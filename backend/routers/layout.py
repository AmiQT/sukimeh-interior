from fastapi import APIRouter
from models.schemas import GenerateLayoutRequest
from services.placement_engine import generate_layout

router = APIRouter()


@router.post("/generate-layout")
async def create_layout(request: GenerateLayoutRequest):
    layout = generate_layout(request.rooms)
    return layout.model_dump()
