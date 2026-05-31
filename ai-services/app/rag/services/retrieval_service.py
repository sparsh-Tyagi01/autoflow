from typing import List, Dict

from app.rag.vectorstore.pinecone_store import vectorstore


def retrieve_context(query: str, k: int = 4) -> str:
    """Retrieve relevant context with source attribution."""

    if vectorstore is None:
        print("[Warning] RAG retrieval attempted but Pinecone is not configured.")
        return ""

    docs = vectorstore.similarity_search(query, k=k)

    if not docs:
        return ""

    parts = []

    for i, doc in enumerate(docs):
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", None)

        citation = f"[Source: {source}"
        if page is not None:
            citation += f", Page {page + 1}"
        citation += "]"

        parts.append(f"{doc.page_content}\n{citation}")

    return "\n\n---\n\n".join(parts)


def retrieve_documents(
    query: str, k: int = 4
) -> List[Dict]:
    """Retrieve documents with full metadata."""

    if vectorstore is None:
        print("[Warning] RAG retrieval attempted but Pinecone is not configured.")
        return []

    docs = vectorstore.similarity_search(query, k=k)

    results = []

    for doc in docs:
        results.append({
            "content": doc.page_content,
            "source": doc.metadata.get("source", "Unknown"),
            "page": doc.metadata.get("page"),
            "file_type": doc.metadata.get("file_type", "unknown"),
            "metadata": doc.metadata,
        })

    return results