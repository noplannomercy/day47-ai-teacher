# AI Teacher PoC — 기술 소개서

## 1. 프로젝트 개요

### 1.1 목적
디지털 교과서 플랫폼에서 AI가 교사의 전체 업무 사이클(리포트 → 교안 → 출제 → 채점)을 지원하고, 학생용 AI Tutor와 데이터를 순환하여 **교사-AI-학생 삼자 연계 교육 생태계**를 증명하는 PoC.

### 1.2 핵심 컨셉
> **"AI Tutor가 쌓은 학생 데이터를 교사가 바로 활용한다. 교안, 시험, 채점까지 — 교사의 업무 사이클 전체를 AI가 지원한다."**

- 교사 → AI Teacher에서 교안 작성 + 시험 출제
- 시험 → AI Tutor를 통해 학생에게 전달
- 학생 → AI Tutor에서 힌트 받으며 과제 풀기
- 채점 → 자동 수행 → Mem0 약점 축적
- 교사 → 과제 현황 대시보드에서 결과 확인
- 리포트 → 채점 결과 자동 반영

### 1.3 PoC 범위
- 대상 과목: 고등학교 1학년 수학
- 대상 단원: 방정식·함수 (이차방정식, 이차함수, 이차부등식, 연립방정식, 일차함수)
- 문제은행: 30문제 (pgvector 55청크 저장)
- 데모 학생: 4명 (성적 분포별 페르소나)
- 데모 교사: 1명 (김수학 선생님)

---

## 2. 시스템 아키텍처

### 2.1 전체 구성도 — 교사-AI-학생 삼자 연계

```
┌─────────────────────────────────────────────────────────────────┐
│                    디지털 교과서 AI 플랫폼                         │
│                                                                  │
│  ┌─────────────────────┐        ┌─────────────────────┐        │
│  │  AI Teacher (교사용)  │        │  AI Tutor (학생용)    │        │
│  │  day47-ai-teacher    │        │  ai-tutor-poc        │        │
│  │                      │        │                      │        │
│  │  📊 학생 리포트       │        │  💬 맞춤 튜터링       │        │
│  │  📝 시험 출제        │───→──│  📋 과제 모드         │        │
│  │  📖 교안 생성        │        │  📝 답안 제출         │        │
│  │  📋 과제 현황        │←─────│  ✅ 자동 채점         │        │
│  └──────────┬──────────┘        └──────────┬──────────┘        │
│             │                               │                    │
│             ▼           공유 데이터           ▼                    │
│  ┌───────────────────────────────────────────────────────┐      │
│  │                                                        │      │
│  │  Mem0          학생별 약점/강점/학습 패턴 (장기 기억)     │      │
│  │  pgvector      문제은행 30문제 55청크 (벡터 검색)        │      │
│  │  PostgreSQL    프로필, 대화이력, 과제, 채점 (관계 DB)     │      │
│  │  n8n           5개 AI 워크플로우 (오케스트레이션)         │      │
│  │  Wolfram       수학 풀이 정답 검증                       │      │
│  │  OpenAI        gpt-4o LLM 엔진                          │      │
│  │                                                        │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 데이터 순환 구조 (킬링 포인트)

```
교사: 교안 생성 (반 약점 분석)
  ↓
교사: 시험 출제 → [과제로 전달]
  ↓
DB: teacher_assignments + student_submissions 생성
  ↓
학생: AI Tutor 접속 → "과제가 있어요!" 알림
  ↓
학생: 힌트 모드로 공부 (Agent가 답 안 알려줌)
  ↓
학생: [과제 제출] → 답안 입력 → 자동 채점
  ↓
DB: 채점 결과 저장 + Mem0 약점 축적
  ↓
교사: 과제 현황 대시보드에서 결과 확인
  ↓
교사: 리포트 생성 → 채점 결과 자동 반영
  ↓
