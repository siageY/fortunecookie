---
name: Fortune Cookie (오늘의 운세)
theme: Bright, Cute & Pastel
colors:
  primary: '#243B53'
  primary-hover: '#102A43'
  brand: '#8EC5FC'
  canvas-gradient-top: '#8EC5FC'
  canvas-gradient-mid: '#B8DCFE'
  canvas-gradient-soft: '#FBE8F2'
  canvas-gradient-bottom: '#FAD0C4'
  surface-card: '#FFFFFF'
  surface-subtle: '#F8FAFC'
  foreground: '#1A2C3F'
  body: '#334E68'
  muted: '#829AB1'
  caption: '#9FB3C8'
  border-divider: '#F0F4F8'
  # 등급별 시맨틱 컬러
  level-daegil:
    text: '#E03131'
    bg: '#FFE3E3'
    shadow: 'rgba(224, 49, 49, 0.18)'
  level-gil:
    text: '#0CA678'
    bg: '#E6FCF5'
    shadow: 'rgba(12, 166, 120, 0.18)'
  level-botong:
    text: '#1971C2'
    bg: '#E7F5FF'
    shadow: 'rgba(25, 113, 194, 0.18)'
  level-josim:
    text: '#6741D9'
    bg: '#F3F0FF'
    shadow: 'rgba(103, 65, 217, 0.18)'
typography:
  display:
    fontSize: 32px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: '-0.5px'
    use: 앱 메인 타이틀 ("오늘의 운세")
  heading-card:
    fontSize: 19px
    fontWeight: 700
    lineHeight: 1.55
    use: 결과 카드 메인 운세 문구
  button-label:
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.3
    use: 운세 보기 메인 액션 버튼 텍스트
  badge:
    fontSize: 16px
    fontWeight: 800
    letterSpacing: '1px'
    use: 운세 등급 뱃지 (대길, 길, 보통, 조심)
  body-detail:
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.45
    use: 오늘의 조언 및 행운의 아이템 내용
  subtitle:
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    use: 앱 상단 서브 문구
  label-micro:
    fontSize: 12px
    fontWeight: 700
    use: 항목 레이블 ("오늘의 조언", "행운의 아이템")
  caption:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    use: 하단 하루 유지 안내 문구
rounded:
  sm: 8px
  md: 14px
  lg: 18px
  xl: 24px
  card: 28px
  mobile-frame: 40px
  full: 9999px
spacing:
  xs: 4
  sm: 8
  md: 12
  base: 16
  lg: 20
  xl: 24
  xxl: 32
  section: 48
components:
  button-fortune:
    type: button
    backgroundColor: 'linear-gradient(135deg, #FFFFFF 0%, #FBFBFC 100%)'
    textColor: '#243B53'
    rounded: 24px
    padding: 18px 24px
    typography: 18px / 700
    shadow: '0 10px 24px rgba(40, 75, 110, 0.15)'
    states:
      hover: 'translateY(-2px), shadow 0 14px 28px rgba(40, 75, 110, 0.2)'
      active: 'scale(0.97), shadow 0 6px 16px rgba(40, 75, 110, 0.15)'
      completed: 'bg rgba(255, 255, 255, 0.85), color #627D98'
    use: 메인 운세 확인 버튼
  card-result:
    type: card
    backgroundColor: '#FFFFFF'
    rounded: 28px
    padding: 28px 22px
    shadow: '0 16px 36px rgba(35, 70, 105, 0.16)'
    animation: 'popIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    use: 운세 결과(등급, 문구, 조언, 아이템) 표시 모달형 카드
  badge-level:
    type: badge
    rounded: 9999px
    padding: 8px 20px
    typography: 16px / 800
    use: 대길, 길, 보통, 조심 등급 뱃지
  item-detail:
    type: container
    backgroundColor: '#F8FAFC'
    rounded: 18px
    padding: 14px 16px
    gap: 12px
    use: 오늘의 조언 / 행운의 아이템 정보 박스
fonts:
  roles:
    sans: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", sans-serif'
---

# Design System: 오늘의 운세 (Fortune Cookie)

