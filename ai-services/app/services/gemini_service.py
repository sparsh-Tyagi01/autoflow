import os

from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

async def stream_response(
    message: str
):
    response = model.generate_content(
        [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"""
                        You are an enterprise AI assistant.

                        User: {message}
                        """
                    }
                ]
            }
        ],
        stream=True
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text