'use client';

import React from 'react';

const dummyReport = {
  situation: '최근 소통 부족으로 갈등을 겪고 있음',
  emotions: [
    {
      nickname: '코코',
      type: '방어',
      details: [
        '감정 표현 절제 어려움',
        '표현 갈등 있음',
        '감정이 상할 때 즉각 반응하거나 해명하려는 경향 있음',
      ],
    },
    {
      nickname: '뿌뿌',
      type: '회피',
      details: [
        '감정 연금 끊기며 회피',
        '감정 표현 자제함',
        '상대 반응에 민감하게 반응함',
      ],
    },
  ],
  communication: '반복적인 오해와 감정적 반응이 반복됨',
  suggestions: [
    "'나'에 집중한 메시지 사용",
    '회피 성향 개선 필요',
    '감정과 반응 구분 연습 필요',
  ],
  recommend: '커플 상담 주 1회 추천',
  };

export default function ReportViewPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">💗 커플 상담 리포트</h1>

      <div className="space-y-6 bg-white p-6 shadow rounded-lg text-gray-800">
        <section>
          <h2 className="text-lg font-semibold mb-1">💬 대화 상황 요약</h2>
          <p>• {dummyReport.situation}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-1">🧠 감정 표현 유형</h2>
          {dummyReport.emotions.map((person, idx) => (
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
          <p>• {dummyReport.communication}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-1">🌱 개선 방안</h2>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {dummyReport.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-1">📞 상담 추천 여부</h2>
          <p>• {dummyReport.recommend}</p>
        </section>
      </div>
    </div>

   {/* 하단 고정 버튼 */}
    <div className="fixed bottom-4 left-0 w-full flex justify-center space-x-4">
              <button className="bg-white rounded-full p-3 shadow">
                    <FiDownload size={20} />
        </button>
          <button className="bg-white rounded-full p-3 shadow">
              <FiShare2 size={20} />
        </button>
        <button className="bg-white rounded-full p-3 shadow">
                    <FiMoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}