# AI Teacher PoC — 교사용 대시보드

> **AI Tutor가 쌓은 학생 데이터를 교사가 즉시 활용**

교사용 AI 대시보드로 학생 리포트, 시험 출제, 교안 생성, 과제 현황을 제공하는 PoC 프론트엔드입니다.

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [핵심 컨셉](#-핵심-컨셉)
- [4대 핵심 기능](#-4대-핵심-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [데모 계정](#-데모-계정)
- [프로젝트 구조](#-프로젝트-구조)
- [데이터 순환 구조](#-데이터-순환-구조)
- [주요 특징](#-주요-특징)
- [AI Tutor 연계](#-ai-tutor-연계)
- [관련 문서](#-관련-문서)
- [개발 로드맵](#-개발-로드맵)

---

## 🎯 프로젝트 개요

### 배경

AI Tutor는 학생과 대화하며 **개인별 학습 데이터**를 축적합니다:
- Mem0에 약점/실수 패턴 저장
- 대화 이력 (n8n_chat_histories)
- 과제 제출 및 자동 채점 결과

하지만 교사는 이 데이터에 접근할 방법이 없었습니다.

### 솔루션

**AI Teacher**는 n8n 워크플로우를 통해:
1. **학생 리포트**: Mem0 약점 데이터 → AI 리포트 생성
2. **시험 출제**: 학생 약점 반영 → 맞춤 시험지 자동 생성
3. **교안 생성**: 반 전체 약점 분석 → 수업 교안 작성
4. **과제 현황**: 학생 제출 현황 + AI 자동 채점 결과 확인

### PoC 범위

- **대상 과목**: 고등학교 1학년 수학
- **대상 단원**: 방정식·함수 (이차방정식, 이차함수, 이차부등식, 연립방정식, 일차함수)
- **데모 교사**: 1명 (김수학 선생님)
- **데모 학생**: 4명 (성적 분포별 페르소나)

---

## 💡 핵심 컨셉

> **"AI Tutor가 쌓은 데이터 → 교사가 즉시 활용 → 다시 학생에게 전달"**

### 데이터 흐름

```
학생 AI Tutor 대화
  → Mem0 약점 축적
  → 교사가 리포트 조회 (약점 확인)
  → 약점 반영 시험 출제
  → 학생에게 과제로 전달
  → 학생이 AI Tutor에서 힌트 모드로 학습
  → 과제 제출 → AI 자동 채점
  → 채점 결과 Mem0에 축적
  → (순환 반복)
```

---

## 🚀 4대 핵심 기능

### 1️⃣ 학생 리포트 📊

**입력**: 학생 선택
**출력**: 강점/약점/성장추세 분석 리포트 (AI 생성)

```
📊 이중위 학생 리포트

# 강점
- 근의 공식을 사용할 수 있음
- 개념 이해 의지가 높음

# 약점
⚠️ 판별식 D=b²-4ac에서 c가 음수일 때 부호 실수 반복
⚠️ -4ac 계산 시 부호 변환 오류

# 추천 보강 주제
1. 부호가 있는 사칙연산 집중 연습
2. 판별식 계산 체크포인트 연습
```

**시간 절감**: 30분 작성 → **즉시**

---

### 2️⃣ 시험 출제 📝

**입력**: 주제(예: 이차방정식) + 문제 수 + 난이도 + 대상 학생
**출력**: 시험지 + 정답지 + 채점기준 (AI 생성)

```markdown
# 시험지: 이차방정식 5문제 (난이도: 중)

1. 이차방정식 x² + 3x - 10 = 0의 두 근을 구하시오.
2. ...

# 정답 및 풀이
1. x = 2 또는 x = -5
   (풀이) 인수분해: (x+5)(x-2) = 0
```

**특징**:
- 학생 약점 자동 반영 (이중위 → 부호 주의 문제 포함)
- [📤 과제로 전달] 버튼 → 학생 AI Tutor에 자동 배포

**시간 절감**: 3~4시간 → **10분**

---

### 3️⃣ 교안 생성 📖

**입력**: 주제(예: 판별식) + 수업 시간(예: 50분) + 학생 선택 (전체/개별)
**출력**: 50분 수업 교안 (AI 생성)

```markdown
# 수업 주제: 이차방정식 판별식
# 학습 목표: D=b²-4ac의 의미 이해 및 활용

## 도입 (10분)
- 이차방정식의 근 복습
- 판별식의 필요성 제시

## 전개 (30분)
⚠️ 주의: 이 반은 c가 음수일 때 -4ac 부호 실수가 많음
  → 판별식 계산 시 부호 변환 집중 설명
...
```

**특징**:
- 반 전체 약점 자동 분석 (전체 선택 시)
- 개별 학생 맞춤도 가능

**시간 절감**: 1~2시간 → **5분**

---

### 4️⃣ 과제 현황 📋

**입력**: 없음 (자동 조회)
**출력**: 과제 목록 + 학생별 제출 현황 + AI 채점 결과

```
과제 목록:
┌─────────────────────────────────┐
│ 2월 16일 | 5문제 | 학생 4명     │
│ 상태: 진행중                     │
└─────────────────────────────────┘

제출 현황:
┌──────────┬──────────┬─────────┬──────────┐
│ 학생     │ 상태     │ 제출일시│ 액션     │
├──────────┼──────────┼─────────┼──────────┤
│ 🏆 김상위│ ✅ 채점완료│ 2/16 14:30│[결과보기]│
│ 📚 이중위│ ⏳ 미제출 │    -    │    -     │
│ ✏️ 박하위│ 📤 제출됨 │ 2/16 15:00│    -     │
│ 🌱 최기초│ ⏳ 미제출 │    -    │    -     │
└──────────┴──────────┴─────────┴──────────┘
```

**특징**:
- 제출 현황 실시간 확인
- [결과 보기] → 채점 결과 + 학생 답안 + 오답 분석
- KaTeX로 수식 렌더링

**시간 절감**: 일일 확인 → **실시간 대시보드**

---

## 🛠 기술 스택

### 프론트엔드

| 레이어 | 기술 | 역할 |
|--------|------|------|
| Framework | **Next.js 15** (App Router) | React 프레임워크 |
| Language | **TypeScript** | 타입 안전성 |
| UI | **shadcn/ui + Tailwind CSS 4.0** | 컴포넌트 + 스타일링 |
| 수식 렌더링 | **KaTeX** (react-katex + react-markdown) | LaTeX 수식 표시 |
| 인증 | **Supabase Auth (SSR)** | 이메일/비밀번호 로그인 |
| 배포 | **Vercel** | 프론트엔드 호스팅 |

### 백엔드 (n8n 워크플로우)

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 워크플로우 | **n8n** (Self-hosted) | AI Agent 오케스트레이션 |
| LLM | **OpenAI gpt-4o** | AI Agent 엔진 |
| 장기 기억 | **Mem0** (Self-hosted) | 학생별 학습 프로필 |
| 벡터 DB | **Supabase pgvector** | 문제은행 RAG 검색 |
| 관계 DB | **Supabase PostgreSQL** | 학생 프로필, 리포트 이력, 과제 등 |

---

## 🏃 시작하기

### 사전 요구사항

- Node.js 18+
- Supabase 프로젝트 (무료 플랜 가능)
- n8n 워크플로우 (이미 배포됨)

### 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd day47-ai-teacher

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 및 n8n URL 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 환경 변수

`.env.local` 파일:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>

# n8n Webhooks
NEXT_PUBLIC_N8N_REPORT_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-report
NEXT_PUBLIC_N8N_EXAM_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-exam
NEXT_PUBLIC_N8N_LESSON_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-doc
NEXT_PUBLIC_N8N_GRADING_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-scoring
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

---

## 👨‍🏫 데모 계정

### 교사

- **이메일**: `teacher-kim@demo.com`
- **비밀번호**: `demo1234`
- **이름**: 김수학 선생님
- **과목**: 수학

### 학생 (4명)

| 학생 | 실력 | 특징 |
|------|------|------|
| 🏆 김상위 | 90점 이상 | 인수분해 능숙, 검산 안 함 |
| 📚 이중위 | 60~80점 | 판별식 부호 실수 반복 |
| ✏️ 박하위 | 40~60점 | 이차/일차 혼동, 부호 계산 취약 |
| 🌱 최기초 | 40점 미만 | 분배법칙 불안정, 분수 어려움 |

---

## 📂 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 랜딩 페이지
│   ├── report/            # 학생 리포트
│   ├── exam/              # 시험 출제
│   ├── lesson/            # 교안 생성
│   └── grading/           # 과제 현황 (구 자동 채점)
├── components/
│   ├── teacher/           # 교사용 컴포넌트
│   │   ├── teacher-sidebar.tsx
│   │   ├── markdown-renderer.tsx
│   │   ├── report/
│   │   ├── exam/
│   │   ├── lesson/
│   │   └── grading/
│   ├── landing/           # 랜딩 페이지 컴포넌트
│   └── ui/                # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase/          # Supabase 클라이언트
│   ├── api/               # n8n + Supabase 쿼리
│   │   ├── n8n.ts         # n8n webhook 호출
│   │   └── supabase-queries.ts
│   ├── types/             # TypeScript 타입
│   └── utils/             # 유틸리티 (parse-exam 등)
└── middleware.ts          # Auth guard
```

---

## 🔄 데이터 순환 구조

### 킬러 데모 시나리오

**목표**: AI Tutor 채점 → Mem0 축적 → 교사 리포트 반영을 증명

```
1️⃣ 학생 "이중위"로 과제 제출 (일부러 부호 틀리게)
   ↓
2️⃣ AI 자동 채점 → "부호 실수" 패턴 감지
   ↓
3️⃣ Mem0에 약점 저장 (Memory Summary → Evaluate → Add)
   ↓
4️⃣ 교사가 "이중위" 리포트 재생성
   ↓
5️⃣ 리포트에 "최근 과제에서도 부호 실수 확인됨" 반영 ✅
```

**증명**: Grading → Mem0 → Report 데이터 순환 작동!

---

## ✨ 주요 특징

### 1. Server vs Client Components

- **Server Components (기본)**:
  - 초기 데이터 페칭 (학생 목록, 교사 프로필, 이력)
  - 레이아웃, 정적 컨텐츠

- **Client Components (`'use client'`)**:
  - 폼, 버튼, 상태 관리
  - n8n API 호출
  - 로딩/에러 상태
  - KaTeX 렌더링

### 2. n8n API 통신

**🚨 CRITICAL: JSON body는 반드시 snake_case 사용**

```typescript
// ✅ 올바름
fetch(url, {
  body: JSON.stringify({
    teacher_id: teacherId,  // snake_case
    student_id: studentId,
  })
})

// ❌ 틀림 - n8n에서 인식 안 됨
fetch(url, {
  body: JSON.stringify({
    teacherId: teacherId,   // camelCase
  })
})
```

### 3. KaTeX 수식 렌더링

```typescript
import 'katex/dist/katex.min.css'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

<ReactMarkdown
  remarkPlugins={[remarkMath]}
  rehypePlugins={[rehypeKatex]}
>
  {content}  // $x^2 + 5x - 3 = 0$ 자동 렌더링
</ReactMarkdown>
```

### 4. 인증 흐름

```
/ (랜딩)
  → 자동 로그인 (teacher-kim@demo.com)
  → middleware 검증 (session + teacher_profiles.user_id)
  → /report 리다이렉트
  → 보호된 페이지 접근 (sidebar + 기능)
```

---

## 🔗 AI Tutor 연계

### 과제 전달 프로세스

```
1. 교사가 /exam에서 시험 출제
2. [📤 과제로 전달] 버튼 클릭
3. n8n이 teacher_assignments 테이블에 INSERT
4. 각 학생에 대해 student_submissions 생성 (status: pending)
5. 학생이 AI Tutor 로그인 시 "📋 과제 알림" 배너 표시
6. 학생이 질문하면 AI가 "힌트 모드"로 전환
   - "풀어줘" → "직접 풀어봐! 힌트 줄까?"
   - 개념 질문은 정상 응답
7. 학생이 [과제 제출하기] → 답안 입력
8. n8n 자동 채점 webhook 호출
9. 결과 student_submissions 업데이트 (status: graded)
10. Mem0에 오답 패턴 축적
11. 교사가 /grading에서 결과 확인
```

### IF 분기 라우팅

AI Tutor의 n8n 워크플로우:

```
Webhook → Check Assignment (SQL: pending 과제 확인)
  → Has Assignment? (IF 분기)
      ├── true → Assignment Agent (힌트만 제공)
      └── false → RAG AI Agent (자유 튜터링)
```

---

## 📚 관련 문서

프로젝트의 상세 문서는 `/public/docs`에서 확인하거나 랜딩 페이지에서 다운로드할 수 있습니다:

- **[AI_Tutor_PoC_기술소개서.md](./public/docs/AI_Tutor_PoC_기술소개서.md)**
  - 전체 시스템 아키텍처
  - ReACT Agent, Mem0, pgvector 상세
  - n8n 워크플로우 구성
  - 문제은행 구성 (30문제)
  - 설치 및 환경 구성 가이드

- **[AI_Tutor_PoC_데모가이드.md](./public/docs/AI_Tutor_PoC_데모가이드.md)**
  - 핵심 기능 3가지
  - 데모 체험 시나리오 (6가지)
  - 개인화 비교 킬러 샷
  - 프로덕션 로드맵

### 추가 문서

- **[SRS.md](./docs/SRS.md)** - 전체 요구사항 명세
- **[IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)** - 상세 구현 계획
- **[CLAUDE.md](./CLAUDE.md)** - 프로젝트 가이드 (개발자용)

---

## 🚀 개발 로드맵

### Phase별 개발 이력

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | Foundation (Auth, Types, API) | ✅ 완료 |
| Phase 2 | Shared Components (Sidebar, Markdown) | ✅ 완료 |
| Phase 3 | Landing Page | ✅ 완료 |
| Phase 4 | Feature Pages (Report/Exam/Lesson) | ✅ 완료 |
| Phase 5 | Assignment Dashboard (과제 현황) | ✅ 완료 |
| Phase 6 | Polish & Testing | 🔄 진행중 |

### 향후 계획

**Phase 7: Multi-Agent 오케스트레이션**
- 전문 Agent 분리 (Q&A, 출제, 채점)
- 문제 단위 메타데이터 관리

**Phase 8: NEIS 연동**
- 교과/비교과 평가 데이터 자동 연동
- 학생 프로필 자동 생성

**Phase 9: 교사 지원 확장**
- 학급 대시보드
- 학부모 리포트
- 전국 단위 약점 분석

---

## 🧪 테스트 시나리오

### 기본 기능 테스트

1. **로그인**: 랜딩 페이지 → [데모 시작] 클릭
2. **리포트**: /report → 학생 선택 → [리포트 생성]
3. **시험 출제**: /exam → 주제/난이도 입력 → [시험 출제]
4. **과제 전달**: 출제 후 [📤 과제로 전달] → AI Tutor 연계 확인
5. **교안 생성**: /lesson → 주제 입력 → [교안 생성]
6. **과제 현황**: /grading → 과제 선택 → 제출 현황 확인

### 킬러 데모 (데이터 순환)

```
1. "이중위" 학생으로 AI Tutor에서 과제 제출 (부호 실수)
2. AI Teacher에서 "이중위" 리포트 재생성
3. 리포트에 최근 채점 실수 반영 확인
4. 전체 학생 교안 생성 → "부호 처리" 보강 포함
```

**증명**: Grading → Mem0 → Report/Lesson 데이터 순환!

---

## 🐛 문제 해결

### KaTeX 렌더링 안 됨
- `katex/dist/katex.min.css` import 확인
- n8n 응답의 이스케이프 처리 확인

### n8n API 에러
- JSON body가 snake_case인지 확인
- CORS 설정 확인 (n8n webhook)

### 빌드 에러
- TypeScript strict mode 준수
- 모든 환경 변수에 `NEXT_PUBLIC_` 접두사
- Server Component에서 `'use client'` 누락 확인

---

## 📞 연락처

- **프로젝트**: AI Teacher PoC - Phase 5
- **범위**: 고등학교 1학년 수학 · 방정식·함수 단원
- **타입**: 데모용 프로토타입

---

## 📄 라이선스

This project is for demonstration purposes only.

---

## 🙏 Acknowledgments

- **Next.js** - React 프레임워크
- **Supabase** - 인증 및 데이터베이스
- **shadcn/ui** - UI 컴포넌트
- **n8n** - AI 워크플로우 오케스트레이션
- **OpenAI** - GPT-4o LLM
- **Mem0** - 학생 학습 프로필 관리
- **KaTeX** - 수학 수식 렌더링
