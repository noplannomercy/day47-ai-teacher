'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface DemoLoginSectionProps {
  onLogin: () => void
  isLoading?: boolean
}

export function DemoLoginSection({ onLogin, isLoading }: DemoLoginSectionProps) {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-bold">데모 체험</h2>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>교사 계정</CardTitle>
            <CardDescription>
              바로 시작해보세요 (회원가입 불필요)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  김
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">김수학 선생님</p>
                <p className="text-sm text-muted-foreground">
                  수학 · teacher-kim@demo.com
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '로그인 중...' : '김수학 선생님으로 로그인'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
