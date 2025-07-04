from flask import Flask
from config import Config
from flask_cors import CORS  # type: ignore
from models.extensions import db   # type: ignore
from flask_jwt_extended import JWTManager  # type: ignore
from routes.auth import login_bp, register_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

app.register_blueprint(login_bp, url_prefix='/api')  # adds '/api' before every route
app.register_blueprint(register_bp, url_prefix='/api')  # adds '/api' before every route

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

if __name__ == '__main__':  
    app.run(debug=True)