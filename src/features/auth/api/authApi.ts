import type { LoginFormData, RegisterFormData, AuthApiResponse, User } from "@/features/auth/types"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"

// const API_BASE = "http://localhost:8080/api"
const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

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
    const token = tokenStorage.getToken();
    console.log("[authApi.getProfile] 토큰 확인:", token);

    if (!token) {
      console.warn("[authApi.getProfile] 토큰이 없어 API 호출 불가. 인증 실패 처리.");
      tokenStorage.clear(); // 토큰이 없으면 확실히 로그아웃 상태로 만듬
      throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    }

    console.log("[authApi.getProfile] /member/profile API 호출 시도...");
    // 무조건 API를 호출하도록 기존 localStorage 로직 제거 또는 주석 처리
    /*
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
    */
    
    const res = await fetch(`${API_BASE}/member/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("[authApi.getProfile] API 응답 상태:", res.status);

    if (!res.ok) {
      console.error("[authApi.getProfile] API 호출 실패, 상태:", res.status, "응답 텍스트:", await res.text().catch(() => '응답 없음'));
      // API 호출 실패 시 토큰 클리어 (서버에서 토큰이 유효하지 않다고 판단한 경우 등)
      // 하지만, 네트워크 오류 등의 경우 무조건 토큰을 지우는 것은 좋지 않을 수 있음.
      // 여기서는 일단 서버가 401, 403 등을 반환했을 때를 가정하고 클리어합니다.
      if (res.status === 401 || res.status === 403) {
        tokenStorage.clear();
        console.log("[authApi.getProfile] 인증 실패로 토큰 클리어됨.");
      }
      throw new Error(`사용자 정보 조회 API 실패: ${res.status}`);
    }
    
    const result = await res.json().catch(async (e) => {
        console.error("[authApi.getProfile] API 응답 JSON 파싱 실패:", e, "응답 텍스트:", await res.text().catch(() => '응답 없음'));
        throw new Error("사용자 정보 API 응답 파싱 실패");
    });

    console.log("[authApi.getProfile] API 응답 데이터:", result);

    if (!result.success || !result.data) { // 백엔드 응답 구조에 success와 data 필드가 있다고 가정
      console.error("[authApi.getProfile] API 응답 success false 또는 data 없음, 메시지:", result.message);
      throw new Error(result.message || "사용자 정보 조회 실패 (데이터 없음)");
    }

    // API 응답을 기반으로 User 객체 구성 (실제 User 타입에 맞게 조정 필요)
    // 예시: 백엔드가 result.data 안에 User 정보를 직접 반환한다고 가정
    const apiUser = result.data;
    const userToReturn: User = {
        memberId: apiUser.memberId,
        memberCode: apiUser.memberCode,
        memberNickName: apiUser.memberNickname, // API 응답의 닉네임 필드명(apiUser.memberNickname)을 User 타입의 memberNickName으로 매핑
        memberRole: apiUser.memberRole,
        coupleStatus: apiUser.coupleStatus,
        coupleId: apiUser.coupleId,
        isInCouple: apiUser.coupleStatus === "COUPLE" || apiUser.coupleStatus === "COUPLED",
        isAdmin: apiUser.memberRole === "ADMIN",
        isSuperAdmin: apiUser.memberRole === "SUPER_ADMIN",
    };

    // API에서 받은 최신 정보로 localStorage 업데이트 (선택적이지만 권장)
    tokenStorage.setMemberCode(userToReturn.memberCode);
    tokenStorage.setCoupleStatus(userToReturn.coupleStatus);
    tokenStorage.setMemberId(userToReturn.memberId);
    tokenStorage.setCoupleId(userToReturn.coupleId);
    tokenStorage.setMemberRole(userToReturn.memberRole);
    if (userToReturn.memberNickName) { // memberNickName으로 수정
        tokenStorage.setMemberNickname(userToReturn.memberNickName); // tokenStorage는 memberNickname 사용 유지 (필요시 tokenStorage도 통일)
    }

    console.log("[authApi.getProfile] 반환될 User 객체:", userToReturn);
    return userToReturn;
  },

  // 현재 사용자의 memberCode를 가져오는 함수 (커플 코드 생성용)
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
    const res = await fetch(`${API_BASE}/couple/status/me`, {
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
  getCouplePollingStatus: async (memberID: string): Promise<{ status: number; data: any }> => {
    try {
      const res = await fetch(`${API_BASE}/couple/status?memberID=${memberID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization 헤더 제거 (백엔드에서 인증 불필요)
        },
      });
  
      // 204 No Content - 매칭되지 않음
      if (res.status === 204) {
        return { status: 204, data: null };
      }
  
      // 200 OK - 매칭됨 (JSON 응답)
      if (res.status === 200) {
        try {
          const result = await res.json(); // JSON으로 파싱
          return { status: res.status, data: result };
        } catch (parseError) {
          console.error('JSON 파싱 실패:', parseError);
          throw new Error(`커플 상태 조회 응답 파싱 실패`);
        }
      }
  
      // 기타 상태 코드 처리
      const errorText = await res.text();
      throw new Error(`커플 상태 조회 실패: ${res.status} ${errorText}`);
  
    } catch (error) {
      console.error('getCouplePollingStatus 오류:', error);
      throw error;
    }
  }
}