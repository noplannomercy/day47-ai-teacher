# AI Tutor PoC — Phase 4 프론트엔드 SRS

## 1. 프로젝트 개요

### 1.1 목적
디지털 교과서 포탈에서 AI Tutor가 학생 개인의 수학 능력에 맞춰 동작하는 것을 증명하는 PoC 데모 애플리케이션.

### 1.2 핵심 메시지
> "같은 문제를 질문해도, 학생의 수학 능력과 학습 이력에 따라 완전히 다른 설명과 연습문제를 제공한다."

### 1.3 PoC 범위
- **대상 과목:** 고등학교 1학년 수학
- **대상 단원:** 방정식·함수 (이차방정식, 이차함수, 이차부등식, 연립방정식, 일차함수)
- **문제은행:** 30문제 (pgvector 55청크 저장 완료)
- **데모 학생:** 4명 (성적 분포별 페르소나)

### 1.4 프로덕션 비전 (PoC에서는 구현하지 않음)
- NEIS 교과/비교과 평가 데이터를 Mem0에 자동 연동하여 학생 프로필 자동 생성
- 교사 지원 플랫폼 (교안 관리, 시험 출제, 학생 관리)
- Multi-agent 오케스트레이션 (출제 Agent, 채점 Agent, Q&A Agent 분리)
- AI 주도 학습 추천 (푸시 알림, 약점 알림, 성장 피드백)

---

## 2. 시스템 아키텍처

### 2.1 전체 구성

