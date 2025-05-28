"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/authApi"
import type { LoginFormData } from "@/features/auth/types"

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const login = async (formData: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(formData)
      console.log('로그인 후 accessToken:', response.accessToken)
      router.push("/main")
    } catch (error) {
      console.error("Login failed:", error)
      // Toast 에러 메시지 표시
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    isLoading,
  }
}
