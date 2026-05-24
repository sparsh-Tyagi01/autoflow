import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface ChatStore {
  messages: Message[]
  loading: boolean

  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>(
  (set) => ({
    messages: [],
    loading: false,

    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),

    setLoading: (loading) =>
      set({ loading }),

    clearMessages: () =>
      set({ messages: [] }),
  })
)