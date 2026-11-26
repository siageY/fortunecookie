/**
 * script.js - 오늘의 운세 동작 스크립트
 * 
 * - 규칙 준수: 변수명 영어 / 주석 한국어 / 프레임워크 미사용
 * - 오늘의 운세는 서버(/api/fortune)가 Gemini API로 생성 (API 키는 서버만 보유)
 * - 서버 호출 실패 시 data/fortunes.json 에서 하나를 골라 대신 표시
 * - 당일 운세 유지: localStorage 를 사용하여 오늘 날짜 동안 동일한 운세 결과 유지
 */

// 로컬 스토리지 키
const STORAGE_KEY = "today_fortune_data";

// 현재 화면에 표시된 운세 / 날씨 요약 (메뉴 추천 연동용)
let currentFortuneSummary = "";
let currentWeatherSummary = "";
let isLoadingMenu = false;

// 운세 요청 진행 여부 (중복 클릭 방지)
let isLoadingFortune = false;

// DOM 요소
const fortuneButton = document.getElementById("fortuneButton");
const btnText = document.getElementById("btnText");
const resultCard = document.getElementById("resultCard");
const fortuneLevel = document.getElementById("fortuneLevel");
const fortuneMessage = document.getElementById("fortuneMessage");
const fortuneAdvice = document.getElementById("fortuneAdvice");
const fortuneLuckyItem = document.getElementById("fortuneLuckyItem");
const openMenuBtn = document.getElementById("openMenuBtn");

// 메뉴 추천 요소
const menuSection = document.getElementById("menuSection");
const menuMealTime = document.getElementById("menuMealTime");
const menuMood = document.getElementById("menuMood");
const menuWeather = document.getElementById("menuWeather");
const menuFortune = document.getElementById("menuFortune");
const menuSubmitBtn = document.getElementById("menuSubmitBtn");
const menuResultBox = document.getElementById("menuResultBox");
const menuResEmoji = document.getElementById("menuResEmoji");
const menuResName = document.getElementById("menuResName");
const menuResPoint = document.getElementById("menuResPoint");
const menuResReason = document.getElementById("menuResReason");
const menuResTip = document.getElementById("menuResTip");

// 날씨 표시 요소
const weatherPanel = document.getElementById("weatherPanel");
const weatherIcon = document.getElementById("weatherIcon");
const weatherText = document.getElementById("weatherText");
const weatherUpdated = document.getElementById("weatherUpdated");

// 날씨 자동 갱신 상태 (5분 주기)
const WEATHER_REFRESH_MS = 5 * 60 * 1000;
let isFetchingWeather = false;

// 현재 날짜를 YYYY-MM-DD 형태의 문자열로 반환
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// data/fortunes.json 파일에서 운세 데이터 비동기 호출 (대체 운세용)
async function fetchFortuneData() {
  try {
    const response = await fetch("../data/fortunes.json");
    if (!response.ok) {
      throw new Error(`데이터를 불러오지 못했습니다. 상태 코드: ${response.status}`);
    }
    const fortuneList = await response.json();
    return fortuneList;
  } catch (error) {
    console.error("운세 데이터를 불러오는 중 오류 발생:", error);
    alert("운세 데이터를 불러오지 못했습니다. 로컬 웹 서버 환경에서 실행 중인지 확인해 주세요.");
    return null;
  }
}

// data/fortunes.json 에서 대체 운세 하나를 무작위로 선택
async function fetchRandomFortune() {
  const fortuneList = await fetchFortuneData();
  if (!fortuneList || fortuneList.length === 0) {
    return null;
  }
  return fortuneList[Math.floor(Math.random() * fortuneList.length)];
}

