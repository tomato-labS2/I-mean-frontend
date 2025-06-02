"use client"

import { useState } from "react"
// import { useRouter } from "next/navigation" // 사용되지 않으므로 주석 처리
import { authApi } from "@/features/auth/api/authApi"
import type { LoginFormData } from "@/features/auth/types"
import { useToast } from "@/components/common/Toast"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  // const router = useRouter() // 사용되지 않으므로 주석 처리
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
      
      // 로그인 성공 메시지 표시
      showToast("로그인되었습니다.")
      
      // 토큰이 저장되고 상태가 업데이트될 시간을 주기 위해 약간의 지연을 추가
      setTimeout(() => {
        // 절대 경로로 이동
        window.location.replace(window.location.origin + "/main")
      }, 500)
    } catch (error: unknown) { // any 대신 unknown 사용하고 타입 가드 추가
      console.error("Login failed:", error)
      
      // 서버 응답 에러 메시지 처리
      if (error instanceof Error && error.message) {
        if (error.message.includes("429")) {
          showToast("너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.")
        } else if (error.message.includes("404")) {
          showToast("등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.")
        } else if (error.message.includes("401")) {
          showToast("이메일 또는 비밀번호가 올바르지 않습니다.")
        } else if (error.message.includes("503")) {
          showToast("서버가 일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해주세요.")
        } else {
          showToast("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.")
        }
      } else {
        showToast("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    isLoading,
  }
}
