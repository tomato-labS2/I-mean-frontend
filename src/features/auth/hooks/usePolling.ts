"use client"


import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/authApi';
import { tokenStorage } from '@/features/auth/utils/tokenStorage';
import { useToast } from "@/components/common/Toast";

const POLLING_INTERVAL = 3000; // 3 seconds


export function usePolling(initialMemberID?: string | null) {

  const router = useRouter();
  const { showToast } = useToast();
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  // 🆕 중복 처리 방지를 위한 상태들
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMatchedRef = useRef(false); // 이미 매칭 처리되었는지 확인

  const getEffectiveMemberID = useCallback((): string | null => {
    const idFromParam = initialMemberID;
    const idFromStorage = tokenStorage.getMemberId();
    if (idFromParam) return String(idFromParam);
    if (idFromStorage) return String(idFromStorage);
    return null;
  }, [initialMemberID]);

  // 🆕 interval 정리 함수
  const clearPollingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Polling interval cleared.');
    }
  }, []);

  // 🆕 매칭 성공 처리 함수 (중복 방지)
  const handleMatchSuccess = useCallback(async (responseData: any) => {
    // 이미 처리 중이거나 이미 매칭 처리되었으면 중단
    if (isProcessingMatch || isMatchedRef.current) {
      console.log('[usePolling] Match already being processed or completed. Skipping.');
      return;
    }

    console.log('[usePolling] Starting match processing...');
    setIsProcessingMatch(true);
    isMatchedRef.current = true;
    
    // 🔴 즉시 폴링 중단
    setIsPolling(false);
    clearPollingInterval();

    try {
      // 🔄 JWT 토큰 갱신
      console.log('[usePolling] Refreshing JWT token...');
      const currentRefreshToken = tokenStorage.getRefreshToken();
      
      if (currentRefreshToken) {
        try {
          const refreshTokenResponse = await authApi.refreshToken(currentRefreshToken);
          if (refreshTokenResponse.accessToken) {
            tokenStorage.setToken(refreshTokenResponse.accessToken);
            console.log('[usePolling] New access token stored successfully.');
          } else {
            console.warn('[usePolling] Refresh token API did not return a new access token.');
          }
        } catch (refreshError) {
          console.error('[usePolling] Failed to refresh token after match:', refreshError);
          // 토큰 리프레시 실패해도 매칭 성공 처리는 계속 진행
        }
      } else {
        console.warn('[usePolling] No refresh token found to refresh JWT.');
      }

      // 🔄 로컬 상태 업데이트
      tokenStorage.setCoupleStatus('COUPLED');
      
      if (responseData?.partnerId !== undefined && responseData?.partnerId !== null) {
        tokenStorage.setCoupleId(Number(responseData.partnerId));
        console.log(`[usePolling] Partner ID stored: ${responseData.partnerId}`);
      }

      // 🎉 성공 알림 (한 번만)
      showToast('커플 매칭 성공! 새로운 정보를 반영하여 메인 페이지로 이동합니다.');
      
      // 🚀 메인 페이지로 이동 (약간의 지연 후)
      setTimeout(() => {
        router.replace('/main');
      }, 1000);

    } catch (error) {
      console.error('[usePolling] Error during match processing:', error);
      setIsProcessingMatch(false);
      // 에러가 발생해도 isMatchedRef는 리셋하지 않음 (중복 처리 방지)
    }
  }, [isProcessingMatch, clearPollingInterval, showToast, router]);

  const checkStatus = useCallback(async () => {
    // 이미 매칭 처리되었거나 처리 중이면 중단
    if (isMatchedRef.current || isProcessingMatch) {
      console.log('[usePolling] Match already processed or processing. Skipping check.');
      return;
    }

    const currentMemberID = getEffectiveMemberID();
    if (!currentMemberID) {
      console.warn('Polling: Member ID is not available.');
      return;
    }

    console.log(`Polling for couple status for memberID: ${currentMemberID}`);
    try {
      const response = await authApi.getCouplePollingStatus(currentMemberID);
      console.log('Polling response:', response);

      if (response.status === 200 && response.data) {
        let isMatch = false;
        
        if (response.data.matched === true) {
          isMatch = true;
        } else if (response.data.message?.startsWith('matched_with:')) {
          // Fallback for old string-based match message
          isMatch = true;
        }

        if (isMatch) {
          console.log('[usePolling] Match detected!');
          await handleMatchSuccess(response.data);
          return; // 함수 종료
        } else if (response.data.message) { 
          console.log('Polling status update (message):', response.data.message);
        } else {
          console.log('Polling: 200 OK but no match detected in JSON structure.', response.data);
        }
      } else if (response.status === 204) {
        console.log('Polling: No content, still waiting for match.');
        // Keep polling
      } else {
        console.error('Polling: Unexpected status code:', response.status);
      }
    } catch (err: any) {
      console.error('Polling error in checkStatus:', err);
    }
  }, [getEffectiveMemberID, handleMatchSuccess, isProcessingMatch]);

  // 🆕 개선된 useEffect (interval 관리)
  useEffect(() => {
    const currentMemberID = getEffectiveMemberID();
    
    // 폴링이 비활성화되었거나 memberID가 없거나 이미 매칭되었으면 정리
    if (!isPolling || !currentMemberID || isMatchedRef.current) {
      clearPollingInterval();
      return;
    }

    console.log('Starting polling interval for memberID:', currentMemberID);
    
    // 즉시 한 번 체크
    checkStatus();
    
    // interval 시작
    intervalRef.current = setInterval(checkStatus, POLLING_INTERVAL);

    // cleanup 함수
    return () => {
      clearPollingInterval();
    };
  }, [isPolling, checkStatus, getEffectiveMemberID, clearPollingInterval]);

  const startPolling = useCallback(() => {
    const currentMemberID = getEffectiveMemberID();
    if (!currentMemberID) {
      showToast("사용자 ID 정보를 가져올 수 없어 폴링을 시작할 수 없습니다.");
      console.error("Cannot start polling: Member ID is missing.");
      return;
    }

    // 이미 매칭되었다면 폴링 시작하지 않음
    if (isMatchedRef.current) {
      console.log('Polling not started: already matched.');
      return;
    }

    setError(null);
    setIsProcessingMatch(false);
    setIsPolling(true);
    console.log('Polling started for memberID:', currentMemberID);
  }, [getEffectiveMemberID, showToast]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    clearPollingInterval();
    console.log('Polling stopped manually.');
  }, [clearPollingInterval]);

  // 🆕 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      clearPollingInterval();
      console.log('usePolling hook cleanup: interval cleared.');
    };
  }, [clearPollingInterval]);

  return { 
    isPolling, 
    error, 
    startPolling, 
    stopPolling,
    isProcessingMatch // 🆕 매칭 처리 중 상태 노출
  };
}
