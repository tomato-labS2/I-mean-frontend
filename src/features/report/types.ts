// src/features/report/types.ts
export interface EmotionProfile {
  nickname: string;
  type: '방어' | '회피';
  details: string[];
}

export interface ReportData {
  situation: string;
  emotions: EmotionProfile[];
  communication: string;
  suggestions: string[];
  recommend: string;
}
