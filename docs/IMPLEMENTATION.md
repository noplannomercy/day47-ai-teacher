# AI Teacher PoC Frontend Implementation Plan

## Context

This project is a **teacher-facing dashboard** for an AI Tutor PoC (Proof of Concept) in the digital textbook platform. The backend (n8n workflows + Mem0 + pgvector + Supabase) is already complete and functional. We only need to build the **frontend** that connects to these existing APIs.

**Purpose**: Demonstrate how AI can support teachers across their entire workflow - from analyzing student performance to generating customized teaching materials.

**Key Message**: "AI Tutor collects student data → Teacher leverages it immediately for reports, exams, lesson plans, and grading."

**Scope**: High school Grade 1 math (quadratic equations, functions) with 4 demo students and 1 demo teacher account.

---

## Current Project State

✅ **Already Complete:**
- Next.js 15 + TypeScript + App Router project initialized
- All dependencies installed: `@supabase/ssr`, `@supabase/supabase-js`, `katex`, `react-katex`, `react-markdown`, `remark-math`, `rehype-katex`
- shadcn/ui configured (`components.json` exists with "new-york" style)
- Tailwind CSS 4.0 setup complete
- Basic utilities (`src/lib/utils.ts` with `cn()` function)
- Backend: 4 n8n webhooks operational, Supabase tables created, demo accounts ready

❌ **Not Yet Implemented:**
- Authentication (Supabase Auth integration)
- 5 pages (landing + 4 feature pages)
- Protected routes middleware
- UI components (sidebar, forms, results)
- n8n API integration layer
- Environment variables configuration

---

## Implementation Overview

### Pages to Build (5 total)

1. **`/` (Landing)** - Public page with hero, feature cards, demo login button
2. **`/report`** - Student report generation (select student → AI generates analysis)
3. **`/exam`** - Exam creation (topic + difficulty → AI generates test with 3 tabs)
4. **`/lesson`** - Lesson plan generation (multi-student selection → AI creates 50-min plan)
5. **`/grading`** - Auto grading (dynamic problem input → AI scores + updates Mem0)

### Core Features

- **Supabase Auth**: Demo auto-login (no signup/password reset)
- **Protected Routes**: Middleware guards `/report`, `/exam`, `/lesson`, `/grading`
- **n8n Integration**: 4 webhook endpoints for AI generation
- **KaTeX Rendering**: Math formulas in markdown responses
- **History Lists**: Previous reports/exams/lessons/gradings from Supabase tables
- **Responsive Design**: Mobile-friendly with collapsible sidebar

---

## Critical Files to Create

### 1. Environment Setup

**File: `.env.local`** (critical - create first)
```env
NEXT_PUBLIC_SUPABASE_URL=https://muefuihjjihdihzjpvbk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11ZWZ1aWhqamloZGloempwdmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTA5NzIsImV4cCI6MjA4NjUyNjk3Mn0.K0Y4I3GbEujUIiZWRf8G4ed8htgcyl4__VIeUvrcFNM

NEXT_PUBLIC_N8N_REPORT_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-report
NEXT_PUBLIC_N8N_EXAM_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-exam
NEXT_PUBLIC_N8N_LESSON_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-doc
NEXT_PUBLIC_N8N_GRADING_URL=https://n8n.srv812064.hstgr.cloud/webhook/aitutor-scoring
```

### 2. Authentication & Middleware

**File: `src/middleware.ts`** - Auth guard for protected routes
- Check Supabase session on `/report/*`, `/exam/*`, `/lesson/*`, `/grading/*`
- Verify `teacher_profiles.user_id` exists (prevent student accounts from accessing)
- Redirect to `/` if unauthorized

