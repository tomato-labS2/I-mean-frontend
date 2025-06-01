'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiDownload, FiShare2, FiMoreHorizontal, FiX } from 'react-icons/fi';

import ReportCard from '@/features/report/components/ReportCard';
import { generateGptReport } from '@/features/report/api/generateReport';
import { ReportData } from '@/features/report/types';

export default function ReportViewPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    const roomId = 'testroom001'; // TODO: 실제 값으로 대체하거나 URL 파라미터로 받아오기
    setLoading(true);
    const result = await generateGptReport(roomId);
    setLoading(false);

    if (result) {
      console.log('GPT 리포트:', result);
      setReport(result);
    } else {
      alert('리포트 생성 실패');
    }
  };

  return (
    <div className="p-8 relative">
      {/* 닫기 버튼 */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        onClick={() => router.push('/chat')}
        aria-label="닫기"
      >
        <FiX size={24} />
      </button>

      <h1 className="text-2xl font-bold mb-6">💗 커플 상담 리포트</h1>

      <button
        onClick={handleGenerateReport}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
        disabled={loading}
      >
        {loading ? '생성 중...' : 'GPT 리포트 생성'}
      </button>

      {report && <ReportCard data={report} />}

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-4 left-0 w-full flex justify-center space-x-4">
        <button className="bg-white rounded-full p-3 shadow"><FiDownload size={20} /></button>
        <button className="bg-white rounded-full p-3 shadow"><FiShare2 size={20} /></button>
        <button className="bg-white rounded-full p-3 shadow"><FiMoreHorizontal size={20} /></button>
      </div>
    </div>
  );
}
