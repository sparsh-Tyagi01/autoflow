import ChatWindow from '@/components/chat/chat-window'

import ConversationSidebar from '@/components/chat/conversation-sidebar'

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <ConversationSidebar />

      <div className="flex-1 p-6">
        <ChatWindow />
      </div>
    </div>
  )
}