**File: `src/lib/supabase/client.ts`** - Browser Supabase client
```typescript
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `src/lib/supabase/server.ts`** - Server-side Supabase client
- Use `createServerClient` from `@supabase/ssr`
- Handle cookies properly for SSR

### 3. Type Definitions

**File: `src/lib/types/database.ts`** - Supabase table types
- `teacher_profiles`: `{ user_id, display_name, subject, role, created_at }`
- `student_profiles`: `{ user_id, display_name, level, score_range, avatar_emoji, created_at }`
- `teacher_reports`, `teacher_exams`, `teacher_lesson_plans`, `teacher_gradings`

**File: `src/lib/types/api.ts`** - n8n request/response types
- `N8nResponse = Array<{ output: string }>`

### 4. API Integration Layer

**File: `src/lib/api/n8n.ts`** - n8n webhook functions
```typescript
export async function generateReport(teacherId: string, studentId: string): Promise<string>
export async function generateExam(params: { teacherId, topic, count, difficulty, studentId? }): Promise<string>
export async function generateLesson(params: { teacherId, topic, duration, studentIds }): Promise<string>
export async function gradeProblems(params: { teacherId, studentId, problems }): Promise<string>
```

**File: `src/lib/api/supabase-queries.ts`** - Supabase query helpers
```typescript
export async function getStudentProfiles(): Promise<StudentProfile[]>
export async function getTeacherProfile(userId: string): Promise<TeacherProfile | null>
export async function getReportHistory(teacherId: string, limit?: number): Promise<ReportHistory[]>
// Similar for exam/lesson/grading history
```

### 5. Shared Components

**File: `src/components/teacher/teacher-sidebar.tsx`**
- Navigation: 4 menu items (📊 Report, 📝 Exam, 📖 Lesson, ✅ Grading)
- Teacher name display (from `teacher_profiles`)
- Logout button (calls `supabase.auth.signOut()`)
- Responsive: Desktop fixed, mobile Sheet drawer

**File: `src/components/teacher/student-selector.tsx`**
- Single student dropdown using shadcn `<Select>`
- Display format: `{emoji} {name} ({level}, {score_range})`
- Example: "🏆 김상위 (상위, 90+)"

**File: `src/components/teacher/student-multi-selector.tsx`**
- Multi-student checkbox selection for lesson page
- Uses shadcn `<Checkbox>`
- Default: all students selected

**File: `src/components/teacher/markdown-renderer.tsx`** - CRITICAL
- Renders markdown with KaTeX math support
- Uses `react-markdown` + `remark-math` + `rehype-katex`
- Import KaTeX CSS: `import 'katex/dist/katex.min.css'`
- Handles inline (`$...$`) and block (`$$...$$`) math

**File: `src/components/teacher/loading-spinner.tsx`**
- Shows during n8n API calls (10-20 seconds)
- Display message: "AI가 {작업} 중... (약 10초 소요)"

**File: `src/components/teacher/history-list.tsx`**
- Display previous reports/exams/lessons/gradings
- Format: Date + summary/topic
- Click to view full content

### 6. shadcn/ui Components to Install

Run these commands to add shadcn components:
```bash
npx shadcn@latest add button card input select tabs checkbox separator badge scroll-area skeleton toast textarea dropdown-menu avatar sheet
```

### 7. Page Implementations

#### Landing Page: `src/app/page.tsx`
**Sections:**
1. Hero - Title + subtitle + "교사 로그인" button
2. 4 Feature Cards - Report/Exam/Lesson/Grading with time savings
3. Data Flow Diagram - Visual showing Mem0 → Teacher → Student cycle
4. Demo Login Section - Auto-login button for `teacher-kim@demo.com`
5. Demo Scenarios - 5 recommended walkthrough scenarios
6. Tech Stack - Mem0/pgvector/Wolfram/RDB explanation cards

**Auto-login handler (client component):**
```typescript
'use client'
async function handleAutoLogin() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: 'teacher-kim@demo.com',
    password: 'demo1234',
  })
  if (!error) router.push('/report')
}
```

#### Report Page: `src/app/report/page.tsx`
**Layout:** Sidebar + Main
**Flow:**
1. Server component fetches students + teacher profile + history
2. Client component handles form (student selection → generate button)
3. Loading state during n8n call (10s)
4. Result: Markdown with KaTeX (sections: 개요/강점/약점/활동/성장/권고사항)
5. History list on the side

**Components:**
- `<ReportForm>` - Student selector + generate button
- `<ReportResult>` - MarkdownRenderer + action buttons

#### Exam Page: `src/app/exam/page.tsx`
**Form inputs:**
- Topic (text): "이차방정식"
- Count (select): 3, 5, 10, 15, 20
- Difficulty (select): 하, 중, 상, 혼합
- Student (optional): Reflect student weaknesses

**Result:** 3 tabs using shadcn `<Tabs>`
- Tab 1: 시험지 (problems only)
- Tab 2: 정답지 (answers + explanations)
- Tab 3: 채점기준 (rubric + partial credit)

**Components:**
- `<ExamForm>` - 4 inputs + generate button
- `<ExamResultTabs>` - Tabs with KaTeX rendering

#### Lesson Page: `src/app/lesson/page.tsx`
**Form inputs:**
- Topic (text): "이차방정식 판별식"
- Duration (select): 30, 40, 45, 50 minutes
- Students (multi-checkbox): All 4 students (default all selected)

**Result:** Lesson plan markdown
- Sections: 반 약점 분석 / 도입 / 전개 / 활동 / 정리

**Components:**
- `<LessonForm>` - Topic + duration + StudentMultiSelector
- `<LessonResult>` - MarkdownRenderer

#### Grading Page: `src/app/grading/page.tsx`
**Form:**
- Student selection (dropdown)
- Dynamic problem rows (add/remove, min 1, max 10)
- Each row: Problem ID (optional) | Question | Correct Answer | Student Answer

**Result:**
- Grading table (문제/정답/학생답/점수/판정)
- Oops analysis (error types + explanation)
- Mem0 correlation (기존 약점 연관 분석)
- Student feedback (encouragement + improvement points)
- Mem0 update status ("새로운 약점 패턴이 Mem0에 저장되었습니다")

**Components:**
- `<GradingForm>` - Student + dynamic ProblemInputRow components
- `<GradingResult>` - Table + analysis sections

---

## Implementation Sequence (Recommended Order)

**🚨 CRITICAL: Build Verification Between Phases**

After completing each Phase, you MUST:
1. Run `npm run build`
2. Verify the build passes without errors
3. Fix any TypeScript/build errors before proceeding
4. **DO NOT move to the next Phase if build fails**

This ensures incremental progress and prevents accumulating errors.

---

### Phase 1: Foundation (Days 1-2)
1. Create `.env.local` with Supabase + n8n URLs
2. Implement Supabase client/server utilities (`src/lib/supabase/`)
3. Implement middleware auth guard (`src/middleware.ts`)
4. Create type definitions (`src/lib/types/`)
5. Install all shadcn components (button, card, select, tabs, etc.)

**✅ Verification:** Run `npm run build` → Must pass before Phase 2

---

### Phase 2: API & Shared Components (Day 2-3)
6. Implement n8n API functions (`src/lib/api/n8n.ts`) - **REMEMBER: snake_case for JSON body**
7. Implement Supabase query helpers (`src/lib/api/supabase-queries.ts`)
8. Build `TeacherSidebar` (navigation + logout)
9. Build `StudentSelector` and `StudentMultiSelector`
10. Build `MarkdownRenderer` (with KaTeX support) - CRITICAL
11. Build `LoadingSpinner` and `HistoryList`

**✅ Verification:** Run `npm run build` → Must pass before Phase 3

---

### Phase 3: Landing Page (Day 3)
12. Implement landing page (`src/app/page.tsx`)
13. Hero section + feature cards
14. Demo login auto-auth handler
15. Test auth flow: Landing → Login → Redirect to /report

**✅ Verification:** Run `npm run build` → Must pass before Phase 4

---

### Phase 4: Feature Pages (Days 4-6)
16. **Report page** (`src/app/report/page.tsx`) - Simplest, do first
17. **Exam page** (`src/app/exam/page.tsx`) - Adds tabs pattern
18. **Lesson page** (`src/app/lesson/page.tsx`) - Multi-student selection
19. **Grading page** (`src/app/grading/page.tsx`) - Most complex (dynamic form)

**✅ Verification:** Run `npm run build` after EACH page → Must pass before next page

---

### Phase 5: Polish & Testing (Days 7-8)
20. Error handling + toast notifications
21. Mobile responsive testing
22. KaTeX rendering edge cases
23. History list interactions
24. Full user flow testing (all 5 demo scenarios from SRS)

**✅ Final Verification:** Run `npm run build` → Must pass before deployment

---

## Critical Implementation Notes

### Authentication Flow
```
Landing (/) → Click "김수학 선생님으로 로그인"
  → supabase.auth.signInWithPassword('teacher-kim@demo.com', 'demo1234')
  → Middleware checks session + teacher_profiles.user_id exists
  → Redirect to /report
  → All protected pages (/report, /exam, /lesson, /grading) show sidebar + content
  → Click "로그아웃" → supabase.auth.signOut() → Redirect to /
