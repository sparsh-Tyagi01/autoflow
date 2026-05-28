from app.rag.vectorstore.chroma_store import (
    vectorstore
)

def retrieve_context(query: str):
    docs = vectorstore.similarity_search(
        query,
        k=4
    )

    return "\n\n".join(
        [doc.page_content for doc in docs]
    )