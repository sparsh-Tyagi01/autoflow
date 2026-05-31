'use client'

import Link from 'next/link'

import { motion } from 'framer-motion'

import {
  Bot,
  Brain,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'AI Agent Builder',
    description: 'Create custom AI agents with configurable prompts, personalities, and tool integrations.',
  },
  {
    icon: Brain,
    title: 'RAG Pipeline',
    description: 'Upload documents and build knowledge bases. Semantic search with source attribution.',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Drag-and-drop workflow builder with triggers, conditions, and autonomous execution.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'JWT auth, RBAC, rate limiting, encrypted secrets, and audit logging.',
  },
  {
    icon: BarChart3,
    title: 'AI Analytics',
    description: 'Token usage, cost tracking, agent performance metrics, and ROI insights.',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Agent Chat',
    description: 'Real-time streaming responses, tool calling, and multi-agent collaboration.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AutoFlow</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            Enterprise AI Agent Operating System
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Build{' '}
            <span className="bg-gradient-to-r from-violet-500 via-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">
              Intelligent AI
            </span>
            <br />
            Employees for Your Business
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create AI agents that reason, remember, retrieve knowledge, call tools, automate
            workflows, and collaborate — all from one unified platform.
          </p>

          <div className="flex items-center gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-base hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
            >
              Start Building
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-base font-medium hover:bg-card transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 flex items-center justify-center mb-4 group-hover:from-violet-500/20 group-hover:to-cyan-500/20 transition-all">
                  <Icon className="h-5 w-5 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 pb-20 text-center">
        <div className="max-w-2xl mx-auto rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-10">
          <h2 className="text-2xl font-bold mb-3">Ready to deploy your AI workforce?</h2>
          <p className="text-muted-foreground mb-6">
            Start with a free tier. Scale as your agents grow.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}