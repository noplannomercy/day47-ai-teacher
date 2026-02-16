'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  ReportHistory,
  ExamHistory,
  LessonHistory,
  GradingHistory,
} from '@/lib/types/student'

type HistoryItem = ReportHistory | ExamHistory | LessonHistory | GradingHistory

interface HistoryListProps {
  items: HistoryItem[]
  type: 'report' | 'exam' | 'lesson' | 'grading'
  onSelect?: (item: HistoryItem) => void
  selectedId?: number | null
  className?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getItemSummary(item: HistoryItem, type: string): string {
  switch (type) {
    case 'report':
      return `학생 리포트`
    case 'exam':
      return (item as ExamHistory).topic || '시험'
    case 'lesson':
      return (item as LessonHistory).topic || '교안'
    case 'grading':
      return `채점 결과`
    default:
      return '항목'
  }
}

export function HistoryList({
  items,
  type,
  onSelect,
  selectedId,
  className,
}: HistoryListProps) {
  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">이전 기록</CardTitle>
          <CardDescription>아직 생성된 기록이 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">이전 기록</CardTitle>
        <CardDescription>{items.length}개의 항목</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4">
            {items.map((item) => {
              const isSelected = selectedId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect?.(item)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:bg-muted'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {getItemSummary(item, type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        선택됨
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
