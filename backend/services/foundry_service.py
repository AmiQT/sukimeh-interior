import os
import json
import httpx
import base64
import logging
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from models.schemas import AnalysisResponse, RoomAnalysis, RoomType, LayoutType, ImageQuality

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")

logger = logging.getLogger(__name__)

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-chat")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview")

# Construct the Azure OpenAI chat completions endpoint
FOUNDRY_ENDPOINT = (
    f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}"
    f"/chat/completions?api-version={AZURE_OPENAI_API_VERSION}"
)
FOUNDRY_API_KEY = AZURE_OPENAI_API_KEY

ANALYZE_PROMPT = """Analyze this floor plan or room photo. Return a JSON response with this exact structure:
{
  "rooms": [
    {
      "type": "kitchen" | "living_room" | "bedroom" | "bathroom",
      "confidence": 0.0-1.0,
      "approximate_size": "small" | "medium" | "large",
      "features": ["window", "door", "corner"]
    }
  ],
  "overall_layout": "open_plan" | "segmented" | "studio",
  "image_quality": "floor_plan" | "photo" | "sketch"
}
Only return valid JSON. No explanation text."""


def get_mock_analysis() -> AnalysisResponse:
    return AnalysisResponse(
        rooms=[
            RoomAnalysis(type=RoomType.kitchen, confidence=0.95, approximate_size="medium", features=["window", "door"]),
            RoomAnalysis(type=RoomType.living_room, confidence=0.92, approximate_size="large", features=["window", "door", "corner"]),
            RoomAnalysis(type=RoomType.bedroom, confidence=0.89, approximate_size="medium", features=["window", "door"]),
        ],
        overall_layout=LayoutType.open_plan,
        image_quality=ImageQuality.floor_plan,
    )


async def analyze_floorplan_with_foundry(image_path: str) -> AnalysisResponse:
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_API_KEY:
        logger.warning("Azure OpenAI credentials not configured, using mock analysis")
        return get_mock_analysis()

    try:
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        ext = Path(image_path).suffix.lower()
        mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".pdf": "application/pdf"}
        mime_type = mime_map.get(ext, "image/png")

        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": ANALYZE_PROMPT},
                        {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_data}"}},
                    ],
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.1,
        }

        headers = {
            "Content-Type": "application/json",
            "api-key": FOUNDRY_API_KEY,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                FOUNDRY_ENDPOINT,
                json=payload,
                headers=headers,
            )
            response.raise_for_status()

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

        parsed = json.loads(content)
        return AnalysisResponse(**parsed)

    except (httpx.HTTPError, json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error(f"Foundry API error: {e}. Falling back to mock analysis.")
        return get_mock_analysis()
