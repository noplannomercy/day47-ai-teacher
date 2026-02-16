'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { SubmissionWithStudent } from '@/lib/types/student'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MarkdownRenderer } from '@/components/teacher/markdown-renderer'

interface GradingResultModalProps {
  submission: SubmissionWithStudent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GradingResultModal({
  submission,
  open,
  onOpenChange,
}: GradingResultModalProps) {
  if (!submission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{submission.student_avatar}</span>
            <span>{submission.student_name}</span>
            {submission.score !== null && (
              <Badge variant="default" className="ml-2">
                {submission.score}점
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="result" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="result">채점 결과</TabsTrigger>
            <TabsTrigger value="answers">학생 답안</TabsTrigger>
          </TabsList>

          {/* Grading Result Tab */}
          <TabsContent value="result" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {submission.grading_result ? (
                <MarkdownRenderer content={submission.grading_result} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  채점 결과가 없습니다.
                </p>
              )}

              {/* Metadata */}
              <div className="mt-6 pt-4 border-t space-y-2 text-xs text-muted-foreground">
                {submission.submitted_at && (
                  <div>
                    제출 시각:{' '}
                    {format(new Date(submission.submitted_at), 'PPP p', {
                      locale: ko,
                    })}
                  </div>
                )}
                {submission.graded_at && (
                  <div>
                    채점 시각:{' '}
                    {format(new Date(submission.graded_at), 'PPP p', {
                      locale: ko,
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Student Answers Tab */}
          <TabsContent value="answers" className="mt-4">
            <ScrollArea className="h-[500px]">
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(submission.answers, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
