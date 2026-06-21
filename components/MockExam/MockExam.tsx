"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  RotateCcw,
  Send,
  X,
} from 'lucide-react'
import type { Question } from '../../lib/types'

interface Props {
  initialQuestions: Question[]
  examId?: string
  examName?: string
  durationMinutes?: number
  passRate?: number
}

interface ExamMaterial {
  kind: 'transaction' | 'table'
  title: string
  lead?: string
  rows: string[][]
  note?: string
}

type AnswerValue = string | string[] | Record<string, string>

interface AnswerBlank {
  id: string
  label: string
  answer: string
  suffix?: string
}

interface JournalLine {
  id: string
  side: '借方' | '貸方'
  account: string
  amount: string
}

interface ExamAnswerSheet {
  kind: 'journal' | 'blanks'
  lines?: JournalLine[]
  blanks?: AnswerBlank[]
}

interface ExamQuestion extends Question {
  material?: ExamMaterial
  prompt?: string
  answerSheet?: ExamAnswerSheet
}

interface ExamSection {
  id: string
  title: string
  focus: string
  points: number
  questions: ExamQuestion[]
}

const SECTION_BLUEPRINTS = [
  { id: 'section-1', title: '第1問', focus: '仕訳問題', points: 45, count: 9 },
  { id: 'section-2', title: '第2問', focus: '補助簿・伝票・試算表', points: 20, count: 4 },
  { id: 'section-3', title: '第3問', focus: '決算整理・精算表', points: 35, count: 7 },
]

