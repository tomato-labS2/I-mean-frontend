'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STEP_CONFIG } from '@/types/signup';
import { registerPassword } from '@/lib/api';
import StepButton from './StepButton';
import styles from './SignupForms.module.css';

export default function PasswordForm() {
  const router = useRouter();
  const [memberPass, setMemberPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberPass(e.target.value);
    setError(undefined);
    
    // 비밀번호 확인 필드가 채워져 있으면 일치 여부 검사
    if (confirmPass) {
      setConfirmError(e.target.value === confirmPass ? undefined : '비밀번호가 일치하지 않습니다');
    }
  };
  
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPass(e.target.value);
    setConfirmError(memberPass === e.target.value ? undefined : '비밀번호가 일치하지 않습니다');
  };
  
  const validatePassword = (password: string): boolean => {
    // 영문, 숫자, 특수문자 포함 8~20자
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    return regex.test(password);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberPass) {
      setError('비밀번호를 입력해주세요');
      return;
    }
    
    if (!validatePassword(memberPass)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자 사이여야 합니다');
      return;
    }
    
    if (memberPass !== confirmPass) {
      setConfirmError('비밀번호가 일치하지 않습니다');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 백엔드 API 호출
      await registerPassword({ memberPass });
      
      // 성공 시 다음 단계로 이동
      router.push(STEP_CONFIG.password.nextPath);
    } catch (error) {
      console.error('에러:', error);
      setError('비밀번호 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formContent}>
        <h3 className={styles.title}>{STEP_CONFIG.password.title}</h3>
        
        <input
          type="password"
          value={memberPass}
          onChange={handlePasswordChange}
          placeholder="비밀번호"
          className={styles.input}
          disabled={isLoading}
        />
        {error && <p className={styles.errorText}>{error}</p>}
        
        <input
          type="password"
          value={confirmPass}
          onChange={handleConfirmChange}
          placeholder="비밀번호 확인"
          className={`${styles.input} ${styles.confirmInput}`}
          disabled={isLoading}
        />
        {confirmError && <p className={styles.errorText}>{confirmError}</p>}
        
        <p className={styles.helperText}>{STEP_CONFIG.password.description}</p>
      </div>
      
      <StepButton 
        text={STEP_CONFIG.password.nextButtonText} 
        disabled={!memberPass || !confirmPass || Boolean(error) || Boolean(confirmError) || isLoading}
        isLoading={isLoading}
      />
    </form>
  );
}