// 서버의 /api/fortune 에서 오늘의 AI 운세 요청 (실패 시 대체 운세)
async function fetchTodayFortune() {
  try {
    const response = await fetch(`/api/fortune?date=${getTodayDateString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`AI 운세 응답 오류. 상태 코드: ${response.status}`);
    }
    const responseData = await response.json();
    if (!responseData || !responseData.fortune) {
      throw new Error("AI 운세 데이터가 비어 있습니다.");
    }
    return responseData.fortune;
  } catch (error) {
    console.warn("AI 운세를 불러오지 못해 기본 운세로 대체합니다:", error.message);
    return fetchRandomFortune();
  }
}

// 결과 카드에 운세 정보 렌더링
function renderFortuneCard(fortune) {
  // 등급 뱃지 텍스트 및 클래스 반영
  fortuneLevel.textContent = fortune.level;
  fortuneLevel.className = `fortune-badge badge-${fortune.level}`;

  // 문구, 조언, 행운의 아이템 반영
  fortuneMessage.textContent = `"${fortune.message}"`;
  fortuneAdvice.textContent = fortune.advice;
  fortuneLuckyItem.textContent = fortune.luckyItem;

  // 메뉴 추천 연동용 운세 요약 저장
  currentFortuneSummary = `[${fortune.level}] ${fortune.message}`;
  if (menuFortune && !menuFortune.value) {
    menuFortune.value = currentFortuneSummary;
  }

  // 카드 노출
  resultCard.classList.remove("hidden");

  // 버튼 스타일 및 문구를 '확인 완료' 상태로 전환
  fortuneButton.classList.add("completed");
  btnText.textContent = "오늘의 운세 확인 완료";
}

// 서버의 /api/weather 에서 오늘 날씨 요청 (실패하면 null)
async function fetchWeather() {
  try {
    const response = await fetch("/api/weather", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`날씨 응답 오류. 상태 코드: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("날씨 정보를 불러오지 못했습니다:", error.message);
    return null;
  }
}

// 날씨 정보를 하단 영역에 표시
function renderWeather(weather) {
  if (!weather) {
    // 실패해도 영역은 보여줘서 상태를 알 수 있게 한다
    weatherIcon.textContent = "🌡️";
    weatherText.textContent = "날씨 정보를 불러오지 못했습니다";
    weatherUpdated.textContent = "";
    weatherPanel.classList.remove("hidden");
    return;
  }

  const skyIcons = {
    "맑음": "☀️",
    "구름조금": "🌤️",
    "구름많음": "⛅",
    "흐림": "☁️"
  };
  const isRaining = weather.precipitation && weather.precipitation !== "없음";
  let icon = skyIcons[weather.sky] || "🌡️";
  if (isRaining) {
    icon = weather.precipitation === "눈" ? "🌨️" : "🌧️";
  }

  const parts = [weather.location, weather.sky];
  if (typeof weather.temperature === "number") {
    parts.push(`${Math.round(weather.temperature)}°C`);
  }
  if (typeof weather.pop === "number") {
    parts.push(`강수 ${weather.pop}%`);
  }

  weatherIcon.textContent = icon;
  weatherText.textContent = parts.join(" ");
  currentWeatherSummary = parts.join(" ");

  // 갱신 시각 표시
  const now = new Date();
  const hourText = String(now.getHours()).padStart(2, "0");
  const minuteText = String(now.getMinutes()).padStart(2, "0");
  weatherUpdated.textContent = `${hourText}:${minuteText} 기준`;

  weatherPanel.classList.remove("hidden");
}

// 날씨 정보를 새로 가져와 화면 갱신 (중복 요청 방지)
async function refreshWeather() {
  if (isFetchingWeather) {
    return;
  }
  isFetchingWeather = true;
  try {
    const weather = await fetchWeather();
    renderWeather(weather);
  } finally {
    isFetchingWeather = false;
  }
}

// 운세 보기 버튼 클릭 이벤트 핸들러
async function handleFortuneButtonClick() {
  // 이미 요청 중이면 중복 호출 방지
  if (isLoadingFortune) {
    return;
  }

  const todayString = getTodayDateString();
  const savedDataString = localStorage.getItem(STORAGE_KEY);

  // 1. 이미 오늘 저장된 운세가 있는 경우
  if (savedDataString) {
    try {
      const savedData = JSON.parse(savedDataString);
      if (savedData && savedData.date === todayString && savedData.fortune) {
        renderFortuneCard(savedData.fortune);
        resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }
    } catch (parseError) {
      console.warn("저장된 데이터 파싱 실패, 신규 추첨을 진행합니다.", parseError);
    }
  }

  // 2. 오늘 처음 누른 경우: 서버에서 AI 운세를 받아 표시
  isLoadingFortune = true;
  fortuneButton.disabled = true;
  btnText.textContent = "운세 보는 중...";

  try {
    const selectedFortune = await fetchTodayFortune();
    if (!selectedFortune) {
      return;
    }

    // 당일 유지를 위해 오늘 날짜와 함께 localStorage에 저장
    const storagePayload = {
      date: todayString,
      fortune: selectedFortune
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storagePayload));

    // 결과 화면 표시
    renderFortuneCard(selectedFortune);
    resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } finally {
    isLoadingFortune = false;
    fortuneButton.disabled = false;
    if (!fortuneButton.classList.contains("completed")) {
      btnText.textContent = "운세 보기";
    }
  }
}

