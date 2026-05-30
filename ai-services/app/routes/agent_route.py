from fastapi import APIRouter, HTTPException

from pydantic import BaseModel

from app.agents.orchestrator.langgraph_agent import run_agent as run_langgraph_agent

from app.memory.conversation_memory import load_memory

from langchain_google_genai.chat_models import ChatGoogleGenerativeAIError


router = APIRouter()

class AgentRequest(BaseModel):
    message: str
    conversation_id: str

@router.post("/run")
async def run_agent(
    req: AgentRequest
):
    try:
        response = await run_langgraph_agent(
            req.message,
            req.conversation_id
        )
    except ChatGoogleGenerativeAIError as exc:
        if "RESOURCE_EXHAUSTED" in str(exc):
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded. Please retry shortly."
            )
        raise

    return {
        "response": response
    }

@router.get("/memory/{conversation_id}")
async def get_memory(
    conversation_id: str
):
    messages = await load_memory(
        conversation_id
    )

    return {
        "conversation_id": conversation_id,
        "messages": messages
    }