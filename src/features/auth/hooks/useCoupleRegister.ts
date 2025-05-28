"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/authApi"

export function useCoupleRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [coupleCode, setCoupleCode] = useState<string | null>(null)
  const router = useRouter()

  const generateCode = async () => {
    setIsLoading(true)
    try {
      // 실제 API가 있다면 호출
      // const result = await authApi.generateCoupleCode();
      // setCoupleCode(result.code);
      // 임시 mock
      setCoupleCode(Math.random().toString(36).substring(2, 8).toUpperCase())
    } finally {
      setIsLoading(false)
    }
  }

  const joinCouple = async (partnerCode: string) => {
    setIsLoading(true)
    try {
      await authApi.joinCouple(partnerCode)
      router.push("/chat")
      // Toast 성공 메시지 표시
    } catch (error) {
      console.error("Couple join failed:", error)
      // Toast 에러 메시지 표시
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateCode,
    joinCouple,
    isLoading,
    coupleCode,
  }
}