교사: 다음 교안에 반영 → (순환)
```

### 2.3 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 교사 프론트엔드 | Next.js 15 + TypeScript | AI Teacher 앱 |
| 학생 프론트엔드 | Next.js 15 + TypeScript | AI Tutor 앱 |
| UI | shadcn/ui + Tailwind CSS | 컴포넌트 + 스타일링 |
| 수식 렌더링 | KaTeX + react-markdown | LaTeX 수식 + 마크다운 |
| 인증 | Supabase Auth | 교사/학생 분리 인증 |
| 배포 | Vercel | 프론트엔드 호스팅 (2개 앱) |
| 워크플로우 | n8n (Self-hosted) × 5 | AI 워크플로우 오케스트레이션 |
| LLM | OpenAI gpt-4o | AI Agent 엔진 |
| 장기 기억 | Mem0 (Self-hosted) | 학생별 학습 프로필 |
| 단기 기억 | n8n Postgres Chat Memory | 대화 이력 자동 관리 |
| 벡터 DB | Supabase pgvector | 문제은행 RAG 검색 |
| 관계 DB | Supabase PostgreSQL | 프로필, 과제, 채점, 산출물 |
| 계산 검증 | Wolfram Alpha API | 수학 정답 검증 |

---

## 3. AI Teacher 핵심 기능

### 3.1 학생 리포트 생성

**입력:** 학생 선택 (1명)
**처리:** Mem0(약점/강점) + 대화 이력(최근 20건) + 이전 리포트(3건) 통합 분석
**출력:** 학생 개요, 강점, 약점, 최근 활동, 성장 추세, 권고사항, 학부모 코멘트

```
n8n 워크플로우:
Webhook → Get Data (이전 리포트 3건)
  → Mem0 GET (학생 전체 메모리)
  → Chat History (최근 대화 20건)
  → Student Profile → Code (Merge)
  → LLM (gpt-4o) → Respond
  → DB INSERT (teacher_reports)
```

**핵심:** 이전 리포트를 참조하여 성장 추세 비교 가능.

### 3.2 시험 출제

**입력:** 단원, 문제 수(3~20), 난이도(하/중/상/혼합), 학생 약점 반영(선택)
**처리:** Mem0(학생 약점) + pgvector(문제은행) + 이전 출제(3건) 분석
**출력:** 시험지 + 정답지 + 채점 기준 (3탭)

```
n8n 워크플로우:
Webhook → Get Data (이전 시험 3건)
  → Mem0 GET (학생 약점)
  → Vector Search (문제은행 10건)
  → Code (Merge) → LLM → Respond
  → DB INSERT (teacher_exams)
```

**핵심:** 이전 출제와 중복 방지 + 학생 약점 반영 문제 포함.

### 3.3 교안 생성

**입력:** 단원, 수업 시간(30~50분), 대상 학생(다중 선택)
**처리:** 학생 N명 Mem0 개별 조회 + pgvector + 이전 교안(3건) 분석
**출력:** 반 약점 분석 + 도입/전개/활동/정리 수업 계획

```
n8n 워크플로우:
Webhook → Get Data (이전 교안 3건)
  → Split Students → Mem0 GET × N명
  → Vector Search (문제은행)
  → Code (Merge) → LLM → Respond
  → DB INSERT (teacher_lesson_plans)
```

**핵심:** 4명 전원 Mem0 조회 → 공통 약점 도출 → 수준별 활동 분리.

### 3.4 과제 전달 + 현황 대시보드

**과제 전달 (시험 출제 후):**
- [과제로 전달] 버튼 → teacher_assignments INSERT
- 전체 학생에게 student_submissions(pending) 생성
- AI Tutor에서 학생 접속 시 자동 감지

**과제 현황 대시보드:**
- 과제별 제출 현황 (2/4명 완료)
- 학생별 상태 (⏳미제출 / 📤제출됨 / ✅채점완료)
- [결과 보기] → 채점 결과 마크다운 확인

---

## 4. AI Tutor 과제 모드 (연계 핵심)

### 4.1 IF 분기 라우팅

기존 AI Tutor 워크플로우에 과제 감지 로직 추가:

```
Webhook → Check Assignment (SQL)
  → IF 과제 있음 (pending)
      → Assignment Agent (힌트 모드)
    과제 없음
      → 기존 RAG AI Agent (자유 튜터링)
