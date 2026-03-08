# Sukimeh AI Interior Designer

**Chin Hin Group — AI Hackathon 2026**

AI-powered interior design tool that analyzes floor plans, generates smart furniture layouts, and provides product recommendations with one-click purchasing.

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Next.js 14 (App Router) + TailwindCSS  |
| Backend    | Python FastAPI                          |
| AI Engine  | Microsoft Foundry                       |
| 2D Canvas  | Konva.js + react-konva                  |
| State      | Zustand (sessionStorage persist)        |
| Share Link | nanoid unique proposal URLs             |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **npm** or **yarn**

### 1. Clone & Configure

```bash
# Copy and edit the .env file in the project root
cp .env.example .env
# Fill in your Foundry credentials:
# FOUNDRY_ENDPOINT=<your endpoint>
# FOUNDRY_API_KEY=<your api key>
```

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
API docs at `http://localhost:8000/docs`.

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Project Structure

```
/
├── .env                         # Environment variables
├── README.md
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── page.tsx             # Screen 1: Upload
│   │   ├── processing/page.tsx  # Screen 2: AI Processing
│   │   ├── layout/page.tsx      # Screen 3: 2D Canvas
│   │   ├── shop/page.tsx        # Screen 4: Shop the Look
│   │   └── proposal/[id]/page.tsx  # Shared proposal (read-only)
│   ├── components/
│   │   ├── UploadZone.tsx
│   │   ├── ProcessingAnimation.tsx
│   │   ├── FloorCanvas.tsx      # Konva canvas
│   │   ├── FurniturePanel.tsx
│   │   ├── SmartAnnotations.tsx
│   │   ├── ShopBundle.tsx
│   │   └── ScoreCard.tsx
│   └── lib/
│       ├── foundry.ts           # API client
│       └── store.ts             # Zustand state management
│
├── backend/                     # FastAPI
│   ├── main.py
│   ├── routers/
│   │   ├── analyze.py           # POST /api/analyze-floorplan
│   │   ├── layout.py            # POST /api/generate-layout
│   │   └── proposal.py          # POST /api/proposal, GET /api/proposal/{id}
│   ├── services/
│   │   ├── foundry_service.py   # Microsoft Foundry integration
│   │   ├── placement_engine.py  # Smart placement rules
│   │   └── product_catalog.py   # Product data access
│   ├── models/
│   │   └── schemas.py           # Pydantic models
│   └── data/
│       └── products.json        # Chin Hin product catalog
```

---

## Screens

### Screen 1 — Upload
Upload a floor plan image or PDF. The AI analyzes room boundaries and zones.

### Screen 2 — AI Processing
Animated step-by-step processing view while the Foundry API analyzes the image.

### Screen 3 — 2D Layout Canvas
Interactive Konva.js canvas with:
- Drag-and-drop furniture placement
- Smart annotation badges (WiFi, Airflow, Traffic Flow)
- Room selector tabs
- Score badge
- Smart Optimization sidebar

### Screen 4 — Shop the Look
Product listing with pricing, bundle discounts, add-to-cart, and share proposal link.

### Shared Proposal
Read-only view of a design proposal accessible via unique nanoid URL.

---

## API Endpoints

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| POST   | `/api/analyze-floorplan`  | Upload & analyze floor plan image  |
| POST   | `/api/generate-layout`    | Generate layout from room analysis |
| POST   | `/api/proposal`           | Save proposal, get shareable link  |
| GET    | `/api/proposal/{id}`      | Retrieve saved proposal            |
| GET    | `/health`                 | Health check                       |

---

## Design System

- **Primary:** Navy `#1B2B6B`
- **Accent:** Orange `#F97316`
- **Background:** `#F8F9FF`
- **Dark cards:** `#0F1729`
- **Display font:** DM Serif Display
- **Body font:** DM Sans
- **Card radius:** 12px
- **Button radius:** 8px

---

## Environment Variables

| Variable             | Description                     |
| -------------------- | ------------------------------- |
| `FOUNDRY_ENDPOINT`   | Microsoft Foundry API endpoint  |
| `FOUNDRY_API_KEY`    | Microsoft Foundry API key       |
| `NEXT_PUBLIC_API_URL`| Backend URL (default: localhost:8000) |

If Foundry credentials are not set, the app falls back to rule-based mock analysis.

---

## License

© 2026 Chin Hin Group Berhad. All rights reserved.
