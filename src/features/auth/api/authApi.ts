import type { LoginFormData, RegisterFormData, AuthApiResponse, User } from "@/features/auth/types"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"

const API_BASE = "http://localhost:8080/api"
// const API_BASE = "http://59.13.225.242:8080/api"

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthApiResponse["data"]> => {
    const res = await fetch(`${API_BASE}/member/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberEmail: data.email,
        memberPass: data.password,
      }),
    })
    const result: AuthApiResponse = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("로그인 실패: " + (result.message || JSON.stringify(result)))
    }
    // 토큰 및 회원 정보 저장
    tokenStorage.setToken(result.data.accessToken)
    tokenStorage.setRefreshToken(result.data.refreshToken)
    tokenStorage.setMemberCode(result.data.memberInfo.memberCode)
    tokenStorage.setCoupleStatus(result.data.memberInfo.coupleStatus)
    tokenStorage.setMemberId(result.data.memberInfo.memberId)
    tokenStorage.setCoupleId(result.data.memberInfo.coupleId)
    tokenStorage.setMemberRole(result.data.memberInfo.memberRole)
    return result.data
  },

  register: async (data: RegisterFormData): Promise<AuthApiResponse["data"]> => {
    const res = await fetch(`${API_BASE}/member/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberEmail: data.email,
        memberPass: data.password,
        memberNickName: data.nickname,
        memberPhone: data.phone,
      }),
    })
    const result: AuthApiResponse = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("회원가입 실패: " + (result.message || JSON.stringify(result)))
    }
    tokenStorage.setToken(result.data.accessToken)
    tokenStorage.setRefreshToken(result.data.refreshToken)
    tokenStorage.setMemberCode(result.data.memberInfo.memberCode)
    tokenStorage.setCoupleStatus(result.data.memberInfo.coupleStatus)
    tokenStorage.setMemberId(result.data.memberInfo.memberId)
    tokenStorage.setCoupleId(result.data.memberInfo.coupleId)
    tokenStorage.setMemberRole(result.data.memberInfo.memberRole)
    return result.data
  },

  getProfile: async (): Promise<User> => {
    const token = tokenStorage.getToken()
    const res = await fetch(`${API_BASE}/member/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error(result.message || "사용자 정보 조회 실패")
    }
    return result.data as User
  },

  // 현재 사용자의 memberCode를 가져오는 함수 (커플 코드 생성용)
  generateCoupleCode: async (): Promise<{ code: string }> => {
    const token = tokenStorage.getToken()
    const res = await fetch(`${API_BASE}/member/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error(result.message || "사용자 정보 조회 실패")
    }
    // 현재 사용자의 memberCode를 반환
    return { code: result.data.memberCode }
  },

  joinCouple: async (targetMemberCode: string): Promise<AuthApiResponse["data"]> => {
    const token = tokenStorage.getToken()
    const res = await fetch(`${API_BASE}/couple/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetMemberCode }),
    })
    const result: AuthApiResponse = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("커플 등록 실패: " + (result.message || JSON.stringify(result)))
    }
    // 커플 등록 후 새로운 토큰으로 업데이트
    if (result.data?.accessToken) {
      tokenStorage.setToken(result.data.accessToken)
    }
    if (result.data?.refreshToken) {
      tokenStorage.setRefreshToken(result.data.refreshToken)
    }
    if (result.data?.memberInfo) {
      tokenStorage.setCoupleStatus(result.data.memberInfo.coupleStatus)
      tokenStorage.setCoupleId(result.data.memberInfo.coupleId)
    }
    return result.data
  },

  logout: async (): Promise<void> => {
    const token = tokenStorage.getToken()
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error(result.message || "로그아웃 실패")
    }
    tokenStorage.clear()
  },

  // 토큰 갱신 API 추가
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("토큰 갱신 실패: " + (result.message || JSON.stringify(result)))
    }
    return result.data
  },

  // 이메일 인증 코드 발송
  sendVerificationEmail: async (email: string, type: 'verification' | 'password-reset'): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("이메일 발송 실패: " + (result.message || JSON.stringify(result)))
    }
  },

  // 이메일 인증 코드 검증
  verifyEmailCode: async (email: string, code: string, type: 'verification' | 'password-reset'): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/email/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, type }),
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("인증 코드 검증 실패: " + (result.message || JSON.stringify(result)))
    }
  },

  // 이메일 중복 체크
  checkEmailAvailability: async (email: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/member/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email),
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("이메일 중복 체크 실패: " + (result.message || JSON.stringify(result)))
    }
    return result.data // true면 사용 가능, false면 사용 불가
  },

  // 커플 상태 확인
  checkCoupleStatus: async (): Promise<boolean> => {
    const token = tokenStorage.getToken()
    const res = await fetch(`${API_BASE}/couple/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("커플 상태 확인 실패: " + (result.message || JSON.stringify(result)))
    }
    return result.data
  },

  // 커플 해제
  breakCouple: async (): Promise<AuthApiResponse["data"]> => {
    const token = tokenStorage.getToken()
    const res = await fetch(`${API_BASE}/couple/break`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const result: AuthApiResponse = await res.json()
    if (!res.ok || !result.success) {
      throw new Error("커플 해제 실패: " + (result.message || JSON.stringify(result)))
    }
    // 커플 해제 후 새로운 토큰으로 업데이트
    if (result.data?.accessToken) {
      tokenStorage.setToken(result.data.accessToken)
    }
    if (result.data?.refreshToken) {
      tokenStorage.setRefreshToken(result.data.refreshToken)
    }
    if (result.data?.memberInfo) {
      tokenStorage.setCoupleStatus(result.data.memberInfo.coupleStatus)
      tokenStorage.setCoupleId(result.data.memberInfo.coupleId)
    }
    return result.data
  },
}