## 1. Overview (개요)

### Visual Theme & Atmosphere (시각적 테마와 분위기)
넷플릭스가 '어두운 영화관(Dark Theater)'의 차분함을 표방한다면, **오늘의 운세**는 **‘아침 햇살 속 따스하고 몽환적인 꿈동산’**을 지향합니다.
하루를 시작하며 가볍게 운세를 열어보는 사용자에게 따뜻한 위로와 기분 좋은 설렘을 선사하기 위해, 은은한 스카이 블루에서 부드러운 피치 핑크로 이어지는 파스텔 그라데이션 배경과 포근하고 말랑말랑한 백색 라운드 카드를 핵심 테마로 구성했습니다.

**주요 특징:**
- **화사한 파스텔 그라데이션**: 맑은 하늘빛(`canvas-gradient-top`)에서 시작해 따스한 피치(`canvas-gradient-bottom`)로 이어지는 배경
- **입체적이고 누르고 싶은 UI**: 평면적인 플랫 디자인을 넘어 손가락으로 꾹 누르고 싶어지는 볼록한 젤리형 버튼과 소프트 볼륨감
- **둥글고 친근한 형태 언어**: 극대화된 곡률(`border-radius: 24px ~ 28px`)로 아기자기하고 편안한 인상 형성
- **경쾌하고 무섭지 않은 등급 표현**: "조심" 등급마저도 라벤더 퍼플 톤과 위트 있는 문구로 부담 없이 해석

---

## 2. Core Principles (디자인 원칙)

1. **아침의 첫 미소를 선물한다 (Gentle & Cheerful)**
   - 자극적이거나 불길한 경고를 배제하고, 어떤 결과가 나오든 하루를 긍정적으로 시작할 수 있는 색감과 어조를 유지합니다.
2. **누르고 싶은 버튼, 펼쳐지는 기쁨 (Tactile Delight)**
   - 메인 버튼은 적절한 입체감과 그림자를 가져 모바일 환경에서 직관적인 터치 본능을 자극합니다.
3. **콘텐츠는 깔끔한 화이트 카드에 담는다 (Purity on Pastel)**
   - 다채로운 파스텔 배경 위에서 운세 텍스트와 정보가 가장 또렷하게 읽힐 수 있도록, 결과 영역은 순백색(`#FFFFFF`) 카드에 부드러운 그림자를 더해 독립된 레이어로 띄웁니다.
4. **부담 없는 1일 1회성 (No Friction, Pure Simplicity)**
   - 복잡한 로그인이나 입력 절차 없이 '단 한 번의 터치'로 완료되는 직관성과 당일 안정감을 보장합니다.

---

## 3. Colors (색상 시스템)

### Primary & Foreground
- **Primary / Action Text** (`#243B53`): 버튼 텍스트 및 핵심 인터랙션 폰트 컬러. 너무 딱딱한 블랙 대신 깊이 있는 딥 네이비를 사용하여 부드러운 신뢰감 부여
- **Title Foreground** (`#1A2C3F`): 헤더 메인 타이틀에 적용되는 굵고 선명한 다크 블루
- **Body Text** (`#334E68`): 운세 조언 및 세부 콘텐츠를 위한 편안한 가독성 컬러
- **Muted Label** (`#829AB1`): 조언, 아이템 레이블 및 보조 정보용 라이트 슬레이트
- **Caption** (`#9FB3C8`): 하단 하루 유지 안내 문구

### Canvas & Surface
- **Canvas Gradient**:
  - `top`: `#8EC5FC` (맑은 아침 하늘빛)
  - `mid`: `#B8DCFE` (부드러운 스카이 블루)
  - `soft`: `#FBE8F2` (은은한 라벤더 핑크)
  - `bottom`: `#FAD0C4` (따스한 햇살 피치)
- **Surface Card** (`#FFFFFF`): 결과를 감싸는 순백색 모달형 카드
- **Surface Subtle** (`#F8FAFC`): 조언 및 행운 아이템 박스를 감싸는 연한 소프트 그레이/블루

