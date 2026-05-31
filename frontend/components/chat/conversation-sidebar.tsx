'use client'

import { useEffect } from 'react'

import { api } from '@/lib/axios'

import { useChatStore } from '@/store/chat-store'

export default function ConversationSidebar() {
  const {
    conversations,
    setConversations,
    setCurrentConversation,
    currentConversationId,
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

        if (response.data.length > 0 && !useChatStore.getState().currentConversationId) {
          useChatStore.getState().setCurrentConversation(response.data[0]._id)
        }
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
    <div className="w-80 border-r p-4 h-full flex flex-col min-h-0 bg-card/20">
      <button
        onClick={
          createConversation
        }
        className="mb-4 w-full rounded-xl bg-primary hover:opacity-90 p-3 text-primary-foreground font-medium transition-opacity"
      >
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {conversations.map(
          (conversation) => {
            const isActive = conversation._id === currentConversationId
            return (
              <button
                key={
                  conversation._id
                }
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? 'border-violet-500/30 bg-violet-500/10 text-violet-500 font-medium'
                    : 'border-border/50 hover:bg-muted/50 text-foreground'
                }`}
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
          }
        )}
      </div>
    </div>
  )
}