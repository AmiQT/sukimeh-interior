import os
import json
import httpx
import logging
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")

logger = logging.getLogger(__name__)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash")
DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions"

SUGGEST_PROMPT = """You are an expert interior designer AI. Analyze the floor plan layout below and suggest optimal furniture placement.

Floor plan data:
{floor_plan_json}

Design Theme / Style Requested:
Preset: {style_preset}
Custom User Guidance: {style_prompt}

Rules:
- Suggest 2-5 furniture items per room based on room type and the selected style
- Positions (x, y) must be within canvas bounds: 0-{width} for x, 0-{height} for y
- Keep furniture away from walls (minimum 20px margin)
- Ensure traffic flow paths between rooms
- For living room: sofa faces TV, router at center
- For kitchen: work triangle (hood-hob-fridge) under 200px total
- For bedroom: bed headboard against wall
- Tailor annotations to the selected style (e.g. Zen Airflow for Japandi, Glare-Free Arc for Scandinavian, Mesh Apex for Smart Haven)

Return ONLY valid JSON in this exact structure:
{{
  "furniture": [
    {{
      "product_id": "RUMA-SOFA-01",
      "name": "Sofa",
      "icon": "🛋️",
      "x": 250,
      "y": 300,
      "annotation": "Optimal viewing distance",
      "room": "living_room"
    }}
  ],
  "score": 92,
  "optimizations": [
    {{"type": "airflow", "title": "Airflow Optimized", "desc": "Hood near window for ventilation"}},
    {{"type": "wifi", "title": "WiFi Coverage", "desc": "Router centralized for full coverage"}},
    {{"type": "traffic", "title": "Traffic Flow Clear", "desc": "90cm clearance paths maintained"}}
  ]
}}

Available product_ids: RUMA-SOFA-01, RUMA-TV-01, RUMA-TABLE-01, RUMA-FAN-01, RUMA-WIFI-01, DAPUR-HOOD-01, DAPUR-HOB-01, DAPUR-FRIDGE-01, DAPUR-DISHWASHER-01, RUMA-BED-01, RUMA-WARDROBE-01, RUMA-SENSOR-01, RUMA-MESH-01
Only return valid JSON. No explanation."""


def get_mock_suggestion(floor_plan: dict) -> dict:
    rooms = floor_plan.get("roomLabels", [])
    width = floor_plan.get("canvas_width", 800)
    height = floor_plan.get("canvas_height", 560)
    preset = (floor_plan.get("style_preset") or "japandi")
    custom_prompt = (floor_plan.get("style_prompt") or "")
    furniture = []

    for room in rooms:
        rtype = room.get("type", "")
        cx = room.get("x", width // 2)
        cy = room.get("y", height // 2)

        if rtype == "living_room":
            furniture += [
                {"product_id": "RUMA-SOFA-01",  "name": "Sofa",        "icon": "🛋️", "x": cx,       "y": cy + 60,  "annotation": "Japandi Low-Profile" if preset == "japandi" else "Cozy Lounge Angle",   "room": rtype},
                {"product_id": "RUMA-TV-01",    "name": "TV",          "icon": "📺", "x": cx,       "y": cy - 80,  "annotation": "Anti-Glare Position", "room": rtype},
                {"product_id": "RUMA-WIFI-01",   "name": "WiFi Router", "icon": "📡", "x": cx + 80,  "y": cy,       "annotation": "Mesh Center 6E",       "room": rtype},
                {"product_id": "RUMA-FAN-01",    "name": "Ceiling Fan", "icon": "🌀", "x": cx,       "y": cy,       "annotation": "Breeze Circulator",    "room": rtype},
            ]
        elif rtype == "kitchen":
            furniture += [
                {"product_id": "DAPUR-HOOD-01",  "name": "Hood",        "icon": "🔥", "x": cx + 40,  "y": cy - 60,  "annotation": "Airflow Optimized",  "room": rtype},
                {"product_id": "DAPUR-HOB-01",   "name": "Hob",         "icon": "🍳", "x": cx,       "y": cy - 40,  "annotation": "Work Triangle",      "room": rtype},
                {"product_id": "DAPUR-FRIDGE-01","name": "Fridge",      "icon": "🧊", "x": cx - 60,  "y": cy - 60,  "annotation": "Entry Accessible",   "room": rtype},
            ]
        elif rtype == "bedroom":
            furniture += [
                {"product_id": "RUMA-BED-01",    "name": "Bed",         "icon": "🛏️", "x": cx,       "y": cy + 40,  "annotation": "Headboard vs Solid Wall",  "room": rtype},
                {"product_id": "RUMA-WARDROBE-01",     "name": "Wardrobe",    "icon": "🗄️", "x": cx - 80,  "y": cy - 40,  "annotation": "60cm Clearance Line",     "room": rtype},
                {"product_id": "RUMA-SENSOR-01",   "name": "Smart Sensor", "icon": "🌡️", "x": cx + 70,  "y": cy - 40,  "annotation": "Sleep Climate Guard",     "room": rtype},
            ]
        elif rtype == "dining_room":
            furniture += [
                {"product_id": "RUMA-TABLE-01",     "name": "Coffee Table","icon": "☕", "x": cx,       "y": cy,       "annotation": "Walnut Social Hub",   "room": rtype},
            ]

    score = min(98, 86 + len(rooms) * 4)

    opt_title = "Japandi Flow & Airflow" if preset == "japandi" else ("Cyber Smart Coverage" if preset == "smart_haven" else "Ergonomic Living Arc")
    opt_desc = f"Dioptimumkan mengikut gaya {preset.replace('_', ' ').title()}: laluan 90cm bebas halangan dan pengudaraan silang semulajadi."
    if custom_prompt:
        opt_desc += f" Mengambil kira arahan khusus: '{custom_prompt[:60]}...'"

    return {
        "furniture": furniture,
        "score": score,
        "optimizations": [
            {"type": "airflow",  "title": opt_title, "desc": opt_desc},
            {"type": "wifi",     "title": "WiFi 6E Low-Latency Center", "desc": "Router dipusatkan — liputan 100% tanpa zon mati merentasi semua bilik."},
            {"type": "traffic",  "title": "Ergonomic 90cm Clearance",   "desc": "Laluan pergerakan dari pintu masuk ke semua zon perabot sentiasa lapang."},
        ],
    }


async def suggest_furniture(floor_plan: dict) -> dict:
    if not DEEPSEEK_API_KEY:
        logger.warning("DEEPSEEK_API_KEY not set, using mock suggestion")
        return get_mock_suggestion(floor_plan)

    width = floor_plan.get("canvas_width", 800)
    height = floor_plan.get("canvas_height", 560)
    preset = floor_plan.get("style_preset", "Modern Scandinavian")
    custom_prompt = floor_plan.get("style_prompt", "Standard ergonomic layout")

    prompt = SUGGEST_PROMPT.format(
        floor_plan_json=json.dumps(floor_plan, indent=2),
        width=width,
        height=height,
        style_preset=preset,
        style_prompt=custom_prompt,
    )

    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2000,
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(DEEPSEEK_ENDPOINT, json=payload, headers=headers)
            response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"].strip()

        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

        return json.loads(content)

    except (httpx.HTTPError, json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error(f"DeepSeek API error: {e}. Falling back to mock suggestion.")
        return get_mock_suggestion(floor_plan)
