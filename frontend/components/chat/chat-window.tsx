'use client'

import { useEffect, useRef } from 'react'

import {
  Message,
  useChatStore,
} from '@/store/chat-store'

import MessageBubble from './message-bubble'
import ChatInput from './chat-input'
import TypingLoader from './typing-loader'

export default function ChatWindow() {
  const {
    messages,
    addMessage,
    loading,
    setLoading,
  } = useChatStore()

  const bottomRef = useRef<HTMLDivElement | null>(
    null
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const sendMessage = async (
    content: string
  ) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    addMessage(userMessage)

    setLoading(true)

    const assistantId =
      crypto.randomUUID()

    addMessage({
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    })

    try {
      const response = await fetch(
        'http://localhost:8080/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            message: content,
          }),
        }
      )

      const reader =
        response.body?.getReader()

      const decoder = new TextDecoder()

      let fullText = ''

      while (true) {
        const { done, value } =
          await reader!.read()

        if (done) break

        const chunk =
          decoder.decode(value)

        fullText += chunk

        useChatStore.setState(
          (state) => ({
            messages:
              state.messages.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      content: fullText,
                    }
                  : msg
              ),
          })
        )
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto rounded-2xl border bg-background p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex h-[70vh] items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold">
                  AutoFlow AI
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Start chatting with your AI agents
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}

          {loading && <TypingLoader />}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-4">
        <ChatInput
          onSend={sendMessage}
          loading={loading}
        />
      </div>
    </div>
  )
}