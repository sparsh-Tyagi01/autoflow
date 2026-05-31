'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Plus,
  Settings,
  Trash2,
  Zap,
  Brain,
  X,
  Check,
} from 'lucide-react'
import { useAgentStore, Agent } from '@/store/agent-store'

const TOOLS_LIST = [
  { id: 'browser', label: 'Web Browser', icon: '🌐' },
  { id: 'send_email', label: 'Email', icon: '📧' },
  { id: 'github', label: 'GitHub', icon: '🐙' },
  { id: 'calculator', label: 'Calculator', icon: '🧮' },
  { id: 'read_file', label: 'File Reader', icon: '📄' },
  { id: 'database', label: 'Database', icon: '🗄️' },
  { id: 'rag_search', label: 'RAG Search', icon: '🔍' },
]

const MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
]

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6',
]

export default function AgentsPage() {
  const { agents, loading, fetchAgents, createAgent, updateAgent, deleteAgent } =
    useAgentStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editAgent, setEditAgent] = useState<Agent | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    systemPrompt: 'You are a helpful AI assistant.',
    model: 'gemini-2.5-flash-lite',
    temperature: 0.7,
    maxTokens: 4096,
    tools: [] as string[],
    memoryEnabled: true,
    ragEnabled: false,
    color: '#6366f1',
  })

  useEffect(() => {
    fetchAgents()
  }, [])

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      systemPrompt: 'You are a helpful AI assistant.',
      model: 'gemini-2.5-flash-lite',
      temperature: 0.7,
      maxTokens: 4096,
      tools: [],
      memoryEnabled: true,
      ragEnabled: false,
      color: '#6366f1',
    })
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return
    await createAgent(form)
    resetForm()
    setShowCreate(false)
  }

  const handleEdit = (agent: Agent) => {
    setEditAgent(agent)
    setForm({
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      tools: agent.tools,
      memoryEnabled: agent.memoryEnabled,
      ragEnabled: agent.ragEnabled,
      color: agent.color,
    })
    setShowCreate(true)
  }

  const handleSave = async () => {
    if (editAgent) {
      await updateAgent(editAgent._id, form)
      setEditAgent(null)
    } else {
      await handleCreate()
      return
    }
    resetForm()
    setShowCreate(false)
  }

  const toggleTool = (toolId: string) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter((t) => t !== toolId)
        : [...prev.tools, toolId],
    }))
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your intelligent AI employees
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setEditAgent(null)
              setShowCreate(true)
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </button>
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-1">No agents yet</h3>
            <p className="text-muted-foreground text-sm">
              Create your first AI agent to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {agents.map((agent, i) => (
                <motion.div
                  key={agent._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: agent.color }}
                    >
                      <Bot className="h-6 w-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(agent)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteAgent(agent._id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {agent.description || 'No description'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500">
                      <Zap className="h-3 w-3" />
                      {agent.model}
                    </span>
                    {agent.memoryEnabled && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500">
                        <Brain className="h-3 w-3" />
                        Memory
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{agent.tools.length} tools</span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        agent.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => {
                setShowCreate(false)
                setEditAgent(null)
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl border border-border/50 bg-card p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editAgent ? 'Edit Agent' : 'Create Agent'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreate(false)
                      setEditAgent(null)
                    }}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Research Assistant"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="What does this agent do?"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  {/* System Prompt */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">System Prompt</label>
                    <textarea
                      value={form.systemPrompt}
                      onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                      rows={4}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Model</label>
                    <select
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      {MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Temperature: {form.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={form.temperature}
                      onChange={(e) =>
                        setForm({ ...form, temperature: parseFloat(e.target.value) })
                      }
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Tools */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tools</label>
                    <div className="grid grid-cols-2 gap-2">
                      {TOOLS_LIST.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => toggleTool(tool.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                            form.tools.includes(tool.id)
                              ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                              : 'border-border hover:border-border/80'
                          }`}
                        >
                          <span>{tool.icon}</span>
                          <span>{tool.label}</span>
                          {form.tools.includes(tool.id) && (
                            <Check className="h-3.5 w-3.5 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        setForm({ ...form, memoryEnabled: !form.memoryEnabled })
                      }
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
                        form.memoryEnabled
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                          : 'border-border'
                      }`}
                    >
                      <Brain className="h-4 w-4" />
                      Memory
                    </button>
                    <button
                      onClick={() =>
                        setForm({ ...form, ragEnabled: !form.ragEnabled })
                      }
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
                        form.ragEnabled
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-border'
                      }`}
                    >
                      🔍 RAG
                    </button>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setForm({ ...form, color: c })}
                          className={`h-8 w-8 rounded-full transition-all ${
                            form.color === c
                              ? 'ring-2 ring-offset-2 ring-offset-background'
                              : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSave}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    {editAgent ? 'Save Changes' : 'Create Agent'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
