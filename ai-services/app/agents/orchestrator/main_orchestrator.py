import os

import google.generativeai as genai

from app.agents.workflows.research_agent import research_agent

from app.agents.workflows.code_agent import code_agent

from app.agents.workflows.rag_agent import rag_agent


genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash"
)

async def run_agents(user_input: str):

    state = {
        "user_input": user_input,
        "research": "",
        "code": "",
        "rag_context": "",
        "final_response": "",
        "messages": []
    }

    state = await research_agent(
        state
    )

    state = await rag_agent(
        state
    )

    state = await code_agent(
        state
    )

    final_prompt = f"""
    You are an orchestrator AI.

    USER REQUEST:
    {user_input}

    RESEARCH:
    {state["research"]}

    RAG CONTEXT:
    {state["rag_context"]}

    CODE:
    {state["code"]}

    Generate the best final response.
    """

    response = await model.generate_content_async(
        final_prompt
    )

    state["final_response"] = (
        response.text
    )

    return state["final_response"]