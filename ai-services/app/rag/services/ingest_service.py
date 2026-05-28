from app.rag.loaders.pdf_loader import (
    load_pdf
)

from app.rag.utils.chunker import (
    split_documents
)

from app.rag.vectorstore.chroma_store import (
    vectorstore
)

async def ingest_pdf(path: str):
    documents = load_pdf(path)

    chunks = split_documents(
        documents
    )

    vectorstore.add_documents(chunks)

    return len(chunks)