import ChatWindow from '@/components/chat/chat-window'

import ConversationSidebar from '@/components/chat/conversation-sidebar'

export default function ChatPage() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <ConversationSidebar />

      <div className="flex-1 p-6 h-full flex flex-col min-h-0">
        <ChatWindow />
      </div>
    </div>
  )
}