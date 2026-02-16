'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownRenderer } from '@/components/teacher/markdown-renderer'
import { Separator } from '@/components/ui/separator'

interface ReportResultProps {
  content: string
  studentName?: string
  onReset: () => void
  onRegenerate: () => void
}

export function ReportResult({
  content,
  studentName,
  onReset,
  onRegenerate,
}: ReportResultProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {studentName ? `${studentName} 학생 리포트` : '학생 리포트'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Content */}
        <div className="rounded-lg border p-6">
          <MarkdownRenderer content={content} />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={onRegenerate} variant="default">
            다시 생성
          </Button>
          <Button onClick={onReset} variant="outline">
            다른 학생
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
