# AI Teacher PoC — Phase3 프론트엔드 SRS

## 1. 프로젝트 개요

### 1.1 목적
디지털 교과서 AI 플랫폼에서 교사의 수업 전체 사이클(리포트 → 교안 → 출제 → 채점)을 AI가 지원하는 것을 증명하는 PoC 데모 애플리케이션.

### 1.2 핵심 메시지
> "AI Tutor가 쌓은 학생 데이터를 교사가 바로 활용한다. 리포트, 교안, 시험, 채점까지 — 교사의 전체 업무 사이클을 AI가 지원한다."

### 1.3 PoC 범위
- **대상 과목:** 고등학교 1학년 수학
- **대상 단원:** 방정식·함수 (이차방정식, 이차함수, 이차부등식, 연립방정식, 일차함수)
- **문제은행:** 30문제 (pgvector 55청크 저장 완료)
- **데모 학생:** 4명 (성적 분포별 페르소나, Mem0 사전 데이터 축적 완료)
- **데모 교사:** 1명 (김수학 선생님)
- **핵심 기능:** 학생 리포트, 시험 출제, 교안 생성, 자동 채점

### 1.4 학생용 AI Tutor와의 관계
```
┌──────────────────────────────────────────────┐
│          디지털 교과서 AI 플랫폼               │
│                                               │
│   학생용 AI Tutor        교사용 AI Teacher     │
│   (ai-tutor-poc)        (day47-ai-teacher)    │
│   ┌────────────┐        ┌────────────┐       │
│   │ 맞춤 풀이    │        │ 학생 리포트  │       │
│   │ 개념 설명    │        │ 시험 출제    │       │
│   │ 연습문제     │   ←→   │ 교안 생성    │       │
│   │ 약점 확인    │        │ 자동 채점    │       │
│   └────────────┘        └────────────┘       │
│          ↕          공유 데이터          ↕     │
│   ┌──────────────────────────────────────┐   │
│   │  Mem0 · pgvector · Supabase · n8n    │   │
│   └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

- **별도 프로젝트로 분리** (독립 배포)
- **Supabase, Mem0, pgvector, n8n 인프라 공유**
- AI Tutor가 쌓은 Mem0 데이터를 AI Teacher가 읽기
- AI Teacher 채점 결과가 Mem0에 축적 → AI Tutor 개인화 강화

### 1.5 프로덕션 비전 (PoC에서는 구현하지 않음)
- 반 단위 학생 관리 대시보드 (학급별 성적 분포, 약점 히트맵)
- NEIS 연동 (출석, 성적, 생활기록부 자동 연계)
- 에듀파인 연계 (행정업무 AI 작성)
- Multi-agent 오케스트레이션 (라우터 Agent → 기능별 Sub-Agent)
- 학부모 리포트 자동 발송
- AI 주도 수업 추천 (약점 기반 다음 차시 자동 제안)

---

## 2. 시스템 아키텍처

### 2.1 전체 구성

```
┌─────────────────────────────────────────────────────────┐
│  프론트엔드 (Vercel)                                      │
│  Next.js + TypeScript + Supabase Auth + shadcn/ui        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  /(랜딩+로그인)  /report  /exam  /lesson  /grading        │
│                                                           │
└───────┬──────────┬────────┬────────┬────────┬────────────┘
        │          │        │        │        │
        │ Auth     │ POST   │ POST   │ POST   │ POST
        │          │        │        │        │
