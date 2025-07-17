import whisper #type:ignore
import pandas as pd #type:ignore
import torch #type:ignore
from langdetect import detect #type:ignore
from sentence_transformers import SentenceTransformer, util #type:ignore
from gtts import gTTS #type:ignore
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML #type:ignore
from deep_translator import GoogleTranslator #type:ignore
import datetime
import os
import pygame #type:ignore
import shutil

pygame.mixer.init()

# Fix template directory to point to Backend/templates
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data')
TEMPLATES_DIR = os.path.join(os.path.dirname(BASE_DIR), 'templates')

BNS_QUERIES_CSV = os.path.join(DATA_DIR, 'BNS_Queries.csv')
BNS_SECTIONS_CSV = os.path.join(DATA_DIR, 'BNS_Section.csv')
OUTPUT_PDF_FILENAME = "complaint_output.pdf"
RESPONSE_AUDIO_FILENAME = "response.mp3"

print("Loading Whisper model...")
try:
    whisper_model = whisper.load_model("medium")
    print("Whisper model loaded.")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    print("Please ensure 'whisper' library is installed and models are available.")
    exit()

print("Loading SentenceTransformer model...")
try:
    sbert = SentenceTransformer('all-MiniLM-L6-v2')
    print("SentenceTransformer model loaded.")
except Exception as e:
    print(f"Error loading SentenceTransformer model: {e}")
    print("Please ensure 'sentence-transformers' library is installed.")
    exit()

print(f"Loading datasets: {BNS_QUERIES_CSV}, {BNS_SECTIONS_CSV}...")
try:
    df_queries = pd.read_csv(BNS_QUERIES_CSV)
    df_sections = pd.read_csv(BNS_SECTIONS_CSV)
    df_sections.columns = df_sections.columns.str.strip()
    print("Datasets loaded.")
except FileNotFoundError as e:
    print(f"Error loading CSV files: {e}")
    print("Please ensure 'BNS_Queries.csv' and 'BNS_Section.csv' are in the 'Backend/mlModel/data/' directory.")
    exit()
except Exception as e:
    print(f"An error occurred while loading CSV files: {e}")
    exit()

query_columns = [f"Query{i}" for i in range(1, 11)]

def transcribe_audio(file_path):
    print(f"Transcribing audio file: {file_path}")
    try:
        result = whisper_model.transcribe(file_path)
        return result["text"]
    except Exception as e:
        print(f"Error during audio transcription: {e}")
        return ""

def detect_language(text):
    try:
        return detect(text)
    except Exception as e:
        print(f"Error detecting language: {e}")
        return 'en'

def translate_to_english(text, original_lang):
    if original_lang == 'en':
        return text
    try:
        return GoogleTranslator(source='auto', target='en').translate(text)
    except Exception as e:
        print(f"Error translating to English: {e}")
        return text

def get_best_query_match(translated_text):
    all_queries = df_queries[query_columns].fillna('').values.flatten().tolist()
    query_embeddings = sbert.encode(all_queries, convert_to_tensor=True)
    input_embedding = sbert.encode(translated_text, convert_to_tensor=True)
    similarities = util.cos_sim(input_embedding, query_embeddings)[0]
    best_match_index = int(torch.argmax(similarities))
    return all_queries[best_match_index]

def get_section_info_from_query(query):
    row_match = df_queries[df_queries[query_columns].isin([query]).any(axis=1)]
    if not row_match.empty:
        bns_code = row_match['BNS'].values[0]
        matched_section = df_sections[df_sections['BNS'] == bns_code]
        if not matched_section.empty:
            return matched_section.iloc[0]
    return None

def speak_in_original_lang(text, lang_code):
    try:
        translated_for_tts = GoogleTranslator(source='en', target=lang_code).translate(text)
        tts = gTTS(text=translated_for_tts, lang=lang_code)
        tts.save(RESPONSE_AUDIO_FILENAME)
        print(f"Generated audio response: {RESPONSE_AUDIO_FILENAME}")
        pygame.mixer.music.load(RESPONSE_AUDIO_FILENAME)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
    except Exception as e:
        print(f"⚠️ TTS translation or audio playback failed: {e}")

def get_template_for_lang(lang_code):
    return {
        "hi": "bns_complaint_template_hi.html",
        "en": "bns_complaint_template_en.html",
        "gu": "bns_complaint_template_gu.html",
        "ta": "bns_complaint_template_ta.html",
        "bn": "bns_complaint_template_bn.html"
    }.get(lang_code, "bns_complaint_template_en.html")

