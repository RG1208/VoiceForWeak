from models.extensions import db
import datetime

class BnsChatSession(db.Model):
    __tablename__ = 'bns_chat_sessions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)  # Optional: link to user
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    title = db.Column(db.String(255), default='New BNS Chat')
    # Store messages as JSON
    messages = db.Column(db.JSON, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'title': self.title,
            'messages': self.messages
        } 