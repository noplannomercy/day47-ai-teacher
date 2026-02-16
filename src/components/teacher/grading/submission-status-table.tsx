'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SubmissionWithStudent } from '@/lib/types/student'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface SubmissionStatusTableProps {
  submissions: SubmissionWithStudent[]
  onViewResult: (submission: SubmissionWithStudent) => void
}

const STATUS_CONFIG = {
  pending: { icon: '⏳', label: '미제출', variant: 'secondary' as const },
  submitted: { icon: '📤', label: '제출됨', variant: 'default' as const },
  graded: { icon: '✅', label: '채점 완료', variant: 'default' as const },
}

export default function SubmissionStatusTable({
  submissions,
  onViewResult,
}: SubmissionStatusTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        제출 현황을 불러올 수 없습니다
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>학생</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>제출일시</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => {
          const statusConfig =
            STATUS_CONFIG[submission.status as keyof typeof STATUS_CONFIG] ||
            STATUS_CONFIG.pending

          return (
            <TableRow key={submission.id}>
              {/* Student */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{submission.student_avatar}</span>
                  <div>
                    <div className="font-medium">{submission.student_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {submission.student_level}
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.icon} {statusConfig.label}
                </Badge>
              </TableCell>

              {/* Submission Date */}
              <TableCell>
                {submission.submitted_at ? (
                  <div className="text-sm">
                    {format(new Date(submission.submitted_at), 'M월 d일 HH:mm', {
                      locale: ko,
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                {submission.status === 'graded' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewResult(submission)}
                  >
                    결과 보기
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
