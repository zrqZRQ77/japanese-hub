// ============================================================
// 全站共通型定义 — 修改此文件影响所有数据结构
// ============================================================

/** 考试元数据 */
export interface ExamMeta {
  id: string           // e.g. "boki3"
  name: string         // e.g. "日商簿記3級"
  shortName: string    // e.g. "簿記3級"
  shortMark: string    // e.g. "BK"
  category: string     // e.g. "会計・経理"
  categorySlug: string // e.g. "accounting"
  family: string       // e.g. "簿記"
  familySlug: string   // e.g. "bookkeeping"
  description: string
  totalChapters: number
  color: string        // Tailwind color key e.g. "blue"
  icon: string         // lucide icon name
  mockExam?: ExamMockConfig
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
 *  single         : 単一選択（既存形式）
 *  multiple       : 複数選択
 *  truefalse      : 正誤判定
 *  fillblank      : 単一穴埋め
 *  account        : 勘定科目入力
 *  journal        : 仕訳入力
 *  numeric        : 数値計算
 *  table          : 表の空欄入力
 *  classification : P/L・B/Sなどの分類
 *  correction     : 誤仕訳の訂正
 */
export type QuestionType =
  | 'single'
  | 'multiple'
  | 'truefalse'
  | 'fillblank'
  | 'account'
  | 'journal'
  | 'numeric'
  | 'table'
  | 'classification'
  | 'correction'

export type PracticeInputKind = 'text' | 'account' | 'number' | 'side' | 'classification'

export interface PracticeField {
  id: string
  label: string
  kind: PracticeInputKind
  correctAnswer: string
  acceptedAnswers?: string[]
  placeholder?: string
  prefix?: string
  suffix?: string
  help?: string
}

export interface PracticeJournalRow {
  id: string
  debitAccountFieldId?: string
  debitAmountFieldId?: string
  creditAccountFieldId?: string
  creditAmountFieldId?: string
}

export interface PracticeTableCell {
  text?: string
  fieldId?: string
}

export interface PracticeTableRow {
  id: string
  label?: string
  cells: PracticeTableCell[]
}

export interface PracticeAnswerSheet {
  kind: 'fields' | 'journal' | 'table'
  fields: PracticeField[]
  journalRows?: PracticeJournalRow[]
  table?: {
    headers: string[]
    rows: PracticeTableRow[]
  }
  submitLabel?: string
}

export interface PracticeGuideLink {
  href: string
  label: string
}

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
  correctAnswer: string | string[]  // 選択式はラベル、非選択式は各入力欄の代表解答
  explanation: string
  tags?: string[]
  practiceSheet?: PracticeAnswerSheet
  explanationSteps?: string[]
  commonMistakes?: string[]
  guideLink?: PracticeGuideLink
}

export interface QuestionSet {
  examId: string
  chapterId: string
  chapterTitle: string
  questions: Question[]
}

export interface ExamMaterial {
  kind: 'transaction' | 'table'
  title: string
  lead?: string
  rows: string[][]
  note?: string
}

export interface AnswerBlank {
  id: string
  label: string
  answer: string
  suffix?: string
}

export interface JournalLine {
  id: string
  side: '借方' | '貸方'
  account: string
  amount: string
}

export interface ExamAnswerSheet {
  kind: 'journal' | 'blanks'
  lines?: JournalLine[]
  blanks?: AnswerBlank[]
}

export interface MockExamQuestion extends Question {
  material?: ExamMaterial
  prompt?: string
  answerSheet?: ExamAnswerSheet
}

export interface MockQuestionSet {
  examId: string
  version: number
  questions: MockExamQuestion[]
}

export interface MockExamSectionBlueprint {
  id: string
  title: string
  focus: string
  points: number
  count: number
}

export interface ExamMockConfig {
  status?: 'draft' | 'public'
  durationMinutes: number
  passRate: number
  sectionBlueprints?: MockExamSectionBlueprint[]
}

/** 知識カード */
export type KnowledgeCardType = '記憶' | '判断' | '手順' | '誤り診断'

export interface KnowledgeCardLink {
  href: string
  label: string
}

export interface KnowledgeCard {
  id: string
  examId: string
  chapterId: string
  front: string
  back: string
  tags?: string[]
  cardType?: KnowledgeCardType
  guideLink?: KnowledgeCardLink
  questionLink?: KnowledgeCardLink & { questionId: string }
  relatedChapterLink?: KnowledgeCardLink & { chapterId: string }
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
  bookmarkedSectionIds: string[]
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
