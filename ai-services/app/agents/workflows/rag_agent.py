from app.rag.services.retrieval_service import retrieve_context


async def rag_agent(state: dict) -> dict:
    """
    RAG agent: retrieves relevant context from the vector store
    to augment the response with knowledge base data.
    """

    try:
        context = retrieve_context(state["user_input"])

        if context and context.strip():
            state["rag_context"] = context
        else:
            state["rag_context"] = "No relevant documents found in knowledge base."
    except Exception:
        state["rag_context"] = "Knowledge base not available."

    return state
