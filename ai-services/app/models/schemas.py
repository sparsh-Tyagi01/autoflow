from pydantic import BaseModel, Field
from typing import Optional, List


class ChatRequest(BaseModel):
    message: str
    conversation_id: str = Field(default="default")


class AgentChatRequest(BaseModel):
    message: str
    conversation_id: str = Field(default="default")
    agent_config: Optional["AgentConfig"] = None


class AgentConfig(BaseModel):
    name: str = "Default Agent"
    system_prompt: str = "You are a helpful AI assistant."
    model: str = "gemini-2.5-flash-lite"
    temperature: float = 0.7
    max_tokens: int = 4096
    tools: List[str] = Field(default_factory=list)
    memory_enabled: bool = True
    rag_enabled: bool = False


class RagQueryRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    response: str


class MemoryResponse(BaseModel):
    conversation_id: str
    messages: list


class UploadResponse(BaseModel):
    message: str
    chunks: int
