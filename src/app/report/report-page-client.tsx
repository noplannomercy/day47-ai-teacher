'use client'

import { useState } from 'react'
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar'
import { ReportForm } from '@/components/teacher/report/report-form'
import { ReportResult } from '@/components/teacher/report/report-result'
import { LoadingSpinner } from '@/components/teacher/loading-spinner'
import { HistoryList } from '@/components/teacher/history-list'
import { generateReport } from '@/lib/api/n8n'
import { toast } from 'sonner'
import type { StudentProfile, TeacherProfile, ReportHistory } from '@/lib/types/student'

interface ReportPageClientProps {
  students: StudentProfile[]
  teacher: TeacherProfile
  history: ReportHistory[]
  teacherId: string
}

export function ReportPageClient({
  students,
  teacher,
  history: initialHistory,
  teacherId,
}: ReportPageClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currentStudentId, setCurrentStudentId] = useState<string>('')
  const [history, setHistory] = useState(initialHistory)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)

  const handleGenerate = async (studentId: string) => {
    setIsLoading(true)
    setCurrentStudentId(studentId)
    setResult(null)
    setSelectedHistoryId(null)

    try {
      const reportContent = await generateReport(teacherId, studentId)

      setResult(reportContent)

      // Optimistic update: add to history
      const newReport: ReportHistory = {
        id: Date.now(), // Temporary ID
        teacher_id: teacherId,
        student_id: studentId,
        report_content: reportContent,
        created_at: new Date().toISOString(),
      }
      setHistory([newReport, ...history])

      toast.success('리포트 생성 완료', {
        description: 'AI가 학생 리포트를 성공적으로 생성했습니다.',
      })
    } catch (error) {
      toast.error('리포트 생성 실패', {
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setCurrentStudentId('')
    setSelectedHistoryId(null)
  }

  const handleRegenerate = () => {
    if (currentStudentId) {
      handleGenerate(currentStudentId)
    }
  }

  const handleSelectHistory = (item: ReportHistory | any) => {
    if ('report_content' in item) {
      setResult(item.report_content)
      setCurrentStudentId(item.student_id)
      setSelectedHistoryId(item.id)
    }
  }

  const currentStudent = students.find((s) => s.user_id === currentStudentId)

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
            <h1 className="text-3xl font-bold">학생 리포트</h1>
            <p className="text-muted-foreground">
              학생의 강점, 약점, 성장 추세를 AI가 분석합니다.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Form or Result */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <LoadingSpinner message="AI가 학생 데이터를 분석 중..." />
              ) : result ? (
                <ReportResult
                  content={result}
                  studentName={currentStudent?.display_name}
                  onReset={handleReset}
                  onRegenerate={handleRegenerate}
                />
              ) : (
                <ReportForm
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
                type="report"
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
