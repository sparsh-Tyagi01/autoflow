import os

from app.rag.loaders.pdf_loader import load_pdf
from app.rag.loaders.docx_loader import load_docx
from app.rag.loaders.text_loader import load_txt
from app.rag.loaders.markdown_loader import load_markdown
from app.rag.loaders.web_loader import load_website

from app.rag.utils.chunker import split_documents

from app.rag.vectorstore.pinecone_store import vectorstore


LOADER_MAP = {
    ".pdf": load_pdf,
    ".docx": load_docx,
    ".txt": load_txt,
    ".md": load_markdown,
}


async def ingest_file(path: str) -> int:
    """Ingest a document file into the vector store.

    Automatically selects the appropriate loader based on file extension.
    Returns the number of chunks created.
    """

    if vectorstore is None:
        raise ValueError("Pinecone vector store is not initialized. Please configure PINECONE_API_KEY.")

    ext = os.path.splitext(path)[1].lower()

    loader_fn = LOADER_MAP.get(ext)

    if loader_fn is None:
        raise ValueError(
            f"Unsupported file type: {ext}. "
            f"Supported: {', '.join(LOADER_MAP.keys())}"
        )

    documents = loader_fn(path)

    # Add source metadata
    for doc in documents:
        doc.metadata["source"] = os.path.basename(path)
        doc.metadata["file_type"] = ext

    chunks = split_documents(documents)

    vectorstore.add_documents(chunks)

    return len(chunks)


async def ingest_pdf(path: str) -> int:
    """Legacy wrapper for PDF ingestion."""
    return await ingest_file(path)


async def ingest_website(url: str) -> int:
    """Ingest a website URL into the vector store."""

    if vectorstore is None:
        raise ValueError("Pinecone vector store is not initialized. Please configure PINECONE_API_KEY.")

    documents = load_website(url)

    for doc in documents:
        doc.metadata["source"] = url
        doc.metadata["file_type"] = "web"

    chunks = split_documents(documents)

    vectorstore.add_documents(chunks)

    return len(chunks)