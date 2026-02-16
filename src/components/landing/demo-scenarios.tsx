import { Card, CardContent } from '@/components/ui/card'

const scenarios = [
  {
    number: 1,
    title: '이중위 학생 리포트를 뽑아보세요',
    description: 'Mem0 약점이 반영됩니다.',
    icon: '📊',
  },
  {
    number: 2,
    title: '이차방정식 시험 5문제를 출제해보세요',
    description: '이중위 약점이 반영됩니다.',
    icon: '📝',
  },
  {
    number: 3,
    title: '판별식 수업 교안을 만들어보세요',
    description: '4명 전원 약점이 분석됩니다.',
    icon: '📖',
  },
  {
    number: 4,
    title: '시험 과제를 학생에게 전달해보세요',
    description: '[과제로 전달] 버튼으로 배포됩니다.',
    icon: '📤',
  },
  {
    number: 5,
    title: '과제 현황에서 채점 결과를 확인하세요',
    description: 'AI가 자동 채점한 결과가 표시됩니다.',
    icon: '📋',
  },
]

export function DemoScenarios() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          추천 데모 시나리오
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Card key={scenario.number} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-3xl">{scenario.icon}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {scenario.number}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold">{scenario.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {scenario.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
