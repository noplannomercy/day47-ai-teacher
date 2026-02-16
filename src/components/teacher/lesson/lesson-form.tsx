'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentMultiSelector } from '@/components/teacher/student-multi-selector'
import type { StudentProfile } from '@/lib/types/student'

interface LessonFormProps {
  students: StudentProfile[]
  onGenerate: (params: {
    topic: string
    duration: number
    studentIds: string[]
  }) => void
  isLoading?: boolean
}

export function LessonForm({ students, onGenerate, isLoading }: LessonFormProps) {
  const [topic, setTopic] = useState('이차방정식 판별식')
  const [duration, setDuration] = useState(50)
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    students.map((s) => s.user_id) // Default: all students selected
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      topic,
      duration,
      studentIds: selectedStudents,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>교안 생성</CardTitle>
        <CardDescription>
          단원과 수업 시간을 입력하면 AI가 반 약점을 반영한 교안을 생성합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic */}
          <div className="space-y-2">
            <label className="text-sm font-medium">단원</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 이차방정식 판별식"
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">수업 시간</label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30분</SelectItem>
                <SelectItem value="40">40분</SelectItem>
                <SelectItem value="45">45분</SelectItem>
                <SelectItem value="50">50분</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students */}
          <div className="space-y-2">
            <label className="text-sm font-medium">반 학생 선택</label>
            <StudentMultiSelector
              students={students}
              selectedIds={selectedStudents}
              onChange={setSelectedStudents}
            />
          </div>

          <Button
            type="submit"
            disabled={!topic || selectedStudents.length === 0 || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? '교안 생성 중...' : '교안 생성'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
