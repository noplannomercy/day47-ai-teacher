import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentProfiles, getTeacherProfile, getReportHistory } from '@/lib/api/supabase-queries'
import { ReportPageClient } from './report-page-client'

export default async function ReportPage() {
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
    getReportHistory(user.id),
  ])

  // Redirect if not a teacher
  if (!teacher) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <ReportPageClient
        students={students}
        teacher={teacher}
        history={history}
        teacherId={user.id}
      />
    </div>
  )
}