def generate_pdf_complaint(section_row, original_text, lang_code, user_details):
    print("Generating PDF complaint...")
    try:
        env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
        template_name = get_template_for_lang(lang_code)
        template = env.get_template(template_name)

        rendered = template.render(
            date=datetime.date.today().strftime("%d-%m-%Y"),
            complaint=original_text,
            law_section=section_row['BNS'],
            law_description=section_row['Description'],
            punishment=section_row['Punishment'],
            category=section_row['Category'],
            user_name=user_details.get('name', ''),
            user_address=user_details.get('address', ''),
            user_phone=user_details.get('phone', ''),
            user_email=user_details.get('email', '')
        )

        HTML(string=rendered).write_pdf(OUTPUT_PDF_FILENAME)
        print(f"✅ Complaint PDF generated: {OUTPUT_PDF_FILENAME}")
        return {"success": True, "pdf_path": OUTPUT_PDF_FILENAME}
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        print(f"Please ensure the '{TEMPLATES_DIR}' directory exists and contains '{template_name}'.")
        return {"success": False, "error": str(e), "template": template_name}

def process_bns_voice_complaint(audio_path, user_details):
    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found at {audio_path}")
        return {"success": False, "error": f"Audio file not found at {audio_path}"}

    print("--- Starting BNS Voice Complaint Processing ---")

    print("🔊 Transcribing audio...")
    original_text = transcribe_audio(audio_path)
    if not original_text:
        print("Transcription failed. Exiting.")
        return {"success": False, "error": "Transcription failed."}
    print(f"📝 Transcribed: \"{original_text}\"")

    lang_code = detect_language(original_text)
    print(f"🌐 Detected language: {lang_code}")

    translated_text = translate_to_english(original_text, lang_code)
    print(f"🗣️ Translated (for matching): \"{translated_text}\"")

    best_query = get_best_query_match(translated_text)
    print(f"🎯 Matched Query: \"{best_query}\"")

    section_row = get_section_info_from_query(best_query)
    pdf_result = None
    audio_url = None

    if section_row is not None:
        pdf_result = generate_pdf_complaint(section_row, original_text, lang_code, user_details)
        speak_in_original_lang(f"This is a case of {section_row['Description']}.", lang_code)
        # Serve audio and PDF from /static/ if needed
        audio_url = f"/static/{RESPONSE_AUDIO_FILENAME}" if os.path.exists(RESPONSE_AUDIO_FILENAME) else ""
        pdf_english_url = f"/static/{OUTPUT_PDF_FILENAME}" if os.path.exists(OUTPUT_PDF_FILENAME) else ""
        # If you have regional PDFs, set pdf_regional_url accordingly, else leave as empty string
        pdf_regional_url = ""  # Set this if you generate regional PDFs

        return {
            "success": pdf_result.get("success", False),
            "transcribed_text": original_text,
            "language": lang_code,
            "translated_text": translated_text,
            "matched_query": best_query,
            "bns_section_info": {
                "BNS": section_row['BNS'],
                "Description": section_row['Description'],
                "Punishment": section_row['Punishment'],
                "Category": section_row['Category'],
            },
            "audio_url": audio_url,
            "pdf_english_url": pdf_english_url,
            "pdf_regional_url": pdf_regional_url,
            "formatted_output": f"Complaint processed for section {section_row['BNS']} - {section_row['Description']}"
        }
    else:
        return {
            "success": False,
            "error": "No matching BNS section found for the query.",
            "transcribed_text": original_text,
            "language": lang_code,
            "translated_text": translated_text,
            "matched_query": best_query,
            "bns_section_info": {},
            "audio_url": "",
            "pdf_english_url": "",
            "pdf_regional_url": "",
            "formatted_output": ""
        }

    print("--- Processing Complete ---")

STATIC_DIR = os.path.join(os.path.dirname(BASE_DIR), 'static')  # BASE_DIR is mlModel/, so this is Backend/static

# After generating response.mp3 and complaint_output.pdf
if os.path.exists(RESPONSE_AUDIO_FILENAME):
    shutil.copy(RESPONSE_AUDIO_FILENAME, os.path.join(STATIC_DIR, RESPONSE_AUDIO_FILENAME))
if os.path.exists(OUTPUT_PDF_FILENAME):
    shutil.copy(OUTPUT_PDF_FILENAME, os.path.join(STATIC_DIR, OUTPUT_PDF_FILENAME))

if __name__ == "__main__":
    print("\nTo run the pipeline, provide an audio file path.")
    print("Example: process_bns_voice_complaint('path/to/your/audio.mp3')")
    print("Make sure 'BNS Queries.csv', 'BNS Section.csv', and 'templates/' directory are present.")