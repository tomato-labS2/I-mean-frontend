'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { generateGptReport } from '@/features/report/api/generateReport';
import ReportCard from '@/features/report/components/ReportCard';
import { FiDownload, FiShare2, FiMoreHorizontal, FiX } from 'react-icons/fi';
import { ReportData } from '@/features/report/types';

export default function ReportViewPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!roomId) {
      alert('roomId가 필요합니다');
      return;
    }

    setLoading(true);
    const result = await generateGptReport(roomId);
    setLoading(false);

    if (result) {
      setReport(result);
    } else {
      alert('리포트 생성 실패');
    }
  };

  return (
    <div className="p-8 relative">
      <button
        onClick={() => router.push('/chat')}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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

      <div className="fixed bottom-4 left-0 w-full flex justify-center space-x-4">
        <button className="bg-white rounded-full p-3 shadow"><FiDownload size={20} /></button>
        <button className="bg-white rounded-full p-3 shadow"><FiShare2 size={20} /></button>
        <button className="bg-white rounded-full p-3 shadow"><FiMoreHorizontal size={20} /></button>
      </div>
    </div>
  );
}
