import { create } from 'zustand'

export interface Message {
  id?: string
  _id?: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Conversation {
  _id: string
  title: string
}

interface ChatStore {
  messages: Message[]

  conversations: Conversation[]

  currentConversationId:
    | string
    | null

  loading: boolean

  setMessages: (
    messages: Message[]
  ) => void

  addMessage: (
    message: Message
  ) => void

  setConversations: (
    conversations: Conversation[]
  ) => void

  setCurrentConversation: (
    id: string
  ) => void

  setLoading: (
    loading: boolean
  ) => void
}

export const useChatStore =
  create<ChatStore>((set) => ({
    messages: [],

    conversations: [],

    currentConversationId: null,

    loading: false,

    setMessages: (messages) =>
      set({
        messages,
      }),

    addMessage: (message) =>
      set((state) => ({
        messages: [
          ...state.messages,
          message,
        ],
      })),

    setConversations: (
      conversations
    ) =>
      set({
        conversations,
      }),

    setCurrentConversation: (
      id
    ) =>
      set({
        currentConversationId: id,
      }),

    setLoading: (loading) =>
      set({
        loading,
      }),
  }))