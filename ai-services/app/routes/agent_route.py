from fastapi import APIRouter

from pydantic import BaseModel

from app.agents.orchestrator.main_orchestrator import run_agents


router = APIRouter()

class AgentRequest(BaseModel):
    message: str

@router.post("/run")
async def run_agent(
    req: AgentRequest
):
    response = await run_agents(
        req.message
    )

    return {
        "response": response
    }