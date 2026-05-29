# from typing import TypedDict, List

# class AgentState(TypedDict):
#     user_input: str

#     research: str

#     code: str

#     rag_context: str

#     final_response: str

#     messages: List[str]


from typing import Annotated

from typing_extensions import TypedDict

from langchain_core.messages import (
    BaseMessage
)

from langgraph.graph.message import (
    add_messages
)

class AgentState(TypedDict):

    messages: Annotated[
        list[BaseMessage],
        add_messages
    ]