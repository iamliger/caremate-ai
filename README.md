
---

# 📑 CareMate AI [Node.js Edition]
> **지능형 개인 건강 코치 및 응급 골든타임 관리 시스템**
> 
> "실수는 짧게, 관리는 길게. 당신의 곁에서 엘리스가 함께합니다."

[![Node.js Version](https://img.shields.io/badge/node-18.x+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-MariaDB/MySQL-003545?style=flat-square&logo=mariadb)](https://xampp.org)
[![AI-Hybrid](https://img.shields.io/badge/AI-Gemini%20%2B%20Ollama-blueviolet?style=flat-square)](https://deepmind.google/technologies/gemini/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/)

---

## 🚀 1. 서비스 개요 (Context)
CareMate AI는 단순한 건강 기록 앱을 넘어, 사용자의 **건강상 실수(흡연, 과식 등)**를 AI가 즉시 분석하여 복구 전략을 제시하고, **응급 상황(Golden Time)** 발생 시 생존에 필요한 핵심 정보를 즉각 제공하는 통합 헬스케어 솔루션입니다.

---

## 🌟 2. 핵심 서비스 시나리오
1.  **🤖 하이브리드 AI 상담 (Fail-safe 구조)**
    *   **Cloud:** Google Gemini 1.5 Flash를 통한 고지능 분석.
    *   **Local:** 서버 혼잡(503/429) 시 내 PC의 **Ollama(Llama3/Gemma2)**가 즉시 백업 답변을 제공하여 무중단 서비스 구현.
2.  **🚭 실시간 금연/금주 트래커**
    *   원터치 '실수 기록' 버튼으로 즉시 카운팅.
    *   최근 7일간의 추이 그래프(Chart.js)를 통한 시각적 동기부여.
3.  **🚨 골든타임 응급 카드 (Emergency Info)**
    *   혈액형, 기저질환, 긴급연락처를 대시보드 최상단에 배치.
    *   SOS 버튼 시뮬레이션 및 만 나이 자동 계산 기능.
4.  **📊 정밀 마이케어 (Daily Log)**
    *   신체 지표(체중, 혈압, 수분, 수면, 스트레스) 및 식단(아침/점심/저녁) 기록.
    *   완벽한 CRUD 지원 및 데이터 시각화.
5.  **🔔 스마트 복약 알람**
    *   캐릭터 '엘리스'가 약 먹을 시간을 **TTS(음성)**와 커스텀 모달로 안내.
6.  **🛡️ 건강 지키미 (Consistency)**
    *   최근 7일 기록 성실도를 %로 환산하여 건강 등급 부여.
    *   누락된 날짜 자동 감지 및 푸시 알림.

---

## 🛠️ 3. 기술 스택 (Tech Stack)
### Backend & Security
- **Runtime:** Node.js (Express)
- **Session:** `express-session` (One-Session-Policy 적용으로 중복 로그인 방지)
- **Security:** `Sharp` 라이브러리를 이용한 이미지 픽셀 재구성 보안 처리
- **Database:** MySQL (MariaDB / XAMPP 환경)

### Frontend
- **Engine:** EJS Template
- **UI Framework:** Bootstrap 5 (Customized)
- **Chart:** Chart.js (건강 통계 시각화)
- **Typography:** Pretendard Font (자간 -0.02em 적용)

### AI Hybrid Engine
- **Online:** Google Gemini 1.5 Flash API
- **Offline/Local:** Ollama API (Llama3, Gemma2)

---

## 🎨 4. UI/UX 디자인 원칙
- **Soft-UI Concept:** 그림자 효과가 가미된 화이트 카드로 피로도 최소화.
- **Color Identity:**
  - `Hero:` Indigo-Blue (#4361ee ~ #3a0ca3)
  - `Emergency:` Red Gradient (#ff4d4d ~ #cc0000)
- **No Browser Alert:** 브라우저의 투박한 기본 경고창을 금지하고, CareMate 전용 **커스텀 모달**과 **플로팅 엘리스** 캐릭터 활용.

---

## 🗄️ 5. 데이터베이스 구조 (Main Tables)
- `users`: 유저 프로필, 신체 정보 및 응급 카드 데이터.
- `daily_logs`: 체중, 혈압, 식단 등 일일 건강 기록.
- `smoking_logs`: 금연/금주 실패 시점 및 누적 데이터.
- `behavior_logs`: AI 상담 내역 및 맞춤 조언 저장.
- `medications`: 복약 스케줄 및 활성화 상태.

---

## ⚙️ 6. 설치 및 실행 방법 (Setup)

### Prerequisites
- Node.js 설치
- XAMPP(MySQL) 실행 및 데이터베이스(`caremate_db`) 생성
- Ollama 설치 및 모델 실행 (`ollama run llama3`)

### Installation
```bash
# 1. 저장소 클론
git clone https://github.com/iamliger/caremate-ai.git

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (.env 파일 생성)
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=caremate_db
GEMINI_API_KEY=your_api_key_here
OLLAMA_URL=http://localhost:11434/api/generate

# 4. 서버 실행
npm start
```

---

## 👤 7. 개발자 정보
- **Email:** [iamliger@nate.com](mailto:iamliger@nate.com)
- **GitHub:** [iamliger](https://github.com/iamliger)
- **AI Persona:** Elice (Intelligent Health Assistant)

---

"이 프로젝트는 사용자의 가장 취약한 순간을 가장 스마트하게 관리하는 것을 목표로 합니다."

---

### 📝 수정 및 업데이트 내역
- **2024-05-20:** 하이브리드 AI(Gemini + Ollama) 연동 모듈 설계 완료.
- **2024-05-21:** Node.js Express 기반의 프로젝트 기초 구조 수립.