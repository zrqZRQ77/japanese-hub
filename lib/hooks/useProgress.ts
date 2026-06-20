// ============================================================
// 進捗管理フック
// ストレージの読み書きは progressAdapter.ts に委譲している
// 将来 Supabase に移行する時は progressAdapter.ts だけ変える
// ============================================================
'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  ExamProgress,
  LearningActivity,
  LearningActivityType,
  Question,
} from '@/lib/types'
import {
  loadProgressFromStorage,
  saveProgressToStorage,
  deleteProgressFromStorage,
} from '@/lib/storage/progressAdapter'

export function getDefaultProgress(examId: string): ExamProgress {
  return {
    version: 2,
    examId,
    completedChapters: [],
    currentChapterId: 'ch1',
    studyMinutes: 0,
    questionsAnswered: 0,
    correctRate: 0,
    streakDays: 0,
    lastStudiedAt: '',
    chapterProgress: {},
    questionProgress: {},
    rememberedCardIds: [],
    lastActivity: null,
  }
}

function normalizeProgress(examId: string, stored: Partial<ExamProgress> | null): ExamProgress {
  const defaults = getDefaultProgress(examId)
  if (!stored) return defaults

  return {
    ...defaults,
    ...stored,
    version: 2,
    examId,
    completedChapters: Array.isArray(stored.completedChapters) ? stored.completedChapters : [],
    chapterProgress: stored.chapterProgress ?? {},
    questionProgress: stored.questionProgress ?? {},
    rememberedCardIds: Array.isArray(stored.rememberedCardIds) ? stored.rememberedCardIds : [],
    lastActivity: stored.lastActivity ?? null,
  }
}

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function withStudyDay(base: ExamProgress): Pick<ExamProgress, 'streakDays' | 'lastStudiedAt'> {
  const today = new Date().toISOString().split('T')[0]
  const lastDay = base.lastStudiedAt?.split('T')[0]
  let streakDays = base.streakDays
  if (lastDay === today) {
    // 当日は変更なし
  } else if (lastDay === getPreviousDay(today)) {
    streakDays += 1
  } else {
    streakDays = 1
  }

  return { streakDays, lastStudiedAt: new Date().toISOString() }
}

function activityFor(
  type: LearningActivityType,
  chapterId: string,
  path: string,
  label: string,
): LearningActivity {
  return { type, chapterId, path, label, updatedAt: new Date().toISOString() }
}

/** React フック：進捗の読み書き */
export function useProgress(examId: string) {
  const [progress, setProgress] = useState<ExamProgress | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const loadId = window.setTimeout(() => {
      const p = normalizeProgress(examId, loadProgressFromStorage(examId))
      setProgress(p)
      setLoaded(true)
    }, 0)

    return () => window.clearTimeout(loadId)
  }, [examId])

  const update = useCallback((patch: Partial<ExamProgress>) => {
    setProgress(prev => {
      const base = prev ?? normalizeProgress(examId, loadProgressFromStorage(examId))
      const next = { ...base, ...patch }
      saveProgressToStorage(next)
      return next
    })
  }, [examId])

  const recordQuestionAnswer = useCallback((
    chapterId: string,
    chapterTitle: string,
    question: Question,
    selectedAnswer: string | string[],
    isCorrect: boolean,
    totalQuestions: number,
  ) => {
    setProgress(prev => {
      const base = prev ?? normalizeProgress(examId, loadProgressFromStorage(examId))
      const now = new Date().toISOString()
      const previousQuestion = base.questionProgress[question.id]
      const questionProgress = {
        ...base.questionProgress,
        [question.id]: {
          questionId: question.id,
          chapterId,
          questionText: question.text,
          selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          tags: question.tags ?? [],
          answeredAt: now,
        },
      }

      const previousChapter = base.chapterProgress[chapterId]
      const answeredQuestionIds = Array.from(new Set([
        ...(previousChapter?.answeredQuestionIds ?? []),
        question.id,
      ]))
      const correctQuestionIds = new Set(previousChapter?.correctQuestionIds ?? [])
      if (isCorrect) correctQuestionIds.add(question.id)
      else correctQuestionIds.delete(question.id)

      const completed = answeredQuestionIds.length >= totalQuestions
      const completedChapters = new Set(base.completedChapters)
      if (completed) completedChapters.add(chapterId)
      else completedChapters.delete(chapterId)

      const questionResults = Object.values(questionProgress)
      const correctCount = questionResults.filter(result => result.isCorrect).length
      const firstAttempt = !previousQuestion
      const studyDay = withStudyDay(base)
      const next: ExamProgress = {
        ...base,
        ...studyDay,
        completedChapters: Array.from(completedChapters),
        currentChapterId: chapterId,
        studyMinutes: base.studyMinutes + (firstAttempt ? 1 : 0),
        questionsAnswered: questionResults.length,
        correctRate: questionResults.length > 0
          ? Math.round((correctCount / questionResults.length) * 100)
          : 0,
        questionProgress,
        chapterProgress: {
          ...base.chapterProgress,
          [chapterId]: {
            chapterId,
            answeredQuestionIds,
            correctQuestionIds: Array.from(correctQuestionIds),
            totalQuestions,
            completed,
            lastStudiedAt: now,
          },
        },
        lastActivity: activityFor(
          'questions',
          chapterId,
          `/exams/${examId}/questions/${chapterId}#${question.id}`,
          `${chapterTitle}の練習問題`,
        ),
      }
      saveProgressToStorage(next)
      return next
    })
  }, [examId])

  const recordActivity = useCallback((
    type: LearningActivityType,
    chapterId: string,
    path: string,
    label: string,
  ) => {
    setProgress(prev => {
      const base = prev ?? normalizeProgress(examId, loadProgressFromStorage(examId))
      const sameRecentActivity = base.lastActivity?.path === path
        && Date.now() - new Date(base.lastActivity.updatedAt).getTime() < 60_000
      if (sameRecentActivity) return base

      const next: ExamProgress = {
        ...base,
        ...withStudyDay(base),
        currentChapterId: chapterId,
        studyMinutes: base.studyMinutes + 1,
        lastActivity: activityFor(type, chapterId, path, label),
      }
      saveProgressToStorage(next)
      return next
    })
  }, [examId])

  const setCardRemembered = useCallback((
    cardId: string,
    remembered: boolean,
    chapterId: string,
    chapterTitle: string,
  ) => {
    setProgress(prev => {
      const base = prev ?? normalizeProgress(examId, loadProgressFromStorage(examId))
      const rememberedCardIds = new Set(base.rememberedCardIds)
      if (remembered) rememberedCardIds.add(cardId)
      else rememberedCardIds.delete(cardId)

      const next: ExamProgress = {
        ...base,
        ...withStudyDay(base),
        currentChapterId: chapterId,
        rememberedCardIds: Array.from(rememberedCardIds),
        lastActivity: activityFor(
          'cards',
          chapterId,
          `/exams/${examId}/cards?chapter=${chapterId}&card=${cardId}`,
          `${chapterTitle}の知識カード`,
        ),
      }
      saveProgressToStorage(next)
      return next
    })
  }, [examId])

  const resetProgress = useCallback(() => {
    const fresh = getDefaultProgress(examId)
    deleteProgressFromStorage(examId)
    setProgress(fresh)
  }, [examId])

  return {
    progress,
    loaded,
    update,
    recordQuestionAnswer,
    recordActivity,
    setCardRemembered,
    resetProgress,
  }
}
