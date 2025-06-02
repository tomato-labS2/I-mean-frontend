// 회원가입 단계 타입
export type SignupStep = 'email' | 'nickname' | 'password' | 'phone';

// 단계 구성 인터페이스
export interface StepConfig {
  title: string;
  description: string;
  nextButtonText: string;
  nextPath: string;
  isLastStep?: boolean;
}

// 각 단계별 설정
export const STEP_CONFIG: Record<SignupStep, StepConfig> = {
  email: {
    title: '아이디를 입력해 주세요!',
    description: '이메일 형식으로 입력해주세요.',
    nextButtonText: '다음',
    nextPath: '/signup/nickname',
  },
  nickname: {
    title: '닉네임을 입력해 주세요!',
    description: '닉네임은 다른 사용자에게 표시됩니다.',
    nextButtonText: '다음',
    nextPath: '/signup/password',
  },
  password: {
    title: '비밀번호를 입력해 주세요!',
    description: '영문, 숫자, 특수문자 조합으로 입력해주세요 (8~20자).',
    nextButtonText: '다음',
    nextPath: '/signup/phone',
  },
  phone: {
    title: '전화번호를 입력해 주세요!',
    description: '인증을 위해 필요합니다.',
    nextButtonText: '완료',
    nextPath: '/login',
    isLastStep: true,
  },
};

// API 요청 인터페이스
export interface EmailRequestDTO {
  memberEmail: string;
}

export interface NicknameRequestDTO {
  memberNickName: string;
}

export interface PasswordRequestDTO {
  memberPass: string;
}

export interface PhoneRequestDTO {
  memberPhone: string;
}