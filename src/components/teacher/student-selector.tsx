'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StudentProfile } from '@/lib/types/student'

interface StudentSelectorProps {
  students: StudentProfile[]
  value: string
  onChange: (studentId: string) => void
  placeholder?: string
}

export function StudentSelector({
  students,
  value,
  onChange,
  placeholder = '학생을 선택하세요',
}: StudentSelectorProps) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {students.map((student) => (
          <SelectItem key={student.user_id} value={student.user_id}>
            {student.avatar_emoji} {student.display_name} ({student.level},{' '}
            {student.score_range})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
