'use client'

import { useState } from 'react'
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar'
import { ExamForm } from '@/components/teacher/exam/exam-form'
import { ExamResultTabs } from '@/components/teacher/exam/exam-result-tabs'
import { LoadingSpinner } from '@/components/teacher/loading-spinner'
import { HistoryList } from '@/components/teacher/history-list'
import { generateExam } from '@/lib/api/n8n'
import { toast } from 'sonner'
import type { StudentProfile, TeacherProfile, ExamHistory } from '@/lib/types/student'

interface ExamPageClientProps {
  students: StudentProfile[]
  teacher: TeacherProfile
  history: ExamHistory[]
  teacherId: string
}

export function ExamPageClient({
  students,
  teacher,
  history: initialHistory,
  teacherId,
}: ExamPageClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currentParams, setCurrentParams] = useState<any>(null)
  const [history, setHistory] = useState(initialHistory)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)

  const handleGenerate = async (params: {
    topic: string
    count: number
    difficulty: string
    studentId?: string
  }) => {
    setIsLoading(true)
    setCurrentParams(params)
    setResult(null)
    setSelectedHistoryId(null)

    try {
      const examContent = await generateExam({
        teacherId,
        topic: params.topic,
        count: params.count,
        difficulty: params.difficulty,
        studentId: params.studentId,
      })

      setResult(examContent)

      // Optimistic update: add to history
      const newExam: ExamHistory = {
        id: Date.now(), // Temporary ID
        teacher_id: teacherId,
        topic: params.topic,
        difficulty: params.difficulty,
        exam_content: examContent,
        student_id: params.studentId || null,
        created_at: new Date().toISOString(),
      }
      setHistory([newExam, ...history])

      toast.success('시험 출제 완료', {
        description: 'AI가 시험을 성공적으로 출제했습니다.',
      })
    } catch (error) {
      toast.error('시험 출제 실패', {
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

  const handleSelectHistory = (item: ExamHistory | any) => {
    if ('exam_content' in item) {
      setResult(item.exam_content)
      setCurrentParams({
        topic: item.topic || '',
        difficulty: item.difficulty || '중',
        count: 5, // Default, not stored
        studentId: item.student_id || undefined,
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
            <h1 className="text-3xl font-bold">시험 출제</h1>
            <p className="text-muted-foreground">
              단원과 난이도를 입력하면 AI가 시험지, 정답지, 채점기준을 생성합니다.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Form or Result */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <LoadingSpinner message="AI가 문제를 출제 중..." />
              ) : result ? (
                <ExamResultTabs
                  content={result}
                  teacherId={teacherId}
                  onReset={handleReset}
                  onRegenerate={handleRegenerate}
                />
              ) : (
                <ExamForm
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
                type="exam"
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
