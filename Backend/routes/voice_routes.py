from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity  # type: ignore
from mlModel.voice_assistant import process_audio  # Import your ML pipeline
import os

voice_bp = Blueprint('voice', __name__)

@voice_bp.route('/voice-chat', methods=['POST'])
@jwt_required()  # Authentication required
def voice_chat():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    
    # Save uploaded file temporarily
    save_path = os.path.join('uploads', audio_file.filename)
    os.makedirs('uploads', exist_ok=True)
    audio_file.save(save_path)

    try:
        result = process_audio(save_path)  # Process with your ML pipeline
        
        # Optionally delete uploaded file after processing:
        os.remove(save_path)

        return jsonify({
            "matched_sections": result['matched_sections'],
            "translated_texts": result['translated_texts'],
            "audio_file_url": f"/static/{os.path.basename(result['audio_file_path'])}"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
