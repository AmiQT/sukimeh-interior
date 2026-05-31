"""Unit tests for the Foundry service (mock analysis path)."""

import pytest
from models.schemas import RoomType, LayoutType, ImageQuality
from services.foundry_service import get_mock_analysis, analyze_floorplan_with_foundry


class TestMockAnalysis:
    """Validate the rule-based mock analysis fallback."""

    def test_get_mock_analysis(self):
        analysis = get_mock_analysis()
        assert len(analysis.rooms) == 3
        assert analysis.overall_layout == LayoutType.open_plan
        assert analysis.image_quality == ImageQuality.floor_plan

    def test_mock_analysis_room_types(self):
        analysis = get_mock_analysis()
        room_types = {r.type for r in analysis.rooms}
        assert RoomType.kitchen in room_types
        assert RoomType.living_room in room_types
        assert RoomType.bedroom in room_types

    def test_mock_analysis_confidence_range(self):
        analysis = get_mock_analysis()
        for room in analysis.rooms:
            assert 0.0 <= room.confidence <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_without_credentials_uses_mock(self, tmp_path, monkeypatch):
        """When Azure OpenAI credentials are missing, fallback to mock."""
        monkeypatch.setattr(
            "services.foundry_service.AZURE_OPENAI_ENDPOINT", ""
        )
        monkeypatch.setattr(
            "services.foundry_service.AZURE_OPENAI_API_KEY", ""
        )

        # Create a dummy image file
        dummy_image = tmp_path / "test.png"
        dummy_image.write_bytes(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100)

        result = await analyze_floorplan_with_foundry(str(dummy_image))
        assert len(result.rooms) == 3
        assert result.overall_layout == LayoutType.open_plan
