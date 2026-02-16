'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentSelector } from '@/components/teacher/student-selector'
import type { StudentProfile } from '@/lib/types/student'

interface ExamFormProps {
  students: StudentProfile[]
  onGenerate: (params: {
    topic: string
    count: number
    difficulty: string
    studentId?: string
  }) => void
  isLoading?: boolean
}

export function ExamForm({ students, onGenerate, isLoading }: ExamFormProps) {
  const [topic, setTopic] = useState('이차방정식')
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('중')
  const [studentId, setStudentId] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      topic,
      count,
      difficulty,
      studentId: studentId || undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>시험 출제</CardTitle>
        <CardDescription>
          단원과 난이도를 입력하면 AI가 시험지, 정답지, 채점기준을 생성합니다.
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
              placeholder="예: 이차방정식, 이차함수 판별식"
              required
            />
          </div>

          {/* Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium">문제 수</label>
            <Select value={count.toString()} onValueChange={(v) => setCount(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3문제</SelectItem>
                <SelectItem value="5">5문제</SelectItem>
                <SelectItem value="10">10문제</SelectItem>
                <SelectItem value="15">15문제</SelectItem>
                <SelectItem value="20">20문제</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">난이도</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="하">하</SelectItem>
                <SelectItem value="중">중</SelectItem>
                <SelectItem value="상">상</SelectItem>
                <SelectItem value="혼합">혼합</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Student (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              학생 약점 반영 <span className="text-muted-foreground">(선택사항)</span>
            </label>
            <StudentSelector
              students={students}
              value={studentId}
              onChange={setStudentId}
              placeholder="약점을 반영할 학생 선택"
            />
          </div>

          <Button
            type="submit"
            disabled={!topic || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? '시험 출제 중...' : '시험 출제'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
