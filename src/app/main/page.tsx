"use client"

import { Menu, LogOut, Heart, X } from "lucide-react"
import Image from 'next/image'
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [initialRoomName, setInitialRoomName] = useState("")
  const [isCoupleRegisterModalOpen, setIsCoupleRegisterModalOpen] = useState(false)

  const { isAuthenticated } = useAuth()
  const { logout } = useLogout()
  const coupleStatus = tokenStorage.getCoupleStatus()
  const { chatRooms, createChatRoom, getMessagesForRoom, addMessage, addHistoryMessages, clearMessagesForRoom, getCoupleChatRoomInfo } = useChat()
  const { showToast } = useToast()

  console.log("[MainPage] Component Rerendered. currentChatRoom:", currentChatRoom);
  useEffect(() => {
    console.log("메인 페이지 마운트됨")
    console.log("현재 URL:", window.location.href)
    console.log("현재 경로:", window.location.pathname)
    
    if (isAuthenticated && coupleStatus === "SINGLE") {
      setIsCoupleRegisterModalOpen(true)
    }
    
    return () => {
      console.log("메인 페이지 언마운트됨")
    }
  }, [isAuthenticated, coupleStatus])

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
      const coupleIdFromStorage = tokenStorage.getCoupleId()
      if (!coupleIdFromStorage) {
        showToast("오류: 커플 정보가 없습니다. 먼저 커플을 등록해주세요.")
        setActiveTab("home")
        return
      }
      const coupleId = coupleIdFromStorage.toString()

      try {
        console.log(`[MainPage] handleTabChange: "couple-chat" 탭 클릭. coupleId: ${coupleId}로 기존 방 조회 시도`)
        const roomInfo = await getCoupleChatRoomInfo(coupleId)
        console.log("[MainPage] handleTabChange: 기존 커플 채팅방 조회 결과 (roomInfo):", JSON.stringify(roomInfo))

        if (roomInfo.is_existing && roomInfo.id) {
          console.log(`[MainPage] handleTabChange: 기존 방 존재 확인. roomId: ${roomInfo.id}, roomName: ${roomInfo.name}`)
          showToast(`기존 채팅방 "${roomInfo.name || '커플 채팅'}"에 참여합니다.`)
          setCurrentChatRoom(roomInfo.id)
          console.log("[MainPage] handleTabChange: setCurrentChatRoom 호출됨. 새로운 currentChatRoom ID debería ser:", roomInfo.id)
          setIsModalOpen(false)
        } else {
          console.log("[MainPage] handleTabChange: 기존 방 없음. 모달 열기 준비.")
          showToast(`새로운 커플 채팅방 이름을 설정해주세요.`)
          setInitialRoomName("커플 채팅")
          setIsModalOpen(true)
        }
      } catch (error) {
        console.error("[MainPage] handleTabChange: 커플 채팅방 조회 중 예상치 못한 오류:", error)
        showToast(`채팅방 정보를 가져오는데 실패했습니다. 새 채팅방을 만들어주세요.`)
        setInitialRoomName("커플 채팅")
        setIsModalOpen(true)
      }
    } else if (tab === "ai-counseling") {
      console.log("AI 상담 기능")
      showToast("정보: AI 상담 기능은 준비 중입니다.")
    } else if (tab === "profile") {
      router.push("/profile")
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

    console.log(`[MainPage] handleConfirmAndCreateRoom: 모달에서 이름 입력 후 채팅방 생성/확정 시도: ${roomNameFromModal}, coupleId: ${coupleId}`);
    try {
      console.log(`[MainPage] handleConfirmAndCreateRoom: 모달에서 이름 입력 후 채팅방 생성/확정 시도: ${roomNameFromModal}, coupleId: ${coupleId}`);
      const newRoomData = await createChatRoom({ name: roomNameFromModal.trim(), coupleId })
      console.log("[MainPage] handleConfirmAndCreateRoom: 모달 확인 후 생성/확정 결과 (newRoomData):", JSON.stringify(newRoomData));
      
      if (newRoomData.name !== roomNameFromModal.trim()) {
        if (newRoomData.is_existing) {
            showToast(`"${newRoomData.name}" 채팅방에 참여합니다. (요청한 이름: "${roomNameFromModal.trim()}"과 다릅니다.)`);
        } else {
            showToast(`채팅방이 "${newRoomData.name}" 이름으로 생성되었습니다. (요청한 이름: "${roomNameFromModal.trim()}")`);
        }
      } else if (newRoomData.is_existing) {
        showToast(`기존 채팅방 "${newRoomData.name}"에 참여합니다.`);
      } else {
        showToast(`"${newRoomData.name}" 채팅방이 생성되었습니다!`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentChatRoom(newRoomData.id);
      console.log("[MainPage] handleConfirmAndCreateRoom: setCurrentChatRoom 호출됨. 새로운 currentChatRoom ID debería ser:", newRoomData.id);
      setIsModalOpen(false);

    } catch (error) {
      console.error("[MainPage] handleConfirmAndCreateRoom: 채팅방 생성/확정 중 오류:", error)
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
  console.log("[MainPage] Rendering UI. currentChatRoom:", currentChatRoom, "Found currentRoom:", currentRoom ? JSON.stringify(currentRoom) : 'Not Found in chatRooms');

  const currentMessages = currentChatRoom ? getMessagesForRoom(currentChatRoom) : []

  if (currentChatRoom && currentRoom) {
    console.log("[MainPage] Rendering ChatInterface with roomId:", currentChatRoom, "roomName:", currentRoom.name);
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

      {/* 커플 등록 팝업 */}
      {isAuthenticated && coupleStatus === "SINGLE" && isCoupleRegisterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">커플 등록 안내</h2>
              <button 
                onClick={() => setIsCoupleRegisterModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="닫기"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              아직 커플 등록을 하지 않으셨다면, 채팅을 위해 커플 등록을 진행해주세요!
            </p>
            <Link href="/auth/couple-register" passHref>
              <Button
                onClick={() => setIsCoupleRegisterModalOpen(false)}
                className="w-full hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-full text-sm sm:text-sm whitespace-nowrap shadow-lg"
                style={{ backgroundColor: '#55996F' }}
              >
                커플 등록하러 가기
              </Button>
            </Link>
          </div>
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
