'use client'

import { useState } from 'react'
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar'
import { LoadingSpinner } from '@/components/teacher/loading-spinner'
import AssignmentList from '@/components/teacher/grading/assignment-list'
import SubmissionStatusTable from '@/components/teacher/grading/submission-status-table'
import GradingResultModal from '@/components/teacher/grading/grading-result-modal'
import { getSubmissionsWithStudents } from '@/lib/api/supabase-queries'
import { toast } from 'sonner'
import type {
  StudentProfile,
  TeacherProfile,
  Assignment,
  SubmissionWithStudent,
} from '@/lib/types/student'

interface GradingPageClientProps {
  students: StudentProfile[]
  teacher: TeacherProfile
  assignments: Assignment[]
  teacherId: string
}

export function GradingPageClient({
  students,
  teacher,
  assignments,
  teacherId,
}: GradingPageClientProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionWithStudent[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithStudent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectAssignment = async (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsLoadingSubmissions(true)
    setSubmissions([])

    try {
      const fetchedSubmissions = await getSubmissionsWithStudents(assignment.id)
      setSubmissions(fetchedSubmissions)
    } catch (error) {
      toast.error('제출 현황을 불러올 수 없습니다', {
        description: error instanceof Error ? error.message : '알 수 없는 오류',
      })
    } finally {
      setIsLoadingSubmissions(false)
    }
  }

  const handleViewResult = (submission: SubmissionWithStudent) => {
    setSelectedSubmission(submission)
    setIsModalOpen(true)
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
            <h1 className="text-3xl font-bold">과제 현황</h1>
            <p className="text-muted-foreground">
              학생 제출 현황과 AI 자동 채점 결과를 확인하세요.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Assignment List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">과제 목록</h2>
              <AssignmentList
                assignments={assignments}
                onSelectAssignment={handleSelectAssignment}
                selectedAssignmentId={selectedAssignment?.id || null}
              />
            </div>

            {/* Right Column: Submission Status Table */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">제출 현황</h2>
              {!selectedAssignment ? (
                <div className="p-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  좌측에서 과제를 선택하세요
                </div>
              ) : isLoadingSubmissions ? (
                <LoadingSpinner message="제출 현황 불러오는 중..." />
              ) : (
                <SubmissionStatusTable
                  submissions={submissions}
                  onViewResult={handleViewResult}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Grading Result Modal */}
      <GradingResultModal
        submission={selectedSubmission}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
