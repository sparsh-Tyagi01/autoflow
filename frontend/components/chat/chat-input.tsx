'use client'

import { useState } from 'react'

import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  onSend: (message: string) => void
  loading: boolean
}

export default function ChatInput({
  onSend,
  loading,
}: Props) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return

    onSend(message)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder="Message your AI agent..."
        className="min-h-[60px]"
      />

      <Button
        disabled={loading}
        onClick={handleSend}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}