# AI Tutor PoC — 기술 소개서

## 1. 프로젝트 개요

### 1.1 목적
디지털 교과서 포탈에서 AI 기반 개인화 수학 튜터링 시스템의 실현 가능성을 증명하는 PoC(Proof of Concept).

### 1.2 핵심 컨셉
> **"같은 문제를 질문해도, 학생의 수학 능력과 학습 이력에 따라 완전히 다른 설명과 연습문제를 제공한다."**

- 상위권 학생 → 인수분해로 빠르게 풀이, 심화 문제 유도
- 하위권 학생 → 기초 개념부터 단계별 설명, 예시 중심

### 1.3 PoC 범위
- 대상 과목: 고등학교 1학년 수학
- 대상 단원: 방정식·함수 (이차방정식, 이차함수, 이차부등식, 연립방정식, 일차함수)
- 문제은행: 30문제 (pgvector 55청크 저장)
- 데모 학생: 4명 (성적 분포별 페르소나)

---

## 2. 시스템 아키텍처

### 2.1 전체 구성도

```
┌──────────────────────────────────────────────────────────────┐
│  프론트엔드 (Vercel)                                          │
│  Next.js 15 + TypeScript + Supabase Auth + KaTeX             │
│                                                               │
│  / (랜딩: 시스템 설명 + 데모 계정 로그인)                       │
│  /chat (AI Tutor 채팅 인터페이스)                              │
└──────────┬────────────────────────────┬──────────────────────┘
           │ Supabase Auth              │ POST webhook
           │                            │
┌──────────▼────────────────────────────▼──────────────────────┐
│  n8n Workflow (Self-hosted)                                   │
│                                                               │
│  Webhook                                                      │
│    → Mem0 Search (학생 장기 기억 조회)                          │
│    → Supabase Vector Search (문제은행 RAG, Limit 2)            │
│    → Aggregate (검색 결과 통합)                                │
│    → RAG AI Agent (gpt-4o, ReACT 패턴)                        │
│        ├── Postgres Chat Memory (대화 이력 자동 관리)           │
│        ├── Wolfram Alpha (수학 계산 검증)                      │
│        ├── Supabase Vector Store (추가 문제 검색)               │
│        └── Execute SQL (데이터 조회)                           │
│    → Respond to Webhook                                       │
│    → Memory Summary (학습 패턴 추출)                           │
│    → Memory Evaluate (저장 여부 판단)                          │
│    → Mem0 Add (장기 기억 축적)                                 │
│                                                               │
│  데이터 레이어:                                                │
│  ├── Supabase PostgreSQL + pgvector (문제은행, 대화이력, 프로필)│
│  ├── Mem0 (학생별 수학 능력/약점/학습 패턴)                     │
│  └── Wolfram Alpha API (계산 검증)                             │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 프론트엔드 | Next.js 15 + TypeScript | 앱 프레임워크 (App Router) |
| UI | shadcn/ui + Tailwind CSS | 컴포넌트 + 스타일링 |
| 수식 렌더링 | KaTeX (react-katex) | LaTeX 수식 표시 |
| 인증 | Supabase Auth | 이메일/비밀번호 로그인 (SSR) |
| 배포 | Vercel | 프론트엔드 호스팅 |
| 워크플로우 | n8n (Self-hosted) | AI Agent 오케스트레이션 |
| LLM | OpenAI gpt-4o | AI Agent 엔진 |
| 장기 기억 | Mem0 (Self-hosted) | 학생별 학습 프로필 영구 저장 |
| 단기 기억 | n8n Postgres Chat Memory | 대화 이력 자동 관리 |
| 벡터 DB | Supabase pgvector | 문제은행 RAG 검색 |
| 관계 DB | Supabase PostgreSQL | 학생 프로필, 대화 이력 |
| 계산 검증 | Wolfram Alpha API | 수학 풀이 정답 검증 |
| 문서 파싱 | Docling (Self-hosted) | 문제은행 PDF/MD → 청크 |
| 임베딩 | OpenAI text-embedding-ada-002 | 벡터 임베딩 생성 |

### 2.3 이중 메모리 아키텍처

| | Mem0 (장기 기억) | Postgres Chat Memory (단기 기억) |
|---|---|---|
| 저장 대상 | 수학 능력, 약점, 학습 패턴 | 대화 원문 (질문+응답) |
| 지속성 | 영구 | 세션 단위 |
| 용도 | "이 학생은 부호 실수가 많다" | "방금 이차방정식 풀었다" |
| 비유 | **학생 생활기록부** | **오늘 수업 노트** |
| 관리 | Memory Summary → Evaluate → Add | n8n 노드가 자동 처리 |

---

## 3. 핵심 기술 상세

### 3.1 ReACT Agent (Reasoning + Acting)

AI Agent가 "생각 → 도구 사용 → 관찰 → 응답" 패턴으로 동작:

```
학생: "x² + 3x - 10 = 0 풀어줘"

