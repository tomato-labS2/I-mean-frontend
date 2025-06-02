'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STEP_CONFIG } from '@/types/signup';
import { registerPhone } from '@/lib/api';
import StepButton from './StepButton';
import styles from './SignupForms.module.css';

export default function PhoneForm() {
  const router = useRouter();
  const [memberPhone, setMemberPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자와 하이픈만 허용
    const value = e.target.value.replace(/[^\d-]/g, '');
    setMemberPhone(value);
    setError(undefined);
  };
  
  const formatPhoneNumber = (phone: string): string => {
    // 전화번호 형식으로 자동 변환 (010-1234-5678)
    const digits = phone.replace(/-/g, '');
    
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };
  
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberPhone) {
      setError('전화번호를 입력해주세요');
      return;
    }
    
    if (!validatePhone(memberPhone)) {
      setError('유효한 전화번호 형식이 아닙니다');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 백엔드 API 호출 (최종 회원가입 완료)
      await registerPhone({ memberPhone });
      
      // 성공 시 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      router.push(STEP_CONFIG.phone.nextPath);
    } catch (error) {
      console.error('에러:', error);
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBlur = () => {
    if (memberPhone) {
      setMemberPhone(formatPhoneNumber(memberPhone));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formContent}>
        <h3 className={styles.title}>{STEP_CONFIG.phone.title}</h3>
        <input
          type="tel"
          value={memberPhone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="전화번호 (예: 010-1234-5678)"
          className={styles.input}
          disabled={isLoading}
        />
        {error && <p className={styles.errorText}>{error}</p>}
        <p className={styles.helperText}>{STEP_CONFIG.phone.description}</p>
      </div>
      
      <StepButton 
        text={STEP_CONFIG.phone.nextButtonText} 
        disabled={!memberPhone || isLoading}
        isLoading={isLoading}
        isSubmit={true}
      />
    </form>
  );
}