/**
 * lib/gemini.mjs - Gemini 운세 생성 공용 로직
 *
 * 로컬 server.js 와 Netlify 함수(netlify/functions/fortune.mjs)가 함께 사용한다.
 * API 키는 호출하는 쪽에서 넘겨주며, 이 모듈은 키를 저장하거나 출력하지 않는다.
 */

export const ALLOWED_LEVELS = ["대길", "길", "보통", "조심"];
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

// AI 응답을 fortunes.json 과 같은 모양으로 검증/정규화
function normalizeFortune(rawFortune) {
  const level = ALLOWED_LEVELS.includes(rawFortune?.level) ? rawFortune.level : null;
  const message = String(rawFortune?.message ?? "").trim();
  const advice = String(rawFortune?.advice ?? "").trim();
  const luckyItem = String(rawFortune?.luckyItem ?? "").trim();

  if (!level || !message || !advice || !luckyItem) {
    throw new Error("AI 응답이 fortunes.json 형식과 다릅니다");
  }

  return { level, message, advice, luckyItem };
}

// Gemini 에게 하루치 운세 문구를 요청
export async function generateFortune({ apiKey, dateString, model = DEFAULT_GEMINI_MODEL }) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 가 없습니다");
  }

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "너는 한국어 운세 작가다.",
              `오늘은 ${dateString} 이다.`,
              "아래 JSON 형식으로만 답한다.",
              '{"level":"대길|길|보통|조심 중 하나","message":"오늘의 운세 한두 문장","advice":"오늘의 조언 한 문장","luckyItem":"행운의 아이템 하나"}',
              "level 은 반드시 대길, 길, 보통, 조심 중 하나만 쓴다.",
              "밝고 귀여운 말투로, 앞서 나온 문구와 겹치지 않게 새롭게 쓴다.",
            ].join("\n"),
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          level: { type: "STRING", enum: ALLOWED_LEVELS },
          message: { type: "STRING" },
          advice: { type: "STRING" },
          luckyItem: { type: "STRING" },
        },
        required: ["level", "message", "advice", "luckyItem"],
      },
      maxOutputTokens: 400,
      temperature: 1,
    },
  };

  const response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    // 응답 본문에는 키가 없지만, 상태 코드만 남겨 로그를 깔끔하게 유지한다
    throw new Error(`Gemini 응답 오류: HTTP ${response.status}`);
  }

  const responseData = await response.json();
  const text = (responseData?.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("");

  return normalizeFortune(JSON.parse(text));
}
