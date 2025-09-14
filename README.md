
# Voice for the Weak

**Voice for the Weak** is an AI-powered platform designed to empower underprivileged and rural communities in India by providing easy access to legal assistance, government welfare schemes, and case analysis tools through voice and text interaction. The platform aims to bridge the gap for illiterate or semi-literate users by providing a multilingual, voice-first web interface.

---

## 🌟 Problem Statement

In rural India, millions of people are unaware of their legal rights, government welfare schemes, or the viability of their legal cases due to illiteracy, lack of access to proper legal help, and complex government websites.  
**Voice for the Weak** solves this problem by providing:
- A voice-first web interface for interaction.
- Government scheme recommendations tailored to individual profiles.
- Simplified legal section analysis (IPC).
- AI-based case win probability prediction.

---

## ✅ Key Features

### 1️⃣ Government Scheme Recommender
- Recommends welfare schemes based on user demographics (age, income, caste, occupation).
- Helps users discover schemes like pensions, loans, subsidies, and insurance.
- Simple form-based or voice interaction input.

### 2️⃣ BNS Section Analysis (Bharat Nyaya Sahayak)
- Provides easy-to-understand explanations of IPC sections.
- Voice-based interaction to aid semi-literate or illiterate users.
- Uses Whisper speech-to-text and GPT-based models for intelligent analysis.

### 3️⃣ Case Win Probability Finder
- Users can input case details.
- Predicts the chance of winning the case based on historical court judgment data.
- Helps rural litigants take informed decisions without expensive lawyer consultations.

---

## 🌐 Multilingual Support
- Supports Hindi, English, and regional Indian languages.
- Designed for illiterate users with a voice-first interface.
- Simple and intuitive UI.

---

## 🚀 Tech Stack

| Layer           | Technology Used              |
|-----------------|------------------------------|
| Frontend        | React, Tailwind CSS          |
| Backend         | Flask, SQLAlchemy            |
| Machine Learning| Sentence Transformers, Whisper, GPT Models |
| Speech-to-Text  | Whisper NLP                   |
| Document Generation | WeasyPrint               |
| Authentication  | JWT                           |
| Deployment      | Vercel (Frontend), Heroku or Custom Server (Backend) |

---

## 🏗️ Project Structure

```
VoiceForWeak/
├── backend/
│   ├── routes/                # API endpoints (scheme recommender, BNS, case win predictor)
│   ├── mlModel/               # ML models and inference pipelines
│   ├── config.py              # App configuration
│   ├── app.py                 # Flask app entry point
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── components/            # React UI components
│   ├── pages/                 # Web pages
│   └── package.json           # Node dependencies
│
├── database/                  # Database models and migration scripts
├── README.md                  # Project documentation
└── .gitignore
```

---

## 🎯 How to Run

### Backend Setup

1. Clone the repo and navigate to backend:
   ```bash
   git clone https://github.com/RG1208/VoiceForWeak.git
   cd VoiceForWeak/backend
   ```

2. Create virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install system dependencies (for WeasyPrint):
   ```bash
   brew install pango gobject-introspection cairo gdk-pixbuf libffi
   ```

5. Run the backend:
   ```bash
   flask run
   ```

---

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start development server:
   ```bash
   pnpm run dev
   ```

---

## ⚡ Future Enhancements

- SMS-based interface for non-smartphone users
- Expand language support (regional languages)
- Offline interaction support for low-connectivity regions
- Integration of additional government schemes dynamically
- Advanced fraud detection in scheme eligibility

---

## 📄 License

This project is licensed under the MIT License.

---