```

### n8n API Pattern

**CRITICAL: JSON body fields MUST use snake_case**

n8n expects snake_case field names in the request body:
- ✅ `teacher_id`, `student_id`, `student_ids`
- ✅ `correct_answer`, `student_answer`
- ❌ NOT `teacherId`, `studentId`, `correctAnswer`, etc.

Function signatures can use camelCase, but the JSON body MUST be snake_case.

```typescript
// Example: generateReport function
async function generateReport(teacherId: string, studentId: string) {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacher_id: teacherId,    // snake_case in JSON
      student_id: studentId     // snake_case in JSON
    }),
  })
  const data: Array<{ output: string }> = await response.json()
  return data[0]?.output || ''
}

// Example: gradeProblems function
async function gradeProblems(params: {
  teacherId: string
  studentId: string
  problems: Array<{
    id?: string
    question: string
    correctAnswer: string
    studentAnswer: string
  }>
}) {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacher_id: params.teacherId,    // snake_case
      student_id: params.studentId,    // snake_case
      problems: params.problems.map(p => ({
        id: p.id,
        question: p.question,
        correct_answer: p.correctAnswer,  // snake_case
        student_answer: p.studentAnswer   // snake_case
      }))
    }),
  })
  const data: Array<{ output: string }> = await response.json()
  return data[0]?.output || ''
}
```

### KaTeX Rendering
- n8n returns markdown with inline math: `$x^2+5x-3=0$`
- And block math: `$$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$`
- `react-markdown` + `remark-math` + `rehype-katex` automatically handle both
- Must import KaTeX CSS: `import 'katex/dist/katex.min.css'` in root layout or component

### Server vs Client Components
- **Server Components** (default): Initial data fetching (students, teacher profile, history)
- **Client Components** (`'use client'`): Forms, n8n API calls, loading states, interactive UI
- Pattern: Server fetches initial data → passes to client component for interactivity

### State Management
- No Redux/Zustand needed (each page is independent)
- Use React `useState` for form inputs, loading states, results
- Supabase handles auth state
- Optimistic UI updates for history lists (append new item immediately)

---

## Directory Structure (After Implementation)

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (add KaTeX CSS import)
│   ├── page.tsx                      # Landing page (REWRITE completely)
│   ├── report/page.tsx               # Student report page
│   ├── exam/page.tsx                 # Exam creation page
│   ├── lesson/page.tsx               # Lesson plan page
│   └── grading/page.tsx              # Auto grading page
├── components/
│   ├── teacher/
│   │   ├── teacher-sidebar.tsx
│   │   ├── student-selector.tsx
│   │   ├── student-multi-selector.tsx
│   │   ├── markdown-renderer.tsx     # KaTeX + markdown
│   │   ├── loading-spinner.tsx
│   │   ├── history-list.tsx
│   │   ├── report/
│   │   │   ├── report-form.tsx
│   │   │   └── report-result.tsx
│   │   ├── exam/
│   │   │   ├── exam-form.tsx
│   │   │   └── exam-result-tabs.tsx
│   │   ├── lesson/
│   │   │   ├── lesson-form.tsx
│   │   │   └── lesson-result.tsx
│   │   └── grading/
│   │       ├── grading-form.tsx
│   │       ├── problem-input-row.tsx
│   │       └── grading-result.tsx
│   └── ui/                           # shadcn components (auto-generated)
├── lib/
│   ├── utils.ts                      # ✅ EXISTS (cn function)
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   └── server.ts                 # Server client (SSR)
│   ├── api/
│   │   ├── n8n.ts                    # Webhook functions
│   │   └── supabase-queries.ts       # DB query helpers
│   └── types/
│       ├── database.ts               # Supabase table types
│       ├── api.ts                    # n8n types
│       └── student.ts                # Student profile types
└── middleware.ts                     # Auth guard
```

