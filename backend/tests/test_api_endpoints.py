"""Integration tests for FastAPI endpoints."""

import io
import json
import pytest
from unittest.mock import patch, AsyncMock
from models.schemas import RoomType, LayoutType, ImageQuality, AnalysisResponse, RoomAnalysis


class TestRootEndpoints:
    """Validate root and health endpoints."""

    def test_root_endpoint(self, test_client):
        response = test_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "Sukimeh" in data["message"]

    def test_health_endpoint(self, test_client):
        response = test_client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestAnalyzeEndpoint:
    """Validate /api/analyze-floorplan endpoint."""

    def test_analyze_unsupported_file(self, test_client):
        file_content = b"not an image"
        response = test_client.post(
            "/api/analyze-floorplan",
            files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")},
        )
        assert response.status_code == 400
        assert "Unsupported file type" in response.json()["detail"]

    def test_analyze_valid_image(self, test_client):
        # Create a minimal valid PNG header
        png_header = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        mock_analysis = AnalysisResponse(
            rooms=[
                RoomAnalysis(type=RoomType.kitchen, confidence=0.95),
            ],
            overall_layout=LayoutType.open_plan,
            image_quality=ImageQuality.floor_plan,
        )

        with patch(
            "routers.analyze.analyze_floorplan_with_foundry",
            new_callable=AsyncMock,
            return_value=mock_analysis,
        ):
            response = test_client.post(
                "/api/analyze-floorplan",
                files={"file": ("floorplan.png", io.BytesIO(png_header), "image/png")},
            )
        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data
        assert "image_id" in data
        assert "image_path" in data
        assert len(data["analysis"]["rooms"]) == 1

    def test_analyze_file_too_large(self, test_client):
        # 21MB file exceeds the 20MB limit
        large_content = b"\x89PNG\r\n\x1a\n" + b"\x00" * (21 * 1024 * 1024)
        response = test_client.post(
            "/api/analyze-floorplan",
            files={"file": ("big.png", io.BytesIO(large_content), "image/png")},
        )
        assert response.status_code == 400
        assert "too large" in response.json()["detail"]


class TestLayoutEndpoint:
    """Validate /api/generate-layout endpoint."""

    def test_generate_layout_endpoint(self, test_client):
        payload = {
            "rooms": [
                {
                    "type": "kitchen",
                    "confidence": 0.95,
                    "approximate_size": "medium",
                    "features": ["window"],
                },
                {
                    "type": "living_room",
                    "confidence": 0.90,
                    "approximate_size": "large",
                    "features": ["window", "door"],
                },
            ]
        }
        response = test_client.post("/api/generate-layout", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "layout_id" in data
        assert "score" in data
        assert "furniture_placements" in data
        assert "bundle" in data
        assert data["score"] >= 85


class TestProposalEndpoints:
    """Validate /api/proposal CRUD endpoints."""

    def test_create_proposal(self, test_client, sample_layout_response):
        payload = {
            "layout": sample_layout_response.model_dump(),
            "image_url": "/uploads/test.png",
        }
        response = test_client.post("/api/proposal", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "url" in data
        assert data["url"].startswith("/proposal/")

    def test_get_proposal_found(self, test_client, sample_layout_response):
        # First create a proposal
        payload = {
            "layout": sample_layout_response.model_dump(),
            "image_url": "/uploads/test.png",
        }
        create_resp = test_client.post("/api/proposal", json=payload)
        proposal_id = create_resp.json()["id"]

        # Then retrieve it
        get_resp = test_client.get(f"/api/proposal/{proposal_id}")
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert data["id"] == proposal_id
        assert data["layout"]["layout_id"] == "test-layout-001"

    def test_get_proposal_not_found(self, test_client):
        response = test_client.get("/api/proposal/nonexistent-id-999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