```

**Assignment Agent vs 기존 Agent:**

| | 기존 Agent | Assignment Agent |
|---|---|---|
| 역할 | 맞춤 튜터링 | 과제 감독관 |
| 답 제공 | O (풀이 직접 제공) | X (힌트만 제공) |
| 도구 | Wolfram + Vector Store + Chat Memory | Chat Memory만 |
| 프롬프트 | "학생 수준에 맞게 설명" | "절대 정답 알려주지 마" |

### 4.2 힌트 모드 동작

```
AI: "선생님이 과제를 내줬어! 같이 풀어보자 😊"
AI: "문제 1번이야. 2x²+5x-3=0의 두 근을 구해봐"
학생: "풀어줘"
AI: "직접 풀어봐! 이 문제는 인수분해로 풀 수 있어. 힌트 줄까?"
학생: "모르겠어"
AI: "곱이 -3이고 합이 5/2인 두 수를 찾아봐"  ← 한 단계 힌트만
```

**힌트 단계:**
1단계: 풀이 방법 제시 ("인수분해 해볼까?")
2단계: 구체적 방향 ("두 수의 곱이 -3인 조합 찾아봐")
3단계: 더 구체적 ("양수와 음수 조합, 5와?")
4단계: 학생 명확 포기 시에만 풀이 제공

### 4.3 과제 제출 + 자동 채점

프론트엔드에서 처리:
1. 과제 알림 배너 → [과제 제출하기] 클릭
2. 모달: 시험 문제 표시 (정답지 숨김) + 답안 입력
3. 제출 확인 다이얼로그 ("제출 후 수정 불가")
4. 자동 채점 webhook 호출 → 결과 표시
5. student_submissions 상태 업데이트 (graded)
6. Mem0 약점 축적 (채점 워크플로우 내부)

---

## 5. n8n 워크플로우 상세

### 5.1 워크플로우 목록 (5개)

| # | 워크플로우 | 트리거 | 주요 노드 |
|---|-----------|--------|-----------|
| 1 | AI Tutor Phase3 | 학생 채팅 | Check Assignment → IF → Agent(자유/과제) → Memory Summary → Mem0 Add |
| 2 | AI Teacher - 학생 리포트 | 교사 요청 | Get Data → Mem0 → Chat History → LLM → DB INSERT |
| 3 | AI Teacher - 시험 출제 | 교사 요청 | Get Data → Mem0 → Vector Search → LLM → DB INSERT |
| 4 | AI Teacher - 교안 생성 | 교사 요청 | Get Data → Split → Mem0×N → Vector → LLM → DB INSERT |
| 5 | AI Teacher - 자동 채점 | 과제 제출 | Get Data → Mem0 → LLM → DB INSERT → Memory Summary → Mem0 Add |

### 5.2 AI Tutor 워크플로우 (수정 후)

```
Webhook
  → Check Assignment (SQL: pending 과제 확인)
  → Has Assignment? (IF 분기)
      ├── true → Assignment Mem0 Search
      │         → Assignment Merge (과제 + Mem0 통합)
      │         → Assignment Agent (힌트 모드, 도구 없음)
      │         → Respond to Webhook
      │
      └── false → Mem0 Search (기존)
                → Vector Search (기존)
                → Aggregate (기존)
                → RAG AI Agent (기존, 풀이 제공)
                → Respond to Webhook
                → Memory Summary → Evaluate → Mem0 Add
```

### 5.3 자동 채점 워크플로우 — Mem0 축적 포함

```
Webhook (problems + student_id)
  → Get Data (이전 채점 3건)
  → Mem0 GET (기존 약점)
  → Code (Merge Data)
  → LLM (채점 + 오답 분석 + 기존 약점 연관)
  → Respond to Webhook (병렬 분기)
  → DB INSERT: teacher_gradings (병렬)
  → Memory Summary (오답 패턴 추출)
  → Memory Evaluate (저장 판단)
  → Mem0 Add (약점 장기 기억 축적)
```

**핵심:** 채점 시 발견된 오답 패턴이 Mem0에 축적 → AI Tutor 개인화 + 교사 리포트에 자동 반영.

---

## 6. 데이터베이스 설계

### 6.1 테이블 구조

```
┌─ 학생 영역 ─────────────────────────────────┐
│ student_profiles    학생 기본 정보 (4명)       │
│ n8n_chat_histories  AI Tutor 대화 이력         │
│ student_submissions 과제 답안 + 채점 결과       │
└──────────────────────────────────────────────┘

┌─ 교사 영역 ─────────────────────────────────┐
│ teacher_profiles     교사 기본 정보 (1명)      │
│ teacher_reports      학생 리포트 산출물         │
│ teacher_exams        시험 출제 산출물           │
│ teacher_lesson_plans 교안 산출물               │
│ teacher_gradings     채점 결과                 │
│ teacher_assignments  과제 배정 (연계 핵심)      │
└──────────────────────────────────────────────┘

┌─ 공유 영역 ─────────────────────────────────┐
│ documents           pgvector 문제은행 (55청크)  │
│ Mem0 (외부)         학생별 장기 기억             │
└──────────────────────────────────────────────┘
```

### 6.2 과제 연계 테이블

```sql
-- 교사 → 학생 과제 전달
teacher_assignments (
  id, teacher_id, exam_id, exam_content,
  student_ids[], status, due_date, created_at
)

