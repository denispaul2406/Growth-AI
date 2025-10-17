# GrowthAI

Explainable D2C Ad Spend Optimization — Upload CSVs from Meta/Google Ads, get transparent recommendations backed by research, simulate impact with uncertainty, and validate with a live precision dashboard.

This README is tailored for SoCSE AI Day judges and developers. It covers the problem, solution, evaluation, setup, demo script, and rubric alignment.

## TL;DR (What this does in 30 seconds)
- Upload your ad CSVs (no OAuth).
- We clean/normalize and detect issues/opportunities with clear “why it fired.”
- We link to real benchmarks and quantify expected impact with a 90% confidence band.
- You rate recommendations; the precision dashboard updates in real time.

## Problem & Objectives
Brands waste 10–25% of ad budgets due to fragmented reporting, creative fatigue, and delayed decisions. GrowthAI:
- Normalizes messy CSVs from Meta/Google.
- Generates explainable recommendations (thresholds and metrics shown).
- Quantifies impact via bootstrap simulation with uncertainty.
- Learns from feedback to report precision overall and by rule type.

## Screens at a glance
- Upload: drag-and-drop with quality stats and preview.
- Recommendations: cards with confidence, triggers, “why fired,” and research links.
- Simulation: current vs projected metrics + CI bands.
- Evaluation: precision KPIs and insights (top rule, low sample size).
- Methodology/Ethics: one-click modal describing approach and responsible use.

## Architecture
- Backend: FastAPI + MongoDB (Motor), Pandas/NumPy for normalization and metrics.
- Frontend: React (CRA/CRACO), styled components + CSS, sonner toasts.
- Data: Benchmarks stored as JSON and linked to recs by relevance scoring.

### Key backend modules
- `normalization.py`: header cleanup, platform inference, currency/number coercion, date parsing, dedupe `(date,campaign,platform)`, derived metrics (CTR, CPA, ROAS).
- `rules.py`: creative fatigue (CTR ↓ ≥20% and CPA ↑ ≥15% WoW) and budget reallocation (Q1 ROAS → Q3 ROAS with headroom, ~15% shift) + benchmark linkage.
- `simulation.py`: bootstrap on ≤28 days, action-specific uplift ranges, returns median/p5/p95 for ROAS and daily revenue lift, optional CPA reduction.
- `server.py`: FastAPI routes under `/api` with CORS; persists `campaigns`, `recommendations`, `feedback`.

### API surface (selected)
- `POST /api/upload-csv` — parse/normalize CSV and store campaigns; returns preview and stats.
- `POST /api/analyze` — generate and persist recommendations.
- `GET /api/recommendations` — list persisted recommendations.
- `POST /api/feedback` — record thumbs-up/down; `GET /api/evaluation/metrics` — precision summary.
- `POST /api/simulate` — counterfactual impact for `refresh_creative` or `reallocate_budget`.

## Install & Run (Local)
Prereqs: Python 3.11+, Node 18+, MongoDB (local or Atlas).

1) Backend
```bash
cd backend
pip install -r requirements.txt

# .env (development)
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=growthai" >> .env
echo "CORS_ORIGINS=http://localhost:3000" >> .env

uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

2) Frontend
```bash
cd ../frontend
yarn install
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
yarn start
```

3) Open `http://localhost:3000`
- Click “Load Demo Dataset” or upload a CSV from `backend/samples/`.
- Click “Generate Recommendations,” open a card, simulate, rate, and view evaluation.

## Cloud deployment (prototype)
- Backend: Render/Railway/Fly.io; MongoDB Atlas free tier. Set env: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`.
- Frontend: Vercel/Netlify. Set `REACT_APP_BACKEND_URL` to backend URL.

## Evaluation methodology (for judges)
- Metric: precision = useful / total ratings, overall and by rule type.
- Simulation: bootstrap with 1000 iterations on last ≤28 days; median and 90% CI for ROAS and revenue lift.
- Explainability: each recommendation shows thresholds, trigger metrics, and 2–3 benchmark citations.

## SoCSE AI Day rubric alignment
- Problem Definition & Objectives: Clearly stated; measurable outputs include precision and uplift projections.
- Data Handling & Model Development: Comprehensive preprocessing; transparent rules; bootstrap simulation.
- Evaluation & Performance Analysis: Live precision dashboard; by-type breakdown; insights.
- Innovation & Ethics: Explainability-first UX; benchmark citations; responsible-use and limitations modal.
- Communication & Prototype Validation: Polished UI; one-click demo dataset; cloud-ready deployment notes.


## Troubleshooting
- 500 on `/api/upload-csv`: verify `MONGO_URL`, `DB_NAME` in `backend/.env` and that MongoDB is reachable.
- 422 on `/api/feedback`: ensure `recommendation_id` exists (fetch via `GET /api/recommendations` after analysis) and `recommendation_type` is `fatigue` or `reallocation`.
- CORS: set `CORS_ORIGINS` to the frontend origin (e.g., `http://localhost:3000`).

## License
MIT — for hackathon use. See roadmap for production hardening (auth, tests, security, observability).

## Acknowledgments
Benchmarks curated from WordStream, HubSpot, Triple Whale, and other industry research. Built to make explainable ad optimization accessible to lean D2C teams.
