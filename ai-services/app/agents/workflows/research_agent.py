import os

from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_core.messages import HumanMessage


async def research_agent(state: dict) -> dict:
    """
    Research agent: searches the web and gathers information
    for a given user query.
    """

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.3,
    )

    prompt = f"""You are a research agent. Analyze the following request
and provide a comprehensive research summary with key findings,
facts, and relevant context.

USER REQUEST:
{state['user_input']}

Provide a structured research report."""

    response = await llm.ainvoke([HumanMessage(content=prompt)])

    state["research"] = response.content

    return state
