"use client"

import { Menu, LogOut, Heart } from "lucide-react"
import Image from 'next/image'
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ChatRoomModal } from "@/features/chat/components/ChatRoomModal"
import { ChatInterface } from "@/features/chat/components/ChatInterface"
import { BottomNavigation } from "@/features/chat/components/BottomNavigation"
import { useChat } from "@/features/chat/hooks/useChat"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"
import { useToast } from "@/components/common/Toast"

export default function MainPage() {
  const [activeTab, setActiveTab] = useState("home")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [initialRoomName, setInitialRoomName] = useState("")

  const { isAuthenticated } = useAuth()
  const { logout } = useLogout()
  const coupleStatus = tokenStorage.getCoupleStatus()
  const { chatRooms, createChatRoom, getMessagesForRoom, addMessage, addHistoryMessages, clearMessagesForRoom } = useChat()
  const { showToast } = useToast()

  useEffect(() => {
    console.log("메인 페이지 마운트됨")
    console.log("현재 URL:", window.location.href)
    console.log("현재 경로:", window.location.pathname)
    
    return () => {
      console.log("메인 페이지 언마운트됨")
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">페이지 로딩 중 오류가 발생했습니다</h1>
          <button 
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab)
    if (tab === "couple-chat") {
      const coupleId = tokenStorage.getCoupleId()
      if (!coupleId) {
        showToast("오류: 커플 정보가 없습니다. 먼저 커플을 등록해주세요.")
        setActiveTab("home")
        return
      }

      try {
        console.log(`[MainPage] 커플 채팅 탭 클릭. coupleId: ${coupleId}로 채팅방 조회/생성 시도`);
        const roomData = await createChatRoom({ name: "커플 채팅", coupleId })
        console.log("[MainPage] 조회/생성 결과:", roomData);

        if (roomData.is_existing) {
          // showToast(`기존 채팅방 "${roomData.name}"에 참여합니다.`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          setCurrentChatRoom(roomData.id)
          setIsModalOpen(false)
        } else {
          showToast(`새로운 커플 채팅방 이름을 설정해주세요.`)
          setInitialRoomName(roomData.name || "")
          setIsModalOpen(true)
        }
      } catch (error) {
        console.error("커플 채팅방 조회/생성 중 오류 (handleTabChange):", error)
        setActiveTab("home")
      }
    } else if (tab === "ai-counseling") {
      console.log("AI 상담 기능")
      showToast("정보: AI 상담 기능은 준비 중입니다.")
    }
  }

  const handleConfirmAndCreateRoom = async (roomNameFromModal: string) => {
    if (!roomNameFromModal.trim()) {
      showToast("경고: 채팅방 이름을 입력해주세요.")
      return
    }
    const coupleId = tokenStorage.getCoupleId()
    if (!coupleId) {
      showToast("오류: 커플 ID를 찾을 수 없습니다. 다시 시도해주세요.")
      setActiveTab("home")
      setIsModalOpen(false)
      return
    }

    try {
      console.log(`[MainPage] 모달에서 이름 입력 후 채팅방 생성/확정 시도: ${roomNameFromModal}, coupleId: ${coupleId}`);
      const newRoomData = await createChatRoom({ name: roomNameFromModal.trim(), coupleId })
      console.log("[MainPage] 모달 확인 후 생성/확정 결과:", newRoomData);
      
      if (newRoomData.is_existing && newRoomData.name !== roomNameFromModal.trim()) {
        showToast(`"${newRoomData.name}" 채팅방에 참여합니다. (요청 이름: ${roomNameFromModal.trim()})`)
      } else if (newRoomData.is_existing) {
        showToast(`기존 채팅방 "${newRoomData.name}"에 참여합니다.`)
      } else {
        showToast(`"${newRoomData.name}" 채팅방이 생성되었습니다!`)
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentChatRoom(newRoomData.id)
      setIsModalOpen(false)

    } catch (error) {
      console.error("채팅방 생성/확정 중 오류 (handleConfirmAndCreateRoom):", error)
      showToast("오류: 채팅방을 만들거나 참여하는 중 문제가 발생했습니다.")
    }
  }

  const handleBackToMain = () => {
    setCurrentChatRoom(null)
    setActiveTab("home")
  }

  const handleSendMessage = (content: string) => {
    // 메시지 전송은 ChatInterface에서 WebSocket을 통해 처리
    console.log("메시지 전송 요청:", content)
  }

  const currentRoom = chatRooms.find((room) => room.id === currentChatRoom)
  const currentMessages = currentChatRoom ? getMessagesForRoom(currentChatRoom) : []

  if (currentChatRoom && currentRoom) {
    return (
      <ChatInterface
        roomName={currentRoom.name}
        roomId={currentChatRoom}
        messages={currentMessages}
        onMessageReceived={addMessage}
        onHistoryReceived={addHistoryMessages}
        onBack={handleBackToMain}
      />
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/mainpage.png')" }}
      />

      {/* 커플 등록 버튼: 메인 이미지 영역 우측 상단에 고정 */}
      {isAuthenticated && coupleStatus === "SINGLE" && (
        <div className="absolute top-8 right-8 z-20">
          <Link href="/auth/couple-register">
            <Button
              className="hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg text-xs sm:text-sm whitespace-nowrap shadow-lg"
              style={{ backgroundColor: '#55996F' }}
            >
              커플 등록
            </Button>
          </Link>
        </div>
      )}

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="shadow-sm" style={{ backgroundColor: '#DCE9E2' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-grow flex justify-center">
              <Image src="/images/logo-gr.png" alt="I:mean 로고" width={138} height={36} style={{ objectFit: "contain" }} />
            </div>
            <div className="w-10">
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  title="로그아웃"
                  className="!bg-[#f4e6a1] !text-[#5a9b5a] hover:!bg-[#ffe066] hover:!text-[#3c1e1e] shadow-md border border-[#e0e0e0] transition-all duration-200 flex flex-row items-center gap-2 px-4 py-2 rounded-xl min-w-[1px]"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="shadow-sm" style={{ backgroundColor: '#DCE9E2' }}>
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div> {/* End of Content Wrapper */}

      {/* Chat Room Creation Modal */}
      <ChatRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmAndCreateRoom} 
        initialValue={initialRoomName} 
      />
    </div>
  )
}
