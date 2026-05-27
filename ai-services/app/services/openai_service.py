import os

from dotenv import load_dotenv

from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

async def stream_response(
    message: str
):
    stream = await client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": """
                You are an enterprise AI assistant.
                """
            },
            {
                "role": "user",
                "content": message
            }
        ],
        stream=True
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content

        if delta:
            yield delta