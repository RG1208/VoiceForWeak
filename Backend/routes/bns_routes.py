from flask import Blueprint, request, jsonify # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore
from mlModel.bns_sections import process_audio_pipeline  # Import your ML pipeline
import os
import uuid

# Initialize Blueprint
bns_bp = Blueprint('bns', __name__)

@bns_bp.route('/bns-chat', methods=['POST'])
@jwt_required()  # Requires JWT Authentication
def bns_chat():

    try:
        # Check for audio file in both 'audio' and 'audio_file' fields
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

        # Save uploaded audio with unique filename
        unique_filename = f"{uuid.uuid4()}_{audio_file.filename}"
        save_path = os.path.join('uploads', unique_filename)
        os.makedirs('uploads', exist_ok=True)
        audio_file.save(save_path)

        # Process audio with ML pipeline
        result = process_audio_pipeline(save_path, user_details)
        
        # Debug: Print the result keys
        print(f"Result keys: {list(result.keys())}")
        print(f"Audio URL: {result.get('audio_url')}")
        print(f"PDF English: {result.get('pdf_english_url')}")
        print(f"PDF Regional: {result.get('pdf_regional_url')}")

        # Clean up uploaded file
        if os.path.exists(save_path):
            os.remove(save_path)

        # Return results with URLs - use the exact field names from mlModel/bns_sections.py
        return jsonify({
            "success": True,
            "bns_sections": result.get('bns_sections', []),
            "matched_sections": result.get('matched_sections', []),
            "translated_texts": result.get('translated_texts', []),
            "transcribed_text": result.get('transcribed_text', ''),
            "language": result.get('language', 'en'),
            "audio_url": result.get('audio_url', ''),  # Already has /static/ prefix
            "pdf_english_url": result.get('pdf_english_url', ''),  # Already has /static/ prefix
            "pdf_regional_url": result.get('pdf_regional_url', ''),  # Already has /static/ prefix
            "formatted_output": result.get('formatted_output', '')
        })

    except Exception as e:
        import traceback
        print(f"Error in bns_chat: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        
        # Clean up the file even if an error occurs after saving but before processing
        if 'save_path' in locals() and os.path.exists(save_path):
            os.remove(save_path)
            print(f"Cleaned up temporary audio file after error: {save_path}")

        # Provide more specific error messages for common issues if desired,
        # otherwise a general 500 internal server error.
        return jsonify({'error': f'BNS processing failed: {str(e)}'}), 500