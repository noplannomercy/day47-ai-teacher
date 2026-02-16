import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentProfiles, getTeacherProfile, getLessonHistory } from '@/lib/api/supabase-queries'
import { LessonPageClient } from './lesson-page-client'

export default async function LessonPage() {
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
    getLessonHistory(user.id),
  ])

  // Redirect if not a teacher
  if (!teacher) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <LessonPageClient
        students={students}
        teacher={teacher}
        history={history}
        teacherId={user.id}
      />
    </div>
  )
}
