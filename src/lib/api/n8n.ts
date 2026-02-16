import type { N8nResponse, N8nError, ExamParams, LessonParams, GradingParams } from '@/lib/types/api'

// Base n8n API error class
export class N8nApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'N8nApiError'
  }
}

/**
 * Generate student report
 *
 * @param teacherId - Teacher's user ID
 * @param studentId - Student's user ID
 * @returns Markdown report content
 */
export async function generateReport(
  teacherId: string,
  studentId: string
): Promise<string> {
  const requestBody = {
    teacher_id: teacherId,  // snake_case for n8n
    student_id: studentId,  // snake_case for n8n
  }

  console.log('🚀 Sending to n8n:', requestBody)

  const response = await fetch(process.env.NEXT_PUBLIC_N8N_REPORT_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  console.log('📡 n8n response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ n8n error:', errorText)
    throw new N8nApiError(
      `Report generation failed: ${response.statusText}`,
      response.status
    )
  }

  // Get raw response text first
  const responseText = await response.text()
  console.log('📄 Raw response:', responseText.substring(0, 200))

  // Try to parse JSON
  let data: N8nResponse
  try {
    data = JSON.parse(responseText)
    console.log('📦 n8n response data:', data)
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError)
    console.error('❌ Response was:', responseText)
    throw new N8nApiError('Failed to parse n8n response as JSON')
  }

  const result = data[0]?.output || ''

  if (!result) {
    console.warn('⚠️ Empty response from n8n')
    throw new N8nApiError('n8n returned empty response')
  }

  return result
}

/**
 * Generate exam
 *
 * @param params - Exam generation parameters
 * @returns Markdown exam content
 */
export async function generateExam(params: ExamParams): Promise<string> {
  const response = await fetch(process.env.NEXT_PUBLIC_N8N_EXAM_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacher_id: params.teacherId,    // snake_case
      topic: params.topic,
      count: params.count,
      difficulty: params.difficulty,
      student_id: params.studentId || null,  // snake_case
    }),
  })

  if (!response.ok) {
    throw new N8nApiError(
      `Exam generation failed: ${response.statusText}`,
      response.status
    )
  }

  const data: N8nResponse = await response.json()
  return data[0]?.output || ''
}

/**
 * Generate lesson plan
 *
 * @param params - Lesson generation parameters
 * @returns Markdown lesson plan content
 */
export async function generateLesson(params: LessonParams): Promise<string> {
  const response = await fetch(process.env.NEXT_PUBLIC_N8N_LESSON_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacher_id: params.teacherId,    // snake_case
      topic: params.topic,
      duration: params.duration,
      student_ids: params.studentIds,  // snake_case
    }),
  })

  if (!response.ok) {
    throw new N8nApiError(
      `Lesson generation failed: ${response.statusText}`,
      response.status
    )
  }

  const data: N8nResponse = await response.json()
  return data[0]?.output || ''
}

/**
 * Grade student problems
 *
 * @param params - Grading parameters
 * @returns Markdown grading result
 */
export async function gradeProblems(params: GradingParams): Promise<string> {
  const response = await fetch(process.env.NEXT_PUBLIC_N8N_GRADING_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacher_id: params.teacherId,    // snake_case
      student_id: params.studentId,    // snake_case
      problems: params.problems.map((p) => ({
        id: p.id,
        question: p.question,
        correct_answer: p.correctAnswer,  // snake_case
        student_answer: p.studentAnswer,  // snake_case
      })),
    }),
  })

  if (!response.ok) {
    throw new N8nApiError(
      `Grading failed: ${response.statusText}`,
      response.status
    )
  }

  const data: N8nResponse = await response.json()
  return data[0]?.output || ''
}
