import json
from pathlib import Path
from typing import List, Optional
from models.schemas import Product

DATA_DIR = Path(__file__).parent.parent / "data"


def load_products() -> List[Product]:
    products_file = DATA_DIR / "products.json"
    with open(products_file, "r") as f:
        raw = json.load(f)
    return [Product(**p) for p in raw]


def get_products_by_room(room: str) -> List[Product]:
    products = load_products()
    return [p for p in products if p.room == room]


def get_product_by_id(product_id: str) -> Optional[Product]:
    products = load_products()
    for p in products:
        if p.id == product_id:
            return p
    return None


def get_products_by_role(role: str) -> List[Product]:
    products = load_products()
    return [p for p in products if p.placement_role == role]
