'use client'

import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  onLogin: () => void
}

export function HeroSection({ onLogin }: HeroSectionProps) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          AI 교무실 — 교사의 전체 업무를 AI가 지원합니다
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          학생 리포트, 시험 출제, 교안 생성, 자동 채점.
          <br />
          AI Tutor가 쌓은 데이터를 교사가 바로 활용합니다.
        </p>
        <Button size="lg" onClick={onLogin} className="text-lg">
          교사 로그인
        </Button>
      </div>
    </section>
  )
}