```
┌────────────────────────────────────────────────────────┐
│  프론트엔드 (Vercel)                                     │
│  Next.js + TypeScript + Supabase Auth + KaTeX          │
├────────────────────────────────────────────────────────┤
│                        │                                │
│  /(랜딩+로그인)          │  /chat (AI Tutor 채팅)         │
│                        │                                │
└────────────┬───────────┴────────────┬──────────────────┘
             │                        │
             │ Supabase Auth          │ POST webhook
             │                        │
┌────────────▼────────────────────────▼──────────────────┐
│  백엔드 (이미 완성)                                      │
│                                                         │
│  n8n Workflow                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Webhook → Mem0 Search → Vector Search →         │   │
│  │ Aggregate → RAG AI Agent → Respond              │   │
│  │                ↓        ↓                        │   │
│  │  Memory Summary → ...  Postgres Chat Memory     │   │
│  │    → Evaluate → Mem0 Add  (대화 이력 자동 관리)  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Supabase PostgreSQL: pgvector(문제은행) + 대화이력      │
│  Mem0: 학생별 수학 능력/약점/학습 패턴                     │
│  Wolfram Alpha: 계산 검증                                │
│  OpenAI gpt-4o: LLM 엔진                               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 프론트엔드 | Next.js 15 + TypeScript | 앱 프레임워크 |
| UI 라이브러리 | shadcn/ui + Tailwind CSS | 컴포넌트 + 스타일링 |
| 수식 렌더링 | KaTeX | LaTeX 수식 표시 |
| 인증 | Supabase Auth | 이메일/비밀번호 로그인 |
| 배포 | Vercel | 호스팅 + CI/CD |
| 백엔드 API | n8n webhook | AI Agent 호출 |
| 관계 DB | Supabase PostgreSQL | 대화 이력 (Postgres Chat Memory), 사용자 메타 |
| 벡터 DB | Supabase pgvector | 문제은행 (이미 구축) |
| 개인화 엔진 | Mem0 | 학생별 학습 프로필 |
| 계산 검증 | Wolfram Alpha | 수학 정답 검증 |
| LLM | OpenAI gpt-4o | AI Agent 엔진 |

---

## 3. 데모 학생 페르소나

### 3.1 학생 프로필 정의

| 항목 | 김상위 | 이중위 | 박하위 | 최기초 |
|------|--------|--------|--------|--------|
| 이메일 | kim-sangwi@demo.com | lee-jungwi@demo.com | park-hawi@demo.com | choi-gicho@demo.com |
| 비밀번호 | demo1234 | demo1234 | demo1234 | demo1234 |
| 수준 | 상위권 (90+) | 중위권 (60~80) | 하위권 (40~60) | 기초부족 (~40) |
| 강점 | 인수분해 능숙, 공식 암기 완벽 | 근의 공식 사용 가능, 기본 계산 | 의지 있음, 단순 계산 가능 | - |
| 약점 | 검산 안 함, 응용문제 전략 부족 | 판별식 부호 실수 반복, 인수분해 시도 안 함 | 이차/일차 개념 혼동, 부호 계산 취약 | 분배법칙 실수, 분수 계산 어려움, 이항 개념 부족 |
| 선호 | 빠른 풀이, 심화 도전 | 근의 공식 선호, 단계별 설명 | 개념 설명 먼저, 천천히 | 기초부터 차근차근, 예시 많이 |

### 3.2 Mem0 사전 데이터 (학생별)

**김상위:**
```
- 인수분해와 근의 공식 모두 능숙하게 사용함
- 계산 속도는 빠르지만 검산을 거의 하지 않음
- 응용문제에서 풀이 전략 수립이 약함
- 심화 문제에 도전하는 것을 좋아함
- 단순 반복 문제보다 새로운 유형을 선호함
```

**이중위:**
```
- 인수분해보다 근의 공식을 선호함
- 판별식 D = b² - 4ac에서 c가 음수일 때 부호를 자주 틀림
- 특히 -4ac 계산 시 부호 변환을 잘못하는 실수 반복
- 근의 공식 대입 후 최종 해 계산에서 부호 처리 오류
- 검산을 거의 하지 않음
```

**박하위:**
```
- 이차방정식과 일차방정식의 차이를 혼동함
- x²이 포함된 식이 이차방정식이라는 것을 자주 잊음
- 부호가 있는 계산에서 실수가 잦음 (음수 × 음수 = 양수)
- 공식을 외우고 있지만 어떤 상황에 적용하는지 모름
- 개념 설명을 먼저 해주면 이해가 빨라짐
```

**최기초:**
```
- 중학교 과정의 분배법칙이 불안정함
- 분수 계산이 어려움 (통분, 약분)
- 이항 시 부호 변환 개념이 부족함
- x에 숫자를 대입하는 것은 가능함
- 매우 천천히 단계별로 설명해야 이해함
- 예시를 많이 보여줘야 함
```

### 3.3 Mem0 데이터가 앱에서 설명되어야 하는 방식

랜딩 페이지에서 각 학생 카드에 Mem0 데이터를 **"AI가 알고 있는 이 학생의 정보"**로 노출.
프론트엔드에 다음 설명 포함:

> "PoC에서는 4명의 가상 학생 데이터를 사전 입력하였습니다.
> 프로덕션 환경에서는 NEIS 교과/비교과 평가 데이터 연동,
> 실제 학습 과정에서의 자동 축적을 통해 학생 프로필이 생성됩니다."

---

## 4. 페이지 상세 설계

### 4.1 랜딩 페이지 (/)

**목적:** 시스템 설명 + 데모 체험 안내 + 로그인

**섹션 구성 (스크롤 순서):**

#### 섹션 1: 히어로
- 타이틀: "AI Tutor — 학생 맞춤형 수학 튜터링"
- 서브타이틀: "같은 문제, 학생마다 다른 설명. 개인화 AI 교육의 시작."
- 대상: 고1 수학 — 방정식·함수 단원

#### 섹션 2: 비교 데모 (핵심 임팩트)
- 질문 예시: "x² + 3x - 10 = 0 풀어줘"
- 좌우 또는 탭으로 **상위권 vs 하위권** 응답 비교
- 사전 저장된 응답 데이터 사용 (실시간 호출 아님)
- 목적: 로그인 전에 "개인화가 뭔지" 즉시 이해

#### 섹션 3: 시스템 아키텍처
- 다이어그램 (Mermaid 또는 이미지)
- 핵심 기술 4가지 설명 카드:
  - Mem0: "학생의 강약점과 학습 패턴을 기억합니다"
  - pgvector: "검증된 문제은행에서 맞춤 연습문제를 찾습니다"
  - Wolfram: "모든 풀이를 수학적으로 검증합니다"
  - ReACT Agent: "생각하고 → 도구 사용 → 응답하는 AI"

#### 섹션 4: 데모 계정 선택 + 로그인
- 4개 학생 카드 (프로필 + Mem0 상태 요약)
- 각 카드에 [이 학생으로 로그인] 버튼
- 클릭 시 해당 이메일/비밀번호로 Supabase Auth 로그인
- 로그인 성공 → /chat으로 리다이렉트

#### 섹션 5: 추천 테스트 시나리오
- 시나리오 1: "같은 문제를 다른 학생으로 로그인해서 비교해보세요"
- 시나리오 2: "'나 어디가 약해?' 물어보기"
- 시나리오 3: "'연습문제 추천해줘' 요청하기"
- 시나리오 4: "대화 후 로그아웃 → 재로그인 → AI가 기억하는지 확인"
- 시나리오 5: "'이차방정식 요약해줘' 요청하기"
- 시나리오 6: "'판별식이 뭐야?' 개념 질문하기"
- 시나리오 7: "문제 풀이 후 '아까 그거 인수분해로는?' 후속 질문하기" (멀티턴)

#### 섹션 6: 프로덕션 비전 (간단히)
- PoC → 프로덕션 로드맵 한 줄 설명
- "NEIS 연동, 교사 플랫폼, Multi-Agent 오케스트레이션..."

### 4.2 채팅 페이지 (/chat)

**접근 제어:** Supabase Auth 세션 필수. 미로그인 시 / 로 리다이렉트.

**레이아웃: 2-Panel**

#### 좌측 패널 (280px)

**현재 학생 정보:**
- 이름, 수준 태그 (상위/중위/하위/기초)
- 점수대 표시

**내 학습 상태 (Mem0 데이터 시각화):**
- 약점 리스트 (태그 형태)
- 강점 리스트
- 선호 학습 스타일
- 데이터 소스 표시: "Mem0 개인화 엔진"

**추천 질문 버튼 (Quick Actions):**
- "x² + 3x - 10 = 0 풀어줘" (문제 풀이)
- "판별식이 뭐야?" (개념 질문)
- "나 어디가 약해?" (약점 확인)
- "연습문제 추천해줘" (연습 요청)
- "이차방정식 요약해줘" (단원 요약)

**하단:**
- [로그아웃] 버튼 → Supabase signOut → / 리다이렉트

#### 우측 패널 (채팅 영역)

**상단:** 현재 학생 이름 + "AI Tutor" 표시

**채팅 영역:**
- 메시지 버블 (학생: 우측, AI: 좌측)
- AI 응답 내 LaTeX 수식 → KaTeX 렌더링
- 연습문제 추천 시 문제 코드(QE-001 등) 포함
- 로딩 상태: "AI가 풀이 중..." 스피너 + 텍스트

**하단:** 메시지 입력 + 전송 버튼

---

## 5. 데이터 모델

### 5.1 기존 테이블 (이미 존재)

```sql
-- pgvector 문제은행 (55청크)
documents (id, content, embedding, metadata)
document_metadata (id, title, created_at, ...)
```

### 5.2 신규 테이블

```sql
-- n8n Postgres Chat Memory 자동 생성 테이블
-- n8n이 자동으로 생성하지만, 사전에 만들어두는 것을 권장
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id serial PRIMARY KEY,
  session_id text NOT NULL,       -- user_id를 session_id로 사용
  message jsonb NOT NULL          -- {type: "human"/"ai", data: {content: "..."}}
);

CREATE INDEX idx_chat_histories_session ON n8n_chat_histories(session_id);

-- 학생 프로필 (Supabase Auth 보조)
CREATE TABLE student_profiles (
  user_id text PRIMARY KEY,       -- Supabase Auth uid
  display_name text NOT NULL,     -- 표시 이름
  level text NOT NULL,            -- 상위/중위/하위/기초
  score_range text,               -- "90+", "60~80" 등
  avatar_emoji text DEFAULT '👤', -- 아바타 이모지
  created_at timestamp DEFAULT now()
);
```

### 5.3 대화 이력 관리 — Postgres Chat Memory

**n8n Postgres Chat Memory 노드 사용:**
- Agent의 Memory 슬롯에 연결 → 대화 이력 **자동 저장/로드**
- Session Key: `{{ $('Webhook').item.json.body.user_id }}`
- user_id = session_id → 학생별 대화 이력 자동 분리
- Agent가 이전 대화 맥락을 자동 참조 (멀티턴 대화 지원)
- 별도 INSERT/DELETE 노드 불필요

**Mem0 (장기 기억) vs Postgres Chat Memory (단기 기억):**

| | Mem0 | Postgres Chat Memory |
|---|---|---|
| 저장 대상 | 수학 능력/약점/학습 패턴 | 대화 원문 (질문+응답) |
| 지속성 | 영구 (장기 기억) | 세션 단위 (단기 기억) |
| 용도 | "이 학생은 부호 실수가 많다" | "방금 이차방정식 풀었다" |
| 비유 | 학생 생활기록부 | 오늘 수업 노트 |
| 관리 | n8n Memory Summary/Evaluate | n8n 자동 (노드가 처리) |

**프론트엔드에서 대화 이력 로드:**
- Supabase Client로 n8n_chat_histories 테이블 직접 조회
- session_id = user_id로 필터링
- 로그인 시 이전 대화 복원 가능

### 5.4 Mem0 데이터 (외부 시스템)
- 학생별 수학 능력/약점/학습 패턴 저장
- n8n Agent가 읽기/쓰기
- 프론트엔드에서는 별도 API로 읽기만 (학습 상태 표시용)

---

## 6. API 설계

### 6.1 n8n Webhook (기존)

```
POST /webhook/{id}
Content-Type: application/json

Request:
{
  "user_id": "supabase_auth_uid",
  "message": "x² + 3x - 10 = 0 풀어줘"
}

Response:
{
  "output": "1) 최종답: x = 2, -5\n2) 풀이 단계:..."
}
```

### 6.2 Mem0 조회 (프론트엔드 → Mem0 API)

```
POST http://193.168.195.222:8888/v1/memories/search/
Content-Type: application/json

Request:
{
  "query": "학생 학습 상태",
  "user_id": "supabase_auth_uid",
  "limit": 10
}

Response:
{
  "results": [
    { "memory": "판별식에서 c 음수일 때 부호 실수 반복", ... },
    ...
  ]
}
```

### 6.3 대화 이력 조회 (프론트엔드 → Supabase)

```
Supabase Client:
supabase
  .from('n8n_chat_histories')
  .select('*')
  .eq('session_id', uid)
  .order('id', { ascending: true })
```

message 컬럼 구조 (jsonb):
```json
// 학생 메시지
{ "type": "human", "data": { "content": "x² + 3x - 10 = 0 풀어줘" } }

// AI 응답
{ "type": "ai", "data": { "content": "1) 최종답: x = 2, -5\n..." } }
```

### 6.4 student_profiles 조회 (프론트엔드 → Supabase)

```
Supabase Client:
supabase
  .from('student_profiles')
  .select('*')
  .eq('user_id', uid)
  .single()
```

---

## 7. 사용자 시나리오

### 7.1 시나리오 B1: 문제 풀이 요청

```
전제: 이중위(중위권)로 로그인된 상태

1. 학생이 "x² + 3x - 10 = 0 풀어줘" 입력
2. 프론트엔드 → n8n webhook (user_id + message)
3. n8n:
   a. Mem0 Search → "부호 실수 반복" 약점 확인
   b. Vector Search → 유사 문제 검색
   c. Postgres Chat Memory → 이전 대화 맥락 로드
   d. Agent 풀이 생성 (약점 기반 경고 + 이전 대화 참조)
   e. Wolfram 검증
   f. Postgres Chat Memory → 대화 자동 저장
   g. Mem0 업데이트
4. 프론트엔드 ← 응답 수신
5. KaTeX로 수식 렌더링
6. 연습문제 추천 (문제은행 코드 포함)
```

**기대 결과 (이중위):**
- 판별식 부호 주의 경고 포함
- 단계별 상세 풀이
- 연습문제: QE-001, QE-008 등 문제은행에서 추천

### 7.2 시나리오 B2: 개념 질문

```
전제: 박하위(하위권)로 로그인

1. "판별식이 뭐야?" 입력
2. Agent:
   - Mem0: "개념 혼동" 확인
   - RAG: 교과서 판별식 내용 검색
   - 기초부터 설명 (일차 vs 이차 구분부터)
3. 기대 결과: 쉬운 언어, 예시 많이, 단계적 설명
```

### 7.3 시나리오 B3: 단원 요약

```
1. "이차방정식 요약해줘" 입력
2. Agent:
   - RAG: 이차방정식 관련 청크 검색
   - 학생 수준에 맞는 요약 생성
3. 기대 결과: 핵심 개념 + 공식 정리 + 학생 약점 관련 주의사항
```

### 7.4 시나리오 B4: 연습문제 요청

```
1. "나한테 맞는 연습문제 줘" 입력
2. Agent:
   - Mem0: 약점 파악
   - pgvector: 약점 관련 문제 검색
   - 난이도 적절한 문제 2~3개 추천
3. 기대 결과: 문제 코드 + 난이도 + 왜 이 문제를 추천하는지 설명
```

### 7.5 시나리오 B5: 내 풀이 검증

```
1. "x² + 3x - 10 = 0 에서 x = 3, -5 가 맞아?" 입력
2. Agent:
   - Wolfram으로 검증 → x = 2, -5가 정답
   - "x = 3은 틀렸어" + 어디서 실수했는지 분석
3. 기대 결과: 오답 지적 + 올바른 풀이 + Mem0 약점 업데이트
```

### 7.6 시나리오 B6: 약점 확인

```
1. "나 어디가 약해?" 입력
2. Agent:
   - Mem0에서 약점 전체 조회
   - 정리해서 피드백
3. 기대 결과: "부호 계산에서 자주 실수해. 특히 c가 음수일 때..."
```

### 7.7 시나리오 COMP: 비교 체험 (킬링샷)

```
1. 김상위로 로그인 → "x² + 3x - 10 = 0 풀어줘" → 응답 확인
2. 로그아웃
3. 최기초로 로그인 → 같은 질문 → 완전히 다른 응답 확인
4. 랜딩 페이지의 비교 데모와 실제 체험이 일치함을 확인
```

### 7.8 시나리오 MULTI: 멀티턴 대화 (Postgres Chat Memory)

```
전제: 이중위로 로그인

1. "x² + 3x - 10 = 0 풀어줘" → AI 풀이 제공
2. "아까 그거 인수분해로는 어떻게 해?" 
   → AI가 "아까 풀었던 x² + 3x - 10 = 0 말이지?" 이전 대화 참조
3. "근의 공식이랑 인수분해 중 뭐가 더 빨라?"
   → AI가 방금 두 가지 방법으로 풀었던 맥락을 기억하고 비교 설명
```

**핵심:** Postgres Chat Memory가 세션 내 대화를 자동 저장하여
Agent가 이전 질문/응답을 참조할 수 있음.

### 7.9 시나리오 PERSIST: 대화 이력 유지

```
1. 이중위로 로그인 → 여러 질문 대화
2. 로그아웃
3. 다시 이중위로 로그인
4. /chat 진입 시 이전 대화 이력이 화면에 복원됨
5. "아까 풀었던 문제 다시 설명해줘" → AI가 이전 세션 대화 참조
```

**핵심:** n8n_chat_histories 테이블에 session_id(user_id)별로
대화가 영구 저장되어, 재로그인 시에도 대화 맥락 유지.

---

## 8. UI 컴포넌트 명세

### 8.1 공통 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `<KaTeXRenderer>` | LaTeX 문자열 → 수식 렌더링 |
| `<ChatBubble>` | 메시지 버블 (학생/AI 구분) |
| `<LoadingIndicator>` | "AI가 풀이 중..." 스피너 |
| `<StudentCard>` | 학생 프로필 카드 (랜딩/사이드바) |
| `<QuickActionButton>` | 추천 질문 버튼 |
| `<MemoryStatusPanel>` | Mem0 데이터 시각화 패널 |

### 8.2 KaTeX 렌더링 규칙

n8n Agent 응답에 포함되는 LaTeX 패턴:
- 인라인: `\\( ... \\)` → KaTeX inline
- 블록: `\\[ ... \\]` → KaTeX display
- 이스케이프: `\\\\` → `\\` 변환 후 렌더링

### 8.3 반응형

| 화면 | 레이아웃 |
|------|----------|
| 데스크톱 (1024px+) | 2-Panel (좌측 사이드바 + 채팅) |
| 태블릿 (768px~1023px) | 사이드바 접기 가능 |
| 모바일 (~767px) | 단일 컬럼 (사이드바 드로어) |

---

## 9. 비기능 요구사항

### 9.1 성능
- AI 응답 대기 시간: 5~15초 (Agent 처리 시간)
- 프론트엔드 초기 로딩: 3초 이내
- KaTeX 렌더링: 즉시

### 9.2 보안
- Supabase Auth 세션 관리
- /chat 페이지 auth guard (미로그인 시 리다이렉트)
- 로그아웃 시 세션 완전 클리어
- Supabase RLS로 n8n_chat_histories, student_profiles 본인 데이터만 접근

### 9.3 배포
- Vercel 배포
- 환경 변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_N8N_WEBHOOK_URL, NEXT_PUBLIC_MEM0_API_URL

---

## 10. n8n 워크플로우 수정사항

### 10.1 Postgres Chat Memory 노드 추가

Agent의 Memory 슬롯에 Postgres Chat Memory 노드 연결:

```
RAG AI Agent
  ├── Chat Model: OpenAI gpt-4o
  ├── Memory: Postgres Chat Memory  ← 신규 추가
  └── Tools: Wolfram, Supabase Vector Store...
