"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/authApi"
import { useToast } from "@/components/common/Toast"

export function useCoupleRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [coupleCode, setCoupleCode] = useState<string | null>(null)
  const router = useRouter()
  const { showToast } = useToast()

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
      console.log("커플 연결 시도 중...", partnerCode)
      await authApi.joinCouple(partnerCode)
      showToast("커플 등록에 성공했습니다! 메인 페이지로 이동합니다.")
      router.push("/main")
    } catch (error) {
      console.error("Couple join failed:", error)
      showToast("커플 등록에 실패했습니다. 코드를 다시 확인해주세요.")

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
