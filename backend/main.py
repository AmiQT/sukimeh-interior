import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import proposal, suggest, analyze, layout

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Ruma Studio API",
    version="1.0.0",
    description="Backend API for Ruma Studio AI Interior Design tool",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(layout.router, prefix="/api", tags=["layout"])
app.include_router(proposal.router, prefix="/api", tags=["proposal"])
app.include_router(suggest.router, prefix="/api", tags=["suggest"])


@app.get("/")
async def root():
    return {"message": "Ruma Studio API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
