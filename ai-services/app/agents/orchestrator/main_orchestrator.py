import os

from langgraph.graph import StateGraph, END

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.workflows.research_agent import research_agent
from app.agents.workflows.code_agent import code_agent
from app.agents.workflows.rag_agent import rag_agent

from typing import TypedDict, Optional


class OrchestratorState(TypedDict):
    user_input: str
    task_type: str
    research: str
    code: str
    rag_context: str
    final_response: str


async def classify_task(state: OrchestratorState) -> OrchestratorState:
    """Classify the user's request to determine which agents to invoke."""

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0,
    )

    prompt = f"""Classify the following user request into one of these categories:
- research: requires web research, fact-finding, or information gathering
- code: requires code generation, debugging, or technical implementation
- rag: requires searching through uploaded documents/knowledge base
- general: general conversation or simple questions

USER REQUEST: {state['user_input']}

Reply with ONLY one word: research, code, rag, or general."""

    response = await llm.ainvoke([HumanMessage(content=prompt)])

    task_type = response.content.strip().lower()

    if task_type not in ("research", "code", "rag", "general"):
        task_type = "general"

    state["task_type"] = task_type

    return state


async def synthesize_response(state: OrchestratorState) -> OrchestratorState:
    """Combine outputs from specialized agents into a final response."""

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.5,
    )

    context_parts = []

    if state.get("research"):
        context_parts.append(f"RESEARCH:\n{state['research']}")

    if state.get("code"):
        context_parts.append(f"CODE:\n{state['code']}")

    if state.get("rag_context"):
        context_parts.append(f"KNOWLEDGE BASE:\n{state['rag_context']}")

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No additional context."

    prompt = f"""You are a helpful AI assistant. Based on the user's request
and the following context from specialized agents, provide a comprehensive
and well-structured response.

USER REQUEST: {state['user_input']}

AGENT CONTEXT:
{context}

Provide a clear, actionable response."""

    response = await llm.ainvoke([
        SystemMessage(content="You are AutoFlow AI, an intelligent assistant."),
        HumanMessage(content=prompt),
    ])

    state["final_response"] = response.content

    return state


def route_by_task_type(state: OrchestratorState) -> str:
    """Route to the appropriate agent based on task classification."""

    task_type = state.get("task_type", "general")

    if task_type == "research":
        return "research"
    elif task_type == "code":
        return "code"
    elif task_type == "rag":
        return "rag"
    else:
        return "synthesize"


def build_orchestrator():
    """Build the multi-agent orchestration graph."""

    graph = StateGraph(OrchestratorState)

    graph.add_node("classify", classify_task)
    graph.add_node("research", research_agent)
    graph.add_node("code", code_agent)
    graph.add_node("rag", rag_agent)
    graph.add_node("synthesize", synthesize_response)

    graph.set_entry_point("classify")

    graph.add_conditional_edges(
        "classify",
        route_by_task_type,
        {
            "research": "research",
            "code": "code",
            "rag": "rag",
            "synthesize": "synthesize",
        },
    )

    # All specialized agents feed into synthesize
    graph.add_edge("research", "synthesize")
    graph.add_edge("code", "synthesize")
    graph.add_edge("rag", "synthesize")
    graph.add_edge("synthesize", END)

    return graph.compile()


orchestrator = build_orchestrator()


async def run_orchestrator(user_input: str) -> str:
    """Run the multi-agent orchestrator on a user request."""

    result = await orchestrator.ainvoke({
        "user_input": user_input,
        "task_type": "",
        "research": "",
        "code": "",
        "rag_context": "",
        "final_response": "",
    })

    return result["final_response"]