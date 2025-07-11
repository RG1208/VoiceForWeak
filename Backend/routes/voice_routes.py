from flask import Blueprint, request, jsonify # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore
from mlModel.voice_assistant import process_audio_pipeline  # Import your ML pipeline
import os
import uuid

# Initialize Blueprint
voice_bp = Blueprint('voice', __name__)

@voice_bp.route('/voice-chat', methods=['POST'])
@jwt_required()  # Requires JWT Authentication
def voice_chat():
    """Handles audio upload, processes it via ML pipeline, and returns results"""
    
    # Validate audio file
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    # Validate required user details
    required_fields = ['name', 'location', 'age', 'gender', 'phone', 'id_number', 'email']
    user_details = {}
    for field in required_fields:
        user_details[field] = request.form.get(field, '')
        if not user_details[field]:
            return jsonify({'error': f'Missing user detail: {field}'}), 400

    # Save uploaded audio with unique filename
    audio_file = request.files['audio']
    unique_filename = f"{uuid.uuid4()}_{audio_file.filename}"
    save_path = os.path.join('uploads', unique_filename)
    os.makedirs('uploads', exist_ok=True)
    audio_file.save(save_path)

    try:
        # Process audio with ML pipeline
        result = process_audio_pipeline(save_path, user_details)

        # Clean up uploaded file
        os.remove(save_path)

        # Return results with URLs (assuming /static is served publicly)
        return jsonify({
            "ipc_sections": result['ipc_sections'],
            "transcribed_text": result['transcribed_text'],
            "language": result['language'],
            "audio_url": f"/static/{os.path.basename(result['audio_file'])}",
            "pdf_english_url": f"/static/{os.path.basename(result['pdf_english'])}",
            "pdf_regional_url": f"/static/{os.path.basename(result['pdf_regional'])}"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