---

## Database Tables (Already Created in Supabase)

**Teacher Tables:**
- `teacher_profiles` - Teacher info (김수학 선생님)
- `teacher_reports` - Generated reports (saved after n8n returns)
- `teacher_exams` - Generated exams
- `teacher_lesson_plans` - Generated lesson plans
- `teacher_gradings` - Grading results

**Student Tables (shared with AI Tutor):**
- `student_profiles` - 4 demo students (김상위, 이중위, 박하위, 최기초)
- `n8n_chat_histories` - Student chat logs (used by n8n internally, not by frontend)

**Note:** Frontend only queries `student_profiles` for dropdown population. All other student data (Mem0 memories, chat histories) are accessed by n8n workflows, not directly by frontend.

---

## Demo Accounts (Already Created)

**Teacher:**
- Email: `teacher-kim@demo.com`
- Password: `demo1234`
- Name: 김수학
- Subject: 수학

**Students:** (4 personas with different performance levels)
- 김상위 (상위권, 90+) - 🏆
- 이중위 (중위권, 60-80) - 📚
- 박하위 (하위권, 40-60) - ✏️
- 최기초 (기초부족, ~40) - 🌱

---

## Verification & Testing

After implementation, verify the following:

### 1. Auth Flow Test
- [ ] Landing page loads without requiring auth
- [ ] Click "김수학 선생님으로 로그인" → auto-login succeeds
- [ ] Redirect to `/report` after login
- [ ] Sidebar shows teacher name "김수학" and subject "수학"
- [ ] Logout button clears session and redirects to `/`
- [ ] Direct access to `/report` without auth redirects to `/`

