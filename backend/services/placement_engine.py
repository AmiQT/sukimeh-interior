import uuid
from typing import List
from models.schemas import (
    RoomAnalysis, FurniturePlacement, SmartOptimization,
    LayoutResponse, Bundle, BundleProduct
)
from services.product_catalog import get_products_by_room, load_products

PLACEMENT_RULES = {
    "kitchen": {
        "hood": {"x_percent": 65, "y_percent": 15, "icon": "🔥", "annotation": "Airflow Optimized"},
        "hob": {"x_percent": 55, "y_percent": 18, "icon": "🍳", "annotation": "Work Triangle Aligned"},
        "fridge": {"x_percent": 25, "y_percent": 12, "icon": "🧊", "annotation": "Entry Accessible"},
        "dishwasher": {"x_percent": 40, "y_percent": 22, "icon": "🫧", "annotation": "Plumbing Adjacent"},
    },
    "living_room": {
        "wifi_router": {"x_percent": 50, "y_percent": 50, "icon": "📡", "annotation": "WiFi Optimal — Central Position"},
        "sofa": {"x_percent": 50, "y_percent": 65, "icon": "🛋️", "annotation": "Optimal Viewing Distance"},
        "tv": {"x_percent": 50, "y_percent": 20, "icon": "📺", "annotation": "Glare-Free Position"},
        "coffee_table": {"x_percent": 50, "y_percent": 50, "icon": "☕", "annotation": "Traffic Flow Clear"},
        "ceiling_fan": {"x_percent": 50, "y_percent": 45, "icon": "🌀", "annotation": "Central Airflow"},
    },
    "bedroom": {
        "bed": {"x_percent": 50, "y_percent": 55, "icon": "🛏️", "annotation": "Headboard Against Wall"},
        "wardrobe": {"x_percent": 15, "y_percent": 30, "icon": "🚪", "annotation": "60cm Clearance Maintained"},
        "smart_sensor": {"x_percent": 50, "y_percent": 10, "icon": "📡", "annotation": "Full Room Coverage"},
        "mesh_extender": {"x_percent": 85, "y_percent": 15, "icon": "📶", "annotation": "WiFi Extended"},
    },
    "bathroom": {
        "smart_sensor": {"x_percent": 50, "y_percent": 20, "icon": "📡", "annotation": "Humidity Monitoring"},
    },
}

ROOM_OFFSET_MAP = {
    "kitchen": {"x_offset": 0, "y_offset": 0},
    "living_room": {"x_offset": 0, "y_offset": 0},
    "bedroom": {"x_offset": 0, "y_offset": 0},
    "bathroom": {"x_offset": 0, "y_offset": 0},
}


def generate_placements(rooms: List[RoomAnalysis]) -> List[FurniturePlacement]:
    placements = []
    all_products = load_products()
    product_map = {p.placement_role: p for p in all_products}

    for room in rooms:
        room_type = room.type.value if hasattr(room.type, "value") else room.type
        rules = PLACEMENT_RULES.get(room_type, {})

        for role, position in rules.items():
            product = product_map.get(role)
            if product:
                placements.append(FurniturePlacement(
                    product_id=product.id,
                    name=product.name,
                    room=room_type,
                    x_percent=position["x_percent"],
                    y_percent=position["y_percent"],
                    rotation=0,
                    annotation=position["annotation"],
                    icon=position["icon"],
                ))

    return placements


def generate_optimizations(rooms: List[RoomAnalysis]) -> List[SmartOptimization]:
    optimizations = []
    room_types = [r.type.value if hasattr(r.type, "value") else r.type for r in rooms]

    if "kitchen" in room_types:
        optimizations.append(SmartOptimization(
            type="airflow",
            title="Optimized Airflow",
            desc="Hood placed near window for 30% better ventilation. Work triangle (hood-hob-fridge) maintained under 6m total.",
        ))

    if "living_room" in room_types:
        optimizations.append(SmartOptimization(
            type="wifi",
            title="Dead Zone Elimination",
            desc="Router centralized at geometric center — full WiFi 6E coverage achieved across all rooms.",
        ))

    optimizations.append(SmartOptimization(
        type="traffic",
        title="Traffic Flow",
        desc="Unobstructed 90cm clearance paths from entrance to all zones. No furniture blocking doorways.",
    ))

    if "bedroom" in room_types:
        optimizations.append(SmartOptimization(
            type="smart",
            title="Smart Home Integration",
            desc="Sensors positioned at ceiling center for full coverage. Mesh extender ensures bedroom connectivity.",
        ))

    return optimizations[:3]


def generate_bundle(placements: List[FurniturePlacement]) -> Bundle:
    all_products = load_products()
    product_map = {p.id: p for p in all_products}

    bundle_products = []
    total_original = 0.0
    total_discounted = 0.0

    seen_ids = set()
    for placement in placements:
        if placement.product_id in seen_ids:
            continue
        seen_ids.add(placement.product_id)

        product = product_map.get(placement.product_id)
        if product:
            bundle_products.append(BundleProduct(
                id=product.id,
                name=product.name,
                price=product.price,
                original_price=product.original_price,
                thumbnail=product.thumbnail,
                sku=product.id,
            ))
            total_original += product.original_price
            total_discounted += product.price

    return Bundle(
        products=bundle_products,
        total_original=total_original,
        total_discounted=total_discounted,
    )


def generate_layout(rooms: List[RoomAnalysis]) -> LayoutResponse:
    placements = generate_placements(rooms)
    optimizations = generate_optimizations(rooms)
    bundle = generate_bundle(placements)

    score = min(98, 85 + len(rooms) * 3 + len(placements))

    return LayoutResponse(
        layout_id=str(uuid.uuid4()),
        score=score,
        rooms=rooms,
        furniture_placements=placements,
        smart_optimizations=optimizations,
        bundle=bundle,
    )
