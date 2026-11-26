/**
 * lib/weather.mjs - 서울 실시간 날씨 공용 로직
 *
 * 기상청 단기예보(공공데이터포털/API허브)를 먼저 시도하고,
 * 실패하면 키가 필요 없는 Open-Meteo 로 대체한다.
 * 로컬 server.js 와 Netlify 함수(netlify/functions/weather.mjs)가 함께 사용한다.
 */

export const WEATHER_LOCATION = { name: "서울", nx: 60, ny: 127 };

const KMA_ENDPOINT =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const KMA_APIHUB_ENDPOINT =
  "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst";
const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const SEOUL_COORDS = { latitude: 37.5665, longitude: 126.978 };
const WEATHER_CACHE_MS = 5 * 60 * 1000;

const SKY_NAMES = { 1: "맑음", 2: "구름조금", 3: "구름많음", 4: "흐림" };
const PTY_NAMES = { 0: "없음", 1: "비", 2: "비/눈", 3: "눈", 4: "소나기" };

// 한국 시간(KST) 기준 현재 날짜/시각
function getKstNowParts() {
  const shifted = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  return {
    date: `${year}${String(month + 1).padStart(2, "0")}${String(day).padStart(2, "0")}`,
    time: `${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`,
  };
}

// 기상청 단기예보 발표시각(02/05/08/11/14/17/20/23시) 중 가장 최근 시각
function getKmaBaseTime() {
  const baseHours = [2, 5, 8, 11, 14, 17, 20, 23];
  const shifted = new Date(Date.now() + 9 * 60 * 60 * 1000 - 10 * 60 * 1000);

  let hour = null;
  for (const candidate of baseHours) {
    if (candidate <= shifted.getUTCHours()) hour = candidate;
  }

  let baseDate = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate())
  );
  if (hour === null) {
    baseDate = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
    hour = 23;
  }

  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const day = baseDate.getUTCDate();
  return {
    baseDate: `${year}${String(month + 1).padStart(2, "0")}${String(day).padStart(2, "0")}`,
    baseTime: `${String(hour).padStart(2, "0")}00`,
  };
}

// 예보 항목을 지금과 가장 가까운 시각 기준으로 요약
function buildWeather(items, base) {
  const groups = new Map();
  for (const item of items) {
    if (!item || !item.fcstDate || !item.fcstTime) continue;
    const key = `${item.fcstDate}${item.fcstTime}`;
    if (!groups.has(key)) groups.set(key, {});
    groups.get(key)[item.category] = item.fcstValue;
  }

  const keys = [...groups.keys()].sort();
  if (keys.length === 0) {
    throw new Error("기상청 예보 항목이 없습니다");
  }

  const now = getKstNowParts();
  const targetKey = `${now.date}${now.time}`;
  const chosenKey = keys.find((key) => key >= targetKey) || keys[keys.length - 1];
  const values = groups.get(chosenKey) || {};

  const toNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    location: WEATHER_LOCATION.name,
    date: chosenKey.slice(0, 8),
    time: chosenKey.slice(8),
    temperature: toNumber(values.TMP),
    sky: SKY_NAMES[values.SKY] || "정보 없음",
    precipitation: PTY_NAMES[values.PTY] || "정보 없음",
    pop: toNumber(values.POP),
    humidity: toNumber(values.REH),
    baseTime: `${base.baseDate}${base.baseTime}`,
  };
}

// 기상청 예보 요청 URL 생성 (게이트웨이별 인증 파라미터 이름이 다름)
function buildKmaRequestUrl(endpoint, keyParamName, apiKey, base) {
  const requestUrl = new URL(endpoint);
  requestUrl.searchParams.set(keyParamName, apiKey);
  requestUrl.searchParams.set("pageNo", "1");
  requestUrl.searchParams.set("numOfRows", "1000");
  requestUrl.searchParams.set("dataType", "JSON");
  requestUrl.searchParams.set("base_date", base.baseDate);
  requestUrl.searchParams.set("base_time", base.baseTime);
  requestUrl.searchParams.set("nx", String(WEATHER_LOCATION.nx));
  requestUrl.searchParams.set("ny", String(WEATHER_LOCATION.ny));
  return requestUrl;
}

