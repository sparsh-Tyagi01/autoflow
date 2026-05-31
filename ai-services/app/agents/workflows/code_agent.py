import os

from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_core.messages import HumanMessage


async def code_agent(state: dict) -> dict:
    """
    Code agent: generates, reviews, or explains code
    based on the user query and research context.
    """

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.2,
    )

    prompt = f"""You are a code assistant agent. Based on the following request
and any available research context, provide relevant code,
technical analysis, or implementation guidance.

USER REQUEST:
{state['user_input']}

RESEARCH CONTEXT:
{state.get('research', 'No research context available.')}

Provide code or technical guidance as needed."""

    response = await llm.ainvoke([HumanMessage(content=prompt)])

    state["code"] = response.content

    return state
