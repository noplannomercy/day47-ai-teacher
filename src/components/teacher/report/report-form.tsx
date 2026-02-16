'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentSelector } from '@/components/teacher/student-selector'
import type { StudentProfile } from '@/lib/types/student'

interface ReportFormProps {
  students: StudentProfile[]
  onGenerate: (studentId: string) => void
  isLoading?: boolean
}

export function ReportForm({ students, onGenerate, isLoading }: ReportFormProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudent) {
      onGenerate(selectedStudent)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>학생 리포트 생성</CardTitle>
        <CardDescription>
          학생을 선택하면 AI가 강점, 약점, 성장 추세를 분석합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">학생 선택</label>
            <StudentSelector
              students={students}
              value={selectedStudent}
              onChange={setSelectedStudent}
            />
          </div>

          <Button
            type="submit"
            disabled={!selectedStudent || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? '리포트 생성 중...' : '리포트 생성'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
