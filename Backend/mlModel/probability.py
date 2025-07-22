# ## Import libraries
import whisper #type:ignore
from sentence_transformers import SentenceTransformer, util #type:ignore
import pandas as pd #type:ignore
from sklearn.metrics.pairwise import cosine_similarity #type:ignore
import os
import torch  #type:ignore

# Determine the base directory of the current script
_script_dir = os.path.dirname(__file__)
dataset_csv_path = os.path.join(_script_dir, 'data', 'Probability.csv')

# Load the dataset
try:
    dataset = pd.read_csv(dataset_csv_path)
    # Ensure 'Result' column is in lowercase for consistent comparison
    if 'Result' in dataset.columns:
        dataset['Result'] = dataset['Result'].astype(str).str.lower()
    else:
        print(f"Warning: 'Result' column not found in {dataset_csv_path}. Probability calculation might fail.")
    print(f"Dataset loaded successfully from: {dataset_csv_path}")
except FileNotFoundError:
    print(f"Error: Dataset CSV file not found at '{dataset_csv_path}'. Please ensure the file exists.")
    dataset = pd.DataFrame() # Create an empty DataFrame to prevent errors later
except Exception as e:
    print(f"An error occurred while loading the dataset: {e}")
    dataset = pd.DataFrame() # Create an empty DataFrame

# Load the Whisper model (large model is memory intensive, consider 'base' or 'small' for lighter deployment)
try:
    print("Loading Whisper model (medium)...")
    whisper_model = whisper.load_model("medium")
    print("Whisper model loaded.")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    whisper_model = None

# Load the Sentence-BERT model for semantic search
try:
    print("Loading Sentence-BERT model (nlpaueb/legal-bert-base-uncased)...")
    bert_model = SentenceTransformer('nlpaueb/legal-bert-base-uncased')
    print("Sentence-BERT model loaded.")
except Exception as e:
    print(f"Error loading Sentence-BERT model: {e}")
    bert_model = None

# Pre-encode the dataset contexts if models loaded successfully and dataset is not empty
dataset_embeddings = None
if not dataset.empty and bert_model:
    print("Preparing dataset contexts and encoding...")
    required_context_cols = ['Case Description', 'Category'] + [f'Evidence{i}' for i in range(1, 6)]
    missing_cols = [col for col in required_context_cols if col not in dataset.columns]

    if missing_cols:
        print(f"Warning: Missing columns for 'full_context' creation: {missing_cols}. Some semantic search features may be limited.")
        # Fallback for full_context if some evidence columns are missing
        existing_context_cols = [col for col in required_context_cols if col in dataset.columns]
        dataset['full_context'] = dataset[existing_context_cols].fillna('').agg(' '.join, axis=1)
    else:
        dataset['full_context'] = dataset['Case Description'] + " " + \
                                  dataset['Category'] + " " + \
                                  dataset[['Evidence1', 'Evidence2', 'Evidence3', 'Evidence4', 'Evidence5']].fillna('').agg(' '.join, axis=1)

    dataset_embeddings = bert_model.encode(dataset['full_context'].tolist(), convert_to_tensor=True)
    print("Dataset contexts encoded.")
else:
    print("Skipping dataset embedding due to empty dataset or model loading failure.")

# ----------------------------
# Helper function for role classification
# ----------------------------
def classify_user_role(transcribed_text: str) -> str:
    """Classifies user role based on keywords in the transcribed text."""
    text = transcribed_text.lower()
    petitioner_keywords = [
        "i filed a case", "i complained", "i am the victim", "i want justice",
        "i am the petitioner", "i took legal action", "i approached the court"
    ]
    accused_keywords = [
        "a case is filed against me", "i was arrested", "i am the accused",
        "allegations on me", "i am being prosecuted", "charges were framed against me"
    ]
    for phrase in petitioner_keywords:
        if phrase in text:
            return "petitioner"
    for phrase in accused_keywords:
        if phrase in text:
            return "accused"
    return "unknown"