### 2. Report Page Test
- [ ] Student dropdown shows 4 students with emoji + name + level
- [ ] Select "📚 이중위" → click "리포트 생성"
- [ ] Loading spinner shows "AI가 학생 데이터를 분석 중..."
- [ ] After ~10s, markdown result renders with sections (개요/강점/약점/활동/성장/권고사항)
- [ ] KaTeX math formulas render correctly (if present)
- [ ] New report appears in history list
- [ ] Click history item → displays that report

### 3. Exam Page Test
- [ ] Form has 4 inputs: topic, count (dropdown: 3/5/10/15/20), difficulty (dropdown: 하/중/상/혼합), student (optional)
- [ ] Enter "이차방정식", 5, "중", select "이중위"
- [ ] Click "시험 출제" → loading spinner
- [ ] After ~10s, 3 tabs appear: 시험지/정답지/채점기준
- [ ] Switch between tabs → each shows correct content
- [ ] KaTeX renders in all tabs
- [ ] New exam appears in history

### 4. Lesson Page Test
- [ ] Form has topic (text), duration (dropdown: 30/40/45/50), students (checkboxes with all selected by default)
- [ ] Enter "이차방정식 판별식", 50분, keep all 4 students selected
- [ ] Click "교안 생성" → loading spinner
- [ ] After ~15s, lesson plan markdown renders
- [ ] Sections include: 반 약점 분석/도입/전개/활동/정리
- [ ] New lesson appears in history

