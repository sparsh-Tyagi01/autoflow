'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Trash2,
  Settings,
  Zap,
  Clock,
  GitBranch,
  X,
} from 'lucide-react'
import { api } from '@/lib/axios'

interface WorkflowItem {
  _id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  nodes: any[]
  edges: any[]
  trigger: { type: string; config: any }
  runCount: number
  lastRunAt: string | null
  createdAt: string
}

const NODE_TYPES = [
  { type: 'trigger', label: 'Trigger', icon: '⚡', color: 'bg-amber-500' },
  { type: 'ai', label: 'AI Reasoning', icon: '🧠', color: 'bg-violet-500' },
  { type: 'condition', label: 'Condition', icon: '🔀', color: 'bg-cyan-500' },
  { type: 'action', label: 'Action', icon: '⚙️', color: 'bg-emerald-500' },
  { type: 'delay', label: 'Delay', icon: '⏱️', color: 'bg-orange-500' },
  { type: 'approval', label: 'Approval', icon: '✅', color: 'bg-pink-500' },
  { type: 'api', label: 'API Call', icon: '🌐', color: 'bg-blue-500' },
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    trigger: 'manual',
  })

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/workflows')
      setWorkflows(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return
    try {
      const response = await api.post('/workflows', {
        name: form.name,
        description: form.description,
        trigger: { type: form.trigger },
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            label: 'Start',
            config: {},
            position: { x: 250, y: 50 },
          },
        ],
        edges: [],
      })
      setWorkflows([response.data, ...workflows])
      setForm({ name: '', description: '', trigger: 'manual' })
      setShowCreate(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/workflows/${id}`)
      setWorkflows(workflows.filter((w) => w._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleStatus = async (workflow: WorkflowItem) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active'
    try {
      const response = await api.put(`/workflows/${workflow._id}`, {
        status: newStatus,
      })
      setWorkflows(workflows.map((w) => (w._id === workflow._id ? response.data : w)))
    } catch (error) {
      console.error(error)
    }
  }

  const statusConfig = {
    draft: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Draft' },
    active: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Active' },
    paused: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Paused' },
    archived: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Archived' },
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Automate complex processes with AI-powered workflows
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </button>
        </div>

        {/* Node Types Preview */}
        <div className="flex flex-wrap gap-2 mb-8">
          {NODE_TYPES.map((node) => (
            <div
              key={node.type}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-card/50 text-xs"
            >
              <span>{node.icon}</span>
              <span>{node.label}</span>
            </div>
          ))}
        </div>

        {/* Workflow List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Workflow className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-1">No workflows yet</h3>
            <p className="text-muted-foreground text-sm">
              Create your first automated workflow
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {workflows.map((workflow, i) => {
                const status = statusConfig[workflow.status]

                return (
                  <motion.div
                    key={workflow._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center">
                        <GitBranch className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStatus(workflow)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          {workflow.status === 'active' ? (
                            <Pause className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Play className="h-4 w-4 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(workflow._id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {workflow.description || 'No description'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        {workflow.trigger?.type || 'manual'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{workflow.nodes?.length || 0} nodes</span>
                      <span>
                        {workflow.runCount > 0
                          ? `${workflow.runCount} runs`
                          : 'Never run'}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">New Workflow</h2>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Customer Onboarding"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="What does this workflow do?"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Trigger</label>
                    <select
                      value={form.trigger}
                      onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      <option value="manual">Manual</option>
                      <option value="schedule">Schedule</option>
                      <option value="webhook">Webhook</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCreate}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Create Workflow
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
