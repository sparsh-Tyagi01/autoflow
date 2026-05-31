'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Bot,
  Zap,
  DollarSign,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { api } from '@/lib/axios'

interface DashboardStats {
  totalConversations: number
  totalAgents: number
  totalTokens: number
  totalCost: number
  avgLatency: number
  dailyUsage: { _id: string; tokens: number; requests: number; cost: number }[]
  toolUsage: { _id: string; count: number }[]
  recentActivity: any[]
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats
    ? [
        {
          label: 'Total Conversations',
          value: formatNumber(stats.totalConversations),
          icon: MessageSquare,
          color: 'from-violet-500 to-violet-600',
          bgColor: 'bg-violet-500/10',
          textColor: 'text-violet-500',
        },
        {
          label: 'Active Agents',
          value: formatNumber(stats.totalAgents),
          icon: Bot,
          color: 'from-cyan-500 to-cyan-600',
          bgColor: 'bg-cyan-500/10',
          textColor: 'text-cyan-500',
        },
        {
          label: 'Tokens Used',
          value: formatNumber(stats.totalTokens),
          icon: Zap,
          color: 'from-amber-500 to-amber-600',
          bgColor: 'bg-amber-500/10',
          textColor: 'text-amber-500',
        },
        {
          label: 'Total Cost',
          value: `$${stats.totalCost.toFixed(2)}`,
          icon: DollarSign,
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-500/10',
          textColor: 'text-emerald-500',
        },
        {
          label: 'Avg Latency',
          value: `${stats.avgLatency}ms`,
          icon: Clock,
          color: 'from-pink-500 to-pink-600',
          bgColor: 'bg-pink-500/10',
          textColor: 'text-pink-500',
        },
      ]
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI performance, token usage, and costs
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Usage Chart (simplified bar chart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-violet-500" />
              <h3 className="font-semibold">Daily Token Usage (7 days)</h3>
            </div>
            {stats && stats.dailyUsage.length > 0 ? (
              <div className="flex items-end gap-2 h-40">
                {stats.dailyUsage.map((day) => {
                  const maxTokens = Math.max(...stats.dailyUsage.map((d) => d.tokens), 1)
                  const height = (day.tokens / maxTokens) * 100

                  return (
                    <div key={day._id} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(day.tokens)}
                      </span>
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-violet-500 to-cyan-500 transition-all"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {day._id.slice(5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                No usage data yet
              </div>
            )}
          </motion.div>

          {/* Tool Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-cyan-500" />
              <h3 className="font-semibold">Tool Usage</h3>
            </div>
            {stats && stats.toolUsage.length > 0 ? (
              <div className="space-y-3">
                {stats.toolUsage.map((tool) => {
                  const maxCount = Math.max(...stats.toolUsage.map((t) => t.count), 1)
                  const width = (tool.count / maxCount) * 100

                  return (
                    <div key={tool._id} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{tool._id}</span>
                        <span className="text-muted-foreground">{tool.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                No tool usage data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
        >
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          {stats && stats.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 10).map((activity: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.success ? 'bg-emerald-500' : 'bg-destructive'
                      }`}
                    />
                    <span className="text-sm">{activity.type}</span>
                    {activity.toolName && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {activity.toolName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{activity.tokensUsed?.total || 0} tokens</span>
                    <span>{activity.latencyMs || 0}ms</span>
                    <span>{new Date(activity.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity recorded yet. Start chatting with your agents!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
