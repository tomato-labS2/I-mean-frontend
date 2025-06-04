"use client"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resendEmailCode = async () => {"use client"}

  import type React from "react"
  import { useState, useEffect } from "react"
  import Link from "next/link"
  import { Button } from "@/components/ui/Button"
  import { Input } from "@/components/ui/Input"
  import { useRegister } from "@/features/auth/hooks/useRegister"
  import { Eye, EyeOff, UserPlus } from "lucide-react"
  import type { RegisterFormData } from "@/features/auth/types"
  
  // 🆕 백엔드 API 기본 URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  export function RegisterForm() {
    const { register, isLoading } = useRegister()
    const [formData, setFormData] = useState<RegisterFormData>({
      email: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      phone: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<Partial<RegisterFormData>>({})
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [emailMessage, setEmailMessage] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [isRateLimited, setIsRateLimited] = useState(false)
    const [rateLimitRemainingTime, setRateLimitRemainingTime] = useState(0)
    const [rateLimitTimer, setRateLimitTimer] = useState<NodeJS.Timeout | null>(null)
  
    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
      return () => {
        if (rateLimitTimer) {
          clearInterval(rateLimitTimer)
        }
      }
    }, [rateLimitTimer])
  
    const handleChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }
  
    const validateForm = (): boolean => {
      const newErrors: Partial<RegisterFormData> = {}
  
      if (!formData.email.includes("@")) {
        newErrors.email = "올바른 이메일 형식이 아닙니다"
      }
  
      if (formData.password.length < 6) {
        newErrors.password = "비밀번호는 6자 이상이어야 합니다"
      }
  
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
      }
  
      if (formData.nickname.length < 2) {
        newErrors.nickname = "닉네임은 2자 이상이어야 합니다"
      }
  
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
  
    // 시간을 분:초 형태로 포맷팅하는 함수
    const formatTime = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return minutes > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${remainingSeconds}s`
    }
  
    // Rate Limit 타이머 시작 함수 (여유 시간 추가)
    const startRateLimitTimer = (seconds: number = 90) => { // 🔧 90초로 안전하게 설정
      // 기존 타이머가 있다면 정리
      if (rateLimitTimer) {
        clearInterval(rateLimitTimer)
      }
  
      setIsRateLimited(true)
      setRateLimitRemainingTime(seconds)
      
      const timer = setInterval(() => {
        setRateLimitRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsRateLimited(false)
            setRateLimitTimer(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setRateLimitTimer(timer)
    }
  
    // 🔧 수정된 이메일 코드 발송 함수 (Rate Limit 처리 포함)
    const sendEmailCode = async () => {
      if (isRateLimited) {
        setEmailMessage(`잠시만 기다려주세요. ${formatTime(rateLimitRemainingTime)} 후 다시 시도할 수 있습니다.`)
        return
      }
  
      setIsSending(true)
      setEmailMessage("")
      try {
        const res = await fetch(`${API_BASE}/auth/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: formData.email, 
            type: "verification"
          }),
        })
        
        const data = await res.json()
        console.log("📤 이메일 발송 응답:", data)
        
        // 429 Rate Limit 에러 특별 처리
        if (res.status === 429) {
          setEmailMessage("⏰ 이메일 발송 제한에 도달했습니다. 약 1분 30초 후 다시 시도해주세요.")
          startRateLimitTimer(90) // 🔧 90초로 안전하게 설정
          return
        }
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || `HTTP error! status: ${res.status}`)
        }
        
        setEmailMessage(data.message || "✅ 인증 코드가 발송되었습니다.")
        setIsEmailSent(true)
      } catch (error) {
        console.error("이메일 발송 오류:", error)
        if (error instanceof Error && error.message.includes("429")) {
          setEmailMessage("⏰ 이메일 발송 제한에 도달했습니다. 약 1분 30초 후 다시 시도해주세요.")
          startRateLimitTimer(90)
        } else {
          setEmailMessage(error instanceof Error ? error.message : "❌ 인증 코드 발송 중 오류가 발생했습니다.")
        }
      } finally {
        setIsSending(false)
      }
    }
  
    // 🔧 수정된 이메일 코드 검증 함수
    const verifyEmailCode = async () => {
      setIsVerifying(true)
      setEmailMessage("")
      try {
        const res = await fetch(`${API_BASE}/auth/email/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: formData.email, 
            code: verificationCode,  // ✅ 백엔드에서 기대하는 필드명 사용
            type: "verification"     // ✅ 백엔드에서 기대하는 필드 추가
          }),
        })
        
        const data = await res.json()
        console.log("📨 이메일 검증 응답:", data)
        
        if (!res.ok) {
          throw new Error(data.message || `HTTP error! status: ${res.status}`)
        }
        
        if (data.success) {
          setIsEmailVerified(true)
          setErrors(prev => ({ ...prev, email: undefined }))
          setEmailMessage("이메일 인증이 완료되었습니다!")
          console.log("✅ 이메일 인증 성공!")
        } else {
          console.log("❌ 이메일 인증 실패")
          setEmailMessage(data.message || "인증에 실패했습니다. 다시 시도해주세요.")
        }
        
      } catch (error) {
        console.error("이메일 인증 오류:", error)
        setEmailMessage(error instanceof Error ? error.message : "인증 코드 검증 중 오류가 발생했습니다.")
      } finally {
        setIsVerifying(false)
      }
    }
  
    // 🔧 수정된 이메일 코드 재발송 함수 (Rate Limit 처리 포함)
    const resendEmailCode = async () => {
      if (isRateLimited) {
        setEmailMessage(`잠시만 기다려주세요. ${formatTime(rateLimitRemainingTime)} 후 다시 시도할 수 있습니다.`)
        return
      }
  
      setIsResending(true)
      setEmailMessage("")
      setVerificationCode("") // 기존 인증 코드 초기화
      try {
        const res = await fetch(`${API_BASE}/auth/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: formData.email, 
            type: "verification"
          }),
        })
        
        const data = await res.json()
        console.log("🔄 이메일 재발송 응답:", data)
        
        // 429 Rate Limit 에러 특별 처리
        if (res.status === 429) {
          setEmailMessage("⏰ 이메일 발송 제한에 도달했습니다. 약 1분 30초 후 다시 시도해주세요.")
          startRateLimitTimer(90) // 90초 대기
          return
        }
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || `HTTP error! status: ${res.status}`)
        }
        
        setEmailMessage(data.message || "✅ 인증 코드가 재발송되었습니다.")
      } catch (error) {
        console.error("이메일 재발송 오류:", error)
        if (error instanceof Error && error.message.includes("429")) {
          setEmailMessage("⏰ 이메일 발송 제한에 도달했습니다. 약 1분 30초 후 다시 시도해주세요.")
          startRateLimitTimer(90)
        } else {
          setEmailMessage(error instanceof Error ? error.message : "❌ 인증 코드 재발송 중 오류가 발생했습니다.")
        }
      } finally {
        setIsResending(false)
      }
    }
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) return
      if (!isEmailVerified) {
        setEmailMessage("이메일 인증을 완료해주세요.")
        return
      }
      await register(formData)
    }
  
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4 slide-up">
        <div className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="이메일(ex. example@gmail.com)"
              value={formData.email}
              onChange={handleChange("email")}
              className={`w-full h-14 bg-white/80 backdrop-blur-sm border-0 rounded-2xl px-4 text-[#5a5a5a] placeholder:text-[#999] shadow-sm ${errors.email ? "ring-2 ring-red-400" : ""}`}
              required
              disabled={isEmailVerified}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 px-2">{errors.email}</p>}
            
            {!isEmailVerified && (
              <div className="mt-2">
                <div className="flex gap-2">
                  {!isEmailSent && (
                    <Button 
                      type="button" 
                      onClick={sendEmailCode} 
                      disabled={isSending || isRateLimited || !formData.email || !!errors.email}
                      className="flex-1 h-10 bg-[#f4e6a1] text-[#5a5a5a] rounded-xl disabled:opacity-50"
                    >
                      {isSending ? "발송 중..." : 
                       isRateLimited ? `대기 중 (${formatTime(rateLimitRemainingTime)})` : 
                       "인증 코드 발송"}
                    </Button>
                  )}
                  {isEmailSent && !isEmailVerified && (
                    <Button 
                      type="button" 
                      onClick={resendEmailCode} 
                      disabled={isResending || isRateLimited} 
                      className="flex-1 h-10 bg-[#f4e6a1] text-[#5a5a5a] rounded-xl disabled:opacity-50"
                    >
                      {isResending ? "재발송 중..." : 
                       isRateLimited ? `대기 중 (${formatTime(rateLimitRemainingTime)})` : 
                       "재발송"}
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* ⚠️ Rate Limit 안내 메시지 추가 */}
            {!isEmailVerified && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-700 text-xs">
                  ℹ️ 스팸 방지를 위해 이메일 발송은 1분에 최대 3회로 제한됩니다. 제한 도달 시 약 1분 30초 대기가 필요합니다.
                </p>
              </div>
            )}
            
            {isEmailSent && !isEmailVerified && (
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  placeholder="인증 코드 입력"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  className="flex-1 h-10 bg-white/80 border-0 rounded-xl px-3 text-[#5a5a5a] placeholder:text-[#999] shadow-sm"
                  maxLength={6}
                />
                <Button 
                  type="button" 
                  onClick={verifyEmailCode} 
                  disabled={isVerifying || !verificationCode} 
                  className="h-10 bg-[#5a9b5a] text-white rounded-xl disabled:opacity-50"
                >
                  {isVerifying ? "인증 중..." : "인증"}
                </Button>
              </div>
            )}
            
            {/* ✅ 인증 성공 표시 */}
            {isEmailVerified && (
              <div className="mt-2 p-2 bg-green-100 border border-green-400 rounded-xl">
                <p className="text-green-700 text-xs">✅ 이메일 인증이 완료되었습니다!</p>
              </div>
            )}
            
            {emailMessage && (
              <p className={`text-xs mt-1 px-2 ${
                isEmailVerified ? "text-green-600" : 
                emailMessage.includes("⏰") || isRateLimited ? "text-orange-600" :
                emailMessage.includes("✅") ? "text-green-600" :
                "text-red-500"
              }`}>
                {emailMessage}
              </p>
            )}
          </div>
  
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange("password")}
              className={`w-full h-14 bg-white/80 backdrop-blur-sm border-0 rounded-2xl px-4 pr-12 text-[#5a5a5a] placeholder:text-[#999] shadow-sm ${errors.password ? "ring-2 ring-red-400" : ""}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#5a9b5a] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1 px-2">{errors.password}</p>}
          </div>
  
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              className={`w-full h-14 bg-white/80 backdrop-blur-sm border-0 rounded-2xl px-4 pr-12 text-[#5a5a5a] placeholder:text-[#999] shadow-sm ${errors.confirmPassword ? "ring-2 ring-red-400" : ""}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#5a9b5a] transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 px-2">{errors.confirmPassword}</p>}
          </div>
  
          <div>
            <Input
              type="text"
              placeholder="닉네임(2자 이상)"
              value={formData.nickname}
              onChange={handleChange("nickname")}
              className={`w-full h-14 bg-white/80 backdrop-blur-sm border-0 rounded-2xl px-4 text-[#5a5a5a] placeholder:text-[#999] shadow-sm ${errors.nickname ? "ring-2 ring-red-400" : ""}`}
              required
            />
            {errors.nickname && <p className="text-red-500 text-xs mt-1 px-2">{errors.nickname}</p>}
          </div>
  
          <div>
            <Input
              type="tel"
              placeholder="휴대폰 번호(-포함)"
              value={formData.phone}
              onChange={handleChange("phone")}
              className="w-full h-14 bg-white/80 backdrop-blur-sm border-0 rounded-2xl px-4 text-[#5a5a5a] placeholder:text-[#999] shadow-sm"
              required
            />
          </div>
        </div>
  
        <div className="pt-4">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !isEmailVerified ||
              !formData.email ||
              !formData.password ||
              !formData.confirmPassword ||
              !formData.nickname ||
              !formData.phone ||
              !!errors.email ||
              !!errors.password ||
              !!errors.confirmPassword ||
              !!errors.nickname ||
              !!errors.phone
            }
            className="w-full h-14 bg-[#f4e6a1] hover:bg-[#f0e085] disabled:bg-[#f4e6a1]/50 text-[#5a5a5a] font-semibold rounded-2xl border-0 shadow-lg transition-all duration-200 text-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#5a5a5a]/30 border-t-[#5a5a5a] rounded-full animate-spin"></div>
                가입 중...
              </div>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                회원가입
              </>
            )}
          </Button>
        </div>
  
        <div className="text-center pt-4">
          <div className="text-sm text-[#999]">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-[#5a9b5a] font-semibold underline underline-offset-2">
              로그인
            </Link>
          </div>
        </div>
      </form>
    )
  }