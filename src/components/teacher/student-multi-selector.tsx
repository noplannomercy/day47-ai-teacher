'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { StudentProfile } from '@/lib/types/student'

interface StudentMultiSelectorProps {
  students: StudentProfile[]
  selectedIds: string[]
  onChange: (studentIds: string[]) => void
}

export function StudentMultiSelector({
  students,
  selectedIds,
  onChange,
}: StudentMultiSelectorProps) {
  const handleToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, studentId])
    } else {
      onChange(selectedIds.filter((id) => id !== studentId))
    }
  }

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onChange(students.map((s) => s.user_id))
    } else {
      onChange([])
    }
  }

  const allSelected = students.length > 0 && selectedIds.length === students.length

  return (
    <div className="space-y-3">
      {/* Select All */}
      <div className="flex items-center space-x-2 border-b pb-2">
        <Checkbox
          id="select-all"
          checked={allSelected}
          onCheckedChange={handleToggleAll}
        />
        <Label
          htmlFor="select-all"
          className="cursor-pointer font-semibold text-sm"
        >
          전체 선택
        </Label>
      </div>

      {/* Individual Students */}
      <div className="space-y-2">
        {students.map((student) => {
          const isChecked = selectedIds.includes(student.user_id)
          return (
            <div key={student.user_id} className="flex items-center space-x-2">
              <Checkbox
                id={student.user_id}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleToggle(student.user_id, checked as boolean)
                }
              />
              <Label
                htmlFor={student.user_id}
                className="cursor-pointer text-sm"
              >
                {student.avatar_emoji} {student.display_name} ({student.level},{' '}
                {student.score_range})
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
