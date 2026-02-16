# AI Teacher PoC - Project Guide

## 프로젝트 개요

교사용 AI 대시보드 - 학생 리포트, 시험 출제, 교안 생성, 자동 채점 기능을 제공하는 PoC 프론트엔드

**핵심 메시지:** "AI Tutor가 쌓은 학생 데이터를 교사가 즉시 활용"

## 기술 스택

- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI:** shadcn/ui + Tailwind CSS 4.0
- **Auth:** Supabase Auth (SSR)
- **Math Rendering:** KaTeX (react-katex + react-markdown)
- **Backend:** n8n webhooks (이미 완성됨)
- **Database:** Supabase PostgreSQL + pgvector
- **Memory:** Mem0 (n8n에서만 접근)

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 랜딩 페이지
│   ├── report/            # 학생 리포트
│   ├── exam/              # 시험 출제
│   ├── lesson/            # 교안 생성
│   └── grading/           # 자동 채점
├── components/
│   ├── teacher/           # 교사용 컴포넌트
│   └── ui/                # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase/          # Supabase 클라이언트
│   ├── api/               # n8n + Supabase 쿼리
│   └── types/             # TypeScript 타입
└── middleware.ts          # Auth guard
```

## 중요 문서

- **[SRS.md](./docs/SRS.md)** - 전체 요구사항 명세
- **[IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)** - 상세 구현 계획

## 환경 변수

`.env.local` 파일 필요 (`.env.example` 참고):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_N8N_REPORT_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-report
NEXT_PUBLIC_N8N_EXAM_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-exam
NEXT_PUBLIC_N8N_LESSON_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-doc
NEXT_PUBLIC_N8N_GRADING_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-scoring
```

## 데모 계정

**교사:**
- 이메일: `teacher-kim@demo.com`
- 비밀번호: `demo1234`
- 이름: 김수학 선생님

**학생:** 4명 (김상위, 이중위, 박하위, 최기초)

## 핵심 아키텍처 결정

### 1. n8n API 통신

**🚨 CRITICAL: JSON body는 반드시 snake_case 사용**

```typescript
// ✅ 올바름
fetch(url, {
  body: JSON.stringify({
    teacher_id: teacherId,  // snake_case
    student_id: studentId,  // snake_case
    correct_answer: answer  // snake_case
  })
})

// ❌ 틀림
fetch(url, {
  body: JSON.stringify({
    teacherId: teacherId,   // camelCase는 n8n에서 인식 안 됨
  })
})
```

함수 시그니처는 camelCase 사용해도 되지만, 전송하는 JSON body는 **무조건 snake_case**

### 2. Server vs Client Components

- **Server Components (기본):**
  - 초기 데이터 페칭 (학생 목록, 교사 프로필, 이력)
  - 레이아웃, 정적 컨텐츠

- **Client Components (`'use client'`):**
  - 폼, 버튼, 상태 관리
  - n8n API 호출
  - 로딩/에러 상태
  - KaTeX 렌더링

### 3. 인증 흐름

```
/ (랜딩)
  → 자동 로그인 (teacher-kim@demo.com)
  → middleware 검증 (session + teacher_profiles.user_id)
  → /report 리다이렉트
  → 보호된 페이지 접근 (sidebar + 기능)
```

### 4. KaTeX 수식 렌더링

```typescript
// MarkdownRenderer에서 사용
import 'katex/dist/katex.min.css'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

<ReactMarkdown
  remarkPlugins={[remarkMath]}
  rehypePlugins={[rehypeKatex]}
>
  {content}  // $x^2 + 5x - 3 = 0$ 같은 수식 자동 렌더링
</ReactMarkdown>
```

## 개발 워크플로우

### 시작하기

```bash
npm install
npm run dev
```

### Phase별 개발 순서

**🚨 각 Phase 완료 후 반드시 `npm run build` 성공 확인**

1. **Phase 1:** Foundation (Auth, Types, API)
2. **Phase 2:** Shared Components (Sidebar, Selectors, MarkdownRenderer)
3. **Phase 3:** Landing Page
4. **Phase 4:** Feature Pages (Report → Exam → Lesson → Grading)
5. **Phase 5:** Polish & Testing

### shadcn/ui 컴포넌트 설치

```bash
npx shadcn@latest add button card input select tabs checkbox separator badge scroll-area skeleton toast textarea dropdown-menu avatar sheet
```

## 주요 제약사항

### ❌ 하지 말아야 할 것

- **Mem0 직접 호출 금지** - n8n 워크플로우에서만 접근
- **n8n_chat_histories 직접 조회 금지** - n8n 내부 전용
- **camelCase로 n8n API body 전송 금지** - 반드시 snake_case
- **빌드 실패 상태로 다음 Phase 진행 금지**

### ✅ 해야 할 것

- Server Components를 기본으로, 필요시에만 Client Components 사용
- n8n API 응답 대기 시 로딩 스피너 표시 (10-20초)
- 각 페이지에 History List 포함
- 모바일 반응형 지원 (sidebar → Sheet drawer)

## 데이터베이스 테이블

### 프론트엔드가 직접 조회하는 테이블

- `teacher_profiles` - 교사 프로필
- `student_profiles` - 학생 프로필 (드롭다운용)
- `teacher_reports` - 생성된 리포트 이력
- `teacher_exams` - 생성된 시험 이력
- `teacher_lesson_plans` - 생성된 교안 이력
- `teacher_gradings` - 채점 결과 이력

### n8n만 접근하는 테이블/시스템

- `n8n_chat_histories` - 학생 대화 이력
- `documents` (pgvector) - 문제은행
- Mem0 - 학생 학습 프로필

## 테스트 시나리오

### 킬러 데모 (데이터 순환 증명)

1. "이중위" 학생 채점 (부호 실수 오답)
2. Mem0에 오답 패턴 저장됨
3. 즉시 "이중위" 리포트 재생성
4. 리포트에 최근 채점 실수 반영 확인
5. 전체 학생 교안 생성 → "부호 처리" 보강 포함

**증명:** Grading → Mem0 → Report/Lesson 데이터 순환

## 배포 (Vercel)

```bash
npm run build  # 로컬 빌드 테스트
```

Vercel 환경 변수에 `.env.local` 내용 동일하게 설정

## 상태 관리

- **Redux/Zustand 불필요** - 각 페이지가 독립적
- **React useState** 사용 (폼, 로딩, 결과)
- **Supabase Auth** - 세션 자동 관리
- **Optimistic UI** - History 리스트 즉시 업데이트

## 참고사항

- PoC이므로 회원가입/비밀번호 재설정 없음
- PDF 다운로드 없음 (향후 기능)
- 다크모드 없음 (shadcn 기본 라이트 테마)
- 실시간 업데이트 없음 (n8n DB INSERT 비동기)

## 문제 해결

### KaTeX 렌더링 안 됨
- `katex/dist/katex.min.css` import 확인
- n8n 응답의 이스케이프 처리 확인 (`\\(` → `\(`)

### n8n API 에러
- JSON body가 snake_case인지 확인
- CORS 설정 확인 (n8n webhook)

### 빌드 에러
- TypeScript strict mode 준수
- 모든 환경 변수에 `NEXT_PUBLIC_` 접두사
- Server Component에서 `'use client'` 누락 확인

## 연락처

프로젝트 관련 문의: docs/SRS.md 참고
