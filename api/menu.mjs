/**
 * api/menu.mjs - POST /api/menu (Vercel Serverless Function)
 *
 * 오늘의 운세, 기분, 시간대, 날씨를 바탕으로 Gemini API(gemini-3.5-flash-lite)를 호출해
 * 오늘의 추천 메뉴 1가지를 JSON으로 반환한다.
 */

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MENU_MODEL = "gemini-3.5-flash-lite";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function parseRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method Not Allowed" });
  }

  let body = {};
  try {
    body = await parseRequestBody(req);
  } catch {
    return sendJson(res, 400, { error: "잘못된 요청 형식(JSON)입니다." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." });
  }

  const { mood, mealTime, weather, fortune } = body;

  const prompt = `
당신은 재치 있고 센스 넘치는 '운세 기반 메뉴 점술가'입니다.
아래 사용자의 현재 상태를 보고, 오늘 기운을 북돋아 줄 딱 한 가지의 구체적인 메뉴를 추천해 주세요.

[사용자 정보]
- 식사 시간대: ${mealTime || "아무 때나"}
- 현재 기분/상태: ${mood || "보통"}
- 오늘 날씨/분위기: ${weather || "무난함"}
- 참고할 오늘의 운세 키워드: ${fortune || "평온함"}

[응답 규칙]
1. 반드시 아래 JSON 형식으로만 응답하고, 마크다운(\`\`\`json)이나 다른 설명은 절대 붙이지 마세요.
2. 메뉴는 구체적인 음식 이름으로 정해주세요 (예: 한식 대신 '얼큰한 차돌박이 순두부찌개').
3. 추천 이유는 운세/기분과 엮어서 유머러스하고 설득력 있게 2~3문장으로 작성하세요.

{
  "menu": "추천 메뉴 이름",
  "emoji": "음식과 어울리는 이모지 1개",
  "luckyPoint": "행운 포인트 (예: 붉은 국물이 액운을 막아줌)",
  "reason": "운세와 기분을 엮은 센스 있는 추천 이유",
  "sideTip": "함께 곁들이면 좋은 음료나 디저트 한 줄 팁"
}
`;

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}/${DEFAULT_MENU_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 600,
          temperature: 0.85,
        },
      }),
      signal: AbortSignal.timeout(7500),
    });

    const rawText = await response.text();
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Gemini API 응답 파싱 실패 (HTTP ${response.status})`);
    }

    if (!response.ok) {
      const msg = data?.error?.message || `Gemini API 호출 실패 (HTTP ${response.status})`;
      if (msg.includes("high demand")) {
        throw new Error("현재 AI 서버 요청이 몰려 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
      }
      throw new Error(msg);
    }

    const resultText = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    if (!resultText) {
      throw new Error("AI로부터 추천 결과를 받지 못했습니다.");
    }

    const parsed = JSON.parse(resultText);
    if (!parsed || !parsed.menu) {
      throw new Error("추천 메뉴 형식이 올바르지 않습니다.");
    }

    return sendJson(res, 200, parsed);
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return sendJson(res, 504, { error: "AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요." });
    }
    console.error("메뉴 추천 오류:", error);
    return sendJson(res, 500, { error: error.message || "메뉴를 추천하는 중 오류가 발생했습니다." });
  }
}
