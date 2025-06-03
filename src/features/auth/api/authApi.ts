import type { LoginFormData, RegisterFormData, AuthApiResponse, User } from "@/features/auth/types"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"

// const API_BASE = "http://localhost:8080/api"
const API_BASE = "http://localhost:8080/api"
// const API_BASE = "http://59.13.225.242:8000/api"

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
    console.log("로그인 API 전체 응답:", result)
    console.log("memberInfo 구조:", result.data?.memberInfo)
    
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
    
    // 닉네임 저장 - 여러 가능한 필드명 시도
    const memberInfo = result.data.memberInfo as any;
    const nickname = memberInfo.memberNickName || 
                    memberInfo.memberNickname || 
                    memberInfo.nickname ||
                    memberInfo.nickName
    console.log("닉네임 저장 시도:", {
      memberNickName: memberInfo.memberNickName,
      memberNickname: memberInfo.memberNickname,
      nickname: memberInfo.nickname,
      nickName: memberInfo.nickName,
      selected: nickname
    })
    
    if (nickname) {
      tokenStorage.setMemberNickname(nickname)
      console.log("닉네임 저장 완료:", nickname)
      console.log("저장 후 localStorage 확인:", tokenStorage.getMemberNickname())
    } else {
      console.warn("닉네임 필드를 찾을 수 없습니다:", result.data.memberInfo)
    }
    
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
    console.log("회원가입 API 전체 응답:", result)
    console.log("memberInfo 구조:", result.data?.memberInfo)
    
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
    
    // 닉네임 저장 - 여러 가능한 필드명 시도
    const memberInfo = result.data.memberInfo as any;
    const nickname = memberInfo.memberNickName || 
                    memberInfo.memberNickname || 
                    memberInfo.nickname ||
                    memberInfo.nickName
    console.log("닉네임 저장 시도:", {
      memberNickName: memberInfo.memberNickName,
      memberNickname: memberInfo.memberNickname,
      nickname: memberInfo.nickname,
      nickName: memberInfo.nickName,
      selected: nickname
    })
    
    if (nickname) {
      tokenStorage.setMemberNickname(nickname)
      console.log("닉네임 저장 완료:", nickname)
      console.log("저장 후 localStorage 확인:", tokenStorage.getMemberNickname())
    } else {
      console.warn("닉네임 필드를 찾을 수 없습니다:", result.data.memberInfo)
    }
    
    return result.data
  },

  getProfile: async (): Promise<User> => {
    const token = tokenStorage.getToken()
    
    // 토큰이 있고 멤버 정보가 로컬 스토리지에 있다면 해당 정보를 사용
    const memberCode = tokenStorage.getMemberCode()
    const coupleStatus = tokenStorage.getCoupleStatus()
    const memberId = tokenStorage.getMemberId()
    const coupleId = tokenStorage.getCoupleId()
    const memberRole = tokenStorage.getMemberRole()
    const memberNickname = tokenStorage.getMemberNickname()

    if (token && memberCode) {
      // 로컬 스토리지의 정보로 User 객체 생성
      return {
        memberId: Number(memberId) || 0,
        memberCode: memberCode,
        memberRole: memberRole || "USER",
        coupleStatus: (coupleStatus as "SINGLE" | "COUPLED") || "SINGLE",
        coupleId: coupleId ? Number(coupleId) : null,
        isInCouple: coupleStatus === "COUPLED",
        isAdmin: memberRole === "ADMIN",
        isSuperAdmin: memberRole === "SUPER_ADMIN"
      }
    }
    
    // 토큰은 있지만 멤버 정보가 없는 경우 API 호출 시도
    // 실제 프로필 API가 구현되면 여기를 수정
    const res = await fetch(`${API_BASE}/member/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!res.ok) {
      // API 호출 실패 시 토큰 클리어
      tokenStorage.clear()
      throw new Error("인증 정보가 유효하지 않습니다.")
    }
    
    const result = await res.json()
    if (!result.success) {
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

  getCouplePollingStatus: async (userId: string): Promise<{ status: number; data: any }> => {
    const token = tokenStorage.getToken();
    const res = await fetch(`${API_BASE}/couple/status?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 204) {
      return { status: 204, data: null };
    }

    const responseText = await res.text(); // 응답을 텍스트로 먼저 받음
    if (!res.ok) {
      // "matched_with:" 형태의 문자열 응답 처리
      if (res.status === 200 && responseText.startsWith("matched_with:")) {
         return { status: 200, data: { message: responseText } };
      }
      throw new Error(`커플 상태 조회 실패: ${res.status} ${responseText}`);
    }

    try {
      const result = JSON.parse(responseText); // JSON으로 파싱 시도
      return { status: res.status, data: result };
    } catch (e) {
      // JSON 파싱 실패 시, 문자열 응답 그대로 반환 (예: "matched_with:")
      if (responseText.startsWith("matched_with:")) {
        return { status: 200, data: { message: responseText } };
      }
      throw new Error(`커플 상태 조회 응답 파싱 실패: ${responseText}`);
    }
  },
}