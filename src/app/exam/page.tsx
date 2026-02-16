import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentProfiles, getTeacherProfile, getExamHistory } from '@/lib/api/supabase-queries'
import { ExamPageClient } from './exam-page-client'

export default async function ExamPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/')
  }

  // Fetch initial data in parallel
  const [students, teacher, history] = await Promise.all([
    getStudentProfiles(),
    getTeacherProfile(user.id),
    getExamHistory(user.id),
  ])

  // Redirect if not a teacher
  if (!teacher) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <ExamPageClient
        students={students}
        teacher={teacher}
        history={history}
        teacherId={user.id}
      />
    </div>
  )
}
