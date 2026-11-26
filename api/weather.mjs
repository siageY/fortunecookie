/**
 * api/weather.mjs - GET /api/weather (Vercel Serverless Function)
 *
 * 기상청 키는 Vercel 환경변수(WEATHER_API_KEY)에서 읽고,
 * 키가 없거나 실패하면 Open-Meteo 로 대체한다. 응답은 5분간 CDN 캐시한다.
 */

import { getWeather } from "../lib/weather.mjs";

// JSON 응답 전송 헬퍼
function sendJson(res, statusCode, payload, cacheControl = "no-store") {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  try {
    const weather = await getWeather(process.env.WEATHER_API_KEY);
    return sendJson(res, 200, weather, "public, s-maxage=300");
  } catch (error) {
    console.warn(`날씨 정보 조회 실패: ${error.message}`);
    return sendJson(res, 502, { error: "날씨 정보를 불러오지 못했습니다" });
  }
}
