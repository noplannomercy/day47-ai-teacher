import type { Database } from './database'

// Student Profile Type
export type StudentProfile = Database['public']['Tables']['student_profiles']['Row']

// Teacher Profile Type
export type TeacherProfile = Database['public']['Tables']['teacher_profiles']['Row']

// Report History Type
export type ReportHistory = Database['public']['Tables']['teacher_reports']['Row']

// Exam History Type
export type ExamHistory = Database['public']['Tables']['teacher_exams']['Row']

// Lesson Plan History Type
export type LessonHistory = Database['public']['Tables']['teacher_lesson_plans']['Row']

// Grading History Type
export type GradingHistory = Database['public']['Tables']['teacher_gradings']['Row']

// Assignment Type
export type Assignment = Database['public']['Tables']['teacher_assignments']['Row']

// Student Submission Type
export type StudentSubmission = Database['public']['Tables']['student_submissions']['Row']

// Submission with Student Profile Data
export interface SubmissionWithStudent extends StudentSubmission {
  student_name: string
  student_level: string
  student_avatar: string
}
