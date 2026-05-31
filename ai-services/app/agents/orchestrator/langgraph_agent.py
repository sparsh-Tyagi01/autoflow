import os

from langgraph.graph import (
    StateGraph,
    END
)

from langgraph.prebuilt import (
    ToolNode
)

from langchain_google_genai import (
    ChatGoogleGenerativeAI
)

from langchain_core.messages import (
    HumanMessage,
    SystemMessage
)

from app.agents.tools.tool_registry import (
    TOOLS,
    get_tools_by_name,
)

from app.agents.state.agent_state import (
    AgentState
)

from app.memory.checkpointer import (
    memory
)

from app.memory.conversation_memory import (
    save_message
)

from app.agents.prompts.system_prompt import (
    SYSTEM_PROMPT
)
from app.core.config import (
    settings
)


def normalize_content(content) -> str:
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                parts.append(str(part["text"]))
            else:
                parts.append(str(part))
        return "".join(parts)

    return str(content)


from langchain_core.runnables import RunnableConfig
from langchain_core.messages import AIMessage

def build_agent(
    model_name: str = "gemini-2.5-flash-lite",
    temperature: float = 0,
    tool_names: list = None,
):
    """Build a LangGraph agent with configurable model, temperature, and tools."""

    api_key = settings.GOOGLE_API_KEY or settings.GEMINI_API_KEY

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=temperature,
    )

    if tool_names:
        selected_tools = get_tools_by_name(tool_names)
    else:
        selected_tools = TOOLS

    llm_with_tools = llm.bind_tools(selected_tools)

    async def chatbot(state: AgentState, config: RunnableConfig):
        full_message = None
        async for chunk in llm_with_tools.astream(
            state["messages"],
            config=config,
        ):
            if full_message is None:
                full_message = chunk
            else:
                full_message += chunk
        
        if full_message is None:
            full_message = AIMessage(content="")
            
        return {"messages": [full_message]}

    tool_node = ToolNode(selected_tools)

    graph = StateGraph(AgentState)

    graph.add_node("chatbot", chatbot)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("chatbot")

    graph.add_conditional_edges(
        "chatbot",
        lambda state:
        "tools"
        if state["messages"][-1].tool_calls
        else END
    )

    graph.add_edge("tools", "chatbot")

    return graph.compile(checkpointer=memory)


# Default agent
default_agent = build_agent()


async def run_agent(
    user_input: str,
    conversation_id: str,
    agent_config: dict = None,
):
    """Run the LangGraph agent with optional dynamic config."""

    # Retrieve relevant semantic memories from Pinecone
    from app.memory.semantic_memory import retrieve_semantic_memory, save_semantic_memory
    memories = await retrieve_semantic_memory(conversation_id, user_input)

    if agent_config:
        system_prompt = agent_config.get("system_prompt", SYSTEM_PROMPT)
        model_name = agent_config.get("model", "gemini-2.5-flash-lite")
        temperature = agent_config.get("temperature", 0)
        tool_names = agent_config.get("tools", None)

        agent = build_agent(
            model_name=model_name,
            temperature=temperature,
            tool_names=tool_names if tool_names else None,
        )
    else:
        system_prompt = SYSTEM_PROMPT
        agent = default_agent

    # Inject semantic memory if present
    if memories:
        system_prompt = f"{system_prompt}\n\n[PAST MEMORIES / RELEVANT CONTEXT]\nUser facts & history summaries:\n{memories}"

    result = await agent.ainvoke(
        {
            "messages": [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_input),
            ]
        },
        config={
            "configurable": {
                "thread_id": conversation_id
            }
        },
    )

    final_response = normalize_content(
        result["messages"][-1].content
    )

    await save_message(
        conversation_id,
        "user",
        user_input,
    )

    await save_message(
        conversation_id,
        "assistant",
        final_response,
    )

    # Process and save new conversation summaries to semantic memory
    await save_semantic_memory(conversation_id)

    return final_response


async def stream_agent(
    user_input: str,
    conversation_id: str,
    agent_config: dict = None,
):
    """Stream the LangGraph agent response token by token."""

    # Retrieve relevant semantic memories from Pinecone
    from app.memory.semantic_memory import retrieve_semantic_memory, save_semantic_memory
    memories = await retrieve_semantic_memory(conversation_id, user_input)

    if agent_config:
        system_prompt = agent_config.get("system_prompt", SYSTEM_PROMPT)
        model_name = agent_config.get("model", "gemini-2.5-flash-lite")
        temperature = agent_config.get("temperature", 0)
        tool_names = agent_config.get("tools", None)

        agent = build_agent(
            model_name=model_name,
            temperature=temperature,
            tool_names=tool_names if tool_names else None,
        )
    else:
        system_prompt = SYSTEM_PROMPT
        agent = default_agent

    # Inject semantic memory if present
    if memories:
        system_prompt = f"{system_prompt}\n\n[PAST MEMORIES / RELEVANT CONTEXT]\nUser facts & history summaries:\n{memories}"

    full_response = ""

    async for event in agent.astream_events(
        {
            "messages": [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_input),
            ]
        },
        config={
            "configurable": {
                "thread_id": conversation_id
            }
        },
        version="v2",
    ):
        kind = event.get("event")

        if kind == "on_chat_model_stream":
            content = event["data"]["chunk"].content
            if content:
                text = normalize_content(content)
                full_response += text
                yield text

    await save_message(conversation_id, "user", user_input)
    await save_message(conversation_id, "assistant", full_response)

    # Process and save new conversation summaries to semantic memory
    await save_semantic_memory(conversation_id)