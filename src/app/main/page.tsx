"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { ChatRoomModal } from "@/features/chat/components/ChatRoomModal"
import { ChatInterface } from "@/features/chat/components/ChatInterface"
import { BottomNavigation } from "@/features/chat/components/BottomNavigation"
import { useChat } from "@/features/chat/hooks/useChat"

export default function MainPage() {
  const [activeTab, setActiveTab] = useState("home")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null)

  const { chatRooms, createChatRoom, sendMessage, getMessagesForRoom } = useChat()

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "couple-chat") {
      setIsModalOpen(true)
    } else if (tab === "ai-counseling") {
      // AI 상담 기능 구현 예정
      console.log("AI 상담 기능")
    }
  }

  const handleCreateRoom = async (roomName: string) => {
    const newRoom = await createChatRoom({ name: roomName })
    setCurrentChatRoom(newRoom.id)
  }

  const handleBackToMain = () => {
    setCurrentChatRoom(null)
    setActiveTab("home")
  }

  const handleSendMessage = (content: string) => {
    if (currentChatRoom) {
      sendMessage(currentChatRoom, content)
    }
  }

  const currentRoom = chatRooms.find((room) => room.id === currentChatRoom)
  const currentMessages = currentChatRoom ? getMessagesForRoom(currentChatRoom) : []

  if (currentChatRoom && currentRoom) {
    return (
      <ChatInterface
        roomName={currentRoom.name}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        onBack={handleBackToMain}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="p-2">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-green-600">I:mean</h1>
            <p className="text-xs text-gray-500">couple counseling</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="text-center">
          <div className="w-32 h-32 bg-green-200 rounded-full mx-auto mb-8 flex items-center justify-center">
            <span className="text-4xl">💑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">AI 상담사와 함께하는</h2>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">커플 채팅</h2>
          <p className="text-gray-600 mb-8">
            하단의 채팅 아이콘을 눌러
            <br />
            새로운 채팅방을 시작해보세요
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Chat Room Creation Modal */}
      <ChatRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleCreateRoom} />
    </div>
  )
}
