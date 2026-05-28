import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

async def stream_response(
    message: str
):
    response = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=[
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            "You are an enterprise AI assistant.\n\n"
                            f"User: {message}"
                        )
                    }
                ],
            }
        ],
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text