### 5. Grading Page Test
- [ ] Select student "이중위"
- [ ] Add 2 problems (click "문제 추가" once):
  - Problem 1: "2x²+5x-3=0", correct: "x=1/2, x=-3", student: "x=1/2, x=3"
  - Problem 2: "x²-2x-8=0", correct: "x=4, x=-2", student: "x=4, x=-2"
- [ ] Click "채점 실행" → loading spinner
- [ ] After ~10s, result shows:
  - Grading table with 2 rows
  - 오답 분석 (Problem 1 has error)
  - 기존 약점 연관 분석
  - 학생 피드백
  - Mem0 업데이트 상태
- [ ] New grading appears in history

### 6. Responsive Test
- [ ] Desktop (1024px+): Fixed sidebar visible
- [ ] Mobile (<1024px): Hamburger menu → Sheet drawer opens
- [ ] Forms usable on mobile
- [ ] Tables scroll horizontally if needed
- [ ] KaTeX renders correctly on mobile

### 7. End-to-End Scenario (Killer Demo)
- [ ] Grade student "이중위" with 1 incorrect problem (부호 실수)
- [ ] Immediately generate new report for "이중위"
- [ ] Report mentions the recent grading mistake
- [ ] Generate lesson plan for all students → includes "부호 처리" reinforcement
- [ ] **This proves data circulation: Grading → Mem0 → Report/Lesson**

---

## Key Dependencies (Already Installed)

- `next@16.1.6` - Next.js 15 framework
- `@supabase/ssr@^0.8.0` - Supabase SSR helpers
- `@supabase/supabase-js@^2.95.3` - Supabase client
- `katex@^0.16.28` - KaTeX math rendering
- `react-katex@^3.1.0` - React wrapper for KaTeX
- `react-markdown@^10.1.0` - Markdown renderer
- `remark-math@^6.0.0` - Markdown math plugin
- `rehype-katex@^7.0.1` - KaTeX integration for rehype
- `shadcn@^3.8.4` - shadcn/ui CLI

---

## Deployment to Vercel

### Environment Variables (Vercel Dashboard)
Set all variables from `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_N8N_REPORT_URL`
- `NEXT_PUBLIC_N8N_EXAM_URL`
- `NEXT_PUBLIC_N8N_LESSON_URL`
- `NEXT_PUBLIC_N8N_GRADING_URL`

### Build Configuration
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 20.x

### Pre-Deployment Checklist
- [ ] Local build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] All environment variables set in Vercel
- [ ] n8n webhooks accessible from internet (CORS enabled)
- [ ] Supabase RLS policies allow teacher access

### Post-Deployment Verification
- [ ] Landing page loads on production URL
- [ ] Auto-login works
- [ ] All 4 feature pages accessible
- [ ] n8n webhooks respond correctly from production
- [ ] KaTeX CSS loads correctly (no FOUC)

---

## Success Criteria

✅ **Implementation Complete When:**
1. All 5 pages render without errors
2. Auto-login flow works end-to-end
3. Protected routes enforce authentication
4. All 4 n8n webhooks integrate successfully
5. KaTeX math renders correctly in all results
6. History lists display previous work
7. Mobile responsive works (sidebar drawer, scrollable tables)
8. Error handling shows user-friendly messages
9. All 5 demo scenarios from SRS work flawlessly
10. Data circulation verified (Grading → Mem0 → Report/Lesson)

---

## Notes

- **No separate /chat page**: The 2.clarify.md mention of /chat was for the student AI Tutor project, not this teacher dashboard
- **No direct Mem0 calls**: All Mem0 access happens through n8n workflows
- **No signup/password reset**: This is a PoC with demo accounts only
- **No PDF export**: Out of scope for PoC (future enhancement)
- **No dark mode**: Single light theme (shadcn default)
- **No real-time updates**: Standard request/response pattern (n8n INSERT to DB happens async, use optimistic UI)

---

## Estimated Timeline

- **Foundation (Auth + API)**: 2 days
- **Shared Components**: 1 day
- **Landing Page**: 1 day
- **4 Feature Pages**: 4 days (1 per page)
- **Testing & Polish**: 1-2 days

**Total: 8-10 days** for a single developer working full-time.