┌───────▼──────────▼────────▼────────▼────────▼────────────┐
│  백엔드 (이미 완성)                                        │
│                                                           │
│  n8n Workflows × 4                                       │
│  ┌─────────────────────────────────────────────────┐     │
│  │ AI Teacher Phase3 - 학생 리포트                    │     │
│  │ Webhook → Get Data → Mem0 GET → Chat History     │     │
│  │ → Student Profile → Code → LLM → Respond        │     │
│  │ → DB INSERT                                      │     │
│  ├─────────────────────────────────────────────────┤     │
│  │ AI Teacher Phase3 - 시험 출제                      │     │
│  │ Webhook → Get Data → Mem0 GET → Vector Search    │     │
│  │ → Code → LLM → Respond → DB INSERT              │     │
│  ├─────────────────────────────────────────────────┤     │
│  │ AI Teacher Phase3 - 교안 생성                      │     │
│  │ Webhook → Get Data → Split → Mem0 GET (4명)      │     │
│  │ → Vector Search → Code → LLM → Respond          │     │
│  │ → DB INSERT                                      │     │
│  ├─────────────────────────────────────────────────┤     │
│  │ AI Teacher Phase3 - 자동 채점                      │     │
│  │ Webhook → Get Data → Mem0 GET → Code → LLM      │     │
│  │ → Respond → DB INSERT                            │     │
│  │          → Memory Summary → Evaluate → Mem0 Add  │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  Supabase PostgreSQL                                     │
│  ├── teacher_profiles (교사 프로필)                        │
│  ├── student_profiles (학생 프로필)                        │
│  ├── teacher_reports (리포트 저장)                         │
│  ├── teacher_exams (시험 저장)                             │
│  ├── teacher_lesson_plans (교안 저장)                      │
│  ├── teacher_gradings (채점 저장)                          │
│  ├── n8n_chat_histories (학생 대화 이력)                   │
│  └── documents (pgvector 문제은행)                         │
│                                                           │
│  Mem0: 학생별 학습 프로필 (약점/강점/패턴)                   │
│  Wolfram Alpha: 수학 검증 (출제/채점 시)                    │
│  OpenAI gpt-4o: LLM 엔진                                 │
└───────────────────────────────────────────────────────────┘
```

### 2.2 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 프론트엔드 | Next.js 15 + TypeScript | 앱 프레임워크 |
| UI 라이브러리 | shadcn/ui + Tailwind CSS | 컴포넌트 + 스타일링 |
| 수식 렌더링 | KaTeX + react-markdown | LaTeX 수식 + 마크다운 |
| 인증 | Supabase Auth | 이메일/비밀번호 로그인 |
| 배포 | Vercel | 호스팅 + CI/CD |
| 백엔드 API | n8n webhook × 4 | 교사 기능별 워크플로우 |
| 관계 DB | Supabase PostgreSQL | 교사 산출물 저장 + 학생/교사 프로필 |
| 벡터 DB | Supabase pgvector | 문제은행 (시험 출제용) |
| 개인화 엔진 | Mem0 | 학생별 학습 프로필 (읽기 + 채점 시 쓰기) |
| 계산 검증 | Wolfram Alpha | 출제 문제 정답 검증 |
| LLM | OpenAI gpt-4o | 리포트/출제/교안/채점 생성 |

---

## 3. 데모 사용자

### 3.1 교사 프로필

| 항목 | 값 |
|------|-----|
| 이름 | 김수학 |
| 이메일 | teacher-kim@demo.com |
| 비밀번호 | demo1234 |
| 과목 | 수학 |
| uid | (Supabase에서 확인) |

### 3.2 학생 프로필 (교사가 관리하는 대상)

| 항목 | 김상위 | 이중위 | 박하위 | 최기초 |
|------|--------|--------|--------|--------|
| 수준 | 상위권 (90+) | 중위권 (60~80) | 하위권 (40~60) | 기초부족 (~40) |
| uid | 3a0d951f-... | f273885e-... | 066a45cd-... | a1fac652-... |
| 아바타 | 🏆 | 📚 | ✏️ | 🌱 |
| 강점 | 인수분해 능숙, 공식 암기 완벽 | 근의 공식 사용 가능 | 의지 있음 | - |
| 약점 | 검산 안 함, 응용문제 전략 부족 | 판별식 부호 실수 반복 | 이차/일차 혼동, 부호 취약 | 분배법칙 실수, 분수 어려움 |

### 3.3 Mem0 데이터 (이미 축적 완료)
- AI Tutor Phase3에서 4명 사전 입력 완료
- AI Tutor와 대화하면서 추가 축적됨
- AI Teacher 자동 채점 결과도 Mem0에 축적됨

---

## 4. 페이지 상세 설계

### 4.1 랜딩 페이지 (/)

**목적:** 시스템 설명 + 데모 체험 안내 + 교사 로그인

**섹션 구성 (스크롤 순서):**

#### 섹션 1: 히어로
- 타이틀: "AI 교무실 — 교사의 전체 업무를 AI가 지원합니다"
- 서브타이틀: "학생 리포트, 시험 출제, 교안 생성, 자동 채점. AI Tutor가 쌓은 데이터를 교사가 바로 활용합니다."
- CTA: [교사 로그인] 버튼

#### 섹션 2: 4대 기능 카드
4개 기능을 카드 형태로 소개:

| 카드 | 아이콘 | 제목 | 설명 | 시간 절감 |
|------|--------|------|------|-----------|
| 1 | 📊 | 학생 리포트 | 강점/약점/성장추세 자동 분석 | 30분 → 즉시 |
| 2 | 📝 | 시험 출제 | 단원+난이도 입력 → 시험지+정답지+채점기준 | 3~4시간 → 10분 |
| 3 | 📖 | 교안 생성 | 반 약점 반영 50분 수업 교안 자동 생성 | 1~2시간 → 5분 |
| 4 | ✅ | 자동 채점 | 채점+오답분석+피드백+Mem0 축적 | 반나절 → 즉시 |

#### 섹션 3: 데이터 순환 다이어그램
```
학생 AI Tutor 대화 → Mem0 약점 축적
  → 교사 리포트 조회 → 약점 반영 시험 출제
  → 학생 시험 응시 → 자동 채점 + 오답 분석
  → Mem0에 새 약점 축적 → AI Tutor 개인화 강화
  → (반복)