-- 학생 답안 + 채점 결과
student_submissions (
  id, assignment_id, student_id,
  answers (jsonb), score, grading_result,
  status [pending→submitted→graded],
  submitted_at, graded_at, created_at
)
```

---

## 7. 인증 설계

### 7.1 교사/학생 분리

```
AI Teacher (교사 앱):
  로그인 → teacher_profiles에 uid 존재 확인
  → 없으면 접근 차단 (학생 계정 차단)

AI Tutor (학생 앱):
  로그인 → student_profiles에 uid 존재 확인
  → 없으면 접근 차단 (교사 계정 차단)
```

### 7.2 데모 계정

| 역할 | 이름 | 이메일 | 비밀번호 |
|------|------|--------|----------|
| 교사 | 김수학 | teacher-kim@demo.com | demo1234 |
| 학생 (상위) | 김상위 🏆 | kim-sangwi@demo.com | demo1234 |
| 학생 (중위) | 이중위 📚 | lee-jungwi@demo.com | demo1234 |
| 학생 (하위) | 박하위 ✏️ | park-hawi@demo.com | demo1234 |
| 학생 (기초) | 최기초 🌱 | choi-gicho@demo.com | demo1234 |

---

## 8. 비용 분석

### 8.1 PoC 인프라 비용

| 항목 | 비용 | 비고 |
|------|------|------|
| n8n | 월 $20 | Self-hosted (Hostinger VPS) |
| Mem0 | 월 $0 | Self-hosted (같은 VPS) |
| Supabase | 월 $0 | Free tier (500MB DB) |
| OpenAI gpt-4o | 종량제 | ~$0.01/호출 |
| Wolfram Alpha | 월 $0 | Free tier (2,000 calls) |
| Vercel | 월 $0 | Free tier (2개 앱) |
| **합계** | **월 ~$20** | PoC 기준 |

### 8.2 프로덕션 확장 시

| 규모 | 학생 수 | 예상 LLM 비용 | 인프라 |
|------|---------|---------------|--------|
| Phase 1 | 100명 | ~$50/월 | VPS 1대 |
| Phase 2 | 1,000명 | ~$300/월 | VPS 2대 |
| Phase 3 | 10,000명 | ~$2,000/월 | K8s 클러스터 |

---

## 9. 프로덕션 로드맵

### 9.1 PoC → 프로덕션 확장 계획

```
Pre-POC (현재, 완료):
  ✅ AI Tutor 개인화 튜터링
  ✅ AI Teacher 4대 기능
  ✅ 교사-학생 과제 연계
  ✅ 데이터 순환 (채점→Mem0→리포트)

POC Phase 1 (100명):
  □ NEIS 연동 (학생 데이터 자동 연계)
  □ 학급 대시보드 (성적 분포, 약점 히트맵)
  □ 영어 과목 확장 (대화형 학습)
  □ 수학 오답노트 자동 생성

POC Phase 2 (1,000명):
  □ Multi-agent 오케스트레이션
  □ 학부모 리포트 자동 발송
  □ OCR 기반 답안 인식
  □ 실시간 스트리밍 응답 (SSE)

프로덕션 (10,000명):
  □ K-소버린 LLM 연계
  □ 에듀파인 행정업무 연동
  □ 수업녹음 요약 (STT)
  □ 전국 단위 약점 분석 리포트
```

---

## 10. 차별점

### 10.1 기존 교육 AI vs 우리 솔루션

| | 기존 AI 교육 도구 | 우리 솔루션 |
|---|---|---|
| 개인화 | 수준별 반 배정 (3단계) | 학생별 실시간 개인화 (무제한) |
| 교사 지원 | 채점 자동화만 | 리포트+교안+출제+채점 전체 |
| 데이터 활용 | 시험 점수만 | 대화 패턴+실수 유형+학습 선호 |
| 기억 | 세션 단위 (매번 리셋) | 영구 기억 (Mem0 장기 축적) |
| 연계 | 교사-학생 분리 | 교사↔학생 데이터 순환 |
| 비용 | 고가 SaaS | 오픈소스 기반 월 $20 |

### 10.2 핵심 기술 우위

1. **이중 메모리 아키텍처:** Mem0(장기) + Chat Memory(단기)로 진짜 "기억하는 AI"
2. **데이터 순환:** 채점→Mem0→리포트→교안 자동 반영 (수동 개입 불필요)
3. **IF 분기 라우팅:** 과제 유무에 따라 Agent 행동 자동 전환 (수학 선생님 vs 시험 감독관)
4. **Self-hosted 핵심 인프라:** n8n + Mem0 자체 호스팅으로 데이터 주권 확보