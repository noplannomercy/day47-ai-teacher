import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: '📊',
    title: '학생 리포트',
    description: '강점/약점/성장추세 자동 분석',
    timeSaved: '30분 → 즉시',
  },
  {
    icon: '📝',
    title: '시험 출제',
    description: '단원+난이도 입력 → 시험지+정답지+채점기준',
    timeSaved: '3~4시간 → 10분',
  },
  {
    icon: '📖',
    title: '교안 생성',
    description: '반 약점 반영 50분 수업 교안 자동 생성',
    timeSaved: '1~2시간 → 5분',
  },
  {
    icon: '📋',
    title: '과제 현황',
    description: '학생 제출 현황과 AI 자동 채점 결과 확인',
    timeSaved: '일일 확인 → 실시간 대시보드',
  },
]

export function FeatureCards() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          4대 핵심 기능
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 text-4xl">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-muted-foreground">
                  {feature.description}
                </p>
                <Badge variant="secondary" className="font-semibold">
                  {feature.timeSaved}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
