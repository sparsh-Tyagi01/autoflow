from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-small-en"
)

vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)