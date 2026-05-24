import os

from dotenv import load_dotenv

from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

async def generate_response(
    message: str
):
    completion = await client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": """
                You are an enterprise AI assistant.
                Help users professionally.
                """
            },
            {
                "role": "user",
                "content": message
            }
        ]
    )

    return completion.choices[0].message.content