from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from mlModel.bns_sections import process_bns_voice_complaint #type:ignore
import os
import uuid
import datetime
from models.bns_chat import BnsChatSession
from models.extensions import db
import pandas as pd #type:ignore

# Initialize Blueprint
bns_bp = Blueprint('bns', __name__)

# Directory for saving uploaded audio files temporarily
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Get the directory of the current script
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # Goes up to Backend/
DATA_DIR = os.path.join(BASE_DIR, "mlModel", "data")

# Load CSV files
df_queries = pd.read_csv(os.path.join(DATA_DIR, "BNS_Queries.csv"))
df_sections = pd.read_csv(os.path.join(DATA_DIR, "BNS_Section.csv"))


@bns_bp.route('/bns-chat', methods=['POST'])
@jwt_required() # Requires JWT Authentication
def bns_chat():
    """
    Handles audio upload for BNS complaints, processes it via ML pipeline,
    and returns results including URLs to generated PDFs and audio responses.
    """

    try:
        audio_file = None
        if 'audio' in request.files:
            audio_file = request.files['audio']
        elif 'audio_file' in request.files:
            audio_file = request.files['audio_file']

        if not audio_file:
            return jsonify({'error': 'No audio file provided'}), 400

        # Get user details with defaults
        user_details = {
            'name': request.form.get('name', 'User'),
            'location': request.form.get('location', 'Unknown'),
            'age': request.form.get('age', '30'),
            'gender': request.form.get('gender', 'Male'),
            'phone': request.form.get('phone', 'NA'),
            'id_number': request.form.get('id_number', 'NA'),
            'email': request.form.get('email', 'user@example.com')
        }

        # Generate a unique filename for the uploaded audio
        unique_filename = f"{uuid.uuid4()}_{audio_file.filename}"
        save_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        audio_file.save(save_path)

        print(f"Received audio for BNS processing: {save_path}")

        # Process audio with BNS ML pipeline
        processing_result = process_bns_voice_complaint(save_path, user_details)
        if not processing_result.get('success', False):
            return jsonify({
                'error': processing_result.get('error', 'Unknown error'),
                'template': processing_result.get('template'),
            }), 500

        # Save chat session to database
        messages = [
            {
                'sender': 'user',
                'type': 'audio',
                'content': unique_filename,
                'timestamp': datetime.datetime.utcnow().isoformat(),
                'user_details': user_details
            },
            {
                'sender': 'bot',
                'type': 'bns-response',
                'content': processing_result.get('formatted_output', ''),
                'timestamp': datetime.datetime.utcnow().isoformat(),
                'transcribed_text': processing_result.get('transcribed_text', ''),
                'language': processing_result.get('language', 'en'),
                'matched_query': processing_result.get('matched_query', ''),
                'bns_section_info': processing_result.get('bns_section_info', {}),
                'audio_url': processing_result.get('audio_url', ''),
                'pdf_english_url': processing_result.get('pdf_english_url', ''),
                'pdf_regional_url': processing_result.get('pdf_regional_url', '')
            }
        ]
        session = BnsChatSession(
            user_id=None,  # Optionally link to user if available
            title=f"BNS Chat {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
            messages=messages
        )
        db.session.add(session)
        db.session.commit()

        # Clean up uploaded audio file
        if os.path.exists(save_path):
            os.remove(save_path)
            print(f"Cleaned up temporary audio file: {save_path}")

        # Return results with URLs
        return jsonify({
            "success": True,
            "transcribed_text": processing_result.get('transcribed_text', ''),
            "language": processing_result.get('language', 'en'),
            "matched_query": processing_result.get('matched_query', ''),
            "bns_section_info": processing_result.get('bns_section_info', {}),
            "audio_url": processing_result.get('audio_url', ''),
            "pdf_english_url": processing_result.get('pdf_english_url', ''),
            "pdf_regional_url": processing_result.get('pdf_regional_url', ''),
            "formatted_output": processing_result.get('formatted_output', '')
        })

    except Exception as e:
        import traceback
        print(f"Error in bns_chat endpoint: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")

        # Clean up the file even if an error occurs after saving but before processing
        if 'save_path' in locals() and os.path.exists(save_path):
            os.remove(save_path)
            print(f"Cleaned up temporary audio file after error: {save_path}")

        return jsonify({'error': f'BNS processing failed: {str(e)}'}), 500