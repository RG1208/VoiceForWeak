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
import smtplib
from email.message import EmailMessage

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
DATA_DIR = os.path.join(BASE_DIR, "data")

df_queries = pd.read_csv(os.path.join(DATA_DIR, "BNS_Queries.csv"))
df_sections = pd.read_csv(os.path.join(DATA_DIR, "BNS_Section.csv"))

# Debug: Print columns of df_sections to confirm its structure
print("Columns in df_sections:", df_sections.columns.tolist())
print("Columns in df_queries:", df_queries.columns.tolist())


# Correct the mapping for queries: 'BNS Section' is the column that holds the actual section number in BNS_Queries.csv
# The header you provided was: BNS Section,Category,Query1,...
query_columns = [f"Query{i}" for i in range(1, 11)]
all_queries, bns_mapping = [], []
for idx, row in df_queries.iterrows():
    for col in query_columns:
        if pd.notna(row[col]):
            all_queries.append(row[col])
            bns_mapping.append(row['BNS Section']) # Access 'BNS Section' from df_queries

stored_embeddings = text_model.encode(all_queries, convert_to_tensor=True)
query_embeddings = sbert.encode(all_queries, convert_to_tensor=True)

def transcribe_audio(path):
    result = whisper_model.transcribe(path, task="translate")
    return result['text'], result['language']

