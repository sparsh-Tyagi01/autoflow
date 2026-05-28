from app.agents.tools.web_search_tool import (
    web_search
)

async def research_agent(state):
    query = state["user_input"]

    results = web_search(query)

    formatted = "\n".join(
        [
            r["content"]
            for r in results
        ]
    )

    state["research"] = formatted

    return state