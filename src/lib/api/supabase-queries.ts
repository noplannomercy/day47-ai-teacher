import { createClient } from '@/lib/supabase/client'
import type {
  StudentProfile,
  TeacherProfile,
  ReportHistory,
  ExamHistory,
  LessonHistory,
  GradingHistory,
  Assignment,
  SubmissionWithStudent,
} from '@/lib/types/student'

/**
 * Get all student profiles
 * Ordered by level
 */
export async function getStudentProfiles(): Promise<StudentProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .order('level')

  if (error) throw error
  return data || []
}

/**
 * Get teacher profile by user ID
 *
 * @param userId - Teacher's user ID
 */
export async function getTeacherProfile(
  userId: string
): Promise<TeacherProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw error
  }
  return data
}

/**
 * Get report history for a teacher
 *
 * @param teacherId - Teacher's user ID
 * @param limit - Maximum number of reports to return
 */
export async function getReportHistory(
  teacherId: string,
  limit = 10
): Promise<ReportHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teacher_reports')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get exam history for a teacher
 *
 * @param teacherId - Teacher's user ID
 * @param limit - Maximum number of exams to return
 */
export async function getExamHistory(
  teacherId: string,
  limit = 10
): Promise<ExamHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teacher_exams')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get lesson plan history for a teacher
 *
 * @param teacherId - Teacher's user ID
 * @param limit - Maximum number of lesson plans to return
 */
export async function getLessonHistory(
  teacherId: string,
  limit = 10
): Promise<LessonHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teacher_lesson_plans')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get grading history for a teacher
 *
 * @param teacherId - Teacher's user ID
 * @param limit - Maximum number of gradings to return
 */
export async function getGradingHistory(
  teacherId: string,
  limit = 10
): Promise<GradingHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teacher_gradings')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get student profile by user ID
 *
 * @param userId - Student's user ID
 */
export async function getStudentProfile(
  userId: string
): Promise<StudentProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw error
  }
  return data
}

/**
 * Assign exam to all students as assignment
 *
 * @param teacherId - Teacher's user ID
 * @param examContent - Exam content from n8n
 * @returns Number of students assigned
 */
export async function assignExamToStudents(
  teacherId: string,
  examContent: string
): Promise<number> {
  const supabase = createClient()

  // 1. Get latest exam ID
  const { data: latestExam, error: examError } = await supabase
    .from('teacher_exams')
    .select('id')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (examError) throw new Error('최근 시험을 찾을 수 없습니다')

  // 2. Get all students
  const { data: students, error: studentsError } = await supabase
    .from('student_profiles')
    .select('user_id')

  if (studentsError) throw studentsError
  if (!students || students.length === 0) {
    throw new Error('학생이 없습니다')
  }

  const studentIds = students.map((s) => s.user_id)

  // 3. Insert assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('teacher_assignments')
    .insert({
      teacher_id: teacherId,
      exam_id: latestExam.id,
      exam_content: examContent,
      student_ids: studentIds,
      status: 'active',
    })
    .select('id')
    .single()

  if (assignmentError) throw assignmentError

  // 4. Insert submissions for each student
  const submissions = studentIds.map((sid) => ({
    assignment_id: assignment.id,
    student_id: sid,
    answers: [],
    status: 'pending',
  }))

  const { error: submissionsError } = await supabase
    .from('student_submissions')
    .insert(submissions)

  if (submissionsError) throw submissionsError

  return studentIds.length
}

/**
 * Get assignments for a teacher
 *
 * @param teacherId - Teacher's user ID
 * @param limit - Maximum number of assignments to return
 */
export async function getAssignments(
  teacherId: string,
  limit = 10
): Promise<Assignment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get submissions for an assignment with student profile data
 *
 * @param assignmentId - Assignment ID
 */
export async function getSubmissionsWithStudents(
  assignmentId: number
): Promise<SubmissionWithStudent[]> {
  const supabase = createClient()

  // 1. Get submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('student_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)

  if (submissionsError) throw submissionsError
  if (!submissions || submissions.length === 0) return []

  // 2. Get student profiles
  const studentIds = submissions.map((s) => s.student_id)
  const { data: students, error: studentsError } = await supabase
    .from('student_profiles')
    .select('user_id, display_name, level, avatar_emoji')
    .in('user_id', studentIds)

  if (studentsError) throw studentsError

  // 3. Merge data
  const studentMap = new Map(students?.map((s) => [s.user_id, s]) || [])

  return submissions.map((sub) => ({
    ...sub,
    student_name: studentMap.get(sub.student_id)?.display_name || 'Unknown',
    student_level: studentMap.get(sub.student_id)?.level || '',
    student_avatar: studentMap.get(sub.student_id)?.avatar_emoji || '👤',
  }))
}
