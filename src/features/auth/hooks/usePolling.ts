"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/authApi';
import { tokenStorage } from '@/features/auth/utils/tokenStorage'; // For userId if needed, or pass as prop
import { useToast } from "@/components/common/Toast";

const POLLING_INTERVAL = 3000; // 3 seconds

export function usePolling(userId?: string | null) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure effectiveUserId is always a string for the API call
  const getEffectiveUserId = useCallback((): string | null => {
    const idFromParam = userId;
    const idFromStorage = tokenStorage.getMemberId();
    if (idFromParam) return String(idFromParam);
    if (idFromStorage) return String(idFromStorage);
    return null;
  }, [userId]);

  const checkStatus = useCallback(async () => {
    const currentUserId = getEffectiveUserId();
    if (!currentUserId) {
      console.warn('Polling: User ID is not available.');
      return;
    }

    console.log(`Polling for couple status for userId: ${currentUserId}`);
    try {
      const response = await authApi.getCouplePollingStatus(currentUserId);
      console.log('Polling response:', response);

      if (response.status === 200) {
        if (response.data?.message?.startsWith('matched_with:') || (response.data?.success && response.data?.data?.coupleStatus === 'COUPLED')) {
          showToast('커플 매칭 성공! 메인 페이지로 이동합니다.');
          tokenStorage.setCoupleStatus('COUPLED');
          if(response.data?.data?.coupleId !== undefined && response.data?.data?.coupleId !== null) {
            tokenStorage.setCoupleId(Number(response.data.data.coupleId)); // Ensure number
          } else if (response.data?.message?.startsWith('matched_with:')) {
            const partnerIdStr = response.data.message.split(':')[1];
            const partnerIdNum = parseInt(partnerIdStr, 10);
            if (!isNaN(partnerIdNum)) {
                // If partnerId from string can be parsed to a number, consider it as coupleId
                // This part depends on your API contract. If partnerId IS the coupleId:
                // tokenStorage.setCoupleId(partnerIdNum);
                console.log('Matched with partnerId (from string response, parsed to number):', partnerIdNum);
            } else {
                console.warn('Could not parse partnerId from matched_with string to a number:', partnerIdStr);
            }
          }
          router.replace('/main');
          setIsPolling(false);
          return;
        } else if (response.data?.message) { // Other 200 OK messages that are not a match
          console.log('Polling status update:', response.data.message);
        }
      } else if (response.status === 204) {
        console.log('Polling: No content, still waiting for match.');
        // Keep polling
      } else {
        // Handle other non-200/204 statuses if necessary
        console.error('Polling: Unexpected status code:', response.status);
        // setError(`Unexpected status: ${response.status}`);
        // Potentially stop polling for certain errors
      }
    } catch (err: any) {
      console.error('Polling error:', err);
      // setError(err.message || 'Failed to fetch couple status.');
      // Decide if polling should stop on error
      // setIsPolling(false); 
    }
  }, [getEffectiveUserId, router, showToast]);

  useEffect(() => {
    const currentUserId = getEffectiveUserId();
    if (!isPolling || !currentUserId) {
      return;
    }

    checkStatus(); // Initial check
    const intervalId = setInterval(checkStatus, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
      console.log('Polling interval cleared.');
    };
  }, [isPolling, checkStatus, getEffectiveUserId]);

  const startPolling = useCallback(() => {
    const currentUserId = getEffectiveUserId();
    if (!currentUserId) {
        showToast("사용자 정보를 가져올 수 없어 폴링을 시작할 수 없습니다.");
        console.error("Cannot start polling: User ID is missing.");
        return;
    }
    setError(null);
    setIsPolling(true);
    console.log('Polling started for userId:', currentUserId);
  }, [getEffectiveUserId, showToast]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    console.log('Polling stopped manually.');
  }, []);

  return { isPolling, error, startPolling, stopPolling };
} 