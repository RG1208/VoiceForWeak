import whisper
from sentence_transformers import SentenceTransformer

print("Loading shared Whisper model (medium)...")
shared_whisper_model = whisper.load_model("medium")
print("Whisper model loaded.")

print("Loading shared Sentence-BERT model (nlpaueb/legal-bert-base-uncased)...")
shared_bert_model = SentenceTransformer("nlpaueb/legal-bert-base-uncased")
print("Sentence-BERT model loaded.") 