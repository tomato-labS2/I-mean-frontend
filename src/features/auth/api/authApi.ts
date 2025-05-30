import type { LoginFormData, RegisterFormData, AuthApiResponse, User } from "@/features/auth/types"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"

// const API_BASE = "http://localhost:8080/api"
const API_BASE = "http://59.13.225.242:8080/api"

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
    // memberId, coupleId 등 필요시 저장 확장 가능
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
    // memberId, coupleId 등 필요시 저장 확장 가능
    return result.data
  },

  getProfile: async (): Promise<User> => {
    const token = tokenStorage.getToken()
    const res = await fetch(`${API_BASE}/auth/me`, {
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

  generateCoupleCode: async (): Promise<{ code: string }> => {
    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Mock couple code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    return { code }
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
    if (result.data?.accessToken) tokenStorage.setToken(result.data.accessToken)
    if (result.data?.memberInfo?.coupleStatus) tokenStorage.setCoupleStatus(result.data.memberInfo.coupleStatus)
    return result.data
  },

  logout: async (): Promise<void> => {
    const token = tokenStorage.getToken();
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || "로그아웃 실패");
    }
    tokenStorage.clear();
  },

  // 기타 API 메서드 필요시 추가
}