// 페이지 최초 로드 시 당일 운세 확인 여부 체크 및 초기화
function initializeApp() {
  const todayString = getTodayDateString();
  const savedDataString = localStorage.getItem(STORAGE_KEY);

  // 이전에 오늘 날짜로 저장된 운세가 있다면 화면에 바로 표시
  if (savedDataString) {
    try {
      const savedData = JSON.parse(savedDataString);
      if (savedData && savedData.date === todayString && savedData.fortune) {
        renderFortuneCard(savedData.fortune);
      }
    } catch (parseError) {
      console.warn("기존 저장 데이터 파싱 오류:", parseError);
    }
  }

  // 버튼 클릭 이벤트 리스너 등록
  fortuneButton.addEventListener("click", handleFortuneButtonClick);
  if (openMenuBtn) {
    openMenuBtn.addEventListener("click", handleOpenMenuSection);
  }
  if (menuSubmitBtn) {
    menuSubmitBtn.addEventListener("click", handleMenuRecommend);
  }

  // 하단 실시간 날씨: 즉시 1회 + 5분마다 갱신 (실패해도 운세 기능은 그대로 동작)
  refreshWeather();
  setInterval(refreshWeather, WEATHER_REFRESH_MS);

  // 탭으로 돌아오면 바로 최신 날씨로 갱신
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshWeather();
    }
  });
}

// 메뉴 추천 카드 열기 및 운세/날씨 자동 채우기
function handleOpenMenuSection() {
  if (!menuSection) return;
  if (menuFortune && currentFortuneSummary) {
    menuFortune.value = currentFortuneSummary;
  }
  if (menuWeather && !menuWeather.value && currentWeatherSummary) {
    menuWeather.value = currentWeatherSummary;
  }
  menuSection.classList.remove("hidden");
  menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 서버의 /api/menu 에 오늘의 메뉴 추천 요청
async function handleMenuRecommend() {
  if (isLoadingMenu) return;

  isLoadingMenu = true;
  menuSubmitBtn.disabled = true;
  menuSubmitBtn.textContent = "🔮 기운을 읽고 메뉴 고르는 중...";
  menuResultBox.classList.add("hidden");

  let hasResult = false;
  try {
    const response = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealTime: menuMealTime.value,
        mood: menuMood.value,
        weather: menuWeather.value,
        fortune: menuFortune.value,
      }),
    });

    const rawText = await response.text();
    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      throw new Error(`서버 응답을 해석할 수 없습니다. (HTTP ${response.status})`);
    }

    if (!response.ok) {
      throw new Error(data.error || `오류가 발생했습니다. (HTTP ${response.status})`);
    }

    menuResEmoji.textContent = data.emoji || "🍽️";
    menuResName.textContent = data.menu || "오늘의 추천 메뉴";
    menuResPoint.textContent = `✨ ${data.luckyPoint || "행운 가득한 한 끼"}`;
    menuResReason.textContent = data.reason || "";
    menuResTip.textContent = `💡 곁들임 팁: ${data.sideTip || "따뜻한 물 한 잔과 함께 즐겨보세요."}`;

    menuResultBox.classList.remove("hidden");
    menuResultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    hasResult = true;
  } catch (error) {
    alert(error.message || "메뉴 추천 중 오류가 발생했습니다.");
  } finally {
    isLoadingMenu = false;
    menuSubmitBtn.disabled = false;
    menuSubmitBtn.textContent = hasResult ? "🔄 다른 메뉴 다시 점지받기" : "✨ 오늘의 메뉴 점지받기";
  }
}

// DOM 콘텐츠 로드 완료 시 초기화 실행
document.addEventListener("DOMContentLoaded", initializeApp);
