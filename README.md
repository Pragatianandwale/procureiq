# ProcureIQ — Rubber Buying Assistant

AI-powered procurement dashboard for CEAT Tyres. Analyses live weather, prices, and news to recommend the best rubber supplier every day.

---

## What You Need First

- Python 3.10 or higher (not 3.14 — use 3.11 or 3.12 to be safe)
- Node.js 18 or higher
- Git

---

## Step 1 — Clone the Repo

```bash
git clone https://github.com/Pragatianandwale/procureiq.git
cd procureiq
```

---

## Step 2 — Get Your API Keys

You need 3 free API keys. Sign up takes 2 minutes each.

| Key | Where to get it | Free? |
|-----|----------------|-------|
| `OPENWEATHER_API_KEY` | https://openweathermap.org/api → sign up → API keys | Yes |
| `EXCHANGERATE_API_KEY` | https://www.exchangerate-api.com → sign up | Yes |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey | Yes |

---

## Step 3 — Create Your .env File

Inside the `procureiq/` folder, create a file called `.env` (no extension):

```
GEMINI_API_KEY=paste_your_gemini_key_here
OPENWEATHER_API_KEY=paste_your_openweather_key_here
EXCHANGERATE_API_KEY=paste_your_exchangerate_key_here
OLLAMA_HOST=http://localhost:11434
DATABASE_URL=procureiq.db
```

---

## Step 4 — Set Up Python Backend

Open a terminal in the `procureiq/` folder:

```bash
# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Step 5 — Set Up Frontend

Open a second terminal in the `procureiq/frontend/` folder:

```bash
npm install
```

---

## Step 6 — Run the App

You need two terminals running at the same time.

**Terminal 1 — Backend** (from `procureiq/backend/`):
```bash
python main.py
```
Backend runs on http://localhost:8000

**Terminal 2 — Frontend** (from `procureiq/frontend/`):
```bash
npm run dev
```
Frontend runs on http://localhost:3000

Open http://localhost:3000 in your browser.

---

## Step 7 — First Time Use

When the dashboard opens, a welcome tour will pop up automatically — follow it.

Then click **🔄 Refresh Analysis** in the top right to load live data and get the first recommendation.

---

## Folder Structure

```
procureiq/
├── backend/
│   ├── main.py              # FastAPI server (port 8000)
│   ├── database.py          # SQLite database
│   ├── pipeline/            # AI processing layers
│   │   ├── ingestion.py     # Weather, prices, RSS feeds
│   │   ├── nlp.py           # Language translation
│   │   ├── gemini.py        # Gemini AI analysis
│   │   ├── rag.py           # FAISS supplier history
│   │   ├── ibn.py           # Supplier ranking engine
│   │   ├── confidence.py    # 55% confidence gate
│   │   └── output.py        # SAP PO generation
│   ├── models/
│   │   └── sgd_feedback.py  # Learning from manager decisions
│   └── data/
│       ├── suppliers.csv
│       ├── harrisons_harvest.csv
│       └── historical_decisions.csv
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── Dashboard.jsx  # Main dashboard
│       └── components/        # UI components
├── requirements.txt
└── .env                       # Your API keys (never committed)
```

---

## Troubleshooting

**Backend won't start**
- Make sure your virtual environment is activated
- Check that `.env` file exists in `procureiq/` with all 3 keys filled in
- Try `pip install -r requirements.txt` again

**"No recommendation found" on dashboard**
- Click **🔄 Refresh Analysis** — the database is empty on first run
- Check the backend terminal for any error messages

**Frontend shows blank page**
- Make sure backend is running on port 8000 first
- Check browser console (F12) for errors

**spaCy model error**
```bash
python -m spacy download en_core_web_sm
```

---

## API Keys Are Safe

The `.env` file is in `.gitignore` — your real keys will never be pushed to GitHub. Only you have them locally.
