'use client'

import { useEffect } from 'react'

import { api } from '@/lib/axios'

import { useChatStore } from '@/store/chat-store'

export default function ConversationSidebar() {
  const {
    conversations,
    setConversations,
    setCurrentConversation,
  } = useChatStore()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations =
    async () => {
      try {
        const response =
          await api.get(
            '/conversations'
          )

        setConversations(
          response.data
        )
      } catch (error) {
        console.error(error)
      }
    }

  const createConversation =
    async () => {
      try {
        const response =
          await api.post(
            '/conversations'
          )

        setConversations([
          response.data,
          ...conversations,
        ])

        setCurrentConversation(
          response.data._id
        )
      } catch (error) {
        console.error(error)
      }
    }

  return (
    <div className="w-80 border-r p-4">
      <button
        onClick={
          createConversation
        }
        className="mb-4 w-full rounded-xl bg-black p-3 text-white"
      >
        New Chat
      </button>

      <div className="space-y-2">
        {conversations.map(
          (conversation) => (
            <button
              key={
                conversation._id
              }
              className="w-full rounded-xl border p-3 text-left hover:bg-muted"
              onClick={() =>
                setCurrentConversation(
                  conversation._id
                )
              }
            >
              {
                conversation.title
              }
            </button>
          )
        )}
      </div>
    </div>
  )
}