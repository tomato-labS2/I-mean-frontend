"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send } from "lucide-react"
import type { ChatMessage } from "../types"

interface ChatInterfaceProps {
  roomName: string
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  onBack: () => void
}

export const ChatInterface = ({ roomName, messages, onSendMessage, onBack }: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState("")
  const [isAiMode, setIsAiMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim())
      setInputMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const getSenderName = (sender: string) => {
    switch (sender) {
      case "user":
        return "나"
      case "partner":
        return "상대방"
      case "ai":
        return "AI 상담사"
      default:
        return sender
    }
  }

  const toggleAiMode = () => {
    setIsAiMode(!isAiMode)
  }

  // AI 상담사 아바타 컴포넌트
  const AiAvatar = ({ size = 48 }: { size?: number }) => (
    <div
      className="rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center border-2 border-yellow-200"
      style={{ width: size, height: size }}
    >
      <span className="text-lg">😊</span>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-medium text-gray-800 flex-1">{roomName}</h1>
        <button
          onClick={toggleAiMode}
          className={`rounded-full transition-all ${isAiMode ? "ring-2 ring-pink-400" : ""}`}
        >
          <AiAvatar size={40} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            {message.sender !== "user" && (
              <div className="flex-shrink-0 mr-3">
                {message.sender === "ai" ? <AiAvatar /> : <div className="w-12 h-12 bg-green-200 rounded-full"></div>}
              </div>
            )}

            <div
              className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} max-w-xs lg:max-w-md`}
            >
              {message.sender !== "user" && (
                <span className="text-sm text-gray-600 mb-1 ml-1">{getSenderName(message.sender)}</span>
              )}

              <div className={`flex items-end ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} gap-2`}>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.sender === "user" ? "bg-green-200 text-gray-800" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>

                <div className="text-xs text-gray-500 flex-shrink-0 pb-1">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t border-gray-200 p-4 transition-colors ${isAiMode ? "bg-pink-100" : "bg-white"}`}>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isAiMode ? "AI 상담사에게 메시지 보내기" : "메시지 입력"}
            className={`flex-1 border rounded-full px-4 py-2 focus:outline-none transition-colors ${
              isAiMode
                ? "border-pink-300 focus:border-pink-400 bg-pink-50 placeholder-pink-400"
                : "border-gray-300 focus:border-green-400 bg-white placeholder-gray-400"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className={`rounded-full p-2 transition-colors ${
              isAiMode
                ? "bg-pink-200 hover:bg-pink-300 disabled:bg-pink-100 disabled:text-pink-400 text-pink-600"
                : "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-600"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
