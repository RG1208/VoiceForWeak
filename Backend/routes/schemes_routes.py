from flask import Blueprint, request, jsonify  # type: ignore
from mlModel.schemes import recommend_schemes

schemes_bp = Blueprint('schemes', __name__)

@schemes_bp.route('/recommend-schemes', methods=['POST'])
def recommend_schemes_route():
    data = request.get_json()
    user_query = data.get('user_query', '')
    user_profile = data.get('user_profile', {})
    top_k = data.get('top_k', 5)

    recommendations = recommend_schemes(user_query, user_profile, top_k=top_k)
    return jsonify({'recommendations': recommendations})
