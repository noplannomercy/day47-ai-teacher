import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const documents = [
  {
    title: 'AI Tutor PoC 기술소개서',
    description: 'AI Tutor 시스템의 기술 아키텍처와 구현 상세',
    filename: 'AI_Tutor_PoC_기술소개서.md',
    icon: '📄',
  },
  {
    title: 'AI Tutor PoC 데모가이드',
    description: 'AI Tutor 데모 시연 및 활용 가이드',
    filename: 'AI_Tutor_PoC_데모가이드.md',
    icon: '📖',
  },
]

export function DocumentDownloadSection() {
  const handleDownload = (filename: string) => {
    const link = document.createElement('a')
    link.href = `/docs/${filename}`
    link.download = filename
    link.click()
  }

  return (
    <section className="bg-gradient-to-b from-white to-blue-50 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          프로젝트 문서 다운로드
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.filename} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 text-4xl">{doc.icon}</div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {doc.description}
                </p>
                <Button
                  onClick={() => handleDownload(doc.filename)}
                  className="w-full"
                  variant="outline"
                >
                  📥 다운로드
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
