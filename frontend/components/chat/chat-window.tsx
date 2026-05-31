'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, ChevronDown, Sparkles } from 'lucide-react'

import { Message, useChatStore } from '@/store/chat-store'
import { useAgentStore, Agent } from '@/store/agent-store'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/axios'
import { socket } from '@/lib/socket'

import MessageBubble from './message-bubble'
import ChatInput from './chat-input'
import TypingLoader from './typing-loader'

const SUGGESTED_PROMPTS = [
  '📊 Analyze a dataset and create insights',
  '✍️ Help me write a professional email',
  '🔍 Research the latest trends in AI',
  '💻 Generate a REST API with Express',
]

export default function ChatWindow() {
  const {
    messages,
    addMessage,
    currentConversationId,
    setMessages,
    loading,
    setLoading,
  } = useChatStore()

  const { user } = useAuthStore()
  const { agents, fetchAgents, selectedAgent, setSelectedAgent } = useAgentStore()
  const [showAgentPicker, setShowAgentPicker] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    if (!currentConversationId) return
    fetchMessages()

    // Join conversation room presence
    socket.emit('join:conversation', currentConversationId)

    // Listen for WebSocket stream events
    socket.on('chat:start', () => {
      setLoading(true)
    })

    socket.on('chat:token', (data: { token: string }) => {
      useChatStore.setState((state) => {
        const lastMsg = state.messages[state.messages.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          return {
            messages: state.messages.map((msg, idx) =>
              idx === state.messages.length - 1
                ? { ...msg, content: msg.content + data.token }
                : msg
            ),
          }
        }
        return state
      })
    })

    socket.on('chat:end', (data: { message: string }) => {
      setLoading(false)
      useChatStore.setState((state) => {
        const lastMsg = state.messages[state.messages.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          return {
            messages: state.messages.map((msg, idx) =>
              idx === state.messages.length - 1
                ? { ...msg, content: data.message }
                : msg
            ),
          }
        }
        return state
      })
    })

    socket.on('chat:error', (data: { error: string }) => {
      setLoading(false)
      useChatStore.setState((state) => {
        const lastMsg = state.messages[state.messages.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          return {
            messages: state.messages.map((msg, idx) =>
              idx === state.messages.length - 1
                ? { ...msg, content: `Error: ${data.error}` }
                : msg
            ),
          }
        }
        return state
      })
    })

    return () => {
      socket.emit('leave:conversation', currentConversationId)
      socket.off('chat:start')
      socket.off('chat:token')
      socket.off('chat:end')
      socket.off('chat:error')
    }
  }, [currentConversationId])

  const fetchMessages = async () => {
    try {
      const response = await api.get(
        `/conversations/${currentConversationId}/messages`
      )
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async (content: string) => {
    let activeConversationId = currentConversationId

    if (!activeConversationId) {
      try {
        const response = await api.post('/conversations')
        const newConversation = response.data
        useChatStore.setState((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: newConversation._id,
        }))
        activeConversationId = newConversation._id
      } catch (error) {
        console.error('Failed to auto-create conversation:', error)
        return
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    addMessage(userMessage)
    setLoading(true)

    // Append placeholder for assistant response stream
    const assistantId = crypto.randomUUID()
    addMessage({
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    })

    // Emit chat message over WebSocket
    const agentConfig = selectedAgent
      ? {
          name: selectedAgent.name,
          systemPrompt: selectedAgent.systemPrompt,
          model: selectedAgent.model,
          temperature: selectedAgent.temperature,
          tools: selectedAgent.tools,
        }
      : undefined

    socket.emit('chat:message', {
      message: content,
      conversationId: activeConversationId,
      agentConfig,
      userId: user?.id,
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Agent Selector Bar */}
      <div className="mb-3 flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowAgentPicker(!showAgentPicker)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-sm hover:border-violet-500/30 transition-all"
          >
            {selectedAgent ? (
              <>
                <div
                  className="h-5 w-5 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: selectedAgent.color }}
                >
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium">{selectedAgent.name}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span>Default Agent</span>
              </>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {showAgentPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-border/50 bg-card shadow-xl z-50 py-2"
              >
                <button
                  onClick={() => {
                    setSelectedAgent(null)
                    setShowAgentPicker(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm ${
                    !selectedAgent ? 'bg-violet-500/10 text-violet-500' : ''
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Default Agent
                </button>
                {agents.map((agent) => (
                  <button
                    key={agent._id}
                    onClick={() => {
                      setSelectedAgent(agent)
                      setShowAgentPicker(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm ${
                      selectedAgent?._id === agent._id ? 'bg-violet-500/10' : ''
                    }`}
                  >
                    <div
                      className="h-5 w-5 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: agent.color }}
                    >
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {agent.description || agent.model}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedAgent && (
          <span className="text-xs text-muted-foreground">
            {selectedAgent.model} · T={selectedAgent.temperature}
          </span>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex h-[60vh] items-center justify-center">
              <div className="text-center max-w-lg">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">AutoFlow AI</h2>
                <p className="text-muted-foreground mb-8">
                  {selectedAgent
                    ? `Chatting with ${selectedAgent.name}`
                    : 'Start a conversation with your AI assistant'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="rounded-xl border border-border/50 bg-card/50 p-3 text-left text-sm hover:border-violet-500/30 hover:shadow-md transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id || message._id} message={message} />
          ))}

          {loading && <TypingLoader />}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-4">
        <ChatInput onSend={sendMessage} loading={loading} />
      </div>
    </div>
  )
}