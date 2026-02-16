'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownRenderer } from '@/components/teacher/markdown-renderer'
import { Separator } from '@/components/ui/separator'

interface LessonResultProps {
  content: string
  onReset: () => void
  onRegenerate: () => void
}

export function LessonResult({ content, onReset, onRegenerate }: LessonResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>교안 생성 결과</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lesson Plan Content */}
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
            조건 변경
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
