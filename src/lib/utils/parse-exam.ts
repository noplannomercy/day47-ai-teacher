/**
 * Count the number of problems in exam content
 * Assumes problems start with number followed by period (e.g., "1.", "2.", etc.)
 */
export function countProblemsInExam(examContent: string): number {
  const matches = examContent.match(/^\d+\./gm)
  return matches ? matches.length : 0
}

/**
 * Extract the exam section from n8n response content
 * n8n responses may include additional sections like "# 시험지", "# 해설" etc.
 * This extracts just the exam portion
 */
export function extractExamSection(content: string): string {
  const examMatch = content.match(/# 시험지\n([\s\S]*?)(?=\n# |$)/)
  return examMatch ? examMatch[1] : content
}
