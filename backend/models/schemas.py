from pydantic import BaseModel, Field
from typing import List, Optional, Union
from enum import Enum


class RoomType(str, Enum):
    kitchen = "kitchen"
    living_room = "living_room"
    bedroom = "bedroom"
    bathroom = "bathroom"


class LayoutType(str, Enum):
    open_plan = "open_plan"
    segmented = "segmented"
    studio = "studio"


class ImageQuality(str, Enum):
    floor_plan = "floor_plan"
    photo = "photo"
    sketch = "sketch"


class RoomAnalysis(BaseModel):
    type: RoomType
    confidence: float = Field(ge=0.0, le=1.0)
    approximate_size: str = "medium"
    features: List[str] = []


class AnalysisResponse(BaseModel):
    rooms: List[RoomAnalysis]
    overall_layout: LayoutType = LayoutType.open_plan
    image_quality: ImageQuality = ImageQuality.floor_plan


class Dimensions(BaseModel):
    width: float
    depth: float
    height: float


class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    original_price: float
    room: str
    placement_role: str
    dimensions: Dimensions
    smart_features: List[str] = []
    thumbnail: str


class FurniturePlacement(BaseModel):
    product_id: str
    name: str
    room: str
    x_percent: float
    y_percent: float
    rotation: float = 0
    annotation: str = ""
    icon: str = "📦"


class SmartOptimization(BaseModel):
    type: str
    title: str
    desc: str


class BundleProduct(BaseModel):
    id: str
    name: str
    price: float
    original_price: float
    thumbnail: str
    sku: str = ""


class Bundle(BaseModel):
    products: List[BundleProduct]
    total_original: float
    total_discounted: float


class LayoutResponse(BaseModel):
    layout_id: str
    score: int
    rooms: List[RoomAnalysis]
    furniture_placements: List[FurniturePlacement]
    smart_optimizations: List[SmartOptimization]
    bundle: Bundle


class GenerateLayoutRequest(BaseModel):
    rooms: List[RoomAnalysis]
    image_path: Optional[str] = None


class ProposalCreate(BaseModel):
    layout: Union[LayoutResponse, dict]
    image_url: Optional[str] = None


class ProposalResponse(BaseModel):
    id: str
    layout: Union[LayoutResponse, dict]
    image_url: Optional[str] = None
    created_at: str
