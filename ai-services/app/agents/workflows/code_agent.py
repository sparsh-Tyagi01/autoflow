import os

import google.generativeai as genai

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash"
)

async def code_agent(state):
    prompt = f"""
    You are a senior software engineer.

    User Request:
    {state["user_input"]}

    Generate production-ready code.
    """

    response = await model.generate_content_async(
        prompt
    )

    state["code"] = response.text

    return state