# ----------------------------
# Core prediction function
# ----------------------------
def predict_case_probability(audio_file_path: str, evidence=None, top_k: int = 15):
    """
    Transcribes audio, determines user role, and estimates their winning probability
    by comparing with similar cases. It also suggests generic evidence types.

    Args:
        audio_file_path (str): The path to the audio file.
        evidence (str or list of str, optional): Additional evidence.
        top_k (int): Number of similar cases to consider. Default is 15.

    Returns:
        tuple: A tuple containing:
            - accused_win_percentage (float): Estimated winning chance for the accused (0-100).
            - petitioner_win_percentage (float): Estimated winning chance for the petitioner (0-100).
            - role (str): The detected role of the user ('petitioner', 'accused', or 'unknown').
            - case_category (str): The predicted category of the case.
            - ranked_generic_suggestions (list): Top 5 generic evidence types to consider.
            Returns (0.0, 0.0, 'unknown', 'Unknown', []) on error.
    """
    if dataset.empty or whisper_model is None or bert_model is None or dataset_embeddings is None:
        print("Required models or dataset are not loaded. Cannot predict probability.")
        return 0.0, 0.0, 'unknown', 'Unknown', []

    if not os.path.exists(audio_file_path):
        print(f"Error: Audio file not found at '{audio_file_path}'")
        return 0.0, 0.0, 'unknown', 'Unknown', []

    try:
        # Transcribe audio and determine user role
        print(f"Transcribing audio file: {audio_file_path}")
        result = whisper_model.transcribe(audio_file_path, task="translate")
        english_text = result["text"].strip()
        print("English translation from Whisper:", english_text)
        
        role = classify_user_role(english_text)
        print(f"Detected user role: {role}")

        # Defensive check for empty or too short transcription
        if not english_text or len(english_text.split()) < 3:
            print("Transcription too short or empty. Cannot proceed.")
            return 0.0, 0.0, role, 'Unknown', []

        # Combine transcription with evidence if provided
        user_context = english_text
        if evidence:
            if isinstance(evidence, list):
                evidence_text = ' '.join([str(e) for e in evidence if e])
            else:
                evidence_text = str(evidence)
            user_context = user_context + ' ' + evidence_text
            print("User context with evidence:", user_context)

        # Encode user's case description using Sentence-BERT
        print("Encoding user's case description...")
        user_embedding = bert_model.encode(user_context, convert_to_tensor=True, normalize_embeddings=True)

        # Normalize dataset embeddings for more accurate cosine similarity
        from torch.nn.functional import normalize #type:ignore
        user_embedding = normalize(user_embedding.unsqueeze(0), p=2, dim=1)[0]
        dataset_emb_norm = normalize(dataset_embeddings, p=2, dim=1)

        # Calculate cosine similarities
        print("Calculating similarities with historical cases...")
        similarities = (user_embedding @ dataset_emb_norm.T)

        # Get top_k similar cases
        top_scores, top_indices = torch.topk(similarities, k=top_k)
        top_cases = dataset.iloc[top_indices.cpu().tolist()] # Convert tensor indices to list for .iloc

        print(f"Top {top_k} similar cases found:")
        print(top_cases[[
            'Scheme Name' if 'Scheme Name' in top_cases.columns else 'Case Description',
            'Result', 'Category']])
            
        # Determine the most likely case category from top similar cases
        case_category = "Unknown"
        if 'Category' in top_cases.columns and not top_cases.empty:
            try:
                # Use mode() to find the most frequent category
                case_category = top_cases['Category'].mode()[0]
                print(f"Determined case category: {case_category}")
            except (KeyError, IndexError):
                print("Could not determine the primary case category.")

        # Calculate probability of winning
        if 'Result' not in top_cases.columns:
            print("Error: 'Result' column missing in top cases. Cannot calculate probabilities.")
            return 0.0, 0.0, role, case_category, []

        win_count = (top_cases['Result'].str.lower() == 'won').sum()
        total_cases = len(top_cases)

        accused_win_probability = 0.0
        if total_cases > 0:
            accused_win_probability = win_count / total_cases

        petitioner_win_probability = 1.0 - accused_win_probability

        # Map specific evidence to generic types and rank by frequency
        GENERIC_EVIDENCE_TYPES = [
            "Eyewitness testimony", "CCTV footage", "Medical report", "Photographic proof", "FIR copy",
            "Digital communication (e.g., chats/emails)", "Contract documents", "Phone call recordings",
            "Police investigation report", "Expert opinion / forensic analysis"
        ]

        ranked_generic = []
        if bert_model:
            print("Mapping specific evidence to generic types...")
            try:
                from collections import Counter

                # Encode both specific evidences from cases and the generic types
                specific_evidence_embeddings = bert_model.encode(
                    GENERIC_EVIDENCE_TYPES, convert_to_tensor=True, normalize_embeddings=True
                )
                generic_evidence_embeddings = bert_model.encode(
                    GENERIC_EVIDENCE_TYPES, convert_to_tensor=True, normalize_embeddings=True
                )

                # Map each specific evidence to the most similar generic type
                similarities = (specific_evidence_embeddings @ generic_evidence_embeddings.T)
                best_matches = torch.argmax(similarities, dim=1)

                # Count the frequency of each generic type
                mapped_generic_types = [GENERIC_EVIDENCE_TYPES[i] for i in best_matches]
                type_counts = Counter(mapped_generic_types)

                # Get the top 5 most common generic types
                ranked_generic = [item for item, count in type_counts.most_common(5)]
                print(f"Returning top {len(ranked_generic)} ranked generic evidence types.")

            except Exception as e:
                print(f"Could not rank generic evidence types due to an error: {e}")
                # Fallback to returning a subset of the generic list if something goes wrong
                ranked_generic = GENERIC_EVIDENCE_TYPES[:5]

        print(f"\n--- Probability Prediction ---")
        print(f"Estimated Probability of the accused winning: {accused_win_probability * 100:.2f}%")
        print(f"Estimated Probability of the petitioner winning: {petitioner_win_probability * 100:.2f}%")

        return accused_win_probability * 100, petitioner_win_probability * 100, role, case_category, ranked_generic

    except Exception as e:
        print(f"An error occurred during probability prediction: {e}")
        return 0.0, 0.0, 'unknown', 'Unknown', []

