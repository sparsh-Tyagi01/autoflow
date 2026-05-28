from app.rag.services.retrieval_service import (
    retrieve_context
)

async def rag_agent(state):
    query = state["user_input"]

    context = retrieve_context(query)

    state["rag_context"] = context

    return state