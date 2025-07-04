import datetime

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///users.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'super-secret-key'  # Change this in production
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(days=1)
