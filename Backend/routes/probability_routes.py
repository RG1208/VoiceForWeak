import os
import logging
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from mlModel.probability import predict_case_probability

prediction_bp = Blueprint('probability', __name__)

# Setup logging
logging.basicConfig(level=logging.INFO)

# Allowed extensions
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a'}

# Upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route("/predict", methods=["POST"])
def probability():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file part in the request"}), 400

    audio_file = request.files['audio']

    if audio_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(audio_file.filename)

    if not allowed_file(filename):
        return jsonify({"error": "Unsupported file type. Allowed types are mp3, wav, m4a"}), 400

    audio_path = os.path.join(UPLOAD_FOLDER, filename)
    audio_file.save(audio_path)

    try:
        # Extract evidence from form data if available
        evidence = request.form.get('evidence')

        # Get accused and petitioner probabilities, role, category, and suggestions
        accused_prob, petitioner_prob, role, category, evidence_suggestions = predict_case_probability(audio_path, evidence=evidence)

        # Clean up uploaded file
        os.remove(audio_path)

        return jsonify({
            "accused_win_probability": round(accused_prob, 2),
            "petitioner_win_probability": round(petitioner_prob, 2),
            "role": role,
            "category": category,
            "suggested_evidence": evidence_suggestions
        })

    except Exception as e:
        logging.error(f"[Prediction Error]: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500
