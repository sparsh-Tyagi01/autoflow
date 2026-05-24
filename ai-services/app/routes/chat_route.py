from fastapi import APIRouter

from pydantic import BaseModel

from app.services.openai_service import generate_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(req: ChatRequest):
    response = await generate_response(
        req.message
    )

    return {
        "response": response
    }