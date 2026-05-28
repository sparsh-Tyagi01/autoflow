import os

from fastapi import APIRouter, UploadFile, File

from app.rag.services.ingest_service import (
    ingest_pdf
)

from app.rag.services.rag_chat_service import (
    rag_chat
)

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):
    path = f"{UPLOAD_DIR}/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    chunks = await ingest_pdf(path)

    return {
        "message": "PDF processed",
        "chunks": chunks
    }

@router.post("/ask")
async def ask_pdf(
    body: dict
):
    response = await rag_chat(
        body["query"]
    )

    return {
        "response": response
    }