# SwasthyaChain

SwasthyaChain is a healthcare records platform combining a FastAPI backend and a React (Vite) frontend. The project demonstrates secure medical record storage and sharing with auxiliary services (IPFS, encryption, blockchain) and AI-assisted insights.

**Tech stack**
- Backend: `Python` + `FastAPI`
- Frontend: `React` + `Vite`
- Data/storage helpers: IPFS + blockchain integration (in `server/app/services`)
- Dev/test: `uvicorn`, `pytest`

**Repository layout**
- `server/` — FastAPI backend, API routers, services, and tests
  - `server/app` — application code
  - `server/requirements.txt` — backend dependencies
  - `server/run.py` — quick-run script
- `swasthyachain-frontend/` — React + Vite frontend
  - `swasthyachain-frontend/src` — React source files
  - `swasthyachain-frontend/package.json` — frontend dependencies & scripts

**Requirements / Prerequisites**
- macOS / Linux / Windows with a POSIX-like shell (examples use `zsh`)
- Node >= 16 (for Vite)
- Python 3.10+ (or the version required by `server/requirements.txt`)
- (Optional) `git` for cloning and managing branches

**Backend — Setup & Run**
1. Create and activate a Python virtual environment (example using `venv`):

```bash
cd server
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
# .\.venv\Scripts\Activate.ps1
```

2. Install backend dependencies:

```bash
pip install -r requirements.txt
```

3. Run the API server (development mode):

```bash
# from repository root
cd server
# using run.py helper (if present)
python run.py
# or directly with uvicorn:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Quick check:
- Open `http://localhost:8000/docs` to view the interactive OpenAPI docs.

**Frontend — Setup & Run**
1. Install Node dependencies and run dev server:

```bash
cd swasthyachain-frontend
npm install
npm run dev
```

2. The Vite dev server default URL is printed in the console (commonly `http://localhost:5173`). Open that in your browser.

**Environment variables**
- If the backend or frontend require `.env` values, create `.env` files in the corresponding folders. Typical variables:
  - `BACKEND_URL` (frontend) — e.g. `http://localhost:8000`
  - Any API keys used by services (IPFS, blockchain providers, AI services)

**Testing**
- Backend tests (example):

```bash
# from repository root
cd server
pytest -q
```

**Common troubleshooting**
- "Import could not be resolved" in VS Code: ensure VS Code uses the same Python interpreter as your virtual environment. Use the Command Palette → "Python: Select Interpreter" and choose `.venv/bin/python`. Restart the language server.
- Tailwind / `@apply` warnings: ensure `tailwindcss` and `postcss` are set up in the frontend and that your editor postcss/stylelint settings allow Tailwind at-rules.
- Fast Refresh warnings (React): move React contexts to files that export only contexts and keep providers as component-only files.

**Contributing**
- Create feature branches off `main`.
- Run backend and frontend locally while developing.
- Add tests for backend changes and ensure existing tests pass.

**Useful commands (summary)**
- Backend install & run:

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Frontend install & run:

```bash
cd swasthyachain-frontend
npm install
npm run dev
```

**License & Authors**
- Add your preferred license file (`LICENSE`) if desired.
- Authors: repository owner / contributors.

---

If you want, I can:
- Add separate READMEs for `server/` and `swasthyachain-frontend/` with more detailed env and config examples.
- Create a `CONTRIBUTING.md` or `LICENSE` file.
- Update `.vscode/settings.json` to set `python.defaultInterpreterPath` to the repo venv.

Tell me which of these you'd like next.