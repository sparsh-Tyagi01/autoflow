from langchain_community.document_loaders import WebBaseLoader


def load_website(url: str):
    loader = WebBaseLoader(url)
    return loader.load()
