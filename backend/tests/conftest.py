import sys
import shutil
import tempfile
from pathlib import Path
from typing import List

import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path so that 'models', 'services', 'routers' resolve
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app
from models.schemas import (
    RoomAnalysis,
    RoomType,
    LayoutType,
    ImageQuality,
    AnalysisResponse,
    LayoutResponse,
    FurniturePlacement,
    SmartOptimization,
    Bundle,
    BundleProduct,
)


@pytest.fixture()
def test_client():
    """FastAPI TestClient for integration tests."""
    return TestClient(app)


@pytest.fixture()
def sample_rooms() -> List[RoomAnalysis]:
    """Standard set of rooms used across multiple tests."""
    return [
        RoomAnalysis(
            type=RoomType.kitchen,
            confidence=0.95,
            approximate_size="medium",
            features=["window", "door"],
        ),
        RoomAnalysis(
            type=RoomType.living_room,
            confidence=0.92,
            approximate_size="large",
            features=["window", "door", "corner"],
        ),
        RoomAnalysis(
            type=RoomType.bedroom,
            confidence=0.89,
            approximate_size="medium",
            features=["window", "door"],
        ),
    ]


@pytest.fixture()
def sample_layout_response(sample_rooms) -> LayoutResponse:
    """Minimal LayoutResponse for proposal tests."""
    return LayoutResponse(
        layout_id="test-layout-001",
        score=92,
        rooms=sample_rooms,
        furniture_placements=[
            FurniturePlacement(
                product_id="ELB-HOOD-X5",
                name="Elba Smart Hood X5",
                room="kitchen",
                x_percent=65,
                y_percent=15,
            )
        ],
        smart_optimizations=[
            SmartOptimization(
                type="airflow",
                title="Optimized Airflow",
                desc="Hood placed near window.",
            )
        ],
        bundle=Bundle(
            products=[
                BundleProduct(
                    id="ELB-HOOD-X5",
                    name="Elba Smart Hood X5",
                    price=1299,
                    original_price=1599,
                    thumbnail="/products/elba-hood-x5.jpg",
                )
            ],
            total_original=1599,
            total_discounted=1299,
        ),
    )


@pytest.fixture()
def tmp_uploads(tmp_path):
    """Provide a temporary uploads directory and clean up after."""
    uploads = tmp_path / "uploads"
    uploads.mkdir()
    yield uploads
    shutil.rmtree(uploads, ignore_errors=True)
