import requests

def github_tool(
    repo: str
):

    url = (
        f"https://api.github.com/repos/{repo}"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return "Repository not found"

    data = response.json()

    return {
        "name": data["name"],
        "description":
        data["description"],
        "stars":
        data["stargazers_count"],
        "forks":
        data["forks_count"],
        "issues":
        data["open_issues_count"],
        "url":
        data["html_url"]
    }