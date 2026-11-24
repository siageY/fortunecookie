/**
 * script.js - 오늘의 운세 동작 스크립트
 * 
 * - 규칙 준수: 변수명 영어 / 주석 한국어 / 프레임워크 미사용
 * - 운세 데이터는 data/fortunes.json 에서 fetch로 로드 (코드 내 문구 하드코딩 금지)
 * - 당일 운세 유지: localStorage 를 사용하여 오늘 날짜 동안 동일한 운세 결과 유지
 */

// 로컬 스토리지 키
const STORAGE_KEY = "today_fortune_data";

// DOM 요소
const fortuneButton = document.getElementById("fortuneButton");
const btnText = document.getElementById("btnText");
const resultCard = document.getElementById("resultCard");
const fortuneLevel = document.getElementById("fortuneLevel");
const fortuneMessage = document.getElementById("fortuneMessage");
const fortuneAdvice = document.getElementById("fortuneAdvice");
const fortuneLuckyItem = document.getElementById("fortuneLuckyItem");

// 현재 날짜를 YYYY-MM-DD 형태의 문자열로 반환
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// data/fortunes.json 파일에서 운세 데이터 비동기 호출
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

// 결과 카드에 운세 정보 렌더링
function renderFortuneCard(fortune) {
  // 등급 뱃지 텍스트 및 클래스 반영
  fortuneLevel.textContent = fortune.level;
  fortuneLevel.className = `fortune-badge badge-${fortune.level}`;

  // 문구, 조언, 행운의 아이템 반영
  fortuneMessage.textContent = `"${fortune.message}"`;
  fortuneAdvice.textContent = fortune.advice;
  fortuneLuckyItem.textContent = fortune.luckyItem;

  // 카드 노출
  resultCard.classList.remove("hidden");

  // 버튼 스타일 및 문구를 '확인 완료' 상태로 전환
  fortuneButton.classList.add("completed");
  btnText.textContent = "오늘의 운세 확인 완료";
}

// 운세 보기 버튼 클릭 이벤트 핸들러
async function handleFortuneButtonClick() {
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

  // 2. 오늘 처음 누른 경우: JSON 파일에서 데이터 로드 후 랜덤 추첨
  const fortuneList = await fetchFortuneData();
  if (!fortuneList || fortuneList.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * fortuneList.length);
  const selectedFortune = fortuneList[randomIndex];

  // 당일 유지를 위해 오늘 날짜와 함께 localStorage에 저장
  const storagePayload = {
    date: todayString,
    fortune: selectedFortune
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storagePayload));

  // 결과 화면 표시
  renderFortuneCard(selectedFortune);
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
}

// DOM 콘텐츠 로드 완료 시 초기화 실행
document.addEventListener("DOMContentLoaded", initializeApp);