const BOKI3_MOCK_QUESTIONS: ExamQuestion[] = [
  {
    id: 'boki3-mock-s1-q1',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '従業員への給料支給時の源泉徴収・社会保険料預り金を含む仕訳を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 1',
      rows: [
        ['取引日', '4月25日'],
        ['内容', '従業員の給料620,000円を支給した。所得税31,000円、社会保険料58,000円を差し引き、残額を普通預金口座から振り込んだ。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 給料 620,000 / (貸) 所得税預り金 31,000・社会保険料預り金 58,000・普通預金 531,000' },
      { label: 'B', text: '(借) 給料 531,000 / (貸) 普通預金 531,000' },
      { label: 'C', text: '(借) 所得税預り金 31,000・社会保険料預り金 58,000 / (貸) 普通預金 89,000' },
      { label: 'D', text: '(借) 給料 620,000 / (貸) 未払金 620,000' },
    ],
    correctAnswer: 'A',
    explanation: '給料総額を費用計上し、差し引いた所得税・社会保険料は預り金、差額を普通預金の減少として処理します。',
    tags: ['仕訳', '預り金'],
  },
  {
    id: 'boki3-mock-s1-q2',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '差入保証金の返還と修繕費控除を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 2',
      rows: [
        ['取引日', '5月8日'],
        ['内容', '事務所の賃貸借契約を解約し、差入保証金360,000円のうち原状回復費95,000円を差し引いた残額が普通預金に入金された。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 普通預金 265,000・修繕費 95,000 / (貸) 差入保証金 360,000' },
      { label: 'B', text: '(借) 普通預金 360,000 / (貸) 差入保証金 265,000・修繕費 95,000' },
      { label: 'C', text: '(借) 差入保証金 360,000 / (貸) 普通預金 265,000・雑益 95,000' },
      { label: 'D', text: '(借) 普通預金 265,000 / (貸) 差入保証金 265,000' },
    ],
    correctAnswer: 'A',
    explanation: '返金額は普通預金、差し引かれた原状回復費は修繕費、保証金全額を貸方で取り崩します。',
    tags: ['保証金', '修繕費'],
  },
  {
    id: 'boki3-mock-s1-q3',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '税抜方式による仕入と前払金の充当を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 3',
      rows: [
        ['取引日', '6月12日'],
        ['内容', '商品330,000円(税込)を仕入れた。消費税は10%、税抜方式で処理する。注文時に支払った前払金50,000円を充当し、残額は掛けとした。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 仕入 300,000・仮払消費税 30,000 / (貸) 前払金 50,000・買掛金 280,000' },
      { label: 'B', text: '(借) 仕入 330,000 / (貸) 前払金 50,000・買掛金 280,000' },
      { label: 'C', text: '(借) 仕入 300,000・仮受消費税 30,000 / (貸) 買掛金 330,000' },
      { label: 'D', text: '(借) 買掛金 280,000・前払金 50,000 / (貸) 仕入 330,000' },
    ],
    correctAnswer: 'A',
    explanation: '税込330,000円は本体300,000円と仮払消費税30,000円に分け、前払金を取り崩して残額を買掛金にします。',
    tags: ['消費税', '前払金'],
  },
  {
    id: 'boki3-mock-s1-q4',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '備品売却時の累計額取り崩しと売却損益を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 4',
      rows: [
        ['取引日', '期首'],
        ['内容', '不用となった備品(取得原価900,000円、減価償却累計額620,000円、間接法)を250,000円で売却し、代金は月末に受け取ることにした。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 未収入金 250,000・備品減価償却累計額 620,000・固定資産売却損 30,000 / (貸) 備品 900,000' },
      { label: 'B', text: '(借) 現金 250,000・減価償却費 620,000 / (貸) 備品 870,000' },
      { label: 'C', text: '(借) 未収入金 250,000・備品減価償却累計額 620,000 / (貸) 備品 900,000・固定資産売却益 30,000' },
      { label: 'D', text: '(借) 固定資産売却損 650,000 / (貸) 備品 650,000' },
    ],
    correctAnswer: 'A',
    explanation: '帳簿価額は280,000円で売却額250,000円との差額30,000円が売却損です。代金は未収入金で処理します。',
    tags: ['固定資産', '売却損益'],
  },
  {
    id: 'boki3-mock-s1-q5',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '会社負担分を含む社会保険料納付を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 5',
      rows: [
        ['取引日', '7月10日'],
        ['内容', '社会保険料92,000円を普通預金から納付した。このうち46,000円は従業員負担分として預かっていたもので、残額は会社負担分である。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 社会保険料預り金 46,000・法定福利費 46,000 / (貸) 普通預金 92,000' },
      { label: 'B', text: '(借) 法定福利費 92,000 / (貸) 普通預金 92,000' },
      { label: 'C', text: '(借) 社会保険料預り金 92,000 / (貸) 普通預金 92,000' },
      { label: 'D', text: '(借) 給料 46,000・法定福利費 46,000 / (貸) 普通預金 92,000' },
    ],
    correctAnswer: 'A',
    explanation: '従業員負担分は預り金の減少、会社負担分は法定福利費として処理します。',
    tags: ['社会保険料', '法定福利費'],
  },
  {
    id: 'boki3-mock-s1-q6',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '貯蔵品へ振り替えていた未使用分の期首再振替を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 6',
      rows: [
        ['取引日', '期首'],
        ['内容', '前期末に未使用として貯蔵品へ振り替えていた郵便切手4,200円、収入印紙18,500円を当期首に再振替した。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 通信費 4,200・租税公課 18,500 / (貸) 貯蔵品 22,700' },
      { label: 'B', text: '(借) 貯蔵品 22,700 / (貸) 通信費 4,200・租税公課 18,500' },
      { label: 'C', text: '(借) 消耗品費 22,700 / (貸) 現金 22,700' },
      { label: 'D', text: '(借) 通信費 22,700 / (貸) 貯蔵品 22,700' },
    ],
    correctAnswer: 'A',
    explanation: '期首には前期末の貯蔵品を本来の費用勘定へ再振替します。切手は通信費、印紙は租税公課です。',
    tags: ['貯蔵品', '再振替'],
  },
  {
    id: 'boki3-mock-s1-q7',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: 'クレジット売上の手数料控除を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 7',
      rows: [
        ['取引日', '8月3日'],
        ['内容', '本日の売上高は現金売上48,000円、クレジット売上92,000円であった。クレジット会社への手数料3%は販売時に差し引いて処理する。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 現金 48,000・クレジット売掛金 89,240・支払手数料 2,760 / (貸) 売上 140,000' },
      { label: 'B', text: '(借) 現金 48,000・売掛金 92,000 / (貸) 売上 140,000' },
      { label: 'C', text: '(借) 現金 140,000 / (貸) 売上 137,240・支払手数料 2,760' },
      { label: 'D', text: '(借) クレジット売掛金 92,000 / (貸) 売上 92,000' },
    ],
    correctAnswer: 'A',
    explanation: 'クレジット手数料は92,000円×3%=2,760円。差引後をクレジット売掛金、手数料を費用にします。',
    tags: ['クレジット売上', '支払手数料'],
  },
  {
    id: 'boki3-mock-s1-q8',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '当座借越契約がある場合の支払を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 8',
      rows: [
        ['取引日', '9月14日'],
        ['内容', '買掛金260,000円を小切手を振り出して支払った。支払直前の当座預金残高は210,000円で、銀行とは当座借越契約を結んでいる。決算日ではない。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 買掛金 260,000 / (貸) 当座預金 260,000' },
      { label: 'B', text: '(借) 買掛金 260,000 / (貸) 当座預金 210,000・当座借越 50,000' },
      { label: 'C', text: '(借) 当座預金 260,000 / (貸) 買掛金 260,000' },
      { label: 'D', text: '(借) 支払手形 260,000 / (貸) 当座預金 260,000' },
    ],
    correctAnswer: 'A',
    explanation: '決算前の通常処理では当座預金勘定で処理します。当座借越への振替は決算整理で行います。',
    tags: ['当座預金', '当座借越'],
  },
  {
    id: 'boki3-mock-s1-q9',
    examId: 'boki3',
    chapterId: 'mock-s1',
    type: 'single',
    text: '手形借入時の利息差引を問う。',
    prompt: '次の取引について、もっとも適切な仕訳を選びなさい。',
    material: {
      kind: 'transaction',
      title: '取引 9',
      rows: [
        ['取引日', '10月1日'],
        ['内容', '銀行から3,000,000円を借り入れ、同額の約束手形を振り出した。借入期間は8か月、年利率3%で、利息は差し引かれ、手取額は当座預金とした。'],
      ],
    },
    options: [
      { label: 'A', text: '(借) 当座預金 2,940,000・支払利息 60,000 / (貸) 手形借入金 3,000,000' },
      { label: 'B', text: '(借) 当座預金 3,000,000 / (貸) 手形借入金 2,940,000・受取利息 60,000' },
      { label: 'C', text: '(借) 支払利息 90,000・当座預金 2,910,000 / (貸) 借入金 3,000,000' },
      { label: 'D', text: '(借) 手形借入金 3,000,000 / (貸) 当座預金 2,940,000・支払利息 60,000' },
    ],
    correctAnswer: 'A',
    explanation: '利息は3,000,000円×3%×8/12=60,000円。手取額は2,940,000円です。',
    tags: ['手形借入金', '支払利息'],
  },
  {
    id: 'boki3-mock-s2-q1',
    examId: 'boki3',
    chapterId: 'mock-s2',
    type: 'single',
    text: '商品有高帳(移動平均法)から売上総利益を求める。',
    prompt: '商品有高帳を移動平均法で記入した場合、10月の売上総利益はいくらか。',
    material: {
      kind: 'table',
      title: '商品有高帳資料',
      lead: '甲商品の10月中の取引は次のとおりである。平均単価に円未満の端数は生じない。',
      rows: [
        ['日付', '摘要', '数量', '単価', '金額'],
        ['10/1', '前月繰越', '120個', '400円', '48,000円'],
        ['10/6', '仕入', '80個', '460円', '36,800円'],
        ['10/14', '売上', '90個', '販売単価 650円', ''],
        ['10/22', '仕入', '70個', '500円', '35,000円'],
        ['10/27', '売上', '100個', '販売単価 680円', ''],
      ],
    },
    options: [
      { label: 'A', text: '47,780円' },
      { label: 'B', text: '49,600円' },
      { label: 'C', text: '52,100円' },
      { label: 'D', text: '126,500円' },
    ],
    correctAnswer: 'A',
    explanation: '10/6後の平均単価は424円、10/14払出原価38,160円。10/22後の平均単価452円、10/27払出原価45,200円。売上高126,500円から売上原価83,720円を差し引きます。',
    tags: ['商品有高帳', '移動平均法'],
  },
  {
    id: 'boki3-mock-s2-q2',
    examId: 'boki3',
    chapterId: 'mock-s2',
    type: 'single',
    text: '固定資産台帳から当期減価償却費を求める。',
    prompt: '当期の備品減価償却費の合計額として正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '固定資産台帳(抜粋)',
      lead: '決算日は3月31日。残存価額ゼロ、定額法、月割計算による。',
      rows: [
        ['資産', '取得日', '取得原価', '耐用年数', '当期使用月数'],
        ['備品A', 'X4年4月1日', '2,400,000円', '6年', '12か月'],
        ['備品B', 'X7年7月1日', '1,800,000円', '5年', '9か月'],
        ['備品C', 'X8年2月1日', '960,000円', '4年', '2か月'],
      ],
    },
    options: [
      { label: 'A', text: '710,000円' },
      { label: 'B', text: '760,000円' },
      { label: 'C', text: '820,000円' },
      { label: 'D', text: '1,032,000円' },
    ],
    correctAnswer: 'A',
    explanation: 'Aは400,000円、Bは1,800,000÷5×9/12=270,000円、Cは960,000÷4×2/12=40,000円。合計710,000円です。',
    tags: ['固定資産台帳', '減価償却'],
  },
  {
    id: 'boki3-mock-s2-q3',
    examId: 'boki3',
    chapterId: 'mock-s2',
    type: 'single',
    text: '前払家賃と支払家賃の勘定記入を問う。',
    prompt: '決算整理で前払家賃に振り替える金額として正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '家賃に関する資料',
      lead: '会計期間は4月1日から3月31日まで。家賃は6か月分を前払いする契約である。',
      rows: [
        ['日付', '内容', '金額'],
        ['4/1', '前期末に前払処理した4か月分を再振替', '480,000円'],
        ['8/1', '8月から翌年1月分を普通預金で支払', '720,000円'],
        ['2/1', '2月から7月分を普通預金で支払(月額は10%値上げ後)', '792,000円'],
      ],
    },
    options: [
      { label: 'A', text: '480,000円' },
      { label: 'B', text: '528,000円' },
      { label: 'C', text: '792,000円' },
      { label: 'D', text: '1,464,000円' },
    ],
    correctAnswer: 'B',
    explanation: '2/1支払分は6か月で792,000円なので月額132,000円。翌期分は4月から7月の4か月分、528,000円です。',
    tags: ['経過勘定', '前払家賃'],
  },
  {
    id: 'boki3-mock-s2-q4',
    examId: 'boki3',
    chapterId: 'mock-s2',
    type: 'single',
    text: '補助簿の選択を問う。',
    prompt: '次の取引を記入する補助簿の組合せとして正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '取引資料',
      rows: [
        ['日付', '取引'],
        ['11日', '商品420,000円を仕入れ、代金のうち120,000円は現金で支払い、残額は掛けとした。'],
        ['19日', '商品600,000円を売り上げ、代金のうち250,000円は得意先振出しの約束手形を受け取り、残額は掛けとした。'],
      ],
    },
    options: [
      { label: 'A', text: '仕入帳・売上帳・商品有高帳・現金出納帳・買掛金元帳・売掛金元帳・受取手形記入帳' },
      { label: 'B', text: '仕入帳・売上帳・現金出納帳のみ' },
      { label: 'C', text: '商品有高帳・支払手形記入帳・買掛金元帳のみ' },
      { label: 'D', text: '固定資産台帳・売掛金元帳・買掛金元帳' },
    ],
    correctAnswer: 'A',
    explanation: '仕入・売上はいずれも商品有高帳に関係します。現金支払、買掛金、売掛金、受取手形もそれぞれ補助簿に記入します。',
    tags: ['補助簿', '商品売買'],
  },
  {
    id: 'boki3-mock-s3-q1',
    examId: 'boki3',
    chapterId: 'mock-s3',
    type: 'single',
    text: '現金過不足と通信費の記入漏れを反映する。',
    prompt: '決算整理後の現金残高として正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '決算整理事項',
      lead: '決算整理前残高試算表の一部と整理事項は次のとおりである。',
      rows: [
        ['借方残高', '勘定科目', '貸方残高'],
        ['93,600円', '現金', ''],
        ['42,000円', '通信費', ''],
        ['', '現金過不足', ''],
        ['整理事項', '実際有高は90,100円であった。不一致額のうち2,900円は通信費の記入漏れ、残額は原因不明である。', ''],
      ],
    },
    options: [
      { label: 'A', text: '90,100円' },
      { label: 'B', text: '90,700円' },
      { label: 'C', text: '93,600円' },
      { label: 'D', text: '96,500円' },
    ],
    correctAnswer: 'A',
    explanation: '現金は実際有高に合わせます。帳簿との差額3,500円のうち2,900円は通信費、600円は雑損です。',
    tags: ['決算整理', '現金過不足'],
  },
  {
    id: 'boki3-mock-s3-q2',
    examId: 'boki3',
    chapterId: 'mock-s3',
    type: 'single',
    text: '貸倒引当金を差額補充法で設定する。',
    prompt: '貸倒引当金繰入額として正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '決算整理事項',
      lead: '売掛金の期末残高に対して2%の貸倒引当金を設定する。差額補充法による。',
      rows: [
        ['借方残高', '勘定科目', '貸方残高'],
        ['1,240,000円', '売掛金', ''],
        ['', '貸倒引当金', '9,000円'],
        ['整理事項', '売掛金のうち40,000円は入金済みであったが未記帳である。入金修正後の残高を基礎とする。', ''],
      ],
    },
    options: [
      { label: 'A', text: '15,000円' },
      { label: 'B', text: '15,800円' },
      { label: 'C', text: '24,000円' },
      { label: 'D', text: '24,800円' },
    ],
    correctAnswer: 'A',
    explanation: '修正後売掛金は1,200,000円。必要額24,000円から既存残高9,000円を差し引き、繰入額は15,000円です。',
    tags: ['貸倒引当金', '差額補充法'],
  },
  {
    id: 'boki3-mock-s3-q3',
    examId: 'boki3',
    chapterId: 'mock-s3',
    type: 'single',
    text: '三分法による売上原価を計算する。',
    prompt: '損益計算書に表示される売上原価として正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '決算整理事項',
      lead: '商品売買は三分法で処理している。',
      rows: [
        ['借方残高', '勘定科目', '貸方残高'],
        ['180,000円', '繰越商品', ''],
        ['2,760,000円', '仕入', ''],
        ['', '売上', '4,200,000円'],
        ['整理事項', '期末商品棚卸高は215,000円である。', ''],
      ],
    },
    options: [
      { label: 'A', text: '2,725,000円' },
      { label: 'B', text: '2,760,000円' },
      { label: 'C', text: '2,795,000円' },
      { label: 'D', text: '2,975,000円' },
    ],
    correctAnswer: 'A',
    explanation: '売上原価は仕入2,760,000円+期首商品180,000円-期末商品215,000円=2,725,000円です。',
    tags: ['売上原価', '三分法'],
  },
  {
    id: 'boki3-mock-s3-q4',
    examId: 'boki3',
    chapterId: 'mock-s3',
    type: 'single',
    text: '固定資産の月割減価償却を問う。',
    prompt: '当期の減価償却費として正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '決算整理事項',
      lead: '備品は残存価額ゼロ、定額法、間接法で処理する。決算日は3月31日。',
      rows: [
        ['借方残高', '勘定科目', '貸方残高'],
        ['1,500,000円', '備品', ''],
        ['', '備品減価償却累計額', '560,000円'],
        ['整理事項', '備品のうち900,000円は期首から使用、600,000円は10月1日に取得して使用を開始した。耐用年数はいずれも5年である。', ''],
      ],
    },
    options: [
      { label: 'A', text: '180,000円' },
      { label: 'B', text: '240,000円' },
      { label: 'C', text: '300,000円' },
      { label: 'D', text: '860,000円' },
    ],
    correctAnswer: 'B',
    explanation: '900,000÷5=180,000円。追加分は600,000÷5×6/12=60,000円。合計240,000円です。',
    tags: ['減価償却', '月割'],
  },
  {
    id: 'boki3-mock-s3-q5',
    examId: 'boki3',
    chapterId: 'mock-s3',
    type: 'single',
    text: '借入金利息の未払計上を問う。',
    prompt: '未払利息として計上する金額を選びなさい。',
    material: {
      kind: 'table',
      title: '決算整理事項',
      lead: '借入金の利息は半年ごとに支払う。決算日は3月31日。',
      rows: [
        ['借方残高', '勘定科目', '貸方残高'],
        ['', '借入金', '1,800,000円'],
        ['18,000円', '支払利息', ''],
        ['整理事項', '借入金は12月1日に借り入れた。年利率2.4%、利息は翌5月末と11月末に支払う。', ''],
      ],
    },
    options: [
      { label: 'A', text: '10,800円' },
      { label: 'B', text: '14,400円' },
      { label: 'C', text: '18,000円' },
      { label: 'D', text: '43,200円' },
    ],
    correctAnswer: 'B',
    explanation: '12月から3月まで4か月分を未払計上します。1,800,000×2.4%×4/12=14,400円です。',
    tags: ['未払利息', '経過勘定'],
  },
  {
    id: 'boki3-mock-s3-q6',
    examId: 'boki3',
    chapterId: 'mock-s3',
    type: 'single',
    text: '税抜方式の消費税清算を問う。',
    prompt: '未払消費税として計上する金額を選びなさい。',
    material: {
      kind: 'table',
      title: '決算整理事項',
      lead: '消費税は税抜方式で処理している。',
      rows: [
        ['借方残高', '勘定科目', '貸方残高'],
        ['384,000円', '仮払消費税', ''],
        ['', '仮受消費税', '692,000円'],
        ['整理事項', '決算にあたり、仮払消費税と仮受消費税を相殺し、差額を未払消費税として計上する。', ''],
      ],
    },
    options: [
      { label: 'A', text: '308,000円' },
      { label: 'B', text: '384,000円' },
      { label: 'C', text: '692,000円' },
      { label: 'D', text: '1,076,000円' },
    ],
    correctAnswer: 'A',
    explanation: '仮受消費税692,000円から仮払消費税384,000円を差し引いた308,000円が未払消費税です。',
    tags: ['消費税', '決算整理'],
  },
  {
    id: 'boki3-mock-s3-q7',
    examId: 'boki3',
    chapterId: 'mock-s3',
    type: 'single',
    text: '決算整理後の当期純利益を計算する。',
    prompt: '当期純利益として正しいものを選びなさい。',
    material: {
      kind: 'table',
      title: '損益計算資料',
      lead: '決算整理後の収益・費用は次のとおりである。',
      rows: [
        ['借方(費用)', '勘定科目', '貸方(収益)'],
        ['2,725,000円', '売上原価', ''],
        ['860,000円', '給料', ''],
        ['240,000円', '減価償却費', ''],
        ['15,000円', '貸倒引当金繰入', ''],
        ['14,400円', '支払利息', ''],
        ['128,000円', '法人税、住民税及び事業税', ''],
        ['', '売上', '4,380,000円'],
        ['', '受取利息', '8,000円'],
      ],
    },
    options: [
      { label: 'A', text: '405,600円' },
      { label: 'B', text: '413,600円' },
      { label: 'C', text: '533,600円' },
      { label: 'D', text: '1,655,000円' },
    ],
    correctAnswer: 'A',
    explanation: '収益合計4,388,000円、費用合計3,982,400円。当期純利益は405,600円です。',
    tags: ['損益計算書', '当期純利益'],
  },
]

