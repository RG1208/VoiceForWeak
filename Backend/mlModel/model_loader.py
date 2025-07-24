import whisper #type: ignore
from sentence_transformers import SentenceTransformer #type: ignore

print("Loading shared Whisper model (medium)...")
shared_whisper_model = whisper.load_model("medium")
print("Whisper model loaded.")

print("Loading shared Sentence-BERT model (sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)...")
shared_bert_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
print("Sentence-BERT model loaded.") 