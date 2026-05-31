from fastapi import APIRouter

from pydantic import BaseModel

from app.agents.orchestrator.langgraph_agent import (
    run_agent
)

router = APIRouter()


class ChatRequest(
    BaseModel
):
    message: str

    conversation_id: str


@router.post("/chat")
async def chat(
    req: ChatRequest
):

    response = await run_agent(
        req.message,
        req.conversation_id
    )

    return {
        "response": response
    }