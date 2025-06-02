'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import styles from './SignupForms.module.css';

interface StepButtonProps {
  text: string;
  disabled?: boolean;
  isLoading?: boolean;
  isSubmit?: boolean;
  onClick?: () => void;
}

const StepButton: React.FC<StepButtonProps> = ({
  text,
  disabled = false,
  isLoading = false,
  isSubmit = false,
  onClick,
}) => {
  return (
    <Button
      type={isSubmit ? 'submit' : 'button'}
      className={`${styles.button} w-full h-14 bg-[#f4e6a1] hover:bg-[#f0e085] text-[#5a5a5a] font-semibold rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-lg`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#5a5a5a]/30 border-t-[#5a5a5a] rounded-full animate-spin mr-2"></div>
          <span>처리 중...</span>
        </div>
      ) : (
        text
      )}
    </Button>
  );
};

export default StepButton; 