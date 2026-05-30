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
    AIMessage,
    SystemMessage
)

from app.agents.tools.tool_registry import (
    TOOLS
)

from app.agents.state.agent_state import (
    AgentState
)

from app.memory.conversation_memory import (
    load_memory,
    save_message
)

def _normalize_content_to_text(
    content
) -> str:
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
        return "".join(parts).strip()
    return str(content)


# Gemini LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv(
        "GOOGLE_API_KEY"
    ),
    temperature=0
)

# Bind tools
llm_with_tools = llm.bind_tools(
    TOOLS
)

# Chatbot node
async def chatbot(
    state: AgentState
):

    response = await llm_with_tools.ainvoke(
        state["messages"]
    )

    return {
        "messages": [
            response
        ]
    }

# Tool node
tool_node = ToolNode(
    TOOLS
)

# Create graph
graph = StateGraph(
    AgentState
)

graph.add_node(
    "chatbot",
    chatbot
)

graph.add_node(
    "tools",
    tool_node
)

graph.set_entry_point(
    "chatbot"
)

# Conditional routing
graph.add_conditional_edges(
    "chatbot",

    lambda state:
    "tools"
    if state["messages"][-1].tool_calls
    else END
)

# Loop back after tool execution
graph.add_edge(
    "tools",
    "chatbot"
)

# Compile graph
agent = graph.compile()

# Run agent
async def run_agent(
    user_input: str,
    conversation_id: str
):

    previous_messages = (
        await load_memory(
            conversation_id
        )
    )

    messages = [
        SystemMessage(
            content=(
                "You are a helpful assistant. Use the conversation history "
                "to answer questions about previously shared facts."
            )
        )
    ]

    for msg in previous_messages:

        if msg["role"] == "user":

            messages.append(
                HumanMessage(
                    content=
                    _normalize_content_to_text(
                        msg["content"]
                    )
                )
            )

        elif (
            msg["role"]
            == "assistant"
        ):

            messages.append(
                AIMessage(
                    content=
                    _normalize_content_to_text(
                        msg["content"]
                    )
                )
            )

    messages.append(
        HumanMessage(
            content=user_input
        )
    )

    result = await agent.ainvoke(
        {
            "messages": messages
        }
    )

    final_response = (
        _normalize_content_to_text(
            result["messages"][-1].content
        )
    )

    await save_message(
        conversation_id,
        "user",
        user_input
    )

    await save_message(
        conversation_id,
        "assistant",
        final_response
    )

    return final_response