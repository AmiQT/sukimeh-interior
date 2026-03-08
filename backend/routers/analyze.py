import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.foundry_service import analyze_floorplan_with_foundry

router = APIRouter()

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".bmp"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


@router.post("/analyze-floorplan")
async def analyze_floorplan(file: UploadFile = File(...)):
    ext = Path(file.filename or "upload.png").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")

    file_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{file_id}{ext}"
    with open(save_path, "wb") as f:
        f.write(content)

    analysis = await analyze_floorplan_with_foundry(str(save_path))

    return {
        "analysis": analysis.model_dump(),
        "image_id": file_id,
        "image_path": f"/uploads/{file_id}{ext}",
    }
