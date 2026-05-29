from pymongo import MongoClient

import os

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client["autoflow"]

def database_tool(
    collection_name: str
):

    collection = db[
        collection_name
    ]

    data = list(
        collection.find().limit(5)
    )

    for item in data:
        item["_id"] = str(item["_id"])

    return data