Agent 사고 과정:
1. [생각] Mem0에서 이 학생 약점 확인 → "부호 실수 반복"
2. [생각] Vector Search로 유사 문제 검색 → QE-001, QE-008 발견
3. [도구 사용] Wolfram Alpha로 정답 계산 → x = 2, -5
4. [관찰] 학생 약점과 연결 → 부호 주의 경고 필요
5. [응답] 풀이 + 약점 경고 + 연습문제 추천
```

### 3.2 Mem0 개인화 엔진

**동작 원리:**

```
① 학생 질문 수신
② Mem0 Search → 기존 학습 프로필 조회
③ Agent 응답 생성 (프로필 기반 맞춤)
④ Memory Summary → 이번 대화에서 학습 패턴 추출
⑤ Memory Evaluate → 저장할 가치가 있는지 판단
⑥ Mem0 Add → 장기 기억에 축적
```

**Memory Summary 프롬프트 핵심:**
- 반복적 실수 패턴 감지
- 선호 풀이 방법 파악
- 이해 수준 변화 추적
- 구체적 약점 기술 (단순 "계산 실수"가 아니라 "c가 음수일 때 -4ac 부호 변환 오류")

**Memory Evaluate 판단 기준:**
- 저장: 반복적 실수 패턴, 새로운 약점 발견, 수준 변화
- 미저장: 일회성 오타, 단순 기입 실수

### 3.3 pgvector 문제은행 RAG

**Data Pipeline:**

```
문제은행 (MD 파일)
  → Docling 청크 분할
  → OpenAI 임베딩 (text-embedding-ada-002)
  → Supabase pgvector 저장 (55청크, 11,456토큰)
```

**검색 전략: 앞단 강제 검색**
- Tool calling 의존 X → 워크플로우 레벨에서 Vector Search 강제 실행
- 학생 질문과 유사한 문제 2건 자동 검색
- Agent System Prompt에 검색 결과 주입

```
## 관련 문제은행 레퍼런스 (자동 검색 결과)
{{ Vector Search 결과 }}

위 레퍼런스에서 유사한 문제를 연습문제로 추천하라.
문제 코드(QE-001 등)를 반드시 포함하라.
```

### 3.4 Wolfram Alpha 검증

- 모든 수학 풀이에서 Agent가 Wolfram Alpha를 Tool로 호출
- LLM의 계산 결과와 Wolfram 결과 비교
- 불일치 시 Wolfram 결과로 자동 수정
- 정답률 100% 달성

### 3.5 과제 모드 — AI Teacher 연계 (IF 분기 라우팅)

**배경:** 교사가 AI Teacher에서 시험 출제 후 [과제로 전달]하면, 학생 AI Tutor가 자동으로 "힌트 모드"로 전환.

**워크플로우 분기:**

```
Webhook → Check Assignment (SQL: pending 과제 확인)
  → Has Assignment? (IF 분기)
      ├── true → Assignment Agent (힌트만 제공, 답 안 알려줌)
      └── false → 기존 RAG AI Agent (자유 튜터링, 풀이 직접 제공)
```

**Agent 행동 비교:**

| | 기존 Agent (자유 모드) | Assignment Agent (과제 모드) |
|---|---|---|
| "풀어줘" | 풀이 직접 제공 | "직접 풀어봐! 힌트 줄까?" |
| "모르겠어" | 단계별 풀이 설명 | 한 단계 힌트만 |
| 개념 질문 | 상세 설명 | 상세 설명 (동일) |
| 도구 | Wolfram + Vector Store + Chat Memory | Chat Memory만 |

**과제 제출 (프론트엔드 처리):**
1. 과제 알림 배너: "📋 선생님이 내준 과제가 있어요!"
2. [과제 제출하기] → 모달에서 시험 문제 확인 + 답안 입력
3. 제출 → 자동 채점 webhook → 결과 표시
4. Mem0 약점 축적 → 교사 리포트에 자동 반영

**데이터 순환:**
```
교사 출제 → 과제 전달 → 학생 힌트 모드 학습
  → 과제 제출 → 자동 채점 → Mem0 축적
  → 교사 리포트에 반영 → (순환)