const BOKI3_ANSWER_SHEETS: Record<string, ExamAnswerSheet> = {
  'boki3-mock-s1-q1': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '給料', amount: '620000' },
      { id: 'c1', side: '貸方', account: '所得税預り金', amount: '31000' },
      { id: 'c2', side: '貸方', account: '社会保険料預り金', amount: '58000' },
      { id: 'c3', side: '貸方', account: '普通預金', amount: '531000' },
    ],
  },
  'boki3-mock-s1-q2': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '普通預金', amount: '265000' },
      { id: 'd2', side: '借方', account: '修繕費', amount: '95000' },
      { id: 'c1', side: '貸方', account: '差入保証金', amount: '360000' },
    ],
  },
  'boki3-mock-s1-q3': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '仕入', amount: '300000' },
      { id: 'd2', side: '借方', account: '仮払消費税', amount: '30000' },
      { id: 'c1', side: '貸方', account: '前払金', amount: '50000' },
      { id: 'c2', side: '貸方', account: '買掛金', amount: '280000' },
    ],
  },
  'boki3-mock-s1-q4': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '未収入金', amount: '250000' },
      { id: 'd2', side: '借方', account: '備品減価償却累計額', amount: '620000' },
      { id: 'd3', side: '借方', account: '固定資産売却損', amount: '30000' },
      { id: 'c1', side: '貸方', account: '備品', amount: '900000' },
    ],
  },
  'boki3-mock-s1-q5': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '社会保険料預り金', amount: '46000' },
      { id: 'd2', side: '借方', account: '法定福利費', amount: '46000' },
      { id: 'c1', side: '貸方', account: '普通預金', amount: '92000' },
    ],
  },
  'boki3-mock-s1-q6': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '通信費', amount: '4200' },
      { id: 'd2', side: '借方', account: '租税公課', amount: '18500' },
      { id: 'c1', side: '貸方', account: '貯蔵品', amount: '22700' },
    ],
  },
  'boki3-mock-s1-q7': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '現金', amount: '48000' },
      { id: 'd2', side: '借方', account: 'クレジット売掛金', amount: '89240' },
      { id: 'd3', side: '借方', account: '支払手数料', amount: '2760' },
      { id: 'c1', side: '貸方', account: '売上', amount: '140000' },
    ],
  },
  'boki3-mock-s1-q8': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '買掛金', amount: '260000' },
      { id: 'c1', side: '貸方', account: '当座預金', amount: '260000' },
    ],
  },
  'boki3-mock-s1-q9': {
    kind: 'journal',
    lines: [
      { id: 'd1', side: '借方', account: '当座預金', amount: '2940000' },
      { id: 'd2', side: '借方', account: '支払利息', amount: '60000' },
      { id: 'c1', side: '貸方', account: '手形借入金', amount: '3000000' },
    ],
  },
  'boki3-mock-s2-q1': {
    kind: 'blanks',
    blanks: [
      { id: 'avg1', label: '10/6後の平均単価', answer: '424', suffix: '円' },
      { id: 'cost1', label: '10/14払出金額', answer: '38160', suffix: '円' },
      { id: 'avg2', label: '10/22後の平均単価', answer: '452', suffix: '円' },
      { id: 'profit', label: '売上総利益', answer: '47780', suffix: '円' },
    ],
  },
  'boki3-mock-s2-q2': {
    kind: 'blanks',
    blanks: [
      { id: 'a', label: '備品A 当期償却費', answer: '400000', suffix: '円' },
      { id: 'b', label: '備品B 当期償却費', answer: '270000', suffix: '円' },
      { id: 'c', label: '備品C 当期償却費', answer: '40000', suffix: '円' },
      { id: 'total', label: '減価償却費合計', answer: '710000', suffix: '円' },
    ],
  },
  'boki3-mock-s2-q3': {
    kind: 'blanks',
    blanks: [
      { id: 'monthly', label: '値上げ後の月額家賃', answer: '132000', suffix: '円' },
      { id: 'prepaid', label: '前払家賃への振替額', answer: '528000', suffix: '円' },
      { id: 'expense', label: '当期の支払家賃', answer: '1464000', suffix: '円' },
    ],
  },
  'boki3-mock-s2-q4': {
    kind: 'blanks',
    blanks: [
      { id: 'purchase_books', label: '11日に記入する補助簿数', answer: '4', suffix: 'つ' },
      { id: 'sales_books', label: '19日に記入する補助簿数', answer: '4', suffix: 'つ' },
      { id: 'bill_book', label: '19日の手形に関係する補助簿名', answer: '受取手形記入帳' },
    ],
  },
  'boki3-mock-s3-q1': {
    kind: 'blanks',
    blanks: [
      { id: 'cash', label: '決算整理後の現金', answer: '90100', suffix: '円' },
      { id: 'communication', label: '通信費に追加する金額', answer: '2900', suffix: '円' },
      { id: 'loss', label: '雑損', answer: '600', suffix: '円' },
    ],
  },
  'boki3-mock-s3-q2': {
    kind: 'blanks',
    blanks: [
      { id: 'receivables', label: '修正後売掛金', answer: '1200000', suffix: '円' },
      { id: 'allowance', label: '貸倒引当金の必要額', answer: '24000', suffix: '円' },
      { id: 'expense', label: '貸倒引当金繰入', answer: '15000', suffix: '円' },
    ],
  },
  'boki3-mock-s3-q3': {
    kind: 'blanks',
    blanks: [
      { id: 'opening', label: '期首商品棚卸高', answer: '180000', suffix: '円' },
      { id: 'ending', label: '期末商品棚卸高', answer: '215000', suffix: '円' },
      { id: 'cost', label: '売上原価', answer: '2725000', suffix: '円' },
    ],
  },
  'boki3-mock-s3-q4': {
    kind: 'blanks',
    blanks: [
      { id: 'old', label: '期首使用分の償却費', answer: '180000', suffix: '円' },
      { id: 'new', label: '期中取得分の償却費', answer: '60000', suffix: '円' },
      { id: 'total', label: '減価償却費', answer: '240000', suffix: '円' },
    ],
  },
  'boki3-mock-s3-q5': {
    kind: 'blanks',
    blanks: [
      { id: 'months', label: '未払計上する月数', answer: '4', suffix: 'か月' },
      { id: 'interest', label: '未払利息', answer: '14400', suffix: '円' },
    ],
  },
  'boki3-mock-s3-q6': {
    kind: 'blanks',
    blanks: [
      { id: 'received', label: '仮受消費税', answer: '692000', suffix: '円' },
      { id: 'paid', label: '仮払消費税', answer: '384000', suffix: '円' },
      { id: 'tax', label: '未払消費税', answer: '308000', suffix: '円' },
    ],
  },
  'boki3-mock-s3-q7': {
    kind: 'blanks',
    blanks: [
      { id: 'revenue', label: '収益合計', answer: '4388000', suffix: '円' },
      { id: 'expense', label: '費用合計', answer: '3982400', suffix: '円' },
      { id: 'profit', label: '当期純利益', answer: '405600', suffix: '円' },
    ],
  },
}

