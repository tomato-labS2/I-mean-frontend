"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/authApi"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"
import type { User } from "@/features/auth/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = tokenStorage.getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const userData = await authApi.getProfile()
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Auth check failed:", error)
      tokenStorage.clear()
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    tokenStorage.clear()
    setUser(null)
    setIsAuthenticated(false)
    router.push("/")
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    checkAuth,
  }
}