```

### 3.6 문제은행 구성

**소스 파일:** `math_problems_g1.md` (489줄, 30문제, 풀이 해설 포함)

#### 선정 기준

1. **교육과정 범위:** 2015 개정 교육과정 고1 수학 — 방정식·함수 단원
2. **단원 비중:** 이차방정식/이차함수를 중심으로 구성 (가장 많은 학생이 어려워하는 단원)
3. **난이도 분포:** 하(4):중(14):상(12) — 중위권 학생의 약점 보강에 초점
4. **풀이 방법 다양성:** 인수분해, 근의 공식, 완전제곱식, 판별식, 근과 계수의 관계 등 다양한 풀이 접근법 포함
5. **AI 검증 가능성:** Wolfram Alpha로 정답 검증 가능한 문제만 선정
6. **개인화 매칭:** 학생 약점(부호 실수, 판별식 오류 등)과 직접 연결되는 문제 우선 배치

#### 단원별 구성

| 단원 | 문제 수 | 코드 | 난이도 분포 |
|------|---------|------|------------|
| 이차방정식 | 10문제 | QE-001 ~ QE-010 | 하2, 중3, 상5 |
| 이차함수 | 10문제 | QF-001 ~ QF-010 | 하1, 중5, 상4 |
| 이차부등식 | 5문제 | QI-001 ~ QI-005 | 중2, 상3 |
| 연립방정식 | 2문제 | SE-001 ~ SE-002 | 하1, 중1 |
| 일차함수 | 3문제 | LF-001 ~ LF-003 | 중3 |
| **합계** | **30문제** | | **하4, 중14, 상12** |

#### 문제 포맷 (MD 파일 내)

```markdown
### [문제 1] 이차방정식의 근 구하기 (인수분해) [QE-001] (난이도: 하)

이차방정식 x² - 5x + 6 = 0 의 두 근을 구하시오.

[태그] 이차방정식, 인수분해, 근구하기, 하

**풀이:**
- 좌변을 인수분해하면: (x - 2)(x - 3) = 0
- x - 2 = 0 또는 x - 3 = 0
- 따라서 x = 2 또는 x = 3

**정답: x = 2 또는 x = 3**
```

포맷 구성: 문제 번호 + 제목 + 코드 + 난이도 + 본문 + 태그 + 풀이 + 정답

#### 문제 목록 전체

**이차방정식 (QE-001 ~ QE-010):**
| 코드 | 난이도 | 제목 |
|------|--------|------|
| QE-001 | 하 | 이차방정식의 근 구하기 (인수분해) |
| QE-002 | 하 | 이차방정식의 근 구하기 (완전제곱식) |
| QE-003 | 중 | 근의 공식을 이용한 이차방정식 풀기 |
| QE-004 | 중 | 판별식을 이용한 근의 개수 판단 |
| QE-005 | 중 | 근과 계수의 관계 |
| QE-006 | 상 | 근과 계수의 관계 활용 |
| QE-007 | 상 | 이차방정식의 근의 조건 |
| QE-008 | 중 | c가 음수인 이차방정식 |
| QE-009 | 상 | 이차방정식 만들기 |
| QE-010 | 상 | 이차방정식의 실생활 활용 |

**이차함수 (QF-001 ~ QF-010):**
| 코드 | 난이도 | 제목 |
|------|--------|------|
| QF-001 | 하 | 이차함수의 꼭짓점 구하기 |
| QF-002 | 중 | 일반형을 표준형으로 변환 |
| QF-003 | 중 | 이차함수의 축과 최솟값 |
| QF-004 | 중 | 이차함수의 그래프와 x축 교점 |
| QF-005 | 상 | 이차함수 결정 (꼭짓점과 한 점) |
| QF-006 | 상 | 이차함수의 최대·최소 (구간) |
| QF-007 | 중 | 이차함수의 평행이동 |
| QF-008 | 상 | 이차함수와 직선의 교점 |
| QF-009 | 상 | 이차함수 결정 (세 점) |
| QF-010 | 중 | 이차함수의 대칭 |

**이차부등식 (QI-001 ~ QI-005):**
| 코드 | 난이도 | 제목 |
|------|--------|------|
| QI-001 | 중 | 이차부등식 기본 |
| QI-002 | 중 | 이차부등식 (부등호 방향) |
| QI-003 | 상 | 이차부등식 (이차항 음수) |
| QI-004 | 상 | 해가 없는 이차부등식 |
| QI-005 | 상 | 연립이차부등식 |

**연립방정식 (SE-001 ~ SE-002):**
| 코드 | 난이도 | 제목 |
|------|--------|------|
| SE-001 | 하 | 연립방정식 기본 |
| SE-002 | 중 | 연립방정식 활용 (나이) |

**일차함수 (LF-001 ~ LF-003):**
| 코드 | 난이도 | 제목 |
|------|--------|------|
| LF-001 | 중 | 일차함수의 그래프 |
| LF-002 | 중 | 두 점을 지나는 일차함수 |
| LF-003 | 상 | 일차함수와 넓이 |

#### pgvector 저장 결과

| 항목 | 값 |
|------|---|
| 총 청크 수 | 55 |
| 총 토큰 수 | 11,456 |
| 임베딩 모델 | text-embedding-ada-002 |
| 청크 분할 | Token Splitter (n8n) |
| 원본 파싱 | Docling → MD 우회 (한글 PDF 인코딩 이슈) |

---

## 4. 데이터 모델

### 4.1 Supabase 테이블

```sql
-- pgvector 문제은행 (n8n Data Pipeline이 생성)
documents (id, content, embedding, metadata)
document_metadata (id, title, created_at, ...)

