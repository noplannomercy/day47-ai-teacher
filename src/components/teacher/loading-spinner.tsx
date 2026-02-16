'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

export function LoadingSpinner({
  message = 'AI가 처리 중...',
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12',
        className
      )}
    >
      {/* Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />

      {/* Message */}
      <div className="text-center">
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">(약 10초 소요)</p>
      </div>
    </div>
  )
}
