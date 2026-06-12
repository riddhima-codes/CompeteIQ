# CompeteIQ — AI Competitor Analysis Tool

CompeteIQ is an AI-powered competitor intelligence platform that automatically scrapes, analyzes, and monitors competitor websites. Built with FastAPI, LangGraph, and React.

## Features

- **Guest Mode** — Use without signup. Add competitors and run analysis instantly
- **AI Analysis** — LangGraph agent pipeline scrapes competitor websites and generates detailed insights
- **Change Detection** — Detects if competitor pricing, features, or content has changed since last analysis
- **Reports Dashboard** — View full analysis history with key insights
- **Optional Auth** — Sign up to save data permanently and get alerts

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- LangGraph (AI agent pipeline)
- MongoDB (data storage)
- JWT Authentication (optional)
- Groq / GPT-4o (LLM)

**Frontend**
- React + Vite
- Tailwind CSS
- React Router

## Getting Started

### Backend
```bash
cd CompeteIQ
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd competeiq-frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the root:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
```

## Architecture

```
User → React Frontend
         ↓
    FastAPI Backend
         ↓
  LangGraph AI Agent
    ↓           ↓
Web Scraper   LLM Analysis
         ↓
      MongoDB
```

## Project Structure

```
CompeteIQ/
├── agents/          # LangGraph agent pipeline
├── core/            # Database, auth, middleware
├── models/          # Pydantic schemas
├── routers/         # API endpoints
├── services/        # Business logic
├── main.py
└── competeiq-frontend/
    └── src/
        ├── pages/
        ├── components/
        └── context/
```
