"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useCoupleRegister } from "@/features/auth/hooks/useCoupleRegister"
import { Heart, Copy, RefreshCw } from "lucide-react"

export function CoupleCodeForm() {
  const { generateCode, joinCouple, isLoading, coupleCode } = useCoupleRegister()
  const [partnerCode, setPartnerCode] = useState("")
  const [mode, setMode] = useState<"generate" | "join">("generate")

  const handleGenerateCode = async () => {
    await generateCode()
  }

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault()
    await joinCouple(partnerCode)
  }

  const copyToClipboard = async () => {
    if (coupleCode) {
      await navigator.clipboard.writeText(coupleCode)
      // Toast 알림 추가 가능
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 slide-up">
      {/* Mode Toggle */}
      <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1">
        <button
          type="button"
          onClick={() => setMode("generate")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            mode === "generate" ? "bg-[#f4e6a1] text-[#5a5a5a] shadow-sm" : "text-[#999] hover:text-[#5a5a5a]"
          }`}
        >
          코드 생성
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            mode === "join" ? "bg-[#f4e6a1] text-[#5a5a5a] shadow-sm" : "text-[#999] hover:text-[#5a5a5a]"
          }`}
        >
          코드 입력
        </button>
      </div>

      {mode === "generate" ? (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <Heart className="w-12 h-12 text-[#5a9b5a] mx-auto" />
            <h3 className="text-lg font-semibold text-[#5a5a5a]">커플 코드 생성</h3>
            <p className="text-sm text-[#999]">파트너에게 공유할 코드를 생성하세요</p>
          </div>

          {coupleCode ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4">
              <div className="text-2xl font-bold text-[#5a9b5a] tracking-wider">{coupleCode}</div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex-1 h-12 bg-white hover:bg-gray-50 text-[#5a5a5a] border border-[#e0e0e0] rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  복사
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-[#5a9b5a] hover:bg-[#4a8a4a] text-white rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새로 생성
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleGenerateCode}
              disabled={isLoading}
              className="w-full h-14 bg-[#f4e6a1] hover:bg-[#f0e085] text-[#5a5a5a] font-semibold rounded-2xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#5a5a5a]/30 border-t-[#5a5a5a] rounded-full animate-spin"></div>
                  생성 중...
                </div>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  커플 코드 생성
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={handleJoinCouple} className="space-y-4">
          <div className="text-center space-y-2">
            <Heart className="w-12 h-12 text-[#5a9b5a] mx-auto" />
            <h3 className="text-lg font-semibold text-[#5a5a5a]">커플 코드 입력</h3>
            <p className="text-sm text-[#999]">파트너가 공유한 코드를 입력하세요</p>
          </div>

          <Input
            type="text"
            placeholder="커플 코드 입력"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
            className="w-full h-14 bg-white/80 backdrop-blur-sm border-0 rounded-2xl px-4 text-center text-lg font-bold tracking-wider text-[#5a5a5a] placeholder:text-[#999] shadow-sm"
            maxLength={6}
            required
          />

          <Button
            type="submit"
            disabled={isLoading || partnerCode.length !== 6}
            className="w-full h-14 bg-[#f4e6a1] hover:bg-[#f0e085] disabled:bg-[#f4e6a1]/50 text-[#5a5a5a] font-semibold rounded-2xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#5a5a5a]/30 border-t-[#5a5a5a] rounded-full animate-spin"></div>
                연결 중...
              </div>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                커플 연결하기
              </>
            )}
          </Button>
        </form>
      )}

      <div className="text-center">
        <div className="text-sm text-[#999]">
          개인으로 가입하시나요?{" "}
          <Link href="/register" className="text-[#5a9b5a] font-semibold underline underline-offset-2">
            일반 회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}
