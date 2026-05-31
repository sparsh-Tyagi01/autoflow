from app.rag.services.retrieval_service import (
    retrieve_context
)

def rag_tool(
    query: str
):

    context = retrieve_context(
        query
    )

    return context