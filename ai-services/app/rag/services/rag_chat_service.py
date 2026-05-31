import os

from google import genai

from app.rag.services.retrieval_service import (
    retrieve_context
)

client = genai.Client(
    api_key=os.getenv(
        "GOOGLE_API_KEY"
    )
)

async def rag_chat(
    query: str
):
    context = retrieve_context(query)

    prompt = f'''
    Answer using the provided context.

    CONTEXT:
    {context}

    QUESTION:
    {query}
    '''

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )

    return response.text