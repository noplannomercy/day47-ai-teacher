'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureCards } from '@/components/landing/feature-cards'
import { DataFlowDiagram } from '@/components/landing/data-flow-diagram'
import { DemoLoginSection } from '@/components/landing/demo-login-section'
import { DemoScenarios } from '@/components/landing/demo-scenarios'
import { TechStackSection } from '@/components/landing/tech-stack-section'
import { DocumentDownloadSection } from '@/components/landing/document-download-section'
import { toast } from 'sonner'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAutoLogin = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Auto-login with demo teacher account
      const { error } = await supabase.auth.signInWithPassword({
        email: 'teacher-kim@demo.com',
        password: 'demo1234',
      })

      if (error) {
        toast.error('로그인 실패', {
          description: error.message,
        })
        return
      }

      // Success - redirect to report page
      toast.success('로그인 성공', {
        description: '김수학 선생님 환영합니다!',
      })

      router.push('/report')
    } catch (error) {
      toast.error('오류 발생', {
        description: '로그인 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onLogin={handleAutoLogin} />

      {/* Feature Cards */}
      <FeatureCards />

      {/* Data Flow Diagram */}
      <DataFlowDiagram />

      {/* Demo Login */}
      <DemoLoginSection onLogin={handleAutoLogin} isLoading={isLoading} />

      {/* Demo Scenarios */}
      <DemoScenarios />

      {/* Tech Stack */}
      <TechStackSection />

      {/* Document Download */}
      <DocumentDownloadSection />

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>AI Teacher PoC - Phase 3 Frontend</p>
          <p className="mt-1">
            고등학교 1학년 수학 · 방정식·함수 단원 · 데모용 프로토타입
          </p>
        </div>
      </footer>
    </main>
  )
}
