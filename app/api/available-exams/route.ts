import { NextResponse } from 'next/server'
import { getAvailableExams } from '@/lib/content/exams-loader'

export async function GET() {
  const exams = getAvailableExams()
  return NextResponse.json(exams)
}
