"use client"

import { useParams, useRouter } from "next/navigation"
import { ChatInterface } from "@/features/chat/components/ChatInterface"
import { useChat } from "@/features/chat/hooks/useChat"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { chatRooms, sendMessage, getMessagesForRoom } = useChat()

  const roomId = params.id as string
  const currentRoom = chatRooms.find((room) => room.id === roomId)
  const messages = getMessagesForRoom(roomId)

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>채팅방을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const handleSendMessage = (content: string) => {
    sendMessage(roomId, content)
  }

  const handleBack = () => {
    router.push("/")
  }

  return (
    <ChatInterface
      roomName={currentRoom.name}
      messages={messages}
      onSendMessage={handleSendMessage}
      onBack={handleBack}
    />
  )
}
