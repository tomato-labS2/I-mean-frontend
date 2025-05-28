const TOKEN_KEY = "imean_access_token"
const REFRESH_TOKEN_KEY = "imean_refresh_token"
const MEMBER_CODE_KEY = "imean_member_code"
const COUPLE_STATUS_KEY = "imean_couple_status"

export const tokenStorage = {
  setToken(token: string) {
    console.log("setToken 호출됨, token:", token)
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  setRefreshToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    }
  },

  getRefreshToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    }
    return null
  },

  setMemberCode(code: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(MEMBER_CODE_KEY, code)
    }
  },

  getMemberCode() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(MEMBER_CODE_KEY)
    }
    return null
  },

  setCoupleStatus(status: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(COUPLE_STATUS_KEY, status)
    }
  },

  getCoupleStatus() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(COUPLE_STATUS_KEY)
    }
    return null
  },

  clear() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(MEMBER_CODE_KEY)
      localStorage.removeItem(COUPLE_STATUS_KEY)
    }
  },
}
