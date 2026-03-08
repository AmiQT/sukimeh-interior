import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from nanoid import generate as nanoid_generate
from models.schemas import ProposalCreate, ProposalResponse

router = APIRouter()
logger = logging.getLogger(__name__)

PROPOSALS_FILE = Path(__file__).parent.parent / "data" / "proposals.json"


def _load_proposals() -> dict:
    if PROPOSALS_FILE.exists():
        with open(PROPOSALS_FILE, "r") as f:
            return json.load(f)
    return {}


def _save_proposals(proposals: dict):
    PROPOSALS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(PROPOSALS_FILE, "w") as f:
        json.dump(proposals, f, indent=2, default=str)


@router.post("/proposal")
async def create_proposal(data: ProposalCreate):
    proposal_id = nanoid_generate(size=12)
    proposals = _load_proposals()

    proposal = ProposalResponse(
        id=proposal_id,
        layout=data.layout,
        image_url=data.image_url,
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    proposals[proposal_id] = proposal.model_dump()
    _save_proposals(proposals)

    return {"id": proposal_id, "url": f"/proposal/{proposal_id}"}


@router.get("/proposal/{proposal_id}")
async def get_proposal(proposal_id: str):
    proposals = _load_proposals()
    proposal = proposals.get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal
