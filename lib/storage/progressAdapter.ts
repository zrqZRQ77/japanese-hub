// ============================================================
// 進捗ストレージ アダプター層
//
// 【将来ユーザーシステムを追加する時の移行手順】
//
// 現在: localStorage のみ（未ログイン）
// 将来: Supabase + NextAuth.js による構成
//   - 認証:  NextAuth.js（Google/GitHub/メールログイン）
//   - DB:    Supabase（PostgreSQL）
//   - テーブル設計（現在の ExamProgress 型と1対1対応）:
//       CREATE TABLE exam_progress (
//         user_id          TEXT NOT NULL,
//         exam_id          TEXT NOT NULL,
//         completed_chapters TEXT[],
//         current_chapter_id TEXT,
//         study_minutes    INT DEFAULT 0,
//         questions_answered INT DEFAULT 0,
//         correct_rate     INT DEFAULT 0,
//         streak_days      INT DEFAULT 0,
//         last_studied_at  TIMESTAMPTZ,
//         PRIMARY KEY (user_id, exam_id)
//       );
//
// 移行時にやること:
//   1. このファイルの load/save を Supabase API 呼び出しに差し替える
//   2. useProgress.ts は一切触らない（このファイルだけ変える）
//   3. 既存の localStorage データは移行スクリプトで Supabase へ移す
//
// ============================================================

import { ExamProgress } from '@/lib/types'

const STORAGE_PREFIX = 'shikaku-navi:progress:'

function getKey(examId: string) {
  return `${STORAGE_PREFIX}${examId}`
}

// ── ここから下が「将来 Supabase に差し替えるゾーン」 ──────────

/**
 * 進捗を読み込む
 * 【将来】: supabase.from('exam_progress').select().eq('user_id', userId).eq('exam_id', examId)
 */
export function loadProgressFromStorage(examId: string): Partial<ExamProgress> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(getKey(examId))
    if (!raw) return null
    return JSON.parse(raw) as Partial<ExamProgress>
  } catch {
    return null
  }
}

/**
 * 進捗を保存する
 * 【将来】: supabase.from('exam_progress').upsert({ user_id: userId, ...progress })
 */
export function saveProgressToStorage(progress: ExamProgress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getKey(progress.examId), JSON.stringify(progress))
  } catch {
    // quota exceeded は無視
  }
}

/**
 * 進捗をリセットする
 * 【将来】: supabase.from('exam_progress').delete().eq('user_id', userId).eq('exam_id', examId)
 */
export function deleteProgressFromStorage(examId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(getKey(examId))
  } catch {
    // ignore
  }
}
