'use client';
import React from 'react';
import { ReportData } from '../types';

interface Props {
  data: ReportData;
}

export default function ReportCard({ data }: Props) {
  return (
    <div className="space-y-6 bg-white p-6 shadow rounded-lg text-gray-800">
      <section>
        <h2 className="text-lg font-semibold mb-1">💬 대화 상황 요약</h2>
        <p>• {data.situation}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">🧠 감정 표현 유형</h2>
        {data.emotions.map((person, idx) => (
          <div key={idx} className="mb-2">
            <p className="font-bold">{person.nickname} ({person.type})</p>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {person.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">📈 소통 패턴</h2>
        <p>• {data.communication}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">🌱 개선 방안</h2>
        <ul className="list-disc ml-5 text-sm text-gray-700">
          {data.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">📞 상담 추천 여부</h2>
        <p>• {data.recommend}</p>
      </section>
    </div>
  );
}