// 기상청 응답에서 예보 항목 배열만 추출
async function fetchKmaItems(requestUrl) {
  const response = await fetch(requestUrl, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    // 응답 본문은 키를 포함하지 않으므로 원인 파악용으로 짧게 남긴다
    const errorBody = (await response.text()).replace(/\s+/g, " ").slice(0, 200);
    throw new Error(`HTTP ${response.status} ${errorBody}`.trim());
  }

  let parsed = null;
  try {
    parsed = JSON.parse(await response.text());
  } catch {
    throw new Error("응답을 해석하지 못했습니다");
  }

  const header = parsed?.response?.header || {};
  const resultCode = String(header.resultCode ?? "");
  if (resultCode !== "00") {
    throw new Error(`결과코드 ${resultCode} ${header.resultMsg || ""}`.trim());
  }

  const rawItems = parsed?.response?.body?.items?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
  if (items.length === 0) {
    throw new Error("예보 데이터가 비어 있습니다");
  }
  return items;
}

// 기상청 단기예보 호출 (공공데이터포털 → API허브 순서)
async function requestKmaWeather(apiKey) {
  if (!apiKey) {
    throw new Error("WEATHER_API_KEY 가 없습니다");
  }

  const base = getKmaBaseTime();
  const attempts = [
    {
      label: "공공데이터포털",
      url: buildKmaRequestUrl(KMA_ENDPOINT, "serviceKey", apiKey, base),
    },
    {
      label: "기상청 API허브",
      url: buildKmaRequestUrl(KMA_APIHUB_ENDPOINT, "authKey", apiKey, base),
    },
  ];

  const errors = [];
  for (const attempt of attempts) {
    try {
      const items = await fetchKmaItems(attempt.url);
      return buildWeather(items, base);
    } catch (error) {
      errors.push(`${attempt.label} 실패: ${error.message}`);
    }
  }

  throw new Error(errors.join(" / "));
}

// WMO 날씨 코드 → 화면 표시용 하늘 상태/강수 형태
function describeWmoCode(code) {
  if (code === 0) return { sky: "맑음", precipitation: "없음" };
  if (code === 1 || code === 2) return { sky: "구름조금", precipitation: "없음" };
  if (code === 3) return { sky: "흐림", precipitation: "없음" };
  if (code === 45 || code === 48) return { sky: "흐림", precipitation: "없음" };
  if (code >= 51 && code <= 57) return { sky: "흐림", precipitation: "비" };
  if (code >= 61 && code <= 67) return { sky: "흐림", precipitation: "비" };
  if (code >= 71 && code <= 77) return { sky: "흐림", precipitation: "눈" };
  if (code >= 80 && code <= 82) return { sky: "흐림", precipitation: "소나기" };
  if (code >= 85 && code <= 86) return { sky: "흐림", precipitation: "눈" };
  if (code >= 95) return { sky: "흐림", precipitation: "비" };
  return { sky: "정보 없음", precipitation: "정보 없음" };
}

async function requestOpenMeteoWeather() {
  const requestUrl = new URL(OPEN_METEO_ENDPOINT);
  requestUrl.searchParams.set("latitude", String(SEOUL_COORDS.latitude));
  requestUrl.searchParams.set("longitude", String(SEOUL_COORDS.longitude));
  requestUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code");
  requestUrl.searchParams.set("daily", "precipitation_probability_max");
  requestUrl.searchParams.set("forecast_days", "1");
  requestUrl.searchParams.set("timezone", "Asia/Seoul");

  const response = await fetch(requestUrl, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`Open-Meteo 응답 오류: HTTP ${response.status}`);
  }

  const data = await response.json();
  const current = data?.current || {};
  const now = getKstNowParts();
  const description = describeWmoCode(Number(current.weather_code));

  const toNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    location: WEATHER_LOCATION.name,
    date: now.date,
    time: now.time,
    temperature: toNumber(current.temperature_2m),
    sky: description.sky,
    precipitation: description.precipitation,
    pop: toNumber(data?.daily?.precipitation_probability_max?.[0]),
    humidity: toNumber(current.relative_humidity_2m),
    baseTime: "open-meteo",
  };
}

// 5분 캐시 (클라이언트도 5분마다 갱신, 일시 오류 시 직전 값 사용)
let weatherCache = { data: null, expiresAt: 0 };

export async function getWeather(apiKey) {
  if (weatherCache.data && Date.now() < weatherCache.expiresAt) {
    return weatherCache.data;
  }

  try {
    const data = await requestKmaWeather(apiKey);
    weatherCache = { data, expiresAt: Date.now() + WEATHER_CACHE_MS };
    return data;
  } catch (kmaError) {
    console.warn(`기상청 날씨 조회 실패, Open-Meteo 로 대체: ${kmaError.message}`);
  }

  try {
    const data = await requestOpenMeteoWeather();
    weatherCache = { data, expiresAt: Date.now() + WEATHER_CACHE_MS };
    return data;
  } catch (openMeteoError) {
    if (weatherCache.data) {
      return weatherCache.data;
    }
    throw openMeteoError;
  }
}
