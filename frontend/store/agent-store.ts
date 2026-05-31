import { create } from 'zustand'
import { api } from '@/lib/axios'

export interface Agent {
  _id: string
  name: string
  description: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  tools: string[]
  memoryEnabled: boolean
  ragEnabled: boolean
  status: 'active' | 'inactive' | 'draft'
  color: string
  createdAt: string
  updatedAt: string
}

interface AgentStore {
  agents: Agent[]
  loading: boolean
  selectedAgent: Agent | null

  fetchAgents: () => Promise<void>
  createAgent: (data: Partial<Agent>) => Promise<Agent | null>
  updateAgent: (id: string, data: Partial<Agent>) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
  setSelectedAgent: (agent: Agent | null) => void
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  loading: false,
  selectedAgent: null,

  fetchAgents: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/agents')
      set({ agents: response.data })
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      set({ loading: false })
    }
  },

  createAgent: async (data) => {
    try {
      const response = await api.post('/agents', data)
      set((state) => ({
        agents: [response.data, ...state.agents],
      }))
      return response.data
    } catch (error) {
      console.error('Failed to create agent:', error)
      return null
    }
  },

  updateAgent: async (id, data) => {
    try {
      const response = await api.put(`/agents/${id}`, data)
      set((state) => ({
        agents: state.agents.map((a) =>
          a._id === id ? response.data : a
        ),
      }))
    } catch (error) {
      console.error('Failed to update agent:', error)
    }
  },

  deleteAgent: async (id) => {
    try {
      await api.delete(`/agents/${id}`)
      set((state) => ({
        agents: state.agents.filter((a) => a._id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete agent:', error)
    }
  },

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}))
