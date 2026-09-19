# Ruma Studio

An open-source, Malay-first room planner. Draw a floor plan, arrange furniture, inspect an isometric view, and share a design proposal.

**Ruma Studio**, **Ruma Living**, and **Dapur Works** are fictional labels used by this project. Products, prices, scores, and coverage overlays are demonstration data, not commercial offers or engineering measurements. There is no affiliation with a furniture manufacturer.

## Features

- Grid-snapped walls, doors, windows, room labels, furniture placement, and drawing undo
- Starter room templates and a built-in demo that needs no API key
- Touch controls, mobile panel navigation, and an isometric PNG export
- A browser-local draft that survives reloads and reopening the browser
- A fictional 13-item catalog, cart, and downloadable demo summary (no payments or orders)
- Shareable proposals saved by the local backend
- Optional AI suggestions; provider integration is experimental and separate from the drawing tools

## Quick start

Requires Node.js 22 LTS and Python 3.10 or later. Clone your fork, then run these commands from the repository root.

### Backend

```sh
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell instead:
# .\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

If PowerShell blocks activation, use `.\.venv\Scripts\python.exe` in place of `python`.

### Frontend (second terminal)

```sh
cd frontend
npm ci
npm run dev
```

On Windows, use `npm.cmd` if PowerShell blocks `npm`. Open http://localhost:3000 and choose **Cuba Demo**. Backend API documentation is at http://localhost:8000/docs. Drawing and the built-in demo work without the backend; suggestions and shared links require it.

### Optional configuration

Copy `.env.example` to `.env` in the repository root for backend settings. Leave API keys empty to use demonstration suggestions. The existing DeepSeek and Azure integrations are optional and have not been validated against live providers as part of the OSS preparation.

For a different backend address, copy `frontend/.env.example` to `frontend/.env.local`. Restart the frontend after changing it; production rewrites are set at build time.

| Variable | Where | Purpose |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | root `.env` | Optional furniture-suggestion provider key |
| `DEEPSEEK_MODEL` | root `.env` | Model identifier for the existing integration |
| `AZURE_OPENAI_ENDPOINT` | root `.env` | Optional legacy image-analysis endpoint |
| `AZURE_OPENAI_API_KEY` | root `.env` | Optional image-analysis key |
| `AZURE_OPENAI_DEPLOYMENT` | root `.env` | Image-analysis deployment |
| `CORS_ORIGINS` | root `.env` | Comma-separated permitted frontend origins |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | Backend address used by Next.js rewrites |

## Validation

```sh
python -m pytest backend/tests -q
cd frontend
npm run lint
npm run build
```

GitHub Actions runs these checks on pushes and pull requests. For a production preview, run `npm start` after building and keep the backend running.

## Project layout

- `frontend/app`: landing page, editor, catalog, demo summary, shared proposal
- `frontend/components`: drawing canvas, isometric viewer, controls and product illustrations
- `frontend/lib`: Zustand store, templates, demo data, API client
- `backend/data/products.json`: fictional product catalog
- `backend/routers`: suggestions, proposals, legacy image analysis and layout API
- `backend/tests`: backend regression tests

## Data and limitations

The current draft and cart live in browser localStorage, on this device and origin only. Starting a new plan or loading a template replaces the draft. Clearing browser data removes it. This release uses new fictional SKUs and does not migrate older demo drafts.

Proposals are stored in `backend/data/proposals.json`; uploaded files are under `backend/uploads/`. Both are excluded from Git. A share link works only while the backend and frontend hosting it are reachable. Anyone with the link can view the proposal. The server has no user accounts or access controls; see [SECURITY.md](SECURITY.md) before hosting publicly.

The isometric view is a stylized visualization, not a CAD model. Distances, WiFi, airflow, and scores are illustrative. Checkout only generates a local demo summary; it sends no email, takes no payment, and creates no real order.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Code and original project illustrations are available under the [MIT license](LICENSE). Dependencies retain their own licenses. Fictional labels are project examples, not a claim of trademark availability.

## Prepare a clean GitHub source release

```sh
python scripts/package_release.py
```

This creates `dist/ruma-studio-source.zip` with source and documentation only. It excludes environment secrets, uploads, proposals, dependencies, build output, and Git history. Extract it into a new directory and initialize a new Git repository for a fresh OSS release. The existing development repository history is not rewritten by this script.
