import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentProfiles, getTeacherProfile, getAssignments } from '@/lib/api/supabase-queries'
import { GradingPageClient } from './grading-page-client'

export default async function GradingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/')
  }

  // Fetch initial data in parallel
  const [students, teacher, assignments] = await Promise.all([
    getStudentProfiles(),
    getTeacherProfile(user.id),
    getAssignments(user.id),
  ])

  // Redirect if not a teacher
  if (!teacher) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <GradingPageClient
        students={students}
        teacher={teacher}
        assignments={assignments}
        teacherId={user.id}
      />
    </div>
  )
}
