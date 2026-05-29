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
    HumanMessage
)

from app.agents.tools.tool_registry import (
    TOOLS
)

from app.agents.state.agent_state import (
    AgentState
)

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
    user_input: str
):

    result = await agent.ainvoke(
        {
            "messages": [
                HumanMessage(
                    content=user_input
                )
            ]
        }
    )

    return result["messages"][-1].content