// n8n API Response Type
export type N8nResponse = Array<{ output: string }>

// n8n Error
export class N8nError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'N8nError'
  }
}

// Exam Generation Parameters
export interface ExamParams {
  teacherId: string
  topic: string
  count: number
  difficulty: string
  studentId?: string
}

// Lesson Generation Parameters
export interface LessonParams {
  teacherId: string
  topic: string
  duration: number
  studentIds: string[]
}

// Grading Problem
export interface GradingProblem {
  id?: string
  question: string
  correctAnswer: string
  studentAnswer: string
}

// Grading Parameters
export interface GradingParams {
  teacherId: string
  studentId: string
  problems: GradingProblem[]
}
