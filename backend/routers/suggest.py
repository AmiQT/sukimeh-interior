import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.deepseek_service import suggest_furniture
from services.product_catalog import load_products

router = APIRouter()


class RoomLabelIn(BaseModel):
    id: str
    x: float
    y: float
    type: str


class WallIn(BaseModel):
    id: str
    x1: float
    y1: float
    x2: float
    y2: float


class FloorPlanIn(BaseModel):
    walls: List[WallIn] = []
    roomLabels: List[RoomLabelIn] = []
    canvas_width: int = 800
    canvas_height: int = 560
    style_preset: Optional[str] = None
    style_prompt: Optional[str] = None


PRODUCT_PRICES = {
    "RUMA-SOFA-01":   {"price": 1899, "original_price": 2399, "name": "Ruma Living L-Shape Sofa L2",        "thumbnail": "/products/ruma-sofa-01.jpg"},
    "RUMA-TV-01":    {"price": 2199, "original_price": 2699, "name": 'Ruma Living 65" Smart TV X-Series',  "thumbnail": "/products/ruma-tv-01.jpg"},
    "RUMA-TABLE-01":     {"price": 599,  "original_price": 799,  "name": "Ruma Living Walnut Coffee Table",     "thumbnail": "/products/ruma-table-01.jpg"},
    "RUMA-FAN-01":    {"price": 449,  "original_price": 549,  "name": "Ruma Living Smart Ceiling Fan D5",   "thumbnail": "/products/ruma-fan-01.jpg"},
    "RUMA-WIFI-01":   {"price": 349,  "original_price": 449,  "name": "Ruma Living Smart WiFi Router R1",   "thumbnail": "/products/ruma-wifi-01.jpg"},
    "DAPUR-HOOD-01":  {"price": 1299, "original_price": 1599, "name": "Dapur Works Smart Hood X5",              "thumbnail": "/products/dapur-hood-x5.jpg"},
    "DAPUR-HOB-01":   {"price": 899,  "original_price": 1099, "name": "Dapur Works Gas Hob G4 Pro",             "thumbnail": "/products/dapur-hob-g4.jpg"},
    "DAPUR-FRIDGE-01":{"price": 2499, "original_price": 2999, "name": "Dapur Works Side-by-Side Fridge S2",     "thumbnail": "/products/dapur-fridge-s2.jpg"},
    "DAPUR-DISHWASHER-01":    {"price": 1599, "original_price": 1899, "name": "Dapur Works Dishwasher A3",              "thumbnail": "/products/dapur-dw-a3.jpg"},
    "RUMA-BED-01":    {"price": 1499, "original_price": 1899, "name": "Ruma Living King Bed Frame K1",      "thumbnail": "/products/ruma-bed-01.jpg"},
    "RUMA-WARDROBE-01":     {"price": 1799, "original_price": 2199, "name": "Ruma Living Sliding Wardrobe S3",    "thumbnail": "/products/ruma-wardrobe-01.jpg"},
    "RUMA-SENSOR-01":   {"price": 149,  "original_price": 199,  "name": "Ruma Living Smart Sensor C1",        "thumbnail": "/products/ruma-sensor-01.jpg"},
    "RUMA-MESH-01":   {"price": 199,  "original_price": 249,  "name": "Ruma Living Mesh Extender E1",       "thumbnail": "/products/ruma-mesh-01.jpg"},
}


@router.post("/suggest-furniture")
async def suggest_furniture_endpoint(body: FloorPlanIn):
    floor_plan_data = body.model_dump()
    ai_result = await suggest_furniture(floor_plan_data)

    # Build bundle from suggested furniture
    seen = set()
    bundle_products = []
    total_original = 0.0
    total_discounted = 0.0

    for item in ai_result.get("furniture", []):
        pid = item.get("product_id", "")
        if pid in seen or pid not in PRODUCT_PRICES:
            continue
        seen.add(pid)
        p = PRODUCT_PRICES[pid]
        bundle_products.append({
            "id": pid,
            "name": p["name"],
            "price": p["price"],
            "original_price": p["original_price"],
            "thumbnail": p["thumbnail"],
            "sku": pid,
        })
        total_original += p["original_price"]
        total_discounted += p["price"]

    return {
        "layout_id": str(uuid.uuid4()),
        "furniture": ai_result.get("furniture", []),
        "score": ai_result.get("score", 85),
        "smart_optimizations": ai_result.get("optimizations", []),
        "bundle": {
            "products": bundle_products,
            "total_original": total_original,
            "total_discounted": total_discounted,
        },
    }