# ----------------------------
# Example usage (for testing when running this Python file directly)
# ----------------------------
if __name__ == "__main__":
    # For local testing, ensure you have an audio file like 'AUDIGO.mp3'
    # in the current directory or provide its full path.
    # Also ensure 'data/Probability.csv' exists relative to this script.
    test_audio_file = "AUDIGO.mp3" # Or specify full path: "/path/to/your/audio.mp3"

    print(f"Attempting to run prediction with audio file: {test_audio_file}")
    accused_prob, petitioner_prob, role, category, evidence_suggestions = predict_case_probability(test_audio_file, top_k=15)

    if accused_prob > 0 or petitioner_prob > 0:
        print("\n--- Final Prediction ---")
        print(f"Detected User Role: {role.capitalize()}")
        print(f"Predicted Case Category: {category}")
        print(f"Accused Winning Chance: {accused_prob:.2f}%")
        print(f"Petitioner Winning Chance: {petitioner_prob:.2f}%")
        
        if evidence_suggestions:
            print("\n--- Top 5 Most Common Generic Evidence Types to Consider ---")
            for i, ev in enumerate(evidence_suggestions, 1):
                print(f"{i}. {ev}")
        else:
            print("\nNo specific evidence suggestions found from similar winning cases.")
    else:
        print("\n--- Prediction could not be performed or no relevant cases found ---")
        print("Please check if 'data/Probability.csv' exists and is correctly formatted,")
        print(f"and if '{test_audio_file}' exists and is a valid audio file.")
        print("Also ensure all required Python packages and FFmpeg are installed.")