### Semantic Level Colors (운세 등급별 컬러)
| 등급 | 배지 배경 (`bg`) | 배지 텍스트 (`text`) | 글로우 그림자 (`shadow`) | 무드 및 상징 |
| :--- | :--- | :--- | :--- | :--- |
| **대길** | `#FFE3E3` | `#E03131` | `rgba(224, 49, 49, 0.18)` | 특별한 행운과 설렘을 전하는 화사한 코랄 레드 |
| **길** | `#E6FCF5` | `#0CA678` | `rgba(12, 166, 120, 0.18)` | 네잎클로버처럼 싱그럽고 기분 좋은 민트 에메랄드 |
| **보통** | `#E7F5FF` | `#1971C2` | `rgba(25, 113, 194, 0.18)` | 맑은 호수처럼 잔잔하고 평온한 스카이 블루 |
| **조심** | `#F3F0FF` | `#6741D9` | `rgba(103, 65, 217, 0.18)` | 불길하지 않고 귀엽고 재치 있는 라벤더 퍼플 |

---

## 4. Typography (타이포그래피)

### Font Stack
- **Primary**: `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", sans-serif`
- 모바일 OS 고유의 둥글고 정돈된 폰트 렌더링을 살려 깔끔하면서도 친근한 인상을 유지합니다.

### Hierarchy (계층 구조)
| 역할 | Size | Weight | Line Height | 용도 |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 32px | 800 (Bold) | 1.2 | 상단 앱 제목 ("오늘의 운세") |
| **Heading Card** | 19px | 700 (Bold) | 1.55 | 결과 카드의 중심 운세 문구 |
| **Button Label** | 18px | 700 (Bold) | 1.3 | "운세 보기" 메인 액션 버튼 |
| **Badge** | 16px | 800 (ExtraBold) | 1.0 | 운세 등급 뱃지 (자간 1px 강조) |
| **Body Detail** | 14px | 600 (SemiBold) | 1.45 | 오늘의 조언 및 행운의 아이템 내용 |
| **Subtitle** | 14px | 500 (Medium) | 1.4 | 상단 서브 안내 문구 |
| **Label Micro** | 12px | 700 (Bold) | 1.2 | 항목 소제목 ("오늘의 조언", "행운의 아이템") |
| **Caption** | 12px | 400 (Regular) | 1.4 | 하단 유지 안내 텍스트 |

---

## 5. Layout & Spacing (레이아웃 및 간격)

### Spacing System (4px Base Grid)
- `xs`: 4px | `sm`: 8px | `md`: 12px | `base`: 16px | `lg`: 20px | `xl`: 24px | `xxl`: 32px | `section`: 48px

### Frame & Container
- **모바일 뷰포트**: 최대 폭 `420px`의 콤팩트 카드형 프레임
- **데스크톱 환경**: 뷰포트 중앙에 모바일 디바이스 형태(`border-radius: 40px`, 흰색 베젤)로 띄워 일관된 앱 감성 제공
- **패딩**: 상단 `48px`, 좌우 `24px`, 하단 `36px`로 엄지손가락 터치가 편리한 영역 확보

---

## 6. Elevation & Depth (입체감과 깊이)

어두운 배경에서 크기(Scale)로 고저차를 나타내는 넷플릭스와 달리, 파스텔 캔버스에서는 **부드럽게 퍼지는 컬러 섀도우(Colored Soft Shadow)**를 사용합니다.

| 레벨 | 스타일 | 대상 컴포넌트 |
| :--- | :--- | :--- |
| **Level 1 (Button Resting)** | `0 10px 24px rgba(40, 75, 110, 0.15)` | 운세 보기 버튼 기본 상태 |
| **Level 1-Hover** | `0 14px 28px rgba(40, 75, 110, 0.2)` + `translateY(-2px)` | 버튼 마우스 호버 |
| **Level 1-Active** | `0 6px 16px rgba(40, 75, 110, 0.15)` + `scale(0.97)` | 버튼 터치/클릭 인터랙션 |
| **Level 2 (Result Card)** | `0 16px 36px rgba(35, 70, 105, 0.16)` | 부드럽게 떠오르는 화이트 결과 카드 |
| **Level Badge Glow** | `0 4px 12px <각 등급별 shadow>` | 운세 등급 뱃지의 은은한 발광 효과 |