function decorateBokiQuestions() {
  return BOKI3_MOCK_QUESTIONS.map(question => ({
    ...question,
    answerSheet: BOKI3_ANSWER_SHEETS[question.id],
  }))
}

function stableShuffle<T>(items: T[]) {
  return items
    .map((item, index) => {
      const key = JSON.stringify(item).length + index * 37
      return { item, key: (key * 9301 + 49297) % 233280 }
    })
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item)
}

function buildSections(questions: ExamQuestion[]): ExamSection[] {
  const pool = stableShuffle(questions)
  let cursor = 0

  return SECTION_BLUEPRINTS.map((section, index) => {
    const nextCursor = Math.min(pool.length, cursor + section.count)
    let sectionQuestions = pool.slice(cursor, nextCursor)
    cursor = nextCursor

    if (sectionQuestions.length === 0 && pool.length > 0) {
      sectionQuestions = pool.slice(index, index + 1)
    }

    return {
      id: section.id,
      title: section.title,
      focus: section.focus,
      points: section.points,
      questions: sectionQuestions,
    }
  }).filter(section => section.questions.length > 0)
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function normalizeAnswer(value: string) {
  return value
    .replace(/[,\s　円]/g, '')
    .replace(/[（(].*?[）)]/g, '')
    .trim()
}

function isAnswerRecord(answer: AnswerValue | undefined): answer is Record<string, string> {
  return Boolean(answer) && !Array.isArray(answer) && typeof answer === 'object'
}

function expectedBlankEntries(q: ExamQuestion) {
  if (!q.answerSheet) return []
  if (q.answerSheet.kind === 'journal') {
    return (q.answerSheet.lines ?? []).flatMap(line => [
      [`${line.id}-account`, line.account] as const,
      [`${line.id}-amount`, line.amount] as const,
    ])
  }
  return (q.answerSheet.blanks ?? []).map(blank => [blank.id, blank.answer] as const)
}

function hasAnswer(q: ExamQuestion, answer: AnswerValue | undefined) {
  if (q.answerSheet) {
    if (!isAnswerRecord(answer)) return false
    const entries = expectedBlankEntries(q)
    return entries.length > 0 && entries.every(([id]) => Boolean(answer[id]?.trim()))
  }
  if (!answer) return false
  return Array.isArray(answer) ? answer.length > 0 : Boolean(String(answer).trim())
}

function isCorrect(q: ExamQuestion, answer: AnswerValue | undefined) {
  if (!answer) return false
  if (q.answerSheet) {
    if (!isAnswerRecord(answer)) return false
    return expectedBlankEntries(q).every(([id, expected]) => {
      const actual = answer[id] ?? ''
      return normalizeAnswer(actual) === normalizeAnswer(expected)
    })
  }
  if (q.type === 'multiple') {
    const expected = Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)]
    const selected = Array.isArray(answer) ? answer : [String(answer)]
    return expected.slice().sort().join(',') === selected.slice().sort().join(',')
  }
  return String(q.correctAnswer) === String(answer)
}

