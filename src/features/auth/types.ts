export interface User {
    id: string
    email: string
    nickname: string
    phone: string
    coupleId: string | null
    createdAt: string
  }
  
  export interface LoginFormData {
    email: string
    password: string
  }
  
  export interface RegisterFormData {
    email: string
    password: string
    confirmPassword: string
    nickname: string
    phone: string
  }
  
  export interface AuthResponse {
    token: string
    user: User
  }
  
  export interface CoupleCodeResponse {
    code: string
  }
  
  export {}
  