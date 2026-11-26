/**
 * api/fortune.mjs - GET /api/fortune (Vercel Serverless Function)
 *
 * Gemini API 키는 Vercel 서버 환경변수(GEMINI_API_KEY)에서만 읽는다.
 * 같은 날짜(date 쿼리) 응답은 Vercel CDN 캐시로 하루 동안 재사용한다.
 */

import { generateFortune } from "../lib/gemini.mjs";

// JSON 응답 전송 헬퍼
function sendJson(res, statusCode, payload, cacheControl = "no-store") {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.end(JSON.stringify(payload));
}

// 한국 시간(KST) 기준 오늘 날짜(YYYY-MM-DD) 반환
function getTodayKst() {
  const shifted = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 요청 URL 또는 쿼리 객체에서 date 파라미터 추출
function extractDateParam(req) {
  if (req?.query?.date) {
    return String(req.query.date);
  }
  try {
    const parsedUrl = new URL(req?.url || "", "http://localhost");
    return parsedUrl.searchParams.get("date");
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: "GEMINI_API_KEY 가 설정되어 있지 않습니다" });
  }

  const dateParam = extractDateParam(req);
  const dateString = /^\d{4}-\d{2}-\d{2}$/.test(dateParam || "")
    ? dateParam
    : getTodayKst();

  try {
    const fortune = await generateFortune({ apiKey, dateString });
    return sendJson(
      res,
      200,
      { date: dateString, source: "ai", fortune },
      // 같은 날짜 요청은 Vercel CDN 캐시로 동일한 운세를 재사용 (하루 유지)
      "public, s-maxage=86400, stale-while-revalidate=600"
    );
  } catch (error) {
    console.warn(`AI 운세 생성 실패: ${error.message}`);
    return sendJson(res, 502, { error: "운세를 생성하지 못했습니다" });
  }
}