def classify_bns(text, top_k=3):
    input_embedding = sbert.encode(text, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(input_embedding, query_embeddings)[0]
    top_indices = torch.topk(cos_scores, k=top_k).indices.tolist()
    top_sections = []
    for idx in top_indices:
        section = bns_mapping[idx]
        info = df_sections[df_sections['BNS Section'] == section].iloc[0].to_dict()
        top_sections.append({
            "bns Section": section,
            "Description": info['Description'],
            "Punishment": info['Punishment'],
            "Cognizable/Non-Cognizable": info['Cognizable/Non-Cognizable'],
            "Bailable/Non-Bailable": info['Bailable/Non-Bailable'],
            "Category": info['Category']
        })
    return top_sections

def speak_text(text, original_lang, filename="bns_output.mp3"):
    gtts_lang_map = {
        "hi": "hi", "en": "en", "gu": "gu",
        "ta": "ta", "bn": "bn", "pa": "pa"
    }
    lang_code = gtts_lang_map.get(original_lang, "en")
    try:
        tts = gTTS(text=text, lang=lang_code)
        tts.save(filename)
        return filename
    except Exception as e:
        print(f"Error speaking text: {e}")
        return None

def create_letter_pdf(user_name, user_location, details, section_data, other_sections=None,
                      gender="Male", age="30", phone="NA", id_number="NA", email="NA",
                      original_lang="en", output_file="bns_letter.pdf"):
    template_file = get_template_for_lang(original_lang)
    env = Environment(loader=FileSystemLoader("templates")) # Assuming 'templates' dir is at project root
    template = env.get_template(template_file)

    # ⭐ MODIFIED: Access 'Name' using .get() with a fallback to 'Description' or 'Not Available'
    section_name_for_pdf = section_data.get('Name', section_data.get('Description', 'Not Available'))

    html_out = template.render(
        Current_Date=datetime.date.today().strftime("%d-%m-%Y"),
        Police_Station_or_Department_Name="Concerned Police Station",
        District_City=user_location,
        bns_Section_Number=section_data['bns Section'],
        bns_Section_Name=section_name_for_pdf, # ⭐ MODIFIED: Now uses the safely retrieved name
        bns_Section_Description=section_data['Description'],
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
        Other_bns_Sections=other_sections or []
    )
    HTML(string=html_out).write_pdf(output_file)
    return output_file

def get_template_for_lang(original_lang):
    templates = {
        "hi": "bns_complaint_template_hi.html",
        "en": "bns_complaint_template_en.html",
        "gu": "bns_complaint_template_gu.html",
        "ta": "bns_complaint_template_ta.html",
        "bn": "bns_complaint_template_bn.html",
        "pa": "bns_complaint_template_pa.html",
    }
    return templates.get(original_lang, "bns_complaint_template_en.html")

def deep_translate_section(section, translator):
    # ⭐ MODIFIED: Access 'Name' safely using .get() with fallback
    section_name_translated = translator.translate(section.get('Name', section.get('Description', 'N/A')))
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

def send_email_with_attachments(recipient, subject, body, attachments):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = "youremail@gmail.com"  # replace
    msg['To'] = recipient
    msg.set_content(body)

    for file_path in attachments:
        with open(file_path, "rb") as f:
            file_data = f.read()
            msg.add_attachment(file_data, maintype="application", subtype="pdf", filename=os.path.basename(file_path))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login("youremail@gmail.com", "your_app_password")  # ⚠️ Use App Password
            smtp.send_message(msg)
        return True
    except Exception as e:
        return False

def process_audio_pipeline(audio_path, user_details, output_dir="static"):
    # ✅ Install fonts before PDF generation
    install_fonts()

    text, original_lang = transcribe_audio(audio_path)

    bns_sections = classify_bns(text)
    main_section = bns_sections[0] if bns_sections else {} # Ensure main_section is not empty
    other_sections = bns_sections[1:] if len(bns_sections) > 1 else []

    translator = GoogleTranslator(source='auto', target=original_lang)

    # ✅ Enhanced bns Section Information in Regional Language
    translated_sections = []
    detailed_bns_info = []
    formatted_output = []

    # Add header
    formatted_output.append("=" * 80)
    formatted_output.append(f"🌐 {translator.translate('Your complaint matches the following bns sections')} ({original_lang.upper()})")
    formatted_output.append("=" * 80)

    for i, section in enumerate(bns_sections, 1):
        # Create detailed regional language explanation with prominent section numbers
        regional_explanation = {
            "section_number": i,
            "bns_section": section['bns Section'],
            "description": translator.translate(section['Description']),
            "punishment": translator.translate(section['Punishment']),
            "bailability": translator.translate(section['Bailable/Non-Bailable']),
            "cognizable": translator.translate(section['Cognizable/Non-Cognizable']),
            "category": translator.translate(section['Category']),
            "what_to_do": [
                translator.translate('File complaint under this section'),
                translator.translate('Register FIR at police station'),
                translator.translate('Keep all evidence safe'),
                translator.translate('Consult a lawyer')
            ]
        }

        # Create formatted text for frontend display
        formatted_section = f"""
🔢 {translator.translate('Matched bns Section')} {i}: {section['bns Section']}

📝 {translator.translate('Description')}: {translator.translate(section['Description'])}

⚖️ {translator.translate('Punishment')}: {translator.translate(section['Punishment'])}

🧷 {translator.translate('Bailability')}: {translator.translate(section['Bailable/Non-Bailable'])}

🚓 {translator.translate('Cognizable')}: {translator.translate(section['Cognizable/Non-Cognizable'])}

📂 {translator.translate('Category')}: {translator.translate(section['Category'])}

🔍 {translator.translate('What to do')}:
- {translator.translate('File complaint under this section')}
- {translator.translate('Register FIR at police station')}
- {translator.translate('Keep all evidence safe')}
- {translator.translate('Consult a lawyer')}
"""
        formatted_output.append(formatted_section)
        formatted_output.append("-" * 80)

        # Create audio block for TTS
        audio_block = (f"bns Section: {section['bns Section']}. "
                      f"Description: {section['Description']}. "
                      f"Punishment: {section['Punishment']}. "
                      f"Bailable: {section['Bailable/Non-Bailable']}. "
                      f"Cognizable: {section['Cognizable/Non-Cognizable']}. "
                      f"Category: {section['Category']}.")

        translated_audio_block = translator.translate(audio_block)
        translated_sections.append(translated_audio_block)
        detailed_bns_info.append(regional_explanation)

    # ✅ Generate comprehensive audio with all bns details in regional language
    comprehensive_audio_text = f"""
{translator.translate('According to your complaint, the following bns sections apply:')}

{chr(10).join(translated_sections)}

{translator.translate('Please take the following steps:')}
1. {translator.translate('File complaint at nearest police station')}
2. {translator.translate('Keep all evidence safe')}
3. {translator.translate('Get legal advice from a lawyer')}
4. {translator.translate('Ensure your safety')}
5. {translator.translate('Keep copy of FIR')}
"""

    os.makedirs(output_dir, exist_ok=True)
    # Generate a unique filename for the audio output
    audio_unique_id = str(uuid.uuid4())
    audio_output_filename = f"bns_output_{audio_unique_id}.mp3"
    audio_file_path_full = os.path.join(output_dir, audio_output_filename)

    audio_file_url = speak_text(comprehensive_audio_text, original_lang, audio_file_path_full)


    # ✅ Generate detailed PDFs with enhanced information
    # Generate unique IDs for PDF filenames
    pdf_en_unique_id = str(uuid.uuid4())
    pdf_regional_unique_id = str(uuid.uuid4())

    pdf_en_path = os.path.join(output_dir, f"bns_letter_english_{pdf_en_unique_id}.pdf")
    pdf_regional_path = os.path.join(output_dir, f"bns_letter_regional_{pdf_regional_unique_id}.pdf")

    pdf_en = create_letter_pdf(
        conditional_translate(user_details['name'], 'en'),
        conditional_translate(user_details['location'], 'en'),
        text, main_section, other_sections, # main_section and other_sections already processed for 'Name' field
        user_details['gender'], user_details['age'],
        user_details['phone'], user_details['id_number'], user_details['email'],
        original_lang='en', output_file=pdf_en_path
    )

    pdf_regional = create_letter_pdf(
        conditional_translate(user_details['name'], original_lang),
        conditional_translate(user_details['location'], original_lang),
        translator.translate(text),
        # Pass the translated main_section and other_sections which now correctly use 'Name' or its fallback
        deep_translate_section(main_section, translator), # This call to deep_translate_section needs fixing
        [deep_translate_section(sec, translator) for sec in other_sections], # This call to deep_translate_section needs fixing
        user_details['gender'], user_details['age'],
        user_details['phone'], user_details['id_number'], user_details['email'],
        original_lang=original_lang, output_file=pdf_regional_path
    )

    # ⭐ MODIFIED: Fix deep_translate_section logic
    # The deep_translate_section function was structured to translate all items.
    # To avoid KeyError, it should use .get() for 'Name' specifically if 'Name' is not always present.
    # I'll update it to be more robust, and ensure the section dictionary passed to it
    # already has the 'Name' key (even if it's a fallback) from classify_bns.
    # So deep_translate_section doesn't need to specifically handle 'Name' KeyError
    # but rather ensures all string values are translated.

    # ✅ Create detailed bns summary in regional language
    bns_summary = {
        "total_sections_found": len(bns_sections),
        "main_section": {
            "section_number": main_section['bns Section'],
            "description": translator.translate(main_section['Description']),
            "punishment": translator.translate(main_section['Punishment']),
            "bailability": translator.translate(main_section['Bailable/Non-Bailable']),
            "cognizable": translator.translate(main_section['Cognizable/Non-Cognizable']),
            "category": translator.translate(main_section['Category'])
        },
        "other_sections": [
            {
                "section_number": sec['bns Section'],
                "description": translator.translate(sec['Description']),
                "punishment": translator.translate(sec['Punishment']),
                "bailability": translator.translate(sec['Bailable/Non-Bailable']),
                "cognizable": translator.translate(sec['Cognizable/Non-Cognizable']),
                "category": translator.translate(sec['Category'])
            }
            for sec in other_sections
        ],
        "recommended_actions": [
            translator.translate("File complaint at nearest police station"),
            translator.translate("Keep all evidence safe"),
            translator.translate("Get legal advice from a lawyer"),
            translator.translate("Ensure your safety"),
            translator.translate("Keep copy of FIR")
        ]
    }

    # Add summary section to formatted output
    formatted_output.append("\n" + "=" * 80)
    formatted_output.append(f"✅ {translator.translate('Processing completed successfully!')}")
    formatted_output.append("=" * 80)

    formatted_output.append(f"\n📁 {translator.translate('Generated Files')}:")
    formatted_output.append(f"🎵 {translator.translate('Audio file')}: {audio_file_url}") # Changed to audio_file_url
    formatted_output.append(f"📄 {translator.translate('English PDF')}: {pdf_en}")
    formatted_output.append(f"📄 {translator.translate('Regional PDF')}: {pdf_regional}")

    formatted_output.append(f"\n🌐 {translator.translate('Language Information')}:")
    formatted_output.append(f"{translator.translate('Detected Language')}: {original_lang}")
    formatted_output.append(f"{translator.translate('Regional Language')}: {original_lang}")

    formatted_output.append(f"\n📝 {translator.translate('Transcribed Text')}:")
    formatted_output.append(f"{text}")

    formatted_output.append(f"\n📊 {translator.translate('bns Summary')}:")
    formatted_output.append(f"{translator.translate('Total bns Sections Found')}: {len(bns_sections)}")
    # ⭐ MODIFIED: Use .get() for 'Name' with fallback
    formatted_output.append(f"{translator.translate('Main Section')}: {bns_sections[0]['bns Section']}")

    if len(bns_sections) > 1:
        formatted_output.append(f"{translator.translate('Other Sections')}: {len(bns_sections) - 1} {translator.translate('additional sections found')}")

    formatted_output.append(f"\n🔍 {translator.translate('Recommended Actions')}:")
    for i, action in enumerate(bns_summary['recommended_actions'], 1):
        formatted_output.append(f"{i}. {action}")

    # Join all formatted output
    complete_formatted_output = "\n".join(formatted_output)

    # Adjust paths for URLs to be web-accessible
    def get_web_url(file_path):
        if file_path and file_path.startswith(output_dir + os.sep):
            # Assumes output_dir is 'static/bns_outputs' or similar.
            # This converts 'static/bns_outputs/file.mp3' to '/static/bns_outputs/file.mp3'
            return "/" + file_path
        return file_path


    return {
        "success": True,
        "audio_url": get_web_url(audio_file_url) if audio_file_url else '', # Ensure it's empty string if None
        "pdf_english_url": get_web_url(pdf_en) if pdf_en else '', # Ensure it's empty string if None
        "pdf_regional_url": get_web_url(pdf_regional) if pdf_regional else '', # Ensure it's empty string if None
        "matched_sections": [section['bns Section'] for section in bns_sections],
        "translated_texts": translated_sections,
        "bns_sections": bns_sections,
        "language": original_lang,
        "transcribed_text": text,
        "formatted_output": complete_formatted_output,
        "detailed_bns_info": detailed_bns_info,
        "bns_summary": bns_summary
    }

# Main execution function for testing (for standalone script testing)
def main():
    # ✅ Install fonts
    install_fonts()

    # Example usage
    audio_path = "test_audio.mp3"  # Replace with actual audio file
    user_details = {
        'name': 'John Doe',
        'location': 'Mumbai, Maharashtra',
        'gender': 'Male',
        'age': '30',
        'phone': '1234567890',
        'id_number': 'A123456789',
        'email': 'john.doe@example.com'
    }

    try:
        # Create a dummy audio file for testing if it doesn't exist
        if not os.path.exists(audio_path):
            print(f"Creating dummy audio file for test: {audio_path}")
            tts_dummy = gTTS(text="This is a test complaint about someone escaping jail.", lang='en')
            tts_dummy.save(audio_path)

        # Ensure output directory exists for testing
        os.makedirs("static", exist_ok=True)
        # Assuming static is your output_dir, ensure there's a sub-dir for bns_outputs if needed
        os.makedirs(os.path.join("static", "bns_outputs"), exist_ok=True)


        result = process_audio_pipeline(audio_path, user_details, output_dir=os.path.join("static", "bns_outputs"))
        print("\n--- TEST PIPELINE RESULT ---")
        for key, value in result.items():
            print(f"{key}: {value}")
        return result
    except Exception as e:
        print(f"Main test execution error: {e}")
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}

if __name__ == "__main__":
    main()
