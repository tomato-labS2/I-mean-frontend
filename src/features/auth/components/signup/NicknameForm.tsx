'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STEP_CONFIG } from '@/types/signup';
import { registerNickname } from '@/lib/api';
import StepButton from './StepButton';
import styles from './SignupForms.module.css';

export default function NicknameForm() {
  const router = useRouter();
  const [memberNickName, setMemberNickName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberNickName(e.target.value);
    setError(undefined);
  };
  
  const validateNickname = (nickname: string): boolean => {
    // 2~20자 제한
    return nickname.length >= 2 && nickname.length <= 20;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberNickName) {
      setError('닉네임을 입력해주세요');
      return;
    }
    
    if (!validateNickname(memberNickName)) {
      setError('닉네임은 2~20자 사이여야 합니다');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 백엔드 API 호출
      await registerNickname({ memberNickName });
      
      // 성공 시 다음 단계로 이동
      router.push(STEP_CONFIG.nickname.nextPath);
    } catch (error) {
      console.error('에러:', error);
      setError('닉네임 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formContent}>
        <h3 className={styles.title}>{STEP_CONFIG.nickname.title}</h3>
        <input
          type="text"
          value={memberNickName}
          onChange={handleChange}
          placeholder="닉네임"
          className={styles.input}
          disabled={isLoading}
        />
        {error && <p className={styles.errorText}>{error}</p>}
        <p className={styles.helperText}>{STEP_CONFIG.nickname.description}</p>
      </div>
      
      <StepButton 
        text={STEP_CONFIG.nickname.nextButtonText} 
        disabled={!memberNickName || isLoading}
        isLoading={isLoading}
      />
    </form>
  );
}