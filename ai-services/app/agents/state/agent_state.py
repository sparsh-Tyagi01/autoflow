from typing import TypedDict, List

class AgentState(TypedDict):
    user_input: str

    research: str

    code: str

    rag_context: str

    final_response: str

    messages: List[str]