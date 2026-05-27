from fastapi import APIRouter

from fastapi.responses import StreamingResponse

from pydantic import BaseModel

from app.services.gemini_service import stream_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(req: ChatRequest):

    async def event_stream():
        async for chunk in stream_response(
            req.message
        ):
            yield chunk

    return StreamingResponse(
        event_stream(),
        media_type="text/plain"
    )