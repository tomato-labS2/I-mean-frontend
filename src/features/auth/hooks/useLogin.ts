"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/authApi"
import type { LoginFormData } from "@/features/auth/types"
import { useToast } from "@/components/common/Toast"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const login = async (formData: LoginFormData) => {
    setIsLoading(true)
    try {
      await authApi.login(formData)
      const token = tokenStorage.getToken()
      if (!token) {
        showToast("로그인 토큰 저장에 실패했습니다. 다시 시도해주세요.")
        return
      }
      setTimeout(() => {
        router.push("/main")
      }, 200)
    } catch (error) {
      console.error("Login failed:", error)
      showToast("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    isLoading,
  }
}
