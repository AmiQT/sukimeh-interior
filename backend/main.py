import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import analyze, layout, proposal

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Sukimeh AI Interior Designer API",
    version="1.0.0",
    description="Backend API for Chin Hin Group AI Interior Design tool",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = Path(__file__).parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(layout.router, prefix="/api", tags=["layout"])
app.include_router(proposal.router, prefix="/api", tags=["proposal"])


@app.get("/")
async def root():
    return {"message": "Sukimeh AI Interior Designer API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
