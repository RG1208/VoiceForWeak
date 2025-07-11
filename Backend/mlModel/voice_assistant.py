import os
import uuid
import pandas as pd  # type: ignore
import whisper  # type: ignore
import torch  # type: ignore
from sentence_transformers import SentenceTransformer, util  # type: ignore
from indictrans2 import IndicTranslator  # type: ignore
from gtts import gTTS  # type: ignore
from jinja2 import Environment, FileSystemLoader  # type: ignore
from weasyprint import HTML  # type: ignore
from deep_translator import GoogleTranslator   # type: ignore
import datetime
from langdetect import detect  # type: ignore
import subprocess

# ✅ Auto-install fonts for regional language PDF support
def install_fonts():
    noto_path = "/usr/share/fonts/truetype/noto"
    if not os.path.exists(noto_path):
        try:
            subprocess.run(["apt-get", "update"], check=True)
            subprocess.run([
                "apt-get", "install", "fonts-noto", "fonts-noto-cjk", "fonts-lohit-*", "-y"
            ], check=True)
            print("✅ Fonts installed successfully.")
        except Exception as e:
            print(f"❌ Font installation failed: {e}")
    else:
        print("✅ Fonts already installed.")

# Load Models
whisper_model = whisper.load_model("medium")
text_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
sbert = SentenceTransformer('all-MiniLM-L6-v2')
translator_indic = IndicTranslator()

# Load CSVs
BASE_DIR = os.path.dirname(__file__)
df_queries = pd.read_csv(os.path.join(BASE_DIR, "VoiceForWeak_Queries.csv"))
df_sections = pd.read_csv(os.path.join(BASE_DIR, "VoiceForWeak_IPC_Sections.csv"))

query_columns = [f"Query{i}" for i in range(1, 11)]
all_queries, ipc_mapping = [], []
for idx, row in df_queries.iterrows():
    for col in query_columns:
        if pd.notna(row[col]):
            all_queries.append(row[col])
            ipc_mapping.append(row['IPC Section'])

stored_embeddings = text_model.encode(all_queries, convert_to_tensor=True)
query_embeddings = sbert.encode(all_queries, convert_to_tensor=True)

def transcribe_audio(path):
    result = whisper_model.transcribe(path, task="translate")
    return result['text'], result['language']

def classify_ipc(text, top_k=3):
    input_embedding = sbert.encode(text, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(input_embedding, query_embeddings)[0]
    top_indices = torch.topk(cos_scores, k=top_k).indices.tolist()
    top_sections = []
    for idx in top_indices:
        section = ipc_mapping[idx]
        info = df_sections[df_sections['IPC Section'] == section].iloc[0].to_dict()
        top_sections.append(info)
    return top_sections

def speak_text(text, original_lang, filename="ipc_output.mp3"):
    gtts_lang_map = {
        "hi": "hi", "en": "en", "gu": "gu",
        "ta": "ta", "bn": "bn", "pa": "pa"
    }
    lang_code = gtts_lang_map.get(original_lang, "en")
    tts = gTTS(text=text, lang=lang_code)
    tts.save(filename)
    return filename

def create_letter_pdf(user_name, user_location, details, section_data, other_sections=None,
                      gender="Male", age="30", phone="NA", id_number="NA", email="NA",
                      original_lang="en", output_file="ipc_letter.pdf"):
    template_file = get_template_for_lang(original_lang)
    env = Environment(loader=FileSystemLoader("templates"))
    template = env.get_template(template_file)
    html_out = template.render(
        Current_Date=datetime.date.today().strftime("%d-%m-%Y"),
        Police_Station_or_Department_Name="Concerned Police Station",
        District_City=user_location,
        IPC_Section_Number=section_data['IPC Section'],
        IPC_Section_Name=section_data['Name'],
        IPC_Section_Description=section_data['Description'],
        Punishment=section_data['Punishment'],
        Cognizability=section_data['Cognizable/Non-Cognizable'],
        Bailability=section_data['Bailable/Non-Bailable'],
        Offence_Category=section_data['Category'],
        Full_Name=user_name,
        Age=age,
        Full_Address=user_location,
        User_Complaint_Summary=details,
        Gender=gender,
        Phone_Number=phone,
        ID_Number=id_number,
        Email=email,
        Signature_or_Thumb="Signature",
        Village_District=user_location,
        Other_IPC_Sections=other_sections or []
    )
    HTML(string=html_out).write_pdf(output_file)
    return output_file

def get_template_for_lang(original_lang):
    templates = {
        "hi": "ipc_complaint_template_hi.html",
        "en": "ipc_complaint_template_en.html",
        "gu": "ipc_complaint_template_gu.html",
        "ta": "ipc_complaint_template_ta.html",
        "bn": "ipc_complaint_template_bn.html",
        "pa": "ipc_complaint_template_pa.html",
    }
    return templates.get(original_lang, "ipc_complaint_template_en.html")

def deep_translate_section(section, translator):
    return {
        key: translator.translate(value) if isinstance(value, str) else value
        for key, value in section.items()
    }

def conditional_translate(text, target_lang):
    try:
        if '@' in text or text.isdigit():
            return text
        detected_lang = detect(text)
        if detected_lang != target_lang:
            return GoogleTranslator(source='auto', target=target_lang).translate(text)
        return text
    except:
        return text

def process_audio_pipeline(audio_path, user_details, output_dir="static"):
    # ✅ Install fonts before PDF generation
    install_fonts()

    text, original_lang = transcribe_audio(audio_path)

    ipc_sections = classify_ipc(text)
    main_section = ipc_sections[0]
    other_sections = ipc_sections[1:] if len(ipc_sections) > 1 else []

    translator = GoogleTranslator(source='auto', target=original_lang)
    translated_sections = []
    for section in ipc_sections:
        block = (f"IPC Section: {section['IPC Section']} - {section['Name']}. "
                 f"Description: {section['Description']}. "
                 f"Punishment: {section['Punishment']}. "
                 f"Bailable: {section['Bailable/Non-Bailable']}. "
                 f"Cognizable: {section['Cognizable/Non-Cognizable']}. "
                 f"Category: {section['Category']}.")
        translated_sections.append(translator.translate(block))

    combined_text = "\n\n".join(translated_sections)
    os.makedirs(output_dir, exist_ok=True)
    audio_file = speak_text(combined_text, original_lang, os.path.join(output_dir, "ipc_output.mp3"))

    # Generate PDFs
    pdf_en = create_letter_pdf(
        conditional_translate(user_details['name'], 'en'),
        conditional_translate(user_details['location'], 'en'),
        text, main_section, other_sections,
        user_details['gender'], user_details['age'],
        user_details['phone'], user_details['id_number'], user_details['email'],
        original_lang='en', output_file=os.path.join(output_dir, "ipc_letter_english.pdf")
    )

    pdf_regional = create_letter_pdf(
        conditional_translate(user_details['name'], original_lang),
        conditional_translate(user_details['location'], original_lang),
        translator.translate(text),
        deep_translate_section(main_section, translator),
        [deep_translate_section(sec, translator) for sec in other_sections],
        user_details['gender'], user_details['age'],
        user_details['phone'], user_details['id_number'], user_details['email'],
        original_lang=original_lang, output_file=os.path.join(output_dir, "ipc_letter_regional.pdf")
    )

    return {
        "audio_file": audio_file,
        "pdf_english": pdf_en,
        "pdf_regional": pdf_regional,
        "ipc_sections": ipc_sections,
        "language": original_lang,
        "transcribed_text": text
    }
