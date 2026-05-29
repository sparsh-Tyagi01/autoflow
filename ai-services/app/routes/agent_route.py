from fastapi import APIRouter

from pydantic import BaseModel

from app.agents.orchestrator.langgraph_agent import run_agent as run_langgraph_agent


router = APIRouter()

class AgentRequest(BaseModel):
    message: str

@router.post("/run")
async def run_agent(
    req: AgentRequest
):
    response = await run_langgraph_agent(
        req.message
    )

    return {
        "response": response
    }