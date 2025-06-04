import type { EmailRequestDTO, NicknameRequestDTO, PasswordRequestDTO, PhoneRequestDTO } from "@/types/signup"
import { tokenStorage } from "@/features/auth/utils/tokenStorage";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const token = tokenStorage.getToken();
    console.log(`[ApiClient] Requesting ${endpoint}. Token from tokenStorage:`, token);

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      console.warn(`[ApiClient] No token found for ${endpoint}. Proceeding without Authorization header.`);
    }

    console.log(`[ApiClient] Fetching ${url} with config:`, JSON.stringify(config.headers));

    const response = await fetch(url, config);

    if (!response.ok) {
      // API 응답 본문을 포함하여 더 자세한 에러 메시지 제공
      const errorData = await response.json().catch(() => null); // JSON 파싱 실패 시 null
      const errorMessage = errorData?.message || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // 응답이 비어있을 수 있는 경우 (예: 204 No Content)
    // response.json() 대신 응답 Content-Type을 확인하여 처리
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      // JSON이 아닌 경우 또는 응답 본문이 없는 경우
      return Promise.resolve(null as T); // 또는 빈 객체 등 적절한 값을 반환
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> { // 'any' 대신 'unknown' 사용
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> { // 'any' 대신 'unknown' 사용
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);

// 회원가입 진행 상태를 저장할 객체
let signupData: {
  email?: string
  nickname?: string
  password?: string
  phone?: string
} = {}

// 이메일 등록
export const registerEmail = async (data: EmailRequestDTO) => {
  signupData.email = data.memberEmail
  // 실제 API 호출은 이메일 인증 단계에서 처리됨
  return Promise.resolve()
}

// 닉네임 등록
export const registerNickname = async (data: NicknameRequestDTO) => {
  signupData.nickname = data.memberNickName
  return Promise.resolve()
}

// 비밀번호 등록
export const registerPassword = async (data: PasswordRequestDTO) => {
  signupData.password = data.memberPass
  return Promise.resolve()
}

// 전화번호 등록 (최종 회원가입)
export const registerPhone = async (data: PhoneRequestDTO) => {
  signupData.phone = data.memberPhone
  
  try {
    const response = await fetch(`${API_BASE_URL}/member/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberEmail: signupData.email,
        memberNickName: signupData.nickname,
        memberPass: signupData.password,
        memberPhone: signupData.phone,
      }),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || "회원가입에 실패했습니다.")
    }

    // 회원가입 완료 후 데이터 초기화
    signupData = {}
    
    return result
  } catch (error) {
    console.error("회원가입 에러:", error)
    throw error
  }
}