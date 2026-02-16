'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/teacher/markdown-renderer'
import { Separator } from '@/components/ui/separator'
import { assignExamToStudents } from '@/lib/api/supabase-queries'
import { toast } from 'sonner'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

interface ExamResultTabsProps {
  content: string
  teacherId: string
  onReset: () => void
  onRegenerate: () => void
}

export function ExamResultTabs({
  content,
  teacherId,
  onReset,
  onRegenerate,
}: ExamResultTabsProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [isAssigned, setIsAssigned] = useState(false)
  const [assignedCount, setAssignedCount] = useState(0)

  const handleAssign = async () => {
    setIsAssigning(true)
    try {
      const count = await assignExamToStudents(teacherId, content)
      setAssignedCount(count)
      setIsAssigned(true)
      toast.success('과제 전달 완료', {
        description: `${count}명의 학생에게 과제를 전달했습니다.`,
      })
    } catch (error) {
      toast.error('과제 전달 실패', {
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      })
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>시험 출제 결과</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="exam" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exam">시험지</TabsTrigger>
            <TabsTrigger value="answer">정답지</TabsTrigger>
            <TabsTrigger value="rubric">채점기준</TabsTrigger>
          </TabsList>

          <TabsContent value="exam" className="mt-4">
            <div className="rounded-lg border p-6">
              <MarkdownRenderer content={content} />
            </div>
          </TabsContent>

          <TabsContent value="answer" className="mt-4">
            <div className="rounded-lg border p-6">
              <MarkdownRenderer content={content} />
            </div>
          </TabsContent>

          <TabsContent value="rubric" className="mt-4">
            <div className="rounded-lg border p-6">
              <MarkdownRenderer content={content} />
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onRegenerate} variant="default">
            다시 출제
          </Button>
          <Button onClick={onReset} variant="outline">
            조건 변경
          </Button>

          {/* Assignment Button */}
          {isAssigned ? (
            <Button variant="secondary" disabled className="ml-auto">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {assignedCount}명에게 전달 완료
            </Button>
          ) : (
            <Button
              onClick={handleAssign}
              disabled={isAssigning}
              variant="default"
              className="ml-auto"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  전달 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  과제로 전달
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