---

## 7. Motion & Easing (모션 및 애니메이션)

| 토큰 | 시간 / 커브 | 적용 요소 및 효과 |
| :--- | :--- | :--- |
| `motion-bounce` | `0.45s / cubic-bezier(0.175, 0.885, 0.32, 1.275)` | 결과 카드 등장 시 통통 튀듯 나타나는 팝인(Pop-In) 효과 |
| `motion-press` | `0.25s / cubic-bezier(0.175, 0.885, 0.32, 1.275)` | 버튼 클릭 시 쫀득하게 눌렸다가 튀어오르는 터치감 |
| `motion-float` | `3.0s / ease-in-out infinite` | 상단 쿠키 아이콘(🥠)이 구름 위를 부유하듯 떠있는 애니메이션 |

---

## 8. Components (컴포넌트 명세)

### 1) Button: 메인 운세 보기 버튼 (`button-fortune`)
- **기본 상태**: 화이트 계열 볼록한 그라데이션, `border-radius: 24px`, 높이감 있는 소프트 그림자
- **터치/클릭 상태**: `scale(0.97)` 축소 및 쫀득한 촉감 제공
- **완료 상태**: `오늘의 운세 확인 완료 ✨` 텍스트로 전환되며 은은한 반투명 톤으로 정돈

### 2) Card: 운세 결과 카드 (`card-result`)
- **배경**: 순백색(`#FFFFFF`), 모서리 곡률 `28px`
- **구조**:
  1. 상단: 등급 뱃지 (필 형태 9999px)
  2. 중앙: 큰 따옴표로 감싼 메인 운세 문구
  3. 구분선: 연한 실선 (`#F0F4F8`)
  4. 하단: 오늘의 조언 및 행운의 아이템 컨테이너 2열

### 3) Badge: 운세 등급 뱃지 (`badge-level`)
- 대길, 길, 보통, 조심 각 등급의 고유 컬러와 부드러운 그림자가 조합된 둥근 캡슐형 뱃지

### 4) Info Box: 조언 및 행운 아이템 박스 (`item-detail`)
- 라운드 코너 `18px`, 연한 서브 배경색(`#F8FAFC`)으로 본문과 명확하게 구분

---

## 9. Voice & Tone (보이스 앤 톤)

| 상황 | 지향하는 톤 | 예시 문구 |
| :--- | :--- | :--- |
| **첫 방문** | 호기심을 부르고 친절한 어조 | "오늘 나에게 찾아올 행운을 열어보세요" |
| **운세 문구** | 긍정적이고 재치 있는 한마디 | "뜻밖의 소식과 함께 기분 좋은 보너스가 찾아올 예감입니다." |
| **조심 운세** | 겁주지 않고 미소 짓게 만드는 유머 | "맛있는 음식 앞에서 이성을 잃고 단추가 비명을 지를 수 있습니다." |
| **당일 유지 안내** | 명확하고 안심을 주는 안내 | "※ 오늘 하루 동안 동일한 운세가 유지됩니다." |

---

## 10. Do's and Don'ts

### Do
- 둥글고 부드러운 곡선(`rounded: 18px ~ 28px`)을 일관되게 유지한다.
- 텍스트는 순백색 카드 안에서 충분한 대비(Contrast)를 확보하여 눈이 편안하게 한다.
- 버튼 터치 시 쫀득한 물리적 피드백(Scale 애니메이션)을 전달한다.
- "조심" 등급도 따뜻하고 재미있는 표현을 사용한다.

### Don't
- 어둡거나 칙칙한 검정 캔버스를 사용하지 않는다. (넷플릭스의 다크 테마와 대비되는 파스텔 지향)
- 직각 모서리나 뾰족한 선(sharp borders)을 사용하지 않는다.
- 운세 문구에 불안감이나 공포를 주는 표현을 사용하지 않는다.
- 불필요한 입력 폼이나 팝업창으로 사용자 경험을 끊지 않는다.
