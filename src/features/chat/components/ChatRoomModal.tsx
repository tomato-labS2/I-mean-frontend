"use client"

import { useState } from "react"

interface ChatRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (roomName: string) => void
}

export const ChatRoomModal = ({ isOpen, onClose, onConfirm }: ChatRoomModalProps) => {
  const [roomName, setRoomName] = useState("")
  const maxLength = 50

  if (!isOpen) return null

  const handleConfirm = () => {
    if (roomName.trim()) {
      onConfirm(roomName.trim())
      setRoomName("")
      onClose()
    }
  }

  const handleCancel = () => {
    setRoomName("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm mx-4">
        <div className="p-6">
          <h2 className="text-center text-gray-800 mb-6 text-base">채팅방 이름을 입력해주세요.</h2>

          <div className="mb-6">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="채팅방 이름"
              maxLength={maxLength}
              className="w-full border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {roomName.length}/{maxLength}
            </div>
          </div>

          <div className="flex border-t border-gray-200">
            <button onClick={handleCancel} className="flex-1 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
              취소
            </button>
            <div className="w-px bg-gray-200"></div>
            <button
              onClick={handleConfirm}
              disabled={!roomName.trim()}
              className="flex-1 py-3 text-gray-800 hover:bg-gray-50 transition-colors disabled:text-gray-400"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
