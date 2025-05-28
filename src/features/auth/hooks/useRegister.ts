"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/authApi"
import type { RegisterFormData } from "@/features/auth/types"

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const register = async (formData: RegisterFormData) => {
    setIsLoading(true)
    try {
      await authApi.register(formData)
      // 회원가입 후 자동 로그인
      await authApi.login({ email: formData.email, password: formData.password })
      router.push("/auth/couple-register")
      // Toast 성공 메시지 표시
    } catch (error) {
      console.error("Register failed:", error)
      // Toast 에러 메시지 표시
    } finally {
      setIsLoading(false)
    }
  }

  return {
    register,
    isLoading,
  }
}
