// src/features/report/hooks/useReportData.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ReportData } from '../types';

export const useReportData = (roomId: number) => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get<ReportData>(`http://localhost:8000/reports/room/${roomId}`);
        setData(response.data);
      } catch (error) {
        console.error('리포트 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [roomId]);

  return { data, loading };
};
