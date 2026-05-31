from langchain_core.tools import tool

from app.agents.tools.browser_tool import (
    browser_tool
)

from app.agents.tools.email_tool import (
    email_tool
)

from app.agents.tools.github_tool import (
    github_tool
)

from app.agents.tools.calculator_tool import (
    calculator_tool
)

from app.agents.tools.file_tool import (
    read_file_tool
)

from app.agents.tools.database_tool import (
    database_tool
)

from app.agents.tools.rag_tool import (
    rag_tool
)

@tool
async def browser(url: str):
    """
    Open and analyze websites
    """

    return await browser_tool(url)

@tool
async def send_email(
    to_email: str,
    subject: str,
    body: str
):
    """
    Send emails
    """

    return await email_tool(
        to_email,
        subject,
        body
    )

@tool
def github(repo: str):
    """
    Analyze GitHub repositories
    """

    return github_tool(repo)

@tool
def calculator(expression: str):
    """
    Solve mathematical expressions
    """

    return calculator_tool(expression)

@tool
def read_file(path: str):
    """
    Read local files
    """

    return read_file_tool(path)

@tool
def database(collection: str):
    """
    Read MongoDB collections
    """

    return database_tool(collection)

@tool
def rag_search(
    query: str
):
    """
    Search uploaded PDFs and vector database.
    """

    return rag_tool(query)

TOOLS = [
    browser,
    send_email,
    github,
    calculator,
    read_file,
    database,
    rag_search
]

TOOL_MAP = {
    "browser": browser,
    "send_email": send_email,
    "github": github,
    "calculator": calculator,
    "read_file": read_file,
    "database": database,
    "rag_search": rag_search,
}


def get_tools_by_name(names: list):
    """Return a list of tool objects from a list of tool name strings."""
    selected = []
    for name in names:
        if name in TOOL_MAP:
            selected.append(TOOL_MAP[name])
    return selected if selected else TOOLS