"""Unit tests for the placement engine service."""

from models.schemas import RoomAnalysis, RoomType
from services.placement_engine import (
    generate_placements,
    generate_optimizations,
    generate_bundle,
    generate_layout,
)


class TestGeneratePlacements:
    """Validate furniture placement generation per room type."""

    def test_generate_placements_kitchen(self):
        rooms = [RoomAnalysis(type=RoomType.kitchen, confidence=0.95)]
        placements = generate_placements(rooms)
        names = [p.name for p in placements]
        # Kitchen should produce hood, hob, fridge, dishwasher
        assert len(placements) == 4
        assert all(p.room == "kitchen" for p in placements)

    def test_generate_placements_living_room(self):
        rooms = [RoomAnalysis(type=RoomType.living_room, confidence=0.90)]
        placements = generate_placements(rooms)
        # Living room should produce wifi_router, sofa, tv, coffee_table, ceiling_fan
        assert len(placements) == 5
        assert all(p.room == "living_room" for p in placements)

    def test_generate_placements_empty_rooms(self):
        placements = generate_placements([])
        assert placements == []

    def test_placement_has_valid_coordinates(self):
        rooms = [RoomAnalysis(type=RoomType.bedroom, confidence=0.85)]
        placements = generate_placements(rooms)
        for p in placements:
            assert 0 <= p.x_percent <= 100
            assert 0 <= p.y_percent <= 100


class TestGenerateOptimizations:
    """Validate smart optimization generation based on room types."""

    def test_generate_optimizations_with_kitchen(self):
        rooms = [RoomAnalysis(type=RoomType.kitchen, confidence=0.95)]
        opts = generate_optimizations(rooms)
        titles = [o.title for o in opts]
        assert "Optimized Airflow" in titles

    def test_generate_optimizations_with_living_room(self):
        rooms = [RoomAnalysis(type=RoomType.living_room, confidence=0.90)]
        opts = generate_optimizations(rooms)
        titles = [o.title for o in opts]
        assert "Dead Zone Elimination" in titles

    def test_generate_optimizations_always_has_traffic(self, sample_rooms):
        opts = generate_optimizations(sample_rooms)
        titles = [o.title for o in opts]
        assert "Traffic Flow" in titles


class TestGenerateBundle:
    """Validate bundle generation from placements."""

    def test_generate_bundle_deduplicates(self):
        rooms = [
            RoomAnalysis(type=RoomType.kitchen, confidence=0.95),
            RoomAnalysis(type=RoomType.living_room, confidence=0.90),
        ]
        placements = generate_placements(rooms)
        bundle = generate_bundle(placements)
        product_ids = [p.id for p in bundle.products]
        # No duplicate product IDs in bundle
        assert len(product_ids) == len(set(product_ids))
        assert bundle.total_original > 0
        assert bundle.total_discounted > 0
        assert bundle.total_discounted <= bundle.total_original


class TestGenerateLayout:
    """Validate the full layout generation pipeline."""

    def test_generate_layout_full_pipeline(self, sample_rooms):
        layout = generate_layout(sample_rooms)
        assert layout.layout_id  # UUID string
        assert 85 <= layout.score <= 98
        assert len(layout.rooms) == 3
        assert len(layout.furniture_placements) > 0
        assert len(layout.smart_optimizations) > 0
        assert layout.bundle.total_discounted > 0
