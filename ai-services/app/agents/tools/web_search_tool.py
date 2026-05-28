from tavily import TavilyClient

import os

client = TavilyClient(
    api_key=os.getenv(
        "TAVILY_API_KEY"
    )
)

def web_search(query: str):
    response = client.search(
        query=query,
        search_depth="advanced",
        max_results=5
    )

    return response["results"]