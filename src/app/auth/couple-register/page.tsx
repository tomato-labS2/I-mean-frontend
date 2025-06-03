"use client"

import { CoupleCodeForm } from "@/features/auth/components/CoupleCodeForm"
import { Header } from "@/components/layout/Header"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CoupleRegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { logout } = useLogout()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="커플 등록" 
        showBack 
        rightElement={
          isAuthenticated ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={logout}
              title="로그아웃"
              className="!bg-[#f4e6a1] !text-[#5a9b5a] hover:!bg-[#ffe066] hover:!text-[#3c1e1e] shadow-md border border-[#e0e0e0] transition-all duration-200 flex flex-row items-center gap-2 px-4 py-2 rounded-xl min-w-[1px]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          ) : null
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="mb-12 text-center fade-in">
          <h2 className="text-4xl font-bold text-[#5a9b5a] mb-2">커플 등록</h2>
          <p className="text-[#999] text-sm">파트너와 함께 AI 채팅을 시작하세요</p>
        </div>
        <CoupleCodeForm />
      </div>
    </div>
  )
}
