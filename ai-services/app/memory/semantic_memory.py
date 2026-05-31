import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.rag.vectorstore.pinecone_store import vectorstore, embeddings
from app.core.config import settings
from app.memory.conversation_memory import load_memory
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document

async def save_semantic_memory(conversation_id: str):
    """
    Summarize conversation history and ingest into Pinecone's 'semantic-memory' namespace.
    """
    if vectorstore is None:
        return

    try:
        # Load messages
        messages = await load_memory(conversation_id)
        if not messages or len(messages) < 2:
            return

        # Periodically run summarization (e.g., on even-numbered turns)
        if len(messages) % 2 != 0:
            return

        # Format messages for the summarizer
        formatted_history = []
        for msg in messages:
            role_label = "User" if msg.get("role") == "user" else "Assistant"
            formatted_history.append(f"{role_label}: {msg.get('content')}")
        
        history_text = "\n".join(formatted_history)

        # Call LLM to extract key facts/insights
        api_key = settings.GOOGLE_API_KEY or settings.GEMINI_API_KEY
        if not api_key:
            return

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=api_key,
            temperature=0,
        )

        prompt = f"""You are a memory processor. Extract all significant facts, user preferences, tasks, and key information from the following conversation transcript.
Provide a concise, bulleted list of facts/insights to remember about this conversation.
Reply ONLY with the bulleted list. If there is nothing important to remember, reply with 'No significant facts'.

CONVERSATION TRANSCRIPT:
{history_text}"""

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        summary = response.content.strip()

        if "No significant facts" in summary or not summary:
            return

        print(f"[Semantic Memory] Extracted facts for {conversation_id}: {summary[:100]}...")

        # Clear previous memory block for this conversation to prevent duplicate/stale lists
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            index = pc.Index(settings.PINECONE_INDEX_NAME)
            index.delete(filter={"conversation_id": conversation_id}, namespace="semantic-memory")
        except Exception as delete_err:
            print(f"[Semantic Memory] Non-critical delete error: {delete_err}")

        # Ingest new memory block
        doc = Document(
            page_content=summary,
            metadata={
                "conversation_id": conversation_id,
                "type": "semantic-memory"
            }
        )

        memory_store = PineconeVectorStore(
            index_name=settings.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=settings.PINECONE_API_KEY,
            namespace="semantic-memory"
        )
        memory_store.add_documents([doc])
        print(f"[Semantic Memory] Successfully saved memory for conversation {conversation_id}")

    except Exception as e:
        print(f"[Semantic Memory] Error saving semantic memory: {e}")


async def retrieve_semantic_memory(conversation_id: str, query: str, k: int = 2) -> str:
    """
    Search Pinecone for relevant semantic memories in the 'semantic-memory' namespace.
    """
    if vectorstore is None:
        return ""

    try:
        memory_store = PineconeVectorStore(
            index_name=settings.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=settings.PINECONE_API_KEY,
            namespace="semantic-memory"
        )
        
        # Search with conversation_id filter
        docs = memory_store.similarity_search(
            query,
            k=k,
            filter={"conversation_id": conversation_id}
        )

        if not docs:
            return ""

        memories = [doc.page_content for doc in docs]
        return "\n".join(memories)

    except Exception as e:
        print(f"[Semantic Memory] Error retrieving semantic memory: {e}")
        return ""