```

#### 섹션 4: 데모 로그인
- 교사 계정 1개 카드 표시
- [김수학 선생님으로 로그인] 버튼
- 클릭 시 teacher-kim@demo.com / demo1234로 Supabase Auth 로그인
- 로그인 성공 → /report로 리다이렉트

#### 섹션 5: 추천 데모 시나리오
- 시나리오 1: "이중위 학생 리포트를 뽑아보세요. Mem0 약점이 반영됩니다."
- 시나리오 2: "이차방정식 시험 5문제를 출제해보세요. 이중위 약점이 반영됩니다."
- 시나리오 3: "판별식 수업 교안을 만들어보세요. 4명 전원 약점이 분석됩니다."
- 시나리오 4: "학생 답안을 채점해보세요. 오답이 Mem0에 축적됩니다."
- 시나리오 5: "채점 후 다시 리포트를 뽑아보세요. 채점 결과가 반영됩니다."

#### 섹션 6: 기술 아키텍처 (간략)
- 핵심 기술 4가지 설명 카드:
  - Mem0: "학생의 강약점과 학습 패턴을 기억합니다"
  - pgvector: "검증된 문제은행에서 시험 문제를 선택합니다"
  - Wolfram: "출제 문제의 정답을 수학적으로 검증합니다"
  - RDB: "리포트, 시험, 교안, 채점 결과를 모두 저장합니다"

#### 섹션 7: 프로덕션 비전 (간단히)
- PoC → 프로덕션 로드맵 한 줄 설명
- "NEIS 연동, 학급 대시보드, 학부모 리포트, Multi-Agent..."

#### 섹션 8: 다운로드 링크
- AI_Tutor_PoC_기술소개서.md
- AI_Tutor_PoC_데모가이드.md
- AI_Teacher_Phase3_Frontend_Setup.md

---

### 4.2 학생 리포트 페이지 (/report)

**접근 제어:** Supabase Auth 세션 필수 + teacher_profiles에 uid 존재 확인. 미인증 시 / 리다이렉트.

**레이아웃: 사이드바 + 메인**

#### 사이드바 (공통, 모든 페이지)
- 교사 이름 + 과목 표시
- 네비게이션 메뉴:
  - 📊 학생 리포트 (활성)
  - 📝 시험 출제
  - 📖 교안 생성
  - ✅ 자동 채점
- 하단: [로그아웃] 버튼

#### 메인 영역 — 입력 폼

**학생 선택:**
- 드롭다운: student_profiles에서 4명 로드
- 각 항목: "🏆 김상위 (상위, 90+)" 형태로 표시
- 선택 시 해당 학생 uid 세팅

**실행 버튼:**
- [리포트 생성] 버튼
- 클릭 시 n8n webhook 호출
- 로딩 상태: "AI가 학생 데이터를 분석 중..." 스피너

#### 메인 영역 — 결과 표시

**리포트 렌더링:**
- 마크다운으로 렌더링 (react-markdown)
- 수식 포함 시 KaTeX 렌더링
- 섹션별 자동 구분:
  1. 학생 개요
  2. 강점
  3. 약점
  4. 최근 학습 활동 요약
  5. 성장 추세
  6. 권고사항
  7. 학부모 상담용 한줄 코멘트

**하단 액션:**
- [다시 생성] 버튼 (같은 학생 재실행)
- [다른 학생] 버튼 (폼으로 복귀)

**이전 리포트 이력:**
- teacher_reports 테이블에서 해당 학생의 과거 리포트 목록 표시
- 날짜 + 요약 1줄
- 클릭 시 과거 리포트 전문 표시

---

### 4.3 시험 출제 페이지 (/exam)

**레이아웃: 사이드바 + 메인**

#### 메인 영역 — 입력 폼

| 필드 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| 단원 | 텍스트 입력 | "이차방정식", "이차함수 판별식" 등 | 이차방정식 |
| 문제 수 | 숫자 선택 | 3, 5, 10, 15, 20 | 5 |
| 난이도 | 드롭다운 | 하, 중, 상, 혼합 | 중 |
| 학생 약점 반영 | 학생 선택 (선택사항) | student_profiles 드롭다운 | 없음 |

**실행 버튼:**
- [시험 출제] 버튼
- 로딩 상태: "AI가 문제를 출제 중..." 스피너

#### 메인 영역 — 결과 표시

**탭 3개:**

| 탭 | 내용 |
|----|------|
| 시험지 | 문제만 (정답 없이), 수식 KaTeX 렌더링 |
| 정답지 | 문제별 정답 + 간단 풀이 |
| 채점 기준 | 문제별 배점 + 부분점수 기준 |

**하단 액션:**
- [다시 출제] 버튼
- [조건 변경] 버튼 (폼으로 복귀)

**이전 출제 이력:**
- teacher_exams 테이블에서 과거 시험 목록
- 날짜 + 단원 + 난이도
- 클릭 시 과거 시험 전문 표시

---

### 4.4 교안 생성 페이지 (/lesson)

**레이아웃: 사이드바 + 메인**

#### 메인 영역 — 입력 폼

| 필드 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| 단원 | 텍스트 입력 | "이차방정식 판별식" 등 | 이차방정식 판별식 |
| 수업 시간 | 숫자 선택 | 30, 40, 45, 50분 | 50 |
| 반 학생 | 체크박스 (다중 선택) | student_profiles 전원 표시 | 전원 선택 |

**실행 버튼:**
- [교안 생성] 버튼
- 로딩 상태: "AI가 반 학생 데이터를 분석 중..." 스피너

#### 메인 영역 — 결과 표시

**교안 렌더링 (마크다운):**
- 반 약점 분석 (공통 약점 + 개별 주의 학생)
- 수업 개요 (단원명, 학습 목표, 준비물)
- 도입 (약 5분) — 전시 학습 복습 + 동기유발
- 전개 (약 30분) — 핵심 개념 + 예제 풀이 + 약점 보강
- 활동 (약 10분) — 수준별 문제 (상/중/하)
- 정리 (약 5분) — 요약 + 과제 + 다음 수업 예고

**하단 액션:**
- [다시 생성] 버튼
- [조건 변경] 버튼

**이전 교안 이력:**
- teacher_lesson_plans 테이블에서 과거 교안 목록
- 날짜 + 단원 + 수업시간

---

### 4.5 자동 채점 페이지 (/grading)

**레이아웃: 사이드바 + 메인**

#### 메인 영역 — 입력 폼

**학생 선택:**
- 드롭다운: student_profiles에서 선택

**문제 입력 (동적 폼):**
- [+ 문제 추가] 버튼으로 문제 행 추가 (최소 1개, 최대 10개)
- 각 문제 행:

| 필드 | 타입 | 설명 |
|------|------|------|
| 문제 ID | 텍스트 | QE-003 등 (선택사항) |
| 문제 | 텍스트 | "2x²+5x-3=0의 두 근을 구하시오" |
| 정답 | 텍스트 | "x=1/2 또는 x=-3" |
| 학생 답안 | 텍스트 | "x=1/2 또는 x=3" |

- 각 행에 [삭제] 버튼

**실행 버튼:**
- [채점 실행] 버튼
- 로딩 상태: "AI가 채점 중..." 스피너

#### 메인 영역 — 결과 표시

**채점 결과 테이블:**

| 문제 | 정답 | 학생답 | 점수 | 판정 |
|------|------|--------|------|------|

**오답 분석:**
- 문제별 오류 유형 (계산 실수 / 개념 미이해 / 풀이 전략 오류)
- 구체적 설명

**기존 약점 연관 분석:**
- Mem0 약점과 이번 오답의 연관성

**학생 피드백:**
- 격려 + 개선 포인트

**Mem0 업데이트 상태:**
- "새로운 약점 패턴이 Mem0에 저장되었습니다" 표시
- 또는 "저장할 새 패턴이 없습니다" 표시

**하단 액션:**
- [다시 채점] 버튼
- [다른 학생] 버튼

**이전 채점 이력:**
- teacher_gradings 테이블에서 해당 학생 과거 채점 목록
- 날짜 + 총점

---

## 5. 데이터 모델

### 5.1 기존 테이블 (AI Tutor에서 생성, 공유)

```sql
-- pgvector 문제은행 (55청크)
documents (id, content, embedding, metadata)

