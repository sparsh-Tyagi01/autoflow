from fastapi import APIRouter

from fastapi.responses import StreamingResponse

from pydantic import BaseModel, Field

from typing import Optional, List

from app.agents.orchestrator.langgraph_agent import (
    run_agent,
    stream_agent,
)


router = APIRouter()


class AgentConfig(BaseModel):
    name: str = "Default Agent"
    system_prompt: str = "You are a helpful AI assistant."
    model: str = "gemini-2.5-flash-lite"
    temperature: float = 0.7
    max_tokens: int = 4096
    tools: Optional[List[str]] = None
    memory_enabled: bool = True
    rag_enabled: bool = False


class AgentRequest(BaseModel):
    message: str
    conversation_id: str = Field(default="default")
    agent_config: Optional[AgentConfig] = None


@router.post("/run")
async def agent_run(request: AgentRequest):
    """Run agent and return full response."""

    config = None
    if request.agent_config:
        config = request.agent_config.model_dump()

    response = await run_agent(
        request.message,
        request.conversation_id,
        agent_config=config,
    )

    return {"response": response}


@router.post("/stream")
async def agent_stream(request: AgentRequest):
    """Stream agent response via SSE."""

    config = None
    if request.agent_config:
        config = request.agent_config.model_dump()

    async def event_generator():
        async for token in stream_agent(
            request.message,
            request.conversation_id,
            agent_config=config,
        ):
            yield f"data: {token}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )