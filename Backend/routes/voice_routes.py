from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required  # type: ignore
from mlModel.voice_assistant import process_audio  # Import your ML pipeline
import os
import uuid

voice_bp = Blueprint('voice', __name__)


@voice_bp.route('/voice-chat', methods=['POST'])
@jwt_required()  # Authentication required
def voice_chat():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    
    # Save uploaded file temporarily with unique filename
    unique_filename = f"{uuid.uuid4()}_{audio_file.filename}"
    save_path = os.path.join('uploads', unique_filename)
    os.makedirs('uploads', exist_ok=True)
    audio_file.save(save_path)

    try:
        result = process_audio(save_path)  # Process with your ML pipeline
        
        # Optionally delete uploaded file after processing:
        os.remove(save_path)

        # Build full URL (optional but better)
        audio_url = f"/static/{result['audio_file_name']}"
        return jsonify({
            "matched_sections": result['matched_sections'],
            "translated_texts": result['translated_texts'],
            "audio_url": audio_url  # <-- This is the key your frontend must use
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
