"""Regression coverage for the offline catalog and shared drawing workflows."""
import json
from pathlib import Path


def test_browser_catalog_matches_backend():
    root = Path(__file__).resolve().parents[2]
    assert json.loads((root / "frontend/lib/catalog.json").read_text()) == json.loads(
        (root / "backend/data/products.json").read_text()
    )


def test_shared_manual_plan_roundtrip(test_client, monkeypatch, tmp_path):
    monkeypatch.setattr("routers.proposal.PROPOSALS_FILE", tmp_path / "proposals.json")
    plan = {
        "walls": [{"id": "wall-1", "x1": 0, "y1": 0, "x2": 200, "y2": 0}],
        "doors": [], "windows": [], "furniture": [], "roomLabels": [],
    }
    layout = {
        "layout_id": "manual-test", "score": 0, "smart_optimizations": [],
        "floorPlan": plan,
        "bundle": {"products": [], "total_original": 0, "total_discounted": 0},
    }
    created = test_client.post("/api/proposal", json={"layout": layout})
    assert created.status_code == 200
    saved = test_client.get(f"/api/proposal/{created.json()['id']}")
    assert saved.json()["layout"]["floorPlan"] == plan


def test_default_suggestion_accepts_omitted_optional_style(test_client, monkeypatch):
    monkeypatch.setattr("services.deepseek_service.DEEPSEEK_API_KEY", "")
    response = test_client.post("/api/suggest-furniture", json={
        "roomLabels": [{"id": "room", "type": "living_room", "x": 200, "y": 200}]
    })
    assert response.status_code == 200
    assert response.json()["bundle"]["products"]
    assert all(p["id"].startswith(("RUMA-", "DAPUR-")) for p in response.json()["bundle"]["products"])