-- n8n Postgres Chat Memory (대화 이력)
n8n_chat_histories (
  id serial PRIMARY KEY,
  session_id text NOT NULL,       -- user_id = session_id
  message jsonb NOT NULL          -- {type: "human"/"ai", data: {content: "..."}}
)

-- 학생 프로필
student_profiles (
  user_id text PRIMARY KEY,       -- Supabase Auth uid
  display_name text NOT NULL,
  level text NOT NULL,            -- 상위/중위/하위/기초
  score_range text,
  avatar_emoji text
)
```

### 4.2 Mem0 데이터 구조

```json
// Mem0 저장 예시
{
  "memory": "판별식 D=b²-4ac에서 c가 음수일 때 부호를 자주 틀림",
  "user_id": "f273885e-dcb3-4ae5-8155-292445b9f4ca",
  "metadata": {
    "memory_type": "pattern",
    "confidence": 0.9,
    "source": "n8n"
  }
}
```

### 4.3 n8n Webhook 인터페이스

```
Request:
POST /webhook/{id}
{ "user_id": "<supabase-uid>", "message": "질문 내용" }

Response:
[{ "output": "AI 응답 (LaTeX 수식 포함)" }]
```

---

## 5. 설치 및 환경 구성

### 5.1 사전 요구사항

| 구성 요소 | 버전/요구사항 |
|----------|-------------|
| Node.js | 18+ |
| n8n | 2.0+ (Self-hosted, Docker) |
| Mem0 | Self-hosted (Docker) |
| Docling | Self-hosted (Docker, 문제은행 파싱 시만 필요) |
| Supabase | 클라우드 (무료 플랜 가능) |
| OpenAI API | gpt-4o + text-embedding-ada-002 |
| Wolfram Alpha | AppID 필요 |
| Vercel | 프론트엔드 배포 |

### 5.2 인프라 설정

#### Supabase 프로젝트

1. https://supabase.com 에서 프로젝트 생성
2. Settings → API에서 URL과 anon key 확보
3. SQL Editor에서 pgvector 활성화:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

4. 테이블 생성:
```sql
-- 대화 이력
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  message jsonb NOT NULL
);
CREATE INDEX idx_chat_histories_session ON n8n_chat_histories(session_id);

-- 학생 프로필
CREATE TABLE student_profiles (
  user_id text PRIMARY KEY,
  display_name text NOT NULL,
  level text NOT NULL,
  score_range text,
  avatar_emoji text DEFAULT '👤',
  created_at timestamp DEFAULT now()
);
```

5. pgvector 문제은행 테이블 (n8n Data Pipeline이 자동 생성하지만 참고용):
```sql
CREATE TABLE documents (
  id bigserial PRIMARY KEY,
  content text,
  metadata jsonb,
  embedding vector(1536)
);

