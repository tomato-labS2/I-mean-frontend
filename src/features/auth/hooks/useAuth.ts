"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/authApi"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"
import type { User } from "@/features/auth/types"
import { useToast } from "@/components/common/Toast"
import { usePolling } from "@/features/auth/hooks/usePolling"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // const router = useRouter() // useAuth 내에서 router 직접 사용하지 않으므로 주석 처리 또는 삭제

  // memberIdForPolling은 user 상태 또는 tokenStorage에서 가져오며, 항상 문자열이나 null/undefined가 되도록 처리
  let memberIdForPollingHook: string | null = null;
  if (user?.memberId) {
    memberIdForPollingHook = String(user.memberId);
  } else {
    const memberIdFromStorage = tokenStorage.getMemberId();
    if (memberIdFromStorage) {
        memberIdForPollingHook = String(memberIdFromStorage);
    }
  }
  const { startPolling, stopPolling, isPolling } = usePolling(memberIdForPollingHook);

  const checkAuth = useCallback(async () => {
    console.log("[useAuth] checkAuth: 중입니다...");
    setIsLoading(true);
    try {
      const token = tokenStorage.getToken()
      console.log("[useAuth] checkAuth: 토큰 확인 중, token:", token);

      if (!token) {
        console.log("[useAuth] checkAuth: 토큰 없음. 인증 실패로 설정.");
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false)
        return
      }

      console.log("[useAuth] checkAuth: 토큰 발견됨. authApi.getProfile() 호출 시도.");
      const userData = await authApi.getProfile() // 이 호출이 src/lib/api.ts의 로그를 트리거해야 함
      console.log("[useAuth] checkAuth: authApi.getProfile() 성공, userData:", userData);
      setUser(userData)
      setIsAuthenticated(true)
      console.log("[useAuth] checkAuth: 인증 성공으로 설정됨.");
    } catch (error) {
      console.error("[useAuth] checkAuth: authApi.getProfile() 실패 또는 기타 오류:", error);
      tokenStorage.clear()
      console.log("[useAuth] checkAuth: 오류로 인해 토큰이 삭제됨.");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false)
      console.log("[useAuth] checkAuth: 완료. isLoading: false, isAuthenticated:", isAuthenticated);
    }
  }, []) // 최초 마운트 시 실행되도록 의존성 배열 비워둠

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isLoading) return;

    const currentCoupleStatus = user?.coupleStatus || tokenStorage.getCoupleStatus();
    // 폴링 시작/중단 결정에 사용될 memberId (usePolling 초기화 시점과 동일한 값 사용)
    const memberIdForEffect = memberIdForPollingHook;

    if (isAuthenticated && memberIdForEffect && currentCoupleStatus !== 'COUPLED') {
      if (!isPolling) {
        console.log('[useAuth] Conditions met, starting polling for memberID:', memberIdForEffect);
        startPolling();
      }
    } else {
      if (isPolling) {
        console.log('[useAuth] Conditions met for stopping polling. isAuthenticated:', isAuthenticated, 'coupleStatus:', currentCoupleStatus);
        stopPolling();
      }
    }
  }, [isAuthenticated, user?.memberId, user?.coupleStatus, isLoading, startPolling, stopPolling, isPolling, memberIdForPollingHook]);

  const logout = useCallback(() => {
    if (isPolling) {
        console.log("[useAuth] Logging out, stopping polling.")
        stopPolling();
    }
    tokenStorage.clear()
    setUser(null)
    setIsAuthenticated(false)
    // 페이지 이동은 useLogout 훅에서 담당
  }, [isPolling, stopPolling])

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    checkAuth,
    isPollingCoupleStatus: isPolling,
  }
}

export function useLogout() {
  const router = useRouter();
  const { showToast } = useToast();
  const logout = async () => {
    try {
      await authApi.logout();
      tokenStorage.clear(); 
      showToast("로그아웃되었습니다.");
      router.push("/"); // 로그인 페이지 또는 홈으로 리다이렉트
      // window.location.href = "/"; //  router.push가 상태 업데이트 전에 실행되는 문제를 피하기 위한 대안
    } catch (error: unknown) {
      console.error("Logout API call failed:", error);
      if (error instanceof Error) {
        showToast(error.message || "로그아웃에 실패했습니다.");
      } else {
        showToast("로그아웃에 실패했습니다.");
      }
    } 
    // useAuth의 상태(isAuthenticated, user)는 checkAuth가 다시 실행되면서 (예: 페이지 리로드 또는 라우팅 후 MainLayout 재렌더링 시) 업데이트 될 것을 기대
  };
  return { logout };
}
