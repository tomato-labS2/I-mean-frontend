"use client"

import { useRouter } from "next/navigation"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"
import { useToast } from "@/components/common/Toast"

export function useLogout() {
  const router = useRouter()
  const { showToast } = useToast()

  const logout = () => {
    try {
      // 모든 토큰 및 회원 정보 삭제
      tokenStorage.clear()

      // 홈페이지로 리다이렉트
      router.push("/")
      showToast("로그아웃되었습니다.")
    } catch (error) {
      console.error("Logout failed:", error)
      showToast("로그아웃 중 오류가 발생했습니다.")
    }
  }

  return {
    logout,
  }
} 