function answerLabel(answer: AnswerValue | undefined) {
  if (!answer) return '未回答'
  if (isAnswerRecord(answer)) return '解答欄に入力済み'
  return Array.isArray(answer) ? answer.join(', ') : answer
}

function sectionInstruction(sectionIndex: number) {
  if (sectionIndex === 0) {
    return '次の各取引について、答案用紙の借方・貸方に勘定科目と金額を記入しなさい。なお、消費税は指示がある場合のみ考慮する。'
  }
  if (sectionIndex === 1) {
    return '次の資料にもとづいて、商品有高帳・補助簿・勘定記入に関する空欄へ答えを入力しなさい。'
  }
  return '次の決算整理事項および試算表にもとづいて、決算整理後の金額を計算し、空欄へ入力しなさい。'
}

function promptText(q: ExamQuestion) {
  if (!q.answerSheet) return q.prompt ?? '解答としてもっとも適切なものを選びなさい。'
  if (q.answerSheet.kind === 'journal') {
    return '答案用紙に借方・貸方の勘定科目と金額を入力しなさい。'
  }
  return '資料を整理し、答案用紙の空欄に入る金額または語句を入力しなさい。'
}

function buildExamMaterial(sectionIndex: number, questionIndex: number, question: ExamQuestion): ExamMaterial {
  if (question.material) return question.material

  const amount = 8000 + ((sectionIndex + 2) * (questionIndex + 3) * 1000)

  if (sectionIndex === 0) {
    return {
      kind: 'transaction',
      title: `取引 ${questionIndex + 1}`,
      lead: question.text,
      rows: [
        ['日付', `${questionIndex + 4}月${questionIndex + 10}日`],
        ['取引内容', question.text],
        ['参考金額', `${amount.toLocaleString()}円`],
      ],
    }
  }

  if (sectionIndex === 1) {
    return {
      kind: 'table',
      title: '資料',
      lead: '当月中の取引記録の一部は次のとおりである。',
      rows: [
        ['摘要', '金額'],
        ['商品を掛けで仕入れた', `${(amount * 3).toLocaleString()}円`],
        ['売掛金を現金で回収した', `${(amount * 2).toLocaleString()}円`],
        ['小切手を振り出して買掛金を支払った', `${amount.toLocaleString()}円`],
      ],
      note: question.text,
    }
  }

  return {
    kind: 'table',
    title: '決算整理事項',
    lead: '会計期間は1年、決算日は3月31日である。決算整理前残高試算表の一部と整理事項は次のとおりである。',
    rows: [
      ['借方残高', '勘定科目', '貸方残高'],
      [`${(amount * 4).toLocaleString()}円`, '現金', ''],
      [`${(amount * 6).toLocaleString()}円`, '売掛金', ''],
      [`${(amount * 12).toLocaleString()}円`, '備品', ''],
      ['', '買掛金', `${(amount * 5).toLocaleString()}円`],
      ['', '売上', `${(amount * 15).toLocaleString()}円`],
    ],
    note: question.text,
  }
}

const buttonBase: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background: '#fff',
  color: 'var(--color-text)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 42,
  padding: '9px 14px',
}

