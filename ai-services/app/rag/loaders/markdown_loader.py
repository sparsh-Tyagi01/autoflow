from langchain_community.document_loaders import UnstructuredMarkdownLoader


def load_markdown(path: str):
    loader = UnstructuredMarkdownLoader(path)
    return loader.load()
