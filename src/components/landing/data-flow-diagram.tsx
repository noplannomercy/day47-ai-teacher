import { Card, CardContent } from '@/components/ui/card'

export function DataFlowDiagram() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          데이터 선순환 구조
        </h2>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 rounded-lg bg-blue-100 p-4">
                  <p className="font-semibold">학생 AI Tutor 대화</p>
                  <p className="text-sm text-muted-foreground">학습 패턴 수집</p>
                </div>
                <span className="text-2xl">→</span>
                <div className="flex-1 rounded-lg bg-green-100 p-4">
                  <p className="font-semibold">Mem0 약점 축적</p>
                  <p className="text-sm text-muted-foreground">개인화 데이터</p>
                </div>
              </div>

              <div className="text-2xl">↓</div>

              <div className="rounded-lg bg-purple-100 p-4">
                <p className="font-semibold">교사 리포트 조회</p>
                <p className="text-sm text-muted-foreground">
                  약점 반영 시험 출제
                </p>
              </div>

              <div className="text-2xl">↓</div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 rounded-lg bg-orange-100 p-4">
                  <p className="font-semibold">학생 과제 제출</p>
                  <p className="text-sm text-muted-foreground">AI Tutor에서 제출</p>
                </div>
                <span className="text-2xl">→</span>
                <div className="flex-1 rounded-lg bg-red-100 p-4">
                  <p className="font-semibold">자동 채점 완료</p>
                  <p className="text-sm text-muted-foreground">
                    교사 대시보드에 결과 표시
                  </p>
                </div>
              </div>

              <div className="text-2xl">↓</div>

              <div className="rounded-lg bg-yellow-100 p-4">
                <p className="font-semibold">Mem0에 새 약점 축적</p>
                <p className="text-sm text-muted-foreground">
                  AI Tutor 개인화 강화 → (반복)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