export default function MockExam({
  initialQuestions,
  examId = 'boki3',
  examName = '日商簿記3級',
  durationMinutes = 60,
  passRate = 70,
}: Props) {
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})

  const examQuestions = useMemo<ExamQuestion[]>(
    () => examId === 'boki3' ? decorateBokiQuestions() : initialQuestions,
    [examId, initialQuestions],
  )
  const sections = useMemo(() => buildSections(examQuestions), [examQuestions])
  const activeSection = sections[currentSection] ?? sections[0]
  const activeQuestion = activeSection?.questions[currentQuestion] ?? activeSection?.questions[0]
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredCount = sections
    .flatMap(section => section.questions)
    .filter(q => hasAnswer(q, answers[q.id]))
    .length

  useEffect(() => {
    if (!started || submitted) return
    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setSubmitted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [started, submitted])

  const result = useMemo(() => {
    const sectionResults = sections.map(section => {
      const questionPoint = section.points / section.questions.length
      const correctCount = section.questions.filter(q => isCorrect(q, answers[q.id])).length
      const sectionScore = Math.round(correctCount * questionPoint * 10) / 10
      return { ...section, correctCount, sectionScore }
    })

    const score = sectionResults.reduce((sum, section) => sum + section.sectionScore, 0)
    const roundedScore = Math.round(score)
    const weakTags = sections
      .flatMap(section => section.questions)
      .filter(q => hasAnswer(q, answers[q.id]) && !isCorrect(q, answers[q.id]))
      .flatMap(q => q.tags ?? [q.chapterId])
      .reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1
        return acc
      }, {})

    return {
      score: roundedScore,
      rate: roundedScore,
      passed: roundedScore >= passRate,
      sectionResults,
      weakTags: Object.entries(weakTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    }
  }, [answers, passRate, sections])

  function selectOption(q: ExamQuestion, label: string, checked?: boolean) {
    if (submitted) return
    setAnswers(prev => {
      if (q.type === 'multiple') {
        const current = Array.isArray(prev[q.id]) ? prev[q.id] as string[] : []
        const next = checked
          ? Array.from(new Set([...current, label]))
          : current.filter(item => item !== label)
        return { ...prev, [q.id]: next }
      }
      return { ...prev, [q.id]: label }
    })
  }

  function updateBlankAnswer(q: ExamQuestion, fieldId: string, value: string) {
    if (submitted) return
    setAnswers(prev => {
      const existing = prev[q.id]
      const current: Record<string, string> = isAnswerRecord(existing) ? existing : {}
      return { ...prev, [q.id]: { ...current, [fieldId]: value } }
    })
  }

  function goTo(sectionIndex: number, questionIndex = 0) {
    setCurrentSection(sectionIndex)
    setCurrentQuestion(questionIndex)
  }

  function goNext() {
    if (!activeSection) return
    if (currentQuestion < activeSection.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      return
    }
    if (currentSection < sections.length - 1) {
      goTo(currentSection + 1, 0)
    }
  }

  function goPrev() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      return
    }
    if (currentSection > 0) {
      const prevSection = sections[currentSection - 1]
      goTo(currentSection - 1, Math.max(0, prevSection.questions.length - 1))
    }
  }

  function resetExam() {
    setStarted(false)
    setSubmitted(false)
    setTimeLeft(durationMinutes * 60)
    setCurrentSection(0)
    setCurrentQuestion(0)
    setAnswers({})
  }

  function submitExam() {
    if (answeredCount < totalQuestions && !window.confirm('未回答の問題があります。このまま採点しますか？')) {
      return
    }
    setSubmitted(true)
  }

  if (!activeSection || !activeQuestion) {
    return (
      <div className="boki-exam-shell">
        <div className="boki-empty">
          <AlertCircle size={28} />
          <h1>模擬試験の問題がまだありません</h1>
          <p>問題データを追加すると、このページで本番形式の演習ができます。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="boki-exam-shell">
      {!started ? (
        <>
          <section className="boki-hero">
            <div>
              <div className="boki-kicker">
                <FileText size={16} />
                模擬試験
              </div>
              <h1>{examName} 模擬試験</h1>
              <p>
                3つの大問で、仕訳・補助簿・決算整理を横断して確認します。
                試験中は左の大問リストから自由に見直せます。
              </p>
            </div>
          </section>

          <section className="boki-start">
            <div>
              <h2>本番前の最終確認</h2>
              <p>
                途中保存なしで60分を測ります。第1問から第3問まで順番に進めても、
                左の大問リストから戻って見直しても構いません。
              </p>
              <div className="boki-start-actions">
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  style={{ ...buttonBase, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}
                >
                  <Clock3 size={18} />
                  試験を開始
                </button>
                <Link href={`/exams/${examId}`} style={buttonBase}>
                  <BookOpen size={18} />
                  学習ページへ戻る
                </Link>
              </div>
            </div>
            <div className="boki-start-panel">
              <h3>この模試の構成</h3>
              {sections.map(section => (
                <div key={section.id} className="boki-plan-row">
                  <span>{section.title}</span>
                  <strong>{section.focus}</strong>
                  <em>{section.questions.length}問</em>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="boki-exam-topbar">
            <div className={timeLeft <= 300 && !submitted ? 'boki-timer danger' : 'boki-timer'}>
              <Clock3 size={18} />
              <span>残り時間</span>
              <strong>{formatTime(timeLeft)}</strong>
            </div>
            <div className="boki-progress-inline">
              <span>回答 {answeredCount}/{totalQuestions}</span>
              <div className="boki-progress-track">
                <div style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>
            {!submitted && (
              <button
                type="button"
                onClick={submitExam}
                style={{ ...buttonBase, background: 'var(--color-success)', color: '#fff', borderColor: 'var(--color-success)' }}
              >
                <Send size={17} />
                採点する
              </button>
            )}
          </div>

          <div className="boki-exam-grid">
            <main className="boki-question-panel">
              <nav className="boki-nav-panel" aria-label="大問ナビ">
                <div className="boki-panel-title">
                  <ClipboardList size={18} />
                  大問
                </div>
                <div className="boki-nav-strip">
                  {sections.map((section, sectionIndex) => {
                    const sectionAnswered = section.questions.filter(q => hasAnswer(q, answers[q.id])).length
                    const active = sectionIndex === currentSection
                    return (
                      <button
                        key={section.id}
                        type="button"
                        className={active ? 'active' : ''}
                        onClick={() => goTo(sectionIndex)}
                      >
                        <span>{section.title}</span>
                        <strong>{section.focus}</strong>
                        <em>{sectionAnswered}/{section.questions.length}問</em>
                      </button>
                    )
                  })}
                </div>
              </nav>

              {submitted && (
                <section className={result.passed ? 'boki-result passed' : 'boki-result'}>
                  <div>
                    {result.passed ? <BadgeCheck size={30} /> : <AlertCircle size={30} />}
                    <div>
                      <h2>{result.passed ? '合格ライン到達' : 'もう一歩で合格ライン'}</h2>
                      <p>{result.score}点 / 100点・合格基準 {passRate}点</p>
                    </div>
                  </div>
                  <div className="boki-result-actions">
                    <button type="button" onClick={resetExam} style={buttonBase}>
                      <RotateCcw size={17} />
                      もう一度
                    </button>
                    <Link href={`/exams/${examId}/guide`} style={buttonBase}>
                      <BookOpen size={17} />
                      復習する
                    </Link>
                  </div>
                </section>
              )}

              <section className="boki-question-card">
                <div className="boki-question-head">
                  <div>
                    <span>{activeSection.title}</span>
                    <h2>{activeSection.focus}</h2>
                  </div>
                </div>

                <div className="boki-content-wrap">
                  <p className="boki-instruction">{sectionInstruction(currentSection)}</p>

                  {(() => {
                    const material = buildExamMaterial(currentSection, currentQuestion, activeQuestion)
                    return (
                      <div className={`boki-material ${material.kind === 'transaction' ? 'transaction' : ''}`}>
                        <div className="boki-material-title">{material.title}</div>
                        {material.lead && <p>{material.lead}</p>}
                        {material.kind === 'transaction' ? (
                          <div className="boki-transaction-rows">
                            {material.rows.map((row, rowIndex) => (
                              <div key={`${row[0]}-${rowIndex}`} className="boki-transaction-row">
                                <span>{row[0]}</span>
                                <strong>{row[1]}</strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="boki-table-wrap">
                            <table>
                              <tbody>
                                {material.rows.map((row, rowIndex) => (
                                  <tr key={`${row[0]}-${rowIndex}`}>
                                    {row.map((cell, cellIndex) => (
                                      <td key={`${cell}-${cellIndex}`}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {'note' in material && material.note && <p className="boki-material-note">{material.note}</p>}
                      </div>
                    )
                  })()}

                  <div className="boki-question-meta">
                    問{currentQuestion + 1} / {activeSection.questions.length}
                    <span>{activeQuestion.tags?.slice(0, 2).join(' / ') || activeQuestion.chapterId}</span>
                  </div>

                  <p className="boki-question-text">{promptText(activeQuestion)}</p>

                  {activeQuestion.answerSheet ? (
                    activeQuestion.answerSheet.kind === 'journal' ? (
                      <div className="boki-answer-sheet">
                        <div className="boki-answer-title">解答欄</div>
                        <div className="boki-journal-grid">
                          <div>借方・貸方</div>
                          <div>勘定科目</div>
                          <div>金額</div>
                          {(activeQuestion.answerSheet.lines ?? []).map(line => {
                            const existingAnswer = answers[activeQuestion.id]
                            const answer: Record<string, string> = isAnswerRecord(existingAnswer) ? existingAnswer : {}
                            const accountId = `${line.id}-account`
                            const amountId = `${line.id}-amount`
                            const accountCorrect = submitted && normalizeAnswer(answer[accountId] ?? '') === normalizeAnswer(line.account)
                            const amountCorrect = submitted && normalizeAnswer(answer[amountId] ?? '') === normalizeAnswer(line.amount)

                            return (
                              <div key={line.id} className="boki-journal-row">
                                <strong>{line.side}</strong>
                                <label className={submitted ? (accountCorrect ? 'correct' : 'wrong') : ''}>
                                  <span>科目</span>
                                  <input
                                    value={answer[accountId] ?? ''}
                                    disabled={submitted}
                                    onChange={e => updateBlankAnswer(activeQuestion, accountId, e.target.value)}
                                    placeholder="例：現金"
                                  />
                                  {submitted && <em>{line.account}</em>}
                                </label>
                                <label className={submitted ? (amountCorrect ? 'correct' : 'wrong') : ''}>
                                  <span>金額</span>
                                  <input
                                    inputMode="numeric"
                                    value={answer[amountId] ?? ''}
                                    disabled={submitted}
                                    onChange={e => updateBlankAnswer(activeQuestion, amountId, e.target.value)}
                                    placeholder="円"
                                  />
                                  {submitted && <em>{Number(line.amount).toLocaleString()}円</em>}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="boki-answer-sheet">
                        <div className="boki-answer-title">解答欄</div>
                        <div className="boki-blank-grid">
                          {(activeQuestion.answerSheet.blanks ?? []).map(blank => {
                            const existingAnswer = answers[activeQuestion.id]
                            const answer: Record<string, string> = isAnswerRecord(existingAnswer) ? existingAnswer : {}
                            const correct = submitted && normalizeAnswer(answer[blank.id] ?? '') === normalizeAnswer(blank.answer)

                            return (
                              <label key={blank.id} className={submitted ? (correct ? 'correct' : 'wrong') : ''}>
                                <span>{blank.label}</span>
                                <div>
                                  <input
                                    value={answer[blank.id] ?? ''}
                                    disabled={submitted}
                                    onChange={e => updateBlankAnswer(activeQuestion, blank.id, e.target.value)}
                                    placeholder="解答を入力"
                                  />
                                  {blank.suffix && <strong>{blank.suffix}</strong>}
                                </div>
                                {submitted && <em>正解: {Number.isNaN(Number(blank.answer)) ? blank.answer : Number(blank.answer).toLocaleString()}{blank.suffix ?? ''}</em>}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="boki-options">
                      {(activeQuestion.options ?? []).map(option => {
                        const selected = activeQuestion.type === 'multiple'
                          ? Array.isArray(answers[activeQuestion.id]) && (answers[activeQuestion.id] as string[]).includes(option.label)
                          : answers[activeQuestion.id] === option.label
                        const correct = submitted && option.label === activeQuestion.correctAnswer
                        const wrong = submitted && selected && !correct

                        return (
                          <label key={option.label} className={`${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}>
                            {activeQuestion.type === 'multiple' ? (
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={submitted}
                                onChange={e => selectOption(activeQuestion, option.label, e.target.checked)}
                              />
                            ) : (
                              <input
                                type="radio"
                                name={activeQuestion.id}
                                checked={selected}
                                disabled={submitted}
                                onChange={() => selectOption(activeQuestion, option.label)}
                              />
                            )}
                            <span className="boki-option-label">{option.label}</span>
                            <span>{option.text}</span>
                            {correct && <CheckCircle2 size={18} />}
                            {wrong && <X size={18} />}
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {submitted && (
                    <div className="boki-explanation">
                      <div>
                        <strong>あなたの回答</strong>
                        <span>{answerLabel(answers[activeQuestion.id])}</span>
                      </div>
                      <div>
                        <strong>正解</strong>
                        <span>{activeQuestion.answerSheet ? '各解答欄に表示' : String(activeQuestion.correctAnswer)}</span>
                      </div>
                      <p>{activeQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="boki-question-actions">
                    <button type="button" onClick={goPrev} disabled={currentSection === 0 && currentQuestion === 0} style={buttonBase}>
                      <ArrowLeft size={17} />
                      前へ
                    </button>
                    <button type="button" onClick={goNext} disabled={currentSection === sections.length - 1 && currentQuestion === activeSection.questions.length - 1} style={buttonBase}>
                      次へ
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </section>

              {submitted && (
                <section className="boki-weakness">
                  <h3>優先して復習</h3>
                  {result.weakTags.length > 0 ? result.weakTags.map(([tag, count]) => (
                    <div key={tag}>
                      <span>{tag}</span>
                      <strong>{count}問</strong>
                    </div>
                  )) : (
                    <p>大きな弱点はありません。この調子です。</p>
                  )}
                </section>
              )}
            </main>
          </div>
        </>
      )}

      <style>{`
        .boki-exam-shell {
          background: var(--color-bg-subtle);
          min-height: calc(100vh - 60px);
          padding: 28px 0 44px;
        }

        .boki-hero,
        .boki-start,
        .boki-exam-topbar,
        .boki-exam-grid {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
        }

        .boki-hero {
          margin-bottom: 24px;
        }

        .boki-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-primary);
          font-size: 0.78rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .boki-hero h1 {
          font-size: clamp(1.55rem, 3vw, 2.25rem);
          line-height: 1.2;
          margin: 0 0 10px;
          font-weight: 900;
          color: var(--color-text);
        }

        .boki-hero p,
        .boki-start p {
          color: var(--color-text-secondary);
          line-height: 1.75;
          margin: 0;
          max-width: 760px;
        }

        .boki-start,
        .boki-start-panel,
        .boki-nav-panel,
        .boki-question-card,
        .boki-weakness,
        .boki-result,
        .boki-empty {
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
        }

        .boki-question-meta,
        .boki-timer span,
        .boki-progress-inline span {
          color: var(--color-text-muted);
          font-size: 0.76rem;
          font-weight: 700;
        }

        .boki-start {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
          gap: 24px;
          padding-top: 28px;
          padding-bottom: 28px;
        }

        .boki-start h2,
        .boki-start-panel h3,
        .boki-weakness h3 {
          margin: 0 0 12px;
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--color-text);
        }

        .boki-start-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .boki-start-panel {
          padding: 18px;
        }

        .boki-plan-row,
        .boki-weakness div {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid var(--color-border);
        }

        .boki-plan-row span {
          font-weight: 900;
          color: var(--color-primary);
        }

        .boki-plan-row strong {
          font-size: 0.87rem;
          color: var(--color-text);
        }

        .boki-plan-row em {
          font-style: normal;
          color: var(--color-text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .boki-exam-topbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-bottom: 16px;
          position: sticky;
          top: 60px;
          z-index: 10;
          background: color-mix(in srgb, var(--color-bg-subtle) 88%, transparent);
          backdrop-filter: blur(8px);
          padding-top: 10px;
          padding-bottom: 10px;
        }

        .boki-progress-inline {
          display: grid;
          grid-template-columns: auto minmax(90px, 140px);
          gap: 10px;
          align-items: center;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
        }

        .boki-exam-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .boki-nav-panel {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          padding: 12px;
          position: static;
          margin: 0 auto 8px;
          width: min(100%, 980px);
        }

        .boki-panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 900;
          padding: 0 8px;
          white-space: nowrap;
        }

        .boki-nav-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .boki-section-nav {
          border-left: 1px solid var(--color-border);
          padding-left: 10px;
          min-width: 0;
        }

        .boki-section-nav > button {
          width: 100%;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
          padding: 8px 6px;
          border-radius: var(--radius-sm);
        }

        .boki-section-nav > button.active {
          background: var(--color-primary-light);
        }

        .boki-section-nav span {
          color: var(--color-primary);
          font-weight: 900;
          font-size: 0.8rem;
        }

        .boki-section-nav strong {
          display: block;
          color: var(--color-text);
          font-size: 0.8rem;
          margin: 3px 0;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .boki-section-nav em {
          color: var(--color-text-muted);
          font-style: normal;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .boki-question-dots {
          display: flex;
          gap: 5px;
          margin-top: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .boki-question-dots button {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: #fff;
          color: var(--color-text-secondary);
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
        }

        .boki-question-dots button.answered {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .boki-question-dots button.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #fff;
        }

        .boki-result {
          padding: 18px;
          margin-bottom: 16px;
          border-color: #fecaca;
          background: #fff7f7;
        }

        .boki-result.passed {
          border-color: #bbf7d0;
          background: #f0fdf4;
        }

        .boki-result,
        .boki-result > div,
        .boki-result-actions,
        .boki-question-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .boki-result h2 {
          margin: 0 0 3px;
          font-size: 1.08rem;
          font-weight: 900;
        }

        .boki-result p {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 0.88rem;
        }

        .boki-question-card {
          padding: clamp(20px, 3vw, 32px);
        }

        .boki-question-panel {
          width: min(100%, 980px);
          margin: 0 auto;
        }

        .boki-content-wrap {
          max-width: 860px;
          margin: 0 auto;
        }

        .boki-question-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .boki-question-head span {
          color: var(--color-primary);
          font-size: 0.78rem;
          font-weight: 900;
        }

        .boki-question-head h2 {
          margin: 4px 0 0;
          font-size: 1.2rem;
          line-height: 1.35;
          color: var(--color-text);
        }

        .boki-question-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .boki-instruction {
          margin: 0 0 18px;
          color: var(--color-text);
          line-height: 1.75;
          font-weight: 700;
        }

        .boki-material {
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-sm);
          padding: 18px;
          margin-bottom: 18px;
          max-width: 100%;
          background: #fff;
        }

        .boki-material-title {
          font-weight: 900;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .boki-material p {
          margin: 0 0 12px;
          line-height: 1.75;
          color: var(--color-text);
        }

        .boki-material.transaction {
          background: #fbfdff;
        }

        .boki-transaction-rows {
          display: grid;
          gap: 0;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: #fff;
        }

        .boki-transaction-row {
          display: grid;
          grid-template-columns: 112px minmax(0, 1fr);
          border-top: 1px solid var(--color-border);
        }

        .boki-transaction-row:first-child {
          border-top: 0;
        }

        .boki-transaction-row span,
        .boki-transaction-row strong {
          padding: 12px 14px;
          line-height: 1.65;
        }

        .boki-transaction-row span {
          background: var(--color-bg-muted);
          color: var(--color-text);
          font-weight: 900;
          white-space: nowrap;
        }

        .boki-transaction-row strong {
          color: var(--color-text);
          font-weight: 700;
        }

        .boki-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          max-width: 100%;
        }

        .boki-material table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          min-width: 100%;
        }

        .boki-material td {
          border: 1px solid var(--color-border);
          padding: 10px 12px;
          vertical-align: top;
          line-height: 1.65;
        }

        .boki-material tr:first-child td {
          background: var(--color-bg-muted);
          font-weight: 800;
          white-space: nowrap;
        }

        .boki-material-note {
          margin-top: 12px !important;
          padding-top: 12px;
          border-top: 1px solid var(--color-border);
          font-weight: 700;
        }

        .boki-question-text {
          color: var(--color-text);
          font-weight: 700;
          font-size: 1.02rem;
          line-height: 1.8;
          margin: 0 0 20px;
        }

        .boki-options {
          display: grid;
          gap: 10px;
        }

        .boki-options label {
          display: grid;
          grid-template-columns: auto 34px minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: #fff;
          padding: 14px 16px;
          cursor: pointer;
          min-height: 62px;
        }

        .boki-options label > span:not(.boki-option-label) {
          white-space: pre-wrap;
          line-height: 1.65;
        }

        .boki-options label.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .boki-options label.correct {
          border-color: var(--color-success);
          background: #f0fdf4;
        }

        .boki-options label.wrong {
          border-color: var(--color-error);
          background: #fef2f2;
        }

        .boki-answer-sheet {
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-sm);
          background: #fff;
          overflow: hidden;
          max-width: 100%;
        }

        .boki-answer-title {
          padding: 10px 14px;
          background: var(--color-bg-muted);
          border-bottom: 1px solid var(--color-border);
          font-weight: 900;
          color: var(--color-text);
        }

        .boki-journal-grid {
          display: grid;
          grid-template-columns: 96px minmax(180px, 1fr) minmax(150px, 0.55fr);
          overflow-x: auto;
          max-width: 100%;
        }

        .boki-journal-grid > div:not(.boki-journal-row) {
          padding: 10px 12px;
          background: #f8fafc;
          border-bottom: 1px solid var(--color-border);
          font-size: 0.78rem;
          font-weight: 900;
          color: var(--color-text-secondary);
          white-space: nowrap;
        }

        .boki-journal-row {
          display: contents;
        }

        .boki-journal-row > strong,
        .boki-journal-row label {
          border-bottom: 1px solid var(--color-border);
          padding: 12px;
          min-width: 0;
        }

        .boki-journal-row > strong {
          color: var(--color-primary);
          background: #fbfdff;
          font-size: 0.86rem;
        }

        .boki-journal-row label,
        .boki-blank-grid label {
          display: grid;
          gap: 6px;
        }

        .boki-journal-row label > span,
        .boki-blank-grid label > span {
          color: var(--color-text-muted);
          font-size: 0.72rem;
          font-weight: 800;
        }

        .boki-journal-row input,
        .boki-blank-grid input {
          width: 100%;
          min-height: 40px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          color: var(--color-text);
          background: #fff;
          font: inherit;
        }

        .boki-journal-row label.correct input,
        .boki-blank-grid label.correct input {
          border-color: var(--color-success);
          background: #f0fdf4;
        }

        .boki-journal-row label.wrong input,
        .boki-blank-grid label.wrong input {
          border-color: var(--color-error);
          background: #fef2f2;
        }

        .boki-journal-row em,
        .boki-blank-grid em {
          color: var(--color-text-secondary);
          font-size: 0.76rem;
          font-style: normal;
          font-weight: 700;
        }

        .boki-blank-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          padding: 14px;
          max-width: 100%;
        }

        .boki-blank-grid label {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 12px;
          background: #fbfdff;
        }

        .boki-blank-grid label > div {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
        }

        .boki-blank-grid strong {
          color: var(--color-text-secondary);
          font-size: 0.8rem;
        }

        .boki-option-label {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: var(--color-primary);
          background: #fff;
          border: 1px solid var(--color-border);
        }

        .boki-explanation {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: var(--color-bg-subtle);
        }

        .boki-explanation div {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 0.86rem;
        }

        .boki-explanation p {
          grid-column: 1 / -1;
          margin: 4px 0 0;
          color: var(--color-text);
          line-height: 1.7;
          font-size: 0.9rem;
        }

        .boki-question-actions {
          margin-top: 22px;
        }

        .boki-question-actions button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .boki-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          background: var(--color-primary-light);
          color: var(--color-primary);
          border: 1px solid #bfdbfe;
        }

        .boki-timer.danger {
          background: #fef2f2;
          color: var(--color-error);
        }

        .boki-timer strong {
          display: block;
          font-size: 1.15rem;
          line-height: 1.1;
          letter-spacing: 0;
        }

        .boki-weakness {
          padding: 18px;
          margin-top: 16px;
          max-width: 860px;
          margin-left: auto;
          margin-right: auto;
        }

        .boki-progress-track {
          height: 8px;
          border-radius: var(--radius-sm);
          background: var(--color-bg-muted);
          overflow: hidden;
        }

        .boki-progress-track div {
          height: 100%;
          background: var(--color-primary);
        }

        .boki-weakness div {
          grid-template-columns: 1fr auto;
        }

        .boki-empty {
          max-width: 720px;
          margin: 40px auto;
          padding: 36px 24px;
          text-align: center;
          color: var(--color-text-secondary);
        }

        .boki-empty h1 {
          color: var(--color-text);
          font-size: 1.35rem;
        }

        @media (max-width: 1050px) {
          .boki-hero,
          .boki-start,
          .boki-exam-grid {
            grid-template-columns: 1fr;
          }

          .boki-nav-panel {
            grid-template-columns: 1fr;
          }

          .boki-nav-strip {
            grid-template-columns: 1fr;
          }

          .boki-section-nav {
            border-left: 0;
            border-top: 1px solid var(--color-border);
            padding: 8px 0 0;
          }

          .boki-nav-panel,
          .boki-exam-topbar {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .boki-hero,
          .boki-start,
          .boki-exam-topbar,
          .boki-exam-grid {
            padding-left: 16px;
            padding-right: 16px;
          }

          .boki-exam-topbar,
          .boki-progress-inline,
          .boki-explanation {
            grid-template-columns: 1fr;
          }

          .boki-exam-topbar {
            align-items: stretch;
          }

          .boki-question-panel,
          .boki-nav-panel,
          .boki-weakness {
            width: 100%;
          }

          .boki-options label {
            grid-template-columns: auto 30px minmax(0, 1fr);
          }

          .boki-blank-grid {
            grid-template-columns: 1fr;
          }

          .boki-journal-grid {
            grid-template-columns: 72px minmax(160px, 1fr) minmax(130px, 0.6fr);
          }

          .boki-transaction-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
