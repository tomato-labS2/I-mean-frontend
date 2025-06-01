export const generateGptReport = async (roomId: string) => {
  const res = await fetch("http://localhost:8000/reports/gpt/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ room_id: roomId }),
  });

  if (!res.ok) {
    throw new Error("API 요청 실패: " + res.status);
  }

  return res.json();
};
