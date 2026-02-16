'use client'

import { useState } from 'react'
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar'
import { LessonForm } from '@/components/teacher/lesson/lesson-form'
import { LessonResult } from '@/components/teacher/lesson/lesson-result'
import { LoadingSpinner } from '@/components/teacher/loading-spinner'
import { HistoryList } from '@/components/teacher/history-list'
import { generateLesson } from '@/lib/api/n8n'
import { toast } from 'sonner'
import type { StudentProfile, TeacherProfile, LessonHistory } from '@/lib/types/student'

interface LessonPageClientProps {
  students: StudentProfile[]
  teacher: TeacherProfile
  history: LessonHistory[]
  teacherId: string
}

export function LessonPageClient({
  students,
  teacher,
  history: initialHistory,
  teacherId,
}: LessonPageClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currentParams, setCurrentParams] = useState<any>(null)
  const [history, setHistory] = useState(initialHistory)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)

  const handleGenerate = async (params: {
    topic: string
    duration: number
    studentIds: string[]
  }) => {
    setIsLoading(true)
    setCurrentParams(params)
    setResult(null)
    setSelectedHistoryId(null)

    try {
      const lessonContent = await generateLesson({
        teacherId,
        topic: params.topic,
        duration: params.duration,
        studentIds: params.studentIds,
      })

      setResult(lessonContent)

      // Optimistic update: add to history
      const newLesson: LessonHistory = {
        id: Date.now(), // Temporary ID
        teacher_id: teacherId,
        topic: params.topic,
        duration: params.duration,
        plan_content: lessonContent,
        created_at: new Date().toISOString(),
      }
      setHistory([newLesson, ...history])

      toast.success('교안 생성 완료', {
        description: 'AI가 교안을 성공적으로 생성했습니다.',
      })
    } catch (error) {
      toast.error('교안 생성 실패', {
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setCurrentParams(null)
    setSelectedHistoryId(null)
  }

  const handleRegenerate = () => {
    if (currentParams) {
      handleGenerate(currentParams)
    }
  }

  const handleSelectHistory = (item: LessonHistory | any) => {
    if ('plan_content' in item) {
      setResult(item.plan_content)
      setCurrentParams({
        topic: item.topic || '',
        duration: item.duration || 50,
        studentIds: students.map((s) => s.user_id), // Default all
      })
      setSelectedHistoryId(item.id)
    }
  }

  return (
    <>
      {/* Sidebar */}
      <TeacherSidebar
        teacherName={teacher.display_name}
        teacherSubject={teacher.subject}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">교안 생성</h1>
            <p className="text-muted-foreground">
              단원과 수업 시간을 입력하면 AI가 반 약점을 반영한 교안을 생성합니다.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Form or Result */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <LoadingSpinner message="AI가 반 학생 데이터를 분석 중..." />
              ) : result ? (
                <LessonResult
                  content={result}
                  onReset={handleReset}
                  onRegenerate={handleRegenerate}
                />
              ) : (
                <LessonForm
                  students={students}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Right Column: History */}
            <div>
              <HistoryList
                items={history}
                type="lesson"
                onSelect={handleSelectHistory}
                selectedId={selectedHistoryId}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