-- 학생 대화 이력
n8n_chat_histories (id, session_id, message)

-- 학생 프로필
student_profiles (user_id, display_name, level, score_range, avatar_emoji, created_at)
```

### 5.2 교사용 테이블 (이미 생성 완료)

```sql
-- 교사 프로필
CREATE TABLE teacher_profiles (
  user_id text PRIMARY KEY,
  display_name text NOT NULL,
  subject text DEFAULT '수학',
  role text DEFAULT 'teacher',
  created_at timestamp DEFAULT now()
);

-- 학생 리포트
CREATE TABLE teacher_reports (
  id serial PRIMARY KEY,
  teacher_id text NOT NULL,
  student_id text NOT NULL,
  report_content text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- 시험 출제
CREATE TABLE teacher_exams (
  id serial PRIMARY KEY,
  teacher_id text NOT NULL,
  topic text,
  difficulty text,
  exam_content text NOT NULL,
  student_id text,
  created_at timestamp DEFAULT now()
);

-- 교안
CREATE TABLE teacher_lesson_plans (
  id serial PRIMARY KEY,
  teacher_id text NOT NULL,
  topic text,
  duration integer,
  plan_content text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- 채점 결과
CREATE TABLE teacher_gradings (
  id serial PRIMARY KEY,
  teacher_id text NOT NULL,
  student_id text NOT NULL,
  problems jsonb NOT NULL,
  grading_result text NOT NULL,
  total_score integer,
  created_at timestamp DEFAULT now()
);
```

### 5.3 Mem0 데이터 (외부 시스템)
- 학생별 학습 프로필 저장 (약점/강점/패턴)
- 리포트/교안/출제: 읽기만 (Mem0 GET)
- 자동 채점: 읽기 + 쓰기 (Mem0 GET + Mem0 Add)

---

## 6. API 설계

### 6.1 학생 리포트 — n8n Webhook

```
POST /webhook/{report-id}
Content-Type: application/json

Request:
{
  "teacher_id": "supabase_auth_uid",
  "student_id": "student_uid"
}

Response:
[{
  "output": "### 학생 리포트\n\n1) **학생 개요**:..."
}]
```

**n8n 내부 처리:**
1. Get Data: teacher_reports에서 해당 학생 이전 리포트 3건 조회
2. Mem0 GET: 학생 전체 메모리 조회
3. Chat History: n8n_chat_histories에서 최근 대화 20건 조회
4. Student Profile: student_profiles에서 학생 기본 정보 조회
5. Code (Merge Data): 4개 데이터 통합
6. LLM (gpt-4o): 리포트 생성 (이전 리포트 참조, 성장 추세 비교)
7. Respond to Webhook
8. DB INSERT: teacher_reports에 저장

### 6.2 시험 출제 — n8n Webhook

```
POST /webhook/{exam-id}
Content-Type: application/json

Request:
{
  "teacher_id": "supabase_auth_uid",
  "topic": "이차방정식",
  "count": 5,
  "difficulty": "중",
  "student_id": "student_uid"  // 선택사항
}

Response:
[{
  "output": "## 시험지\n\n### 문제 1\n..."
}]
```

**n8n 내부 처리:**
1. Get Data: teacher_exams에서 이전 출제 3건 조회
2. Mem0 GET: 학생 약점 조회 (student_id 있을 때)
3. Vector Search: pgvector 문제은행에서 관련 문제 10건 검색
4. Code (Merge Data): 통합
5. LLM: 시험 출제 (이전 문제 중복 방지, 약점 반영)
6. Respond → DB INSERT

### 6.3 교안 생성 — n8n Webhook

```
POST /webhook/{lesson-id}
Content-Type: application/json

Request:
{
  "teacher_id": "supabase_auth_uid",
  "topic": "이차방정식 판별식",
  "duration": 50,
  "student_ids": ["uid1", "uid2", "uid3", "uid4"]
}

Response:
[{
  "output": "## 반 약점 분석\n- **공통 약점 (4명)**..."
}]
```

**n8n 내부 처리:**
1. Get Data: teacher_lesson_plans에서 이전 교안 3건 조회
2. Split Students: student_ids 배열 → 개별 아이템 분리
3. Mem0 GET × N명: 각 학생 메모리 조회 (자동 반복 실행)
4. Vector Search: 문제은행에서 관련 문제 검색
5. Code (Merge Data): N명 Mem0 + 문제 + 이전 교안 통합
6. LLM: 교안 생성 (반 전체 약점 분석, 수준별 활동 분리, 이전 수업과 연속성)
7. Respond → DB INSERT

### 6.4 자동 채점 — n8n Webhook

```
POST /webhook/{grading-id}
Content-Type: application/json

Request:
{
  "teacher_id": "supabase_auth_uid",
  "student_id": "student_uid",
  "problems": [
    {
      "id": "QE-003",
      "question": "2x²+5x-3=0의 두 근을 구하시오",
      "correct_answer": "x=1/2 또는 x=-3",
      "student_answer": "x=1/2 또는 x=3"
    }
  ]
}

Response:
[{
  "output": "### 채점 결과\n| 문제 | 정답 | 학생답 | 점수 | 판정 |..."
}]
```

**n8n 내부 처리:**
1. Get Data: teacher_gradings에서 이전 채점 3건 조회
2. Mem0 GET: 학생 기존 약점 조회
3. Code (Merge Data): 통합
4. LLM: 채점 + 오답 분석 + 기존 약점 연관 분석
5. Respond to Webhook
6. DB INSERT: teacher_gradings에 저장 (병렬)
7. Memory Summary → Evaluate → Mem0 Add (비동기, 오답 패턴 장기 기억 축적)

### 6.5 프론트엔드 → Supabase 직접 조회

**teacher_profiles 조회:**
```
supabase
  .from('teacher_profiles')
  .select('*')
  .eq('user_id', uid)
  .single()
```

**student_profiles 전체 조회 (학생 선택 드롭다운용):**
```
supabase
  .from('student_profiles')
  .select('*')
  .order('level')
```

**이전 리포트 이력:**
```
supabase
  .from('teacher_reports')
  .select('id, student_id, report_content, created_at')
  .eq('teacher_id', uid)
  .order('created_at', { ascending: false })
  .limit(10)
```

**이전 시험 이력:**
```
supabase
  .from('teacher_exams')
  .select('id, topic, difficulty, exam_content, created_at')
  .eq('teacher_id', uid)
  .order('created_at', { ascending: false })
  .limit(10)
```

**이전 교안 이력:**
```
supabase
  .from('teacher_lesson_plans')
  .select('id, topic, duration, plan_content, created_at')
  .eq('teacher_id', uid)
  .order('created_at', { ascending: false })
  .limit(10)
```

**이전 채점 이력:**
```
supabase
  .from('teacher_gradings')
  .select('id, student_id, grading_result, created_at')
  .eq('teacher_id', uid)
  .order('created_at', { ascending: false })
  .limit(10)
```

---

## 7. 사용자 시나리오

### 7.1 시나리오 S1: 학생 리포트 생성

```
전제: 김수학 교사로 로그인

1. /report 페이지 진입
2. 학생 드롭다운에서 "📚 이중위 (중위, 60~80)" 선택
3. [리포트 생성] 클릭
4. "AI가 학생 데이터를 분석 중..." 로딩 (약 10초)
5. 리포트 표시:
   - 학생 개요 (이중위, 중위, 60~80)
   - 강점: 근의 공식 활용
   - 약점: -4ac 부호 실수, 검산 생략
   - 최근 활동: x²+3x-10=0 근의 공식+인수분해 풀이
   - 성장 추세: "이전 리포트 대비 부호 실수 감소"
   - 권고사항: 부호 변환 연습 + 검산 습관화
   - 학부모 코멘트: 한줄 요약
6. 이전 리포트 이력에 새 리포트 추가됨
```

### 7.2 시나리오 S2: 시험 출제

```
전제: 김수학 교사로 로그인

1. /exam 페이지 진입
2. 단원: "이차방정식", 문제 수: 5, 난이도: 중
3. 학생 약점 반영: "📚 이중위" 선택
4. [시험 출제] 클릭 (약 10초)
5. 결과 탭:
   - 시험지 탭: 문제 5개 (수식 KaTeX 렌더링)
   - 정답지 탭: 문제별 정답 + 풀이
   - 채점 기준 탭: 배점 + 부분점수
6. 이중위 약점 반영 확인: 부호 처리 문제 포함
7. 이전 출제와 중복 없음 확인
```

### 7.3 시나리오 S3: 교안 생성

```
전제: 김수학 교사로 로그인

1. /lesson 페이지 진입
2. 단원: "이차방정식 판별식", 수업 시간: 50분
3. 학생: 4명 전원 체크
4. [교안 생성] 클릭 (약 15초)
5. 결과:
   - 반 약점 분석: "공통 약점: 부호 처리 실수 (4명)"
   - 도입 (5분) → 전개 (30분) → 활동 (10분) → 정리 (5분)
   - 수준별 활동: 상위/중위/하위 문제 각 1개
   - 문제은행에서 예제 선택 (QE-003, QF-007 등)
6. 이전 교안과 수업 연속성 확인
```

### 7.4 시나리오 S4: 자동 채점

```
전제: 김수학 교사로 로그인

1. /grading 페이지 진입
2. 학생: "📚 이중위" 선택
3. 문제 입력:
   - 문제 1: "2x²+5x-3=0", 정답: "x=1/2, x=-3", 학생답: "x=1/2, x=3"
   - 문제 2: "x²-2x-8=0", 정답: "x=4, x=-2", 학생답: "x=4, x=-2"
4. [채점 실행] 클릭 (약 10초)
5. 결과:
   - 채점 테이블: 문제1 오답(5점), 문제2 정답(10점)
   - 오답 분석: "부호 처리 실수 (계산 실수)"
   - 기존 약점 연관: "Mem0 약점과 일치 (부호 오류 패턴)"
   - 학생 피드백: 격려 + 개선점
   - Mem0 업데이트: "새 패턴 저장됨" 표시
```

### 7.5 시나리오 S5: 데이터 순환 확인 (킬링샷)

```
1. 이중위에 대해 자동 채점 실행 (부호 실수 오답)
2. Mem0에 새 오답 패턴 축적됨
3. 즉시 이중위 리포트 다시 생성
4. 리포트에 "최근 시험에서도 부호 실수 확인됨" 반영 확인
5. 교안 생성 시 "부호 처리 보강 포인트" 자동 포함 확인

핵심: 채점 → Mem0 축적 → 리포트/교안에 즉시 반영
```

### 7.6 시나리오 S6: 이력 조회

```
1. /report 페이지에서 과거 리포트 목록 확인
2. 과거 리포트 클릭 → 전문 표시
3. 최신 리포트와 비교하여 성장 추세 확인
4. /exam, /lesson, /grading도 동일하게 이력 조회
```

---

## 8. UI 컴포넌트 명세

### 8.1 공통 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<TeacherNav>` | 사이드바 네비게이션 (4개 메뉴 + 로그아웃) |
| `<StudentSelector>` | 학생 선택 드롭다운 (단일 선택) |
| `<StudentCheckbox>` | 학생 선택 체크박스 (다중 선택, 교안용) |
| `<MarkdownRenderer>` | 마크다운 + KaTeX 수식 렌더링 |
| `<LoadingSpinner>` | "AI가 처리 중..." 로딩 표시 |
| `<HistoryList>` | 이전 산출물 목록 (날짜 + 제목) |
| `<ResultCard>` | 결과 표시 카드 (마크다운 렌더링) |

### 8.2 페이지별 컴포넌트

| 페이지 | 폼 컴포넌트 | 결과 컴포넌트 |
|--------|-------------|---------------|
| /report | `<ReportForm>` | `<ReportResult>` |
| /exam | `<ExamForm>` | `<ExamResult>` (탭 3개) |
| /lesson | `<LessonForm>` | `<LessonResult>` |
| /grading | `<GradingForm>` (동적 문제 입력) | `<GradingResult>` |

### 8.3 마크다운 + KaTeX 렌더링 규칙

n8n 응답에 포함되는 패턴:
- 인라인 수식: `\\( ... \\)` 또는 `$...$` → KaTeX inline
- 블록 수식: `\\[ ... \\]` 또는 `$$...$$` → KaTeX display
- 마크다운: `### 제목`, `**볼드**`, `| 테이블 |` → react-markdown
- 이스케이프: `\\\\` → `\\` 변환 후 렌더링

### 8.4 반응형

| 화면 | 레이아웃 |
|------|----------|
| 데스크톱 (1024px+) | 사이드바 (240px) + 메인 영역 |
| 태블릿 (768px~1023px) | 사이드바 접기 가능 (햄버거 메뉴) |
| 모바일 (~767px) | 단일 컬럼 (사이드바 드로어) |

---

## 9. 비기능 요구사항

### 9.1 성능
- AI 응답 대기 시간: 10~15초 (LLM 처리 시간)
- 교안 생성 (4명 Mem0 조회): 최대 20초
- 프론트엔드 초기 로딩: 3초 이내
- KaTeX 렌더링: 즉시

### 9.2 보안
- Supabase Auth 세션 관리
- 모든 페이지 auth guard (teacher_profiles 존재 확인)
- 학생 계정으로 접근 시 / 리다이렉트
- 로그아웃 시 세션 완전 클리어

### 9.3 배포
- Vercel 배포
- 환경 변수: SUPABASE_URL, SUPABASE_ANON_KEY, N8N_REPORT_URL, N8N_EXAM_URL, N8N_LESSON_URL, N8N_GRADING_URL, MEM0_API_URL

---

## 10. n8n Webhook 매핑

### 10.1 현재

| 기능 | Webhook URL |
|------|-------------|
| 학생 리포트 | AI Teacher Phase3 - 학생 리포트 | https://n8n.srv812064.hstgr.cloud/webhook/aitutor-report |
| 시험 출제 | AI Teacher Phase3 - 시험 출제 | https://n8n.srv812064.hstgr.cloud/webhook/aitutor-exam |
| 교안 생성 | AI Teacher Phase3 - 교안 생성 | https://n8n.srv812064.hstgr.cloud/webhook/aitutor-doc |
| 자동 채점 | AI Teacher Phase3 - 자동 채점 | https://n8n.srv812064.hstgr.cloud/webhook/aitutor-scoring |

---

## 11. 사전 작업 체크리스트

### 11.1 이미 완료 ✅
- [x] Supabase Auth 교사 계정 생성 (teacher-kim@demo.com)
- [x] Supabase Auth 학생 계정 4개 생성
- [x] teacher_profiles 테이블 생성 + 데이터
- [x] student_profiles 테이블 생성 + 데이터
- [x] teacher_reports / exams / lesson_plans / gradings 테이블 생성
- [x] n8n 워크플로우 4개 완성 + 테스트 통과
- [x] DB INSERT 연결 (4개 전부)
- [x] 이전 기록 참조 (Get Data) 연결 (4개 전부)
- [x] Mem0 사전 데이터 입력 (4명)
- [x] pgvector 문제은행 구축 (30문제, 55청크)
- [x] Mem0 Add 연결 (자동 채점)

### 11.2 프론트엔드 구현 시 필요
- [ ] 프로젝트 생성 (day47-ai-teacher)
- [ ] 환경 변수 설정 (.env.local)
- [ ] Supabase Auth 연결 + 교사 인증 guard
- [ ] 랜딩 페이지 구현
- [ ] 4개 기능 페이지 구현
- [ ] 이전 이력 조회 UI 구현
- [ ] n8n webhook Production 전환
- [ ] Vercel 배포

---

## 12. 제외 사항 (PoC 범위 외)

- 회원가입 (데모 계정 고정)
- 비밀번호 변경/찾기
- 학생 관리 CRUD (학생 추가/삭제)
- 학급별 대시보드 (성적 분포 차트, 약점 히트맵)
- PDF 다운로드/인쇄
- 학부모 리포트 발송
- NEIS/에듀파인 연동
- Multi-agent 통합 (라우터 Agent)
- 실시간 스트리밍 응답 (SSE)
- OCR 기반 답안 인식 (자동 채점 확장)
- 다크모드
- 다국어 지원