CREATE TABLE document_metadata (
  id bigserial PRIMARY KEY,
  title text,
  total_chunks integer,
  total_tokens integer,
  created_at timestamp DEFAULT now()
);
```

#### Supabase Auth 데모 계정

Supabase Dashboard → Authentication → Users → Add User:

| 이메일 | 비밀번호 | Auto Confirm |
|--------|----------|-------------|
| kim-sangwi@demo.com | demo1234 | ✅ |
| lee-jungwi@demo.com | demo1234 | ✅ |
| park-hawi@demo.com | demo1234 | ✅ |
| choi-gicho@demo.com | demo1234 | ✅ |

생성 후 uid 확인 → student_profiles INSERT:
```sql
INSERT INTO student_profiles (user_id, display_name, level, score_range, avatar_emoji) VALUES
('<김상위-uid>', '김상위', '상위', '90+', '🏆'),
('<이중위-uid>', '이중위', '중위', '60~80', '📚'),
('<박하위-uid>', '박하위', '하위', '40~60', '✏️'),
('<최기초-uid>', '최기초', '기초', '~40', '🌱');
```

#### n8n (Self-hosted)

Docker로 실행:
```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

n8n 내에서 설정할 Credentials:
- OpenAI API Key (gpt-4o + embeddings)
- Supabase API (REST API)
- Supabase Postgres (Session Pooler 연결)
- Wolfram Alpha AppID
- Mem0 HTTP Request (Base URL: http://<mem0-host>:8888)

#### Mem0 (Self-hosted)

```bash
docker run -d --name mem0 \
  -p 8888:8000 \
  mem0ai/mem0:latest
```

API 확인: `curl http://<host>:8888/docs`

#### Docling (문제은행 파싱 시만 필요)

```bash
docker run -d --name docling-serve \
  -p 5001:5001 \
  quay.io/docling-project/docling-serve
```

### 5.3 Mem0 사전 데이터 입력

데모 계정별 학습 프로필을 Mem0에 사전 입력:

> ⚠️ Windows CMD에서는 싱글쿼트 불가. 더블쿼트 + 이스케이프 사용.
> API 경로: `/memories` (/v1/memories/ 아님)

**김상위 (상위권):**
```bash
curl -X POST http://<mem0-host>:8888/memories \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "이 학생은 인수분해와 근의 공식 모두 능숙하게 사용한다. 계산 속도는 빠르지만 검산을 거의 하지 않는다. 응용문제에서 풀이 전략 수립이 약하다. 심화 문제에 도전하는 것을 좋아하고 단순 반복 문제보다 새로운 유형을 선호한다."}],
    "user_id": "<김상위-uid>"
  }'
```

**이중위 (중위권):**
```bash
curl -X POST http://<mem0-host>:8888/memories \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "이 학생은 인수분해보다 근의 공식을 선호한다. 판별식에서 c가 음수일 때 부호를 자주 틀린다. 특히 -4ac 계산 시 부호 변환을 잘못하는 실수를 반복한다. 근의 공식 대입 후 최종 해 계산에서 부호 처리 오류가 있다. 검산을 거의 하지 않는다."}],
    "user_id": "<이중위-uid>"
  }'
```

**박하위 (하위권):**
```bash
curl -X POST http://<mem0-host>:8888/memories \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "이 학생은 이차방정식과 일차방정식의 차이를 혼동한다. 부호가 있는 계산에서 실수가 잦다. 음수 곱하기 음수가 양수인 것을 자주 틀린다. 공식을 외우고 있지만 어떤 상황에 적용하는지 모른다. 개념 설명을 먼저 해주면 이해가 빨라진다."}],
    "user_id": "<박하위-uid>"
  }'
```

**최기초 (기초부족):**
```bash
curl -X POST http://<mem0-host>:8888/memories \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "이 학생은 중학교 과정의 분배법칙이 불안정하다. 분수 계산이 어렵고 통분 약분을 자주 틀린다. 이항 시 부호 변환 개념이 부족하다. x에 숫자를 대입하는 것은 가능하다. 매우 천천히 단계별로 설명해야 이해한다."}],
    "user_id": "<최기초-uid>"
  }'
```

검증:
```bash
curl "http://<mem0-host>:8888/memories?user_id=<uid>"
```

### 5.4 n8n 워크플로우 구성

#### Phase 1-2: ReACT Agent + Mem0

```
Webhook (POST)
  → Mem0 Search (HTTP Request, POST /search)
  → RAG AI Agent (Tools Agent, gpt-4o)
      ├── Postgres Chat Memory (session_key = user_id)
      ├── Wolfram Alpha Tool
      └── Supabase Vector Store Tool
  → Respond to Webhook
  → Memory Summary (OpenAI Chat, 학습 패턴 추출)
  → Memory Evaluate (OpenAI Chat, 저장 여부 판단)
  → Mem0 Add (HTTP Request, POST /memories)
```

#### Phase 3: pgvector 문제은행 추가

```
Webhook
  → Mem0 Search
  → Vector Search (Supabase, Get Ranked Documents, Limit 2)
  → Aggregate (All Item Data → document 필드)
  → RAG AI Agent (System Prompt에 검색 결과 주입)
      ├── Postgres Chat Memory
      ├── Wolfram Alpha
      └── Supabase Vector Store (추가 검색용)
  → Respond to Webhook
  → Memory Summary → Evaluate → Mem0 Add
```

**Agent System Prompt 핵심:**

```
당신은 한국 중고등학생을 위한 AI 수학 튜터입니다.

## 사용자 정보 (기억)
{{ Mem0 Search 결과 }}

## 관련 문제은행 레퍼런스 (자동 검색 결과)
{{ Vector Search → Aggregate 결과 }}

## 필수 규칙
⚠️ 1. 풀이 완료 후 반드시 wolfram_calculator로 최종답을 검증하라.
⚠️ 2. 연습문제 추천 시 반드시 위 문제은행에서 선택하라. 직접 만들지 마라.
⚠️ 3. 답을 찾지 못하면 솔직하게 말하라.

## 출력 형식
1) 최종답
2) 풀이 단계(4단계): 전략 선택 → 핵심 아이디어 → 계산 전개 → 검산
3) 체크포인트 질문(2개)
4) 실수 방지 주의사항(학생 약점 기반)
5) 연습문제 추천(2개, 문제 코드 포함)
```

#### Mem0 Add Body (JSON.stringify 필수)

```json
{
  "messages": [
    {
      "role": "user",
      "content": {{ JSON.stringify($('Memory Summary').item.json.output.summary) }}
    }
  ],
  "user_id": "{{ $('Webhook').item.json.body.user_id }}",
  "agent_id": "lqpagent",
  "run_id": "pocmem0001",
  "infer": false,
  "metadata": {
    "source": "n8n",
    "memory_type": "{{ $('Evaluate').item.json.output.memory_type }}",
    "confidence": {{ $('Evaluate').item.json.output.confidence }},
    "eval_reason": {{ JSON.stringify($('Evaluate').item.json.output.reason) }},
    "origin": "conversation_summary",
    "decision": {{ JSON.stringify($('Memory Summary').item.json.output.decision || '') }},
    "relations": {{ JSON.stringify($('Memory Summary').item.json.output.relations || []) }},
    "timestamp": "{{ $now.toISO() }}"
  }
}
```

> ⚠️ LLM 출력이 들어가는 필드(content, eval_reason, decision)는 반드시 JSON.stringify()로 감싸야 함. 줄바꿈/따옴표로 JSON 파싱 실패 방지.

#### 문제은행 Data Pipeline (별도 워크플로우)

```
수동 트리거 → Docling 청크 (MD 파일 업로드)
  → Default Data Loader
  → Token Splitter
  → OpenAI Embeddings
  → Supabase Vector Store (Insert)
```

> Docling은 한글 PDF 인코딩 이슈로 **MD 파일로 우회** 처리. weasyprint 생성 PDF → Docling 파싱 실패 (pypdfium2 호환 불가).

### 5.5 프론트엔드 설정

```bash
# 프로젝트 생성
npx create-next-app@latest ai-tutor-poc --typescript --tailwind --eslint --app --src-dir

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input card avatar badge scroll-area separator sheet skeleton tabs toast

# Supabase + KaTeX
npm install @supabase/supabase-js @supabase/ssr
npm install katex react-katex
npm install -D @types/katex @types/react-katex

# 기타
npm install react-markdown lucide-react
```

환경 변수 (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://<n8n-host>/webhook/<id>
NEXT_PUBLIC_MEM0_API_URL=http://<mem0-host>:8888
```

---

## 6. 데모 학생 페르소나

### 6.1 학생 프로필

| 학생 | 수준 | 성적 | 강점 | 약점 |
|------|------|------|------|------|
| 김상위 | 상위권 | 90+ | 인수분해 능숙, 공식 암기 | 검산 안 함, 응용 전략 부족 |
| 이중위 | 중위권 | 60~80 | 근의 공식 사용 가능 | 판별식 부호 실수 반복, 인수분해 시도 안 함 |
| 박하위 | 하위권 | 40~60 | 의지 있음 | 이차/일차 혼동, 부호 계산 취약 |
| 최기초 | 기초부족 | ~40 | x 대입 가능 | 분배법칙 불안정, 분수 어려움, 이항 부족 |

### 6.2 개인화 응답 비교 (킬링샷)

**질문: "x² + 3x - 10 = 0 풀어줘"**

**김상위 (상위권):**
> 인수분해로 빠르게 풀 수 있습니다. (x+5)(x-2)=0이므로 x=-5 또는 x=2입니다.
> 심화: 근과 계수의 관계도 확인해볼까요?

**이중위 (중위권):**
> 판별식 부호 주의! 지난번 c 음수에서 틀렸잖아.
> -4ac 계산 시 -4×1×(-10) = +40 꼭 확인하세요.

**박하위 (하위권):**
> 이차방정식이 뭔지부터 확인하자. x²이 있으면 이차방정식이야.
> 단계별로 천천히 가자...

**최기초 (기초부족):**
> 먼저 x에 숫자를 넣어보자. x=2를 넣으면 4+6-10=0 맞지?
> 이렇게 답을 찾을 수 있어.

---

## 7. 데이터 흐름 상세

### 7.1 질문 → 응답 전체 과정

```
① 학생이 채팅에 질문 입력
② 프론트엔드 → POST n8n webhook (user_id + message)
③ n8n: Mem0 Search → 학생 장기 기억(약점/패턴) 조회
④ n8n: Vector Search → 문제은행에서 유사 문제 2건 검색
⑤ n8n: Aggregate → 검색 결과 1건으로 통합
⑥ n8n: Postgres Chat Memory → 이전 대화 맥락 로드
⑦ n8n: RAG AI Agent 실행
   - System Prompt에 Mem0 + Vector Search 결과 주입
   - Wolfram Alpha로 계산 검증
   - 학생 수준 맞춤 응답 생성
⑧ n8n: Postgres Chat Memory → 대화 자동 저장
⑨ n8n: Respond to Webhook → 프론트엔드에 응답 반환
⑩ 프론트엔드: KaTeX로 수식 렌더링 + 화면 표시
⑪ n8n: Memory Summary → 이번 대화에서 학습 패턴 추출
⑫ n8n: Memory Evaluate → 저장할 가치 판단
⑬ n8n: Mem0 Add → 장기 기억 축적 (비동기)
```

### 7.2 Mem0 자동 축적 과정

```
최초 상태: 사전 입력된 기본 프로필
  ↓
1차 대화: "부호 실수 패턴" 감지 → Mem0 저장
  ↓
2차 대화: "인수분해보다 근의 공식 선호" 감지 → Mem0 저장
  ↓
3차 대화: Mem0에 축적된 데이터로 더 정교한 맞춤 응답
  ↓
...대화할수록 개인화 정확도 상승
```

---

## 8. 개발 Phase 이력

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | ReACT Agent + Wolfram 검증 | ✅ 완료 |
| Phase 2 | + Mem0 개인화 (Memory Summary/Evaluate) | ✅ 완료 |
| Phase 3 | + pgvector 문제은행 RAG | ✅ 완료 |
| Phase 4 | 프론트엔드 PoC 앱 (Next.js + Supabase Auth) | ✅ 완료 |
| Phase 5 | Multi-agent 오케스트레이션 (출제/채점/Q&A 분리) | 📋 계획 |

### 8.1 Phase별 주요 발견 및 해결

**Phase 1-2:**
- gpt-4o-mini → tool calling 지시 준수율 낮음 → **gpt-4o로 변경** 해결
- Memory Summary 프롬프트: "단순 계산 실수" → 과도 필터링 → 저장 금지 조건 완화

**Phase 3:**
- Docling PDF 파싱: 한글 폰트 인코딩 이슈 → **MD 파일로 우회**
- Tool calling 의존 시 Agent가 Tool 미호출 → **앞단 강제 검색**으로 해결
- Vector Search 2건 → Agent 2회 실행 → **Aggregate 노드**로 통합
- Mem0 Add JSON 파싱 실패 → **JSON.stringify()** 적용

**Phase 4:**
- Supabase Auth + Mem0 + n8n webhook 통합 프론트엔드 완성
- KaTeX 수식 렌더링 (인라인 + 블록)
- Postgres Chat Memory로 멀티턴 대화 + 이력 유지

---

## 9. 프로덕션 로드맵

### Phase 5: Multi-Agent 오케스트레이션

```
현재: 하나의 Agent가 모든 시나리오 처리
목표: 전문 Agent 분리

Q&A Agent    → 개념 설명, 풀이, 요약
출제 Agent   → 약점 기반 문제 선택, 과제 출제
채점 Agent   → 학생 답변 채점, 피드백, 이력 저장
```

추가 테이블:
```sql
-- 과제
assignments (id, title, problem_ids[], due_date)

-- 학생 풀이 이력
student_attempts (id, user_id, problem_id, student_answer, is_correct, ai_feedback)

-- 문제 단위 메타데이터
problem_bank (problem_id, topic, subtopic, difficulty, problem_text, answer, solution, tags[])
```

### Phase 6: NEIS 연동

- 교과/비교과 평가 데이터를 Mem0에 자동 연동
- 사전 입력 없이 학생 프로필 자동 생성

### Phase 7: 교사 지원 플랫폼

- 교안 관리, 시험 출제, 학생 관리
- 같은 RAG (교과서, 문제은행) 공유
- 역할별 다른 뷰 (TEACHER / STUDENT)

### Phase 8: AI 주도 학습

- 약점 알림 ("부호 실수 3번째야. 집중 연습할까?")
- 학습 추천 ("이차함수 넘어갈까?")
- 성장 피드백 ("지난주보다 정답률 20% 올랐어!")

---

## 10. 현재 환경 정보 (참고)

| 항목 | 값 |
|------|---|
| Supabase URL | https://muefuihjjihdihzjpvbk.supabase.co |
| Supabase Postgres | aws-1-ap-northeast-2.pooler.supabase.com:5432 |
| n8n Webhook (Production) | https://n8n.srv812064.hstgr.cloud/webhook/6350e749-78cb-4a00-890d-cfa59faafac8 |
| Mem0 API | http://193.168.195.222:8888 |
| Docling API | http://69.62.77.191:5001 |
| Wolfram AppID | Y7E7HYYK9G |

### 데모 계정 uid 매핑

| 학생 | uid |
|------|-----|
| 김상위 | 3a0d951f-6fe7-49cf-96e9-d9194fc723fc |
| 이중위 | f273885e-dcb3-4ae5-8155-292445b9f4ca |
| 박하위 | 066a45cd-9db3-4bd2-bd53-ac89c04cb29b |
| 최기초 | a1fac652-00f1-461f-b8f5-b740434614ae |

---

## 11. 테스트 검증

### 기본 테스트 (curl)

```bash
# 이중위로 문제 풀이 요청
curl -X POST https://n8n.srv812064.hstgr.cloud/webhook/6350e749-78cb-4a00-890d-cfa59faafac8 \
  -H "Content-Type: application/json" \
  -d '{"user_id":"f273885e-dcb3-4ae5-8155-292445b9f4ca","message":"x^2+3x-10=0 풀어줘"}'

# 멀티턴 테스트 (같은 uid로 후속 질문)
curl -X POST https://n8n.srv812064.hstgr.cloud/webhook/6350e749-78cb-4a00-890d-cfa59faafac8 \
  -H "Content-Type: application/json" \
  -d '{"user_id":"f273885e-dcb3-4ae5-8155-292445b9f4ca","message":"아까 그거 인수분해로는 어떻게 해?"}'
```

### 확인 포인트

- ✅ 학생 약점 반영된 응답 (부호 실수 경고 등)
- ✅ 문제은행 코드(QE-001 등) 포함된 연습문제 추천
- ✅ Wolfram 검증으로 정답 100%
- ✅ Mem0 Add 성공 (JSON 에러 없음)
- ✅ 멀티턴: "아까 그거" 이전 대화 참조
- ✅ 학생별 다른 응답 (킬링샷)
- ✅ KaTeX 수식 렌더링
- ✅ 대화 이력 유지 (재로그인 후 복원)