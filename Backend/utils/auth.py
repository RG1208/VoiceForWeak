from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token # type: ignore
from models.user import User
from datetime import timedelta
from werkzeug.security import generate_password_hash
from models.extensions import db
from flask_cors import CORS  # type: ignore


register_bp = Blueprint('register', __name__)
login_bp = Blueprint('login', __name__)


@register_bp.route('/register', methods=['POST'])
def register():
    data= request.get_json()

    # Extract data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"message": "User already exists"}), 400

    if not email or not password or not name:
        return jsonify({"message": "All fields are required"}), 400

    # Create new user
    new_user = User(
        name=name,
        email=email,
        password=generate_password_hash(password),
    )
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(
    identity=str(new_user.id),  
    additional_claims={
        "name": new_user.name,
        "email": new_user.email
    }
)

    return jsonify({
        "message": "User registered successfully",
        "token": access_token,
        "user_id": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
    }), 201


@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"message": "Email and password are required."}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({"message": "Invalid email or password."}), 401

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'email': user.email,
                'name': user.name
            },
            expires_delta=timedelta(days=1)
        )

        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user_id': user.id,
            'email': user.email,
            'name': user.name
        }), 200

    except Exception as e:
        return jsonify({"message": "Something went wrong.", "error": str(e)}), 500