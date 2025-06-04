"use client"

import { useState, useCallback } from "react"
import type { ChatRoom, ChatMessage, CreateChatRoomData } from "../types"
import { chatApi, type CreateChatRoomResponse, type GetCoupleChatRoomResponse } from "../api/chatApi"
import { useToast } from "@/components/common/Toast"
import { sendWebSocketMessage } from "@/lib/websocket"

export const useChat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const createChatRoom = useCallback(async (data: CreateChatRoomData): Promise<CreateChatRoomResponse> => {
    setIsLoading(true)
    try {
      console.log("채팅방 생성/조회 시도 (useChat):", data.name, data.coupleId)
      const newRoom = await chatApi.createChatRoom(data)
      console.log("채팅방 생성/조회 성공 (useChat):", JSON.stringify(newRoom))
      const newRoomData: ChatRoom = {
        id: newRoom.id,
        name: newRoom.name,
        createdAt: newRoom.createdAt,
      };
      setChatRooms((prevChatRooms) => {
        const existingRoomIndex = prevChatRooms.findIndex(room => room.id === newRoomData.id);
        if (existingRoomIndex > -1) {
          const updatedRooms = [...prevChatRooms];
          updatedRooms[existingRoomIndex] = { ...updatedRooms[existingRoomIndex], ...newRoomData };
          console.log("[useChat Hook] createChatRoom: 기존 채팅방 정보 업데이트 in chatRooms state:", JSON.stringify(updatedRooms));
          return updatedRooms;
        } else {
          const newRooms = [...prevChatRooms, newRoomData];
          console.log("[useChat Hook] createChatRoom: 새 채팅방 정보 추가 in chatRooms state:", JSON.stringify(newRooms));
          return newRooms;
        }
      });
      return newRoom
    } catch (error) {
      console.error("채팅방 생성/조회 실패 (useChat):", error)
      const errorMessage = error instanceof Error ? error.message : "채팅방 생성/조회에 실패했습니다."
      showToast(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [showToast, setChatRooms, setIsLoading])

  const getCoupleChatRoomInfo = useCallback(async (coupleId: string): Promise<GetCoupleChatRoomResponse> => {
    setIsLoading(true);
    console.log("[useChat Hook] getCoupleChatRoomInfo: 조회 시작, coupleId:", coupleId);
    try {
      const roomInfo = await chatApi.getCoupleChatRoom(coupleId);
      console.log("[useChat Hook] getCoupleChatRoomInfo: API 응답 받음, roomInfo:", JSON.stringify(roomInfo));

      let roomCreatedAt: Date;
      if (roomInfo.created_at && typeof roomInfo.created_at === 'string') {
        roomCreatedAt = new Date(roomInfo.created_at);
      } else if (roomInfo.created_at instanceof Date) {
        roomCreatedAt = roomInfo.created_at;
      } else {
        roomCreatedAt = new Date();
      }

      if (roomInfo.is_existing && roomInfo.id && roomInfo.name) {
        const newRoomData: ChatRoom = {
          id: roomInfo.id,
          name: roomInfo.name,
          createdAt: roomCreatedAt 
        };

        setChatRooms(prevChatRooms => {
          const existingRoomIndex = prevChatRooms.findIndex(room => room.id === newRoomData.id);
          if (existingRoomIndex > -1) {
            const updatedRooms = [...prevChatRooms];
            updatedRooms[existingRoomIndex] = { ...updatedRooms[existingRoomIndex], ...newRoomData };
            console.log("[useChat Hook] getCoupleChatRoomInfo: 기존 채팅방 정보 업데이트 in chatRooms state:", JSON.stringify(updatedRooms));
            return updatedRooms;
          } else {
            const newRooms = [...prevChatRooms, newRoomData];
            console.log("[useChat Hook] getCoupleChatRoomInfo: 새 채팅방 정보 추가 in chatRooms state:", JSON.stringify(newRooms));
            return newRooms;
          }
        });
      }
      return roomInfo;
    } catch (error) {
      console.error("[useChat Hook] getCoupleChatRoomInfo: 커플 채팅방 정보 조회 실패:", error);
      const errorMessage = error instanceof Error ? error.message : "커플 채팅방 정보 조회에 실패했습니다.";
      showToast(errorMessage);
      return { id: null, name: null, is_existing: false };
    } finally {
      setIsLoading(false);
      console.log("[useChat Hook] getCoupleChatRoomInfo: 조회 완료 (finally)");
    }
  }, [showToast, setChatRooms, setIsLoading]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.find(m => m.id === message.id)) return prev
      return [...prev, message].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    })
  }, [])

  const addHistoryMessages = useCallback((historyMessages: ChatMessage[], roomId: string) => {
    setMessages((prev) => {
      const combinedMessages = [...prev]
      historyMessages.forEach(histMsg => {
        if (!combinedMessages.find(m => m.id === histMsg.id)) {
          combinedMessages.push(histMsg)
        }
      })
      return combinedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    })
  }, [])

  const clearMessagesForRoom = useCallback((roomId: string) => {
    console.log(`[useChat] clearMessagesForRoom for ${roomId} - 현재는 실제 동작 안 함, 필요시 주석 해제`)
  }, [])

  const getMessagesForRoom = useCallback(
    (roomId: string) => {
      return messages.filter((message) => message.roomId === roomId)
                     .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    },
    [messages],
  )

  const sendMessage = useCallback((roomId: string, content: string) => {
    if (!content.trim()) return
    try {
      sendWebSocketMessage("message", content)
    } catch (e) {
      showToast("메시지 전송 중 오류가 발생했습니다.")
      console.error("sendMessage error:", e)
    }
  }, [showToast])

  return {
    chatRooms,
    messages,
    isLoading,
    createChatRoom,
    getCoupleChatRoomInfo,
    addMessage,
    addHistoryMessages,
    clearMessagesForRoom,
    getMessagesForRoom,
    sendMessage,
  }
}