import os
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.config import settings

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-small-en"
)

api_key = settings.PINECONE_API_KEY
index_name = settings.PINECONE_INDEX_NAME

vectorstore = None

if api_key and index_name:
    try:
        pc = Pinecone(api_key=api_key)
        existing_indexes = [idx.name for idx in pc.list_indexes()]
        
        if index_name not in existing_indexes:
            print(f"Creating Pinecone index: {index_name}")
            pc.create_index(
                name=index_name,
                dimension=384,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
        
        vectorstore = PineconeVectorStore(
            index_name=index_name,
            embedding=embeddings,
            pinecone_api_key=api_key
        )
        print("Pinecone Vector Store initialized successfully.")
    except Exception as e:
        print("Failed to initialize Pinecone. Ingestion and retrieval will fail:", e)
        vectorstore = None
else:
    print("PINECONE_API_KEY or PINECONE_INDEX_NAME is missing. Pinecone RAG search will be unavailable.")
    vectorstore = None
