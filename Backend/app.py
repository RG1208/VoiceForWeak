from flask import Flask
from config import Config
from flask_cors import CORS  # type: ignore
from models.extensions import db   # type: ignore
from flask_jwt_extended import JWTManager  # type: ignore
from utils.auth import login_bp, register_bp
from routes.voice_routes import voice_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

app.register_blueprint(login_bp, url_prefix='/api') 
app.register_blueprint(register_bp, url_prefix='/api')  
app.register_blueprint(voice_bp, url_prefix='/api')

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

if __name__ == '__main__':  
    app.run(debug=True)