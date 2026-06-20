// ============================================================
// 全站共通型定义 — 修改此文件影响所有数据结构
// ============================================================

/** 考试元数据 */
export interface ExamMeta {
  id: string           // e.g. "boki3"
  name: string         // e.g. "日商簿記3級"
  shortName: string    // e.g. "簿記3級"
  category: string     // e.g. "会計・経理"
  description: string
  totalChapters: number
  color: string        // Tailwind color key e.g. "blue"
  icon: string         // lucide icon name
  info?: ExamInfo
}

/** 章节元数据 */
export interface ChapterMeta {
  id: string           // e.g. "ch1"
  number: number
  title: string
  sections: SectionMeta[]
}

export interface SectionMeta {
  id: string           // e.g. "ch1-s1"
  number: string       // e.g. "1-1"
  title: string
}

/** 学习ガイド（MDXフロントマター） */
export interface GuideFrontmatter {
  examId: string
  chapterId: string
  chapterNumber: number
  chapterTitle: string
  sectionNumber: string
  sectionTitle: string
  updatedAt: string
}

/** 問題タイプ
 *  single    : 単一選択（既存形式、options必須、correctAnswer は "A"|"B"|"C"|"D"）
 *  multiple  : 複数選択（options必須、correctAnswer は ["A","C"] などの配列）
 *  truefalse : 正誤判定（options不要、correctAnswer は "true" | "false"）
 *  fillblank : 穴埋め  （options不要、correctAnswer は正解文字列）
 */
export type QuestionType = 'single' | 'multiple' | 'truefalse' | 'fillblank'

/** 練習問題 */
export interface Question {
  id: string
  chapterId: string
  examId: string
  type?: QuestionType          // 省略時は "single" として扱う（後方互換）
  text: string
  options?: {
    label: string              // "A" | "B" | "C" | "D"
    text: string
  }[]
  correctAnswer: string | string[]  // single/truefalse/fillblank → string、multiple → string[]
  explanation: string
  tags?: string[]
}

export interface QuestionSet {
  examId: string
  chapterId: string
  chapterTitle: string
  questions: Question[]
}

/** 知識カード */
export interface KnowledgeCard {
  id: string
  examId: string
  chapterId: string
  front: string
  back: string
  tags?: string[]
}

export interface CardSet {
  examId: string
  chapterId: string
  chapterTitle: string
  cards: KnowledgeCard[]
}

/** 学習進捗（ローカルストレージ用） */
export type LearningActivityType = 'guide' | 'questions' | 'cards'

export interface LearningActivity {
  type: LearningActivityType
  chapterId: string
  path: string
  label: string
  updatedAt: string
}

export interface QuestionProgress {
  questionId: string
  chapterId: string
  questionText: string
  selectedAnswer: string | string[]
  correctAnswer: string | string[]
  isCorrect: boolean
  tags: string[]
  answeredAt: string
}

export interface ChapterLearningProgress {
  chapterId: string
  answeredQuestionIds: string[]
  correctQuestionIds: string[]
  totalQuestions: number
  completed: boolean
  lastStudiedAt: string
}

export interface ExamProgress {
  version: 2
  examId: string
  completedChapters: string[]
  currentChapterId: string
  studyMinutes: number
  questionsAnswered: number
  correctRate: number
  streakDays: number
  lastStudiedAt: string
  chapterProgress: Record<string, ChapterLearningProgress>
  questionProgress: Record<string, QuestionProgress>
  rememberedCardIds: string[]
  lastActivity: LearningActivity | null
}

// ============================================================
// index.ts の ExamMeta に追加する型定義スニペット
// 既存の ExamMeta interface に `info?: ExamInfo` フィールドを追加してください
// ============================================================

export interface ExamBook {
  title: string
  author: string
  type: string        // 'テキスト' | 'テキスト＋問題集' | '過去問・予想問題'
  note: string
  amazonUrl: string
}

export interface ExamCourse {
  title: string
  provider: string
  note: string
  url: string
  isFree: boolean
  isAffiliate?: boolean
}

export interface ExamInfo {
  tagline: string
  difficulty: number          // 1〜5
  difficultyLabel: string
  studyHours: string
  studyMonths: string
  examFee: string
  passRate: string
  examFormat: string
  examTime: string
  officialUrl: string
  registrationNote: string
  valueAfterPass: string[]
  books: ExamBook[]
  courses: ExamCourse[]
}

// ExamMeta に追加するフィールド：
// info?: ExamInfo

// 例：
// export interface ExamMeta {
//   id: string
//   name: string
//   shortName: string
//   category: string
//   description: string
//   totalChapters: number
//   color: string
//   icon: string
//   info?: ExamInfo   // ← これを追加
// }
