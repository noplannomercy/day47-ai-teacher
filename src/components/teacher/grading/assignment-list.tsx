'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Assignment } from '@/lib/types/student'
import { countProblemsInExam } from '@/lib/utils/parse-exam'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface AssignmentListProps {
  assignments: Assignment[]
  onSelectAssignment: (assignment: Assignment) => void
  selectedAssignmentId: number | null
}

export default function AssignmentList({
  assignments,
  onSelectAssignment,
  selectedAssignmentId,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          과제가 없습니다. <br />
          <span className="text-xs">
            /exam에서 시험을 출제하고 [과제로 전달] 버튼을 눌러주세요.
          </span>
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => {
        const problemCount = countProblemsInExam(assignment.exam_content)
        const isSelected = assignment.id === selectedAssignmentId
        const createdDate = format(
          new Date(assignment.created_at),
          'M월 d일',
          { locale: ko }
        )

        return (
          <Card
            key={assignment.id}
            className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
              isSelected ? 'bg-accent border-primary' : ''
            }`}
            onClick={() => onSelectAssignment(assignment)}
          >
            <div className="space-y-2">
              {/* Header: Date + Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {createdDate}
                </span>
                <Badge
                  variant={assignment.status === 'active' ? 'default' : 'secondary'}
                >
                  {assignment.status === 'active' ? '진행중' : '완료'}
                </Badge>
              </div>

              <Separator />

              {/* Problem Count */}
              <div className="text-sm font-medium">{problemCount}문제</div>

              {/* Student Submission Count (placeholder - will be updated after selecting) */}
              <div className="text-xs text-muted-foreground">
                학생 {assignment.student_ids.length}명
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
