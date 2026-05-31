"""Unit tests for Pydantic schemas and model validation."""

import pytest
from pydantic import ValidationError

from models.schemas import (
    RoomType,
    LayoutType,
    ImageQuality,
    RoomAnalysis,
    Product,
    Dimensions,
    FurniturePlacement,
    Bundle,
    BundleProduct,
    ProposalCreate,
    LayoutResponse,
    SmartOptimization,
)


class TestEnums:
    """Validate enum definitions match expected values."""

    def test_room_type_enum_values(self):
        assert set(RoomType) == {
            RoomType.kitchen,
            RoomType.living_room,
            RoomType.bedroom,
            RoomType.bathroom,
        }

    def test_layout_type_enum_values(self):
        assert set(LayoutType) == {
            LayoutType.open_plan,
            LayoutType.segmented,
            LayoutType.studio,
        }

    def test_image_quality_enum_values(self):
        assert set(ImageQuality) == {
            ImageQuality.floor_plan,
            ImageQuality.photo,
            ImageQuality.sketch,
        }


class TestRoomAnalysis:
    """Validate RoomAnalysis model constraints."""

    def test_room_analysis_valid(self):
        room = RoomAnalysis(
            type=RoomType.kitchen,
            confidence=0.95,
            approximate_size="medium",
            features=["window", "door"],
        )
        assert room.type == RoomType.kitchen
        assert room.confidence == 0.95
        assert room.approximate_size == "medium"
        assert "window" in room.features

    def test_room_analysis_confidence_too_high(self):
        with pytest.raises(ValidationError):
            RoomAnalysis(type=RoomType.kitchen, confidence=1.5)

    def test_room_analysis_confidence_too_low(self):
        with pytest.raises(ValidationError):
            RoomAnalysis(type=RoomType.kitchen, confidence=-0.1)


class TestProductModel:
    """Validate Product model creation."""

    def test_product_model(self):
        product = Product(
            id="TEST-001",
            name="Test Product",
            category="appliance",
            price=999.0,
            original_price=1299.0,
            room="kitchen",
            placement_role="hood",
            dimensions=Dimensions(width=90, depth=50, height=15),
            smart_features=["wifi"],
            thumbnail="/products/test.jpg",
        )
        assert product.id == "TEST-001"
        assert product.price == 999.0
        assert product.dimensions.width == 90


class TestFurniturePlacement:
    """Validate FurniturePlacement default values."""

    def test_furniture_placement_defaults(self):
        placement = FurniturePlacement(
            product_id="TEST-001",
            name="Test Item",
            room="kitchen",
            x_percent=50.0,
            y_percent=50.0,
        )
        assert placement.rotation == 0
        assert placement.annotation == ""
        assert placement.icon == "📦"


class TestBundleModel:
    """Validate Bundle and BundleProduct models."""

    def test_bundle_model(self):
        bundle = Bundle(
            products=[
                BundleProduct(
                    id="A1",
                    name="Product A",
                    price=100,
                    original_price=150,
                    thumbnail="/a.jpg",
                ),
                BundleProduct(
                    id="B1",
                    name="Product B",
                    price=200,
                    original_price=250,
                    thumbnail="/b.jpg",
                ),
            ],
            total_original=400,
            total_discounted=300,
        )
        assert len(bundle.products) == 2
        assert bundle.total_original == 400
        assert bundle.total_discounted == 300


class TestProposalCreate:
    """Validate ProposalCreate model with nested LayoutResponse."""

    def test_proposal_create_model(self, sample_layout_response):
        proposal = ProposalCreate(
            layout=sample_layout_response,
            image_url="/uploads/test.png",
        )
        assert proposal.layout.layout_id == "test-layout-001"
        assert proposal.image_url == "/uploads/test.png"