```

**Postgres Chat Memory 설정:**
- Credential: AITUTOR Supabase account (Session Pooler)
- Table Name: n8n_chat_histories
- Session Key: `{{ $('Webhook').item.json.body.user_id }}`

**효과:**
- 학생별 대화 이력 자동 저장/로드
- Agent가 이전 대화 맥락 자동 참조 (멀티턴 대화)
- 별도 INSERT/DELETE 노드 불필요
- "아까 그 문제에서..." 같은 후속 질문 처리 가능

### 10.2 Mem0 API CORS 또는 Proxy

프론트엔드에서 Mem0 API 직접 호출 시 CORS 문제 가능.
- 방법 A: Next.js API Route로 프록시 (/api/mem0)
- 방법 B: n8n에 Mem0 조회 전용 webhook 추가

### 10.3 webhook production 모드 활성화

현재 test 모드 → production 모드로 전환 필요.
프론트엔드 배포 전 반드시 활성화.

---

## 11. 사전 작업 체크리스트

### 11.1 Supabase 설정
- [ ] Supabase Auth에 4개 데모 계정 생성
- [ ] n8n_chat_histories 테이블 생성 (또는 n8n 자동 생성 확인)
- [ ] student_profiles 테이블 생성 + 4명 데이터 INSERT
- [ ] RLS 정책 설정 (본인 데이터만 접근)

### 11.2 Mem0 사전 데이터
- [ ] 김상위 (상위권) 메모리 입력
- [ ] 이중위 (중위권) 메모리 입력 (기존 studentA 데이터 활용 가능)
- [ ] 박하위 (하위권) 메모리 입력
- [ ] 최기초 (기초부족) 메모리 입력

### 11.3 n8n 수정
- [ ] Postgres Chat Memory 노드 추가 (Agent Memory 슬롯)
- [ ] Session Key 설정: user_id 기반
- [ ] Postgres Chat Memory 연결 테스트 (멀티턴 대화 확인)
- [ ] webhook production 모드 활성화

### 11.4 랜딩 페이지 비교 데모 데이터
- [ ] 김상위로 "x² + 3x - 10 = 0 풀어줘" → 응답 저장
- [ ] 최기초로 같은 질문 → 응답 저장
- [ ] 랜딩 페이지에 하드코딩

---

## 12. 제외 사항 (PoC 범위 외)

- 회원가입 (데모 계정 고정)
- 비밀번호 변경/찾기
- 교사/어드민 기능
- 과제 출제/채점 (Multi-agent Phase 5)
- 오답 복습 (student_attempts Phase 5)
- AI 주도 학습 추천
- 실시간 스트리밍 응답 (SSE)
- 다크모드
- 다국어 지원