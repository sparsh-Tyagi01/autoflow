import os

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat_route import router as chat_router
from app.routes.rag_route import router as rag_router
from app.routes.agent_route import router as agent_router

load_dotenv()

app = FastAPI()

CLIENT_URL = os.getenv(
    "CLIENT_URL"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(rag_router, prefix="/rag")
app.include_router(agent_router, prefix="/agents")

@app.get("/")
async def root():
    return {
        "message": "AI Service Running"
    }