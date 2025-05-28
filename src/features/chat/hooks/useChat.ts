"use client"

import { useState, useCallback } from "react"
import type { ChatRoom, ChatMessage, CreateChatRoomData } from "../types"

export const useChat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const createChatRoom = useCallback(async (data: CreateChatRoomData): Promise<ChatRoom> => {
    setIsLoading(true)
    try {
      // 실제 API 호출 대신 임시 데이터 생성
      const newRoom: ChatRoom = {
        id: Date.now().toString(),
        name: data.name,
        createdAt: new Date(),
      }

      setChatRooms((prev) => [...prev, newRoom])
      return newRoom
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (roomId: string, content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(), // ID 생성
      content,
      sender: "user",
      timestamp: new Date(),
      roomId,
    }

    setMessages((prev) => [...prev, newMessage])

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "안녕하세요! AI 상담사입니다. 어떤 도움이 필요하신가요?",
        sender: "ai",
        timestamp: new Date(),
        roomId,
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }, [])

  const getMessagesForRoom = useCallback(
    (roomId: string) => {
      return messages.filter((message) => message.roomId === roomId)
    },
    [messages],
  )

  return {
    chatRooms,
    messages,
    isLoading,
    createChatRoom,
    sendMessage,
    getMessagesForRoom,
  }
}