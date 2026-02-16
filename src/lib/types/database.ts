export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teacher_profiles: {
        Row: {
          user_id: string
          display_name: string
          subject: string
          role: string
          created_at: string
        }
        Insert: {
          user_id: string
          display_name: string
          subject?: string
          role?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string
          subject?: string
          role?: string
          created_at?: string
        }
      }
      student_profiles: {
        Row: {
          user_id: string
          display_name: string
          level: string
          score_range: string
          avatar_emoji: string
          created_at: string
        }
        Insert: {
          user_id: string
          display_name: string
          level: string
          score_range: string
          avatar_emoji: string
          created_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string
          level?: string
          score_range?: string
          avatar_emoji?: string
          created_at?: string
        }
      }
      teacher_reports: {
        Row: {
          id: number
          teacher_id: string
          student_id: string
          report_content: string
          created_at: string
        }
        Insert: {
          teacher_id: string
          student_id: string
          report_content: string
          created_at?: string
        }
        Update: {
          teacher_id?: string
          student_id?: string
          report_content?: string
          created_at?: string
        }
      }
      teacher_exams: {
        Row: {
          id: number
          teacher_id: string
          topic: string | null
          difficulty: string | null
          exam_content: string
          student_id: string | null
          created_at: string
        }
        Insert: {
          teacher_id: string
          topic?: string | null
          difficulty?: string | null
          exam_content: string
          student_id?: string | null
          created_at?: string
        }
        Update: {
          teacher_id?: string
          topic?: string | null
          difficulty?: string | null
          exam_content?: string
          student_id?: string | null
          created_at?: string
        }
      }
      teacher_lesson_plans: {
        Row: {
          id: number
          teacher_id: string
          topic: string | null
          duration: number | null
          plan_content: string
          created_at: string
        }
        Insert: {
          teacher_id: string
          topic?: string | null
          duration?: number | null
          plan_content: string
          created_at?: string
        }
        Update: {
          teacher_id?: string
          topic?: string | null
          duration?: number | null
          plan_content?: string
          created_at?: string
        }
      }
      teacher_gradings: {
        Row: {
          id: number
          teacher_id: string
          student_id: string
          problems: Json
          grading_result: string
          total_score: number | null
          created_at: string
        }
        Insert: {
          teacher_id: string
          student_id: string
          problems: Json
          grading_result: string
          total_score?: number | null
          created_at?: string
        }
        Update: {
          teacher_id?: string
          student_id?: string
          problems?: Json
          grading_result?: string
          total_score?: number | null
          created_at?: string
        }
      }
      teacher_assignments: {
        Row: {
          id: number
          teacher_id: string
          exam_id: number | null
          exam_content: string
          student_ids: string[]
          status: string
          due_date: string | null
          created_at: string
        }
        Insert: {
          teacher_id: string
          exam_content: string
          student_ids: string[]
          exam_id?: number | null
          status?: string
          due_date?: string | null
          created_at?: string
        }
        Update: {
          teacher_id?: string
          exam_content?: string
          student_ids?: string[]
          exam_id?: number | null
          status?: string
          due_date?: string | null
          created_at?: string
        }
      }
      student_submissions: {
        Row: {
          id: number
          assignment_id: number
          student_id: string
          answers: Json
          score: number | null
          grading_result: string | null
          status: string
          submitted_at: string | null
          graded_at: string | null
          created_at: string
        }
        Insert: {
          assignment_id: number
          student_id: string
          answers?: Json
          score?: number | null
          grading_result?: string | null
          status?: string
          submitted_at?: string | null
          graded_at?: string | null
          created_at?: string
        }
        Update: {
          assignment_id?: number
          student_id?: string
          answers?: Json
          score?: number | null
          grading_result?: string | null
          status?: string
          submitted_at?: string | null
          graded_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
