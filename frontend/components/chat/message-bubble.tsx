import ReactMarkdown from 'react-markdown'

import { Message } from '@/store/chat-store'

interface Props {
  message: Message
}

export default function MessageBubble({
  message,
}: Props) {
  return (
    <div
      className={`max-w-3xl rounded-2xl px-4 py-3 ${
        message.role === 'user'
          ? 'bg-black text-white ml-auto'
          : 'bg-muted'
      }`}
    >
      <ReactMarkdown>
        {message.content}
      </ReactMarkdown>
    </div>
  )
}