import os

from pymongo import MongoClient

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client["autoflow"]

chat_collection = db["chats"]

async def save_message(
    conversation_id: str,
    role: str,
    content: str
):

    existing_chat = (
        chat_collection.find_one(
            {
                "conversationId":
                conversation_id
            }
        )
    )

    if existing_chat:

        chat_collection.update_one(
            {
                "conversationId":
                conversation_id
            },
            {
                "$push": {
                    "messages": {
                        "role": role,
                        "content": content
                    }
                }
            }
        )

    else:

        chat_collection.insert_one(
            {
                "conversationId":
                conversation_id,

                "messages": [
                    {
                        "role": role,
                        "content": content
                    }
                ]
            }
        )

async def load_memory(
    conversation_id: str
):

    chat = chat_collection.find_one(
        {
            "conversationId":
            conversation_id
        }
    )

    if not chat:
        return []

    return chat["messages"]