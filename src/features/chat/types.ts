export interface ChatRoom {
  id: string
  name: string
  createdAt: Date
  lastMessage?: string
  lastMessageTime?: Date
}

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "partner" | "ai" | "system"
  type?: "message" | "ai_message" | "system" | "session" | "response" | "error" | "chat_history"
  timestamp: Date
  roomId: string
}

export interface CreateChatRoomData {
  name: string
  coupleId: number
}