import os
import uuid
import pandas as pd
import whisper  # type: ignore
import torch  # type: ignore
from sentence_transformers import SentenceTransformer, util  # type: ignore
from indictrans2 import IndicTranslator  # type: ignore
from gtts import gTTS  # type: ignore

# Load Models Globally (For Faster Reuse)
whisper_model = whisper.load_model("medium")
text_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
translator = IndicTranslator()

# Load CSV Files Once
BASE_DIR = os.path.dirname(__file__)
queries_path = os.path.join(BASE_DIR, "VoiceForWeak_Queries.csv")
sections_path = os.path.join(BASE_DIR, "VoiceForWeak_IPC_Sections.csv")

df_queries = pd.read_csv(queries_path)
df_sections = pd.read_csv(sections_path)

# Prepare Queries
query_columns = [f'Query{i}' for i in range(1, 11)]
all_queries = []
ipc_mapping = []

for idx, row in df_queries.iterrows():
    for col in query_columns:
        query = row[col]
        if pd.notna(query):
            all_queries.append(query)
            ipc_mapping.append(row['IPC Section'])

# Encode Queries Once
stored_embeddings = text_model.encode(all_queries, convert_to_tensor=True)


def process_audio(audio_path, output_dir="static"):
    """Full pipeline: Audio → Transcribe → NLP → Translation → TTS"""
    # Step 1: Transcribe & Translate to English
    result = whisper_model.transcribe(audio_path, task="translate")
    english_text = result["text"]
    original_lang = result['language']

    # Step 2: Semantic Search on Queries
    query_embedding = text_model.encode(english_text, convert_to_tensor=True)
    scores = util.pytorch_cos_sim(query_embedding, stored_embeddings)[0]
    top_k = 3
    top_match_indices = torch.topk(scores, k=top_k).indices.tolist()
    matched_sections = [ipc_mapping[idx] for idx in top_match_indices]

    # Step 3: Prepare Section Info & Translate
    translated_sections = []
    for section in matched_sections:
        info = df_sections[df_sections['IPC Section'] == section].iloc[0]
        ipc_text = f"IPC Section: {section} - {info['Name']}. " \
                   f"Description: {info['Description']}. " \
                   f"Punishment: {info['Punishment']}. " \
                   f"Bailable: {info['Bailable/Non-Bailable']}. " \
                   f"Cognizable: {info['Cognizable/Non-Cognizable']}. " \
                   f"Category: {info['Category']}."

        try:
            translated_text = translator.translate(ipc_text, target_lang=original_lang)
            translated_sections.append(translated_text)
        except Exception as e:
            translated_sections.append(f"Translation failed for section {section}: {e}")

    # Step 4: Text-to-Speech (Unique filename)
    combined_text = "\n\n".join(translated_sections)
    os.makedirs(output_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}.mp3"
    output_path = os.path.join(output_dir, unique_filename)
    tts = gTTS(text=combined_text, lang=original_lang)
    tts.save(output_path)

    return {
        "matched_sections": matched_sections,
        "translated_texts": translated_sections,
        "audio_file_path": output_path,
        "audio_file_name": unique_filename
    }
