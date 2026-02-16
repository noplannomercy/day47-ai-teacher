import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const techStack = [
  {
    icon: '🧠',
    title: 'Mem0',
    description: '학생의 강약점과 학습 패턴을 기억합니다',
  },
  {
    icon: '🔍',
    title: 'pgvector',
    description: '검증된 문제은행에서 시험 문제를 선택합니다',
  },
  {
    icon: '🔢',
    title: 'Wolfram',
    description: '출제 문제의 정답을 수학적으로 검증합니다',
  },
  {
    icon: '💾',
    title: 'RDB',
    description: '리포트, 시험, 교안, 채점 결과를 모두 저장합니다',
  },
]

export function TechStackSection() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          핵심 기술 아키텍처
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {techStack.map((tech) => (
            <Card key={tech.title} className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 text-5xl">{tech.icon}</div>
                <CardTitle>{tech.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tech.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
