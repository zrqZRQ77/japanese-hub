// ============================================================
// 考试注册表 — 添加新考试只需在此追加一条记录
// ============================================================
import { ExamMeta } from './index'

export const EXAMS_REGISTRY: ExamMeta[] = [
  {
    id: 'boki3',
    name: '日商簿記3級',
    shortName: '簿記3級',
    category: '会計・経理',
    description: '日商簿記検定3級。商業簿記の基礎を学ぶ入門資格。',
    totalChapters: 13,
    color: 'blue',
    icon: 'BookOpen',
    info: {
      tagline: 'お金の流れが読める人になる、最初の一歩',
      difficulty: 2,          // 1〜5
      difficultyLabel: '初級',
      studyHours: '50〜100時間',
      studyMonths: '1〜2ヶ月（1日2時間）',
      examFee: '3,300円（税込）',
      passRate: '30〜40%',
      examFormat: '統一試験（年3回）またはネット試験（随時）',
      examTime: '60分',
      officialUrl: 'https://www.kentei.ne.jp/bookkeeping',
      registrationNote: '最寄りの商工会議所またはネット試験専用サイトから申し込み',
      valueAfterPass: [
        '経理・会計事務の基礎スキルの証明',
        '就職・転職活動でのアピールポイント',
        '簿記2級・1級へのステップアップ',
        '個人事業主の確定申告や家計管理に活かせる',
      ],
      books: [
        {
          title: 'スッキリわかる 日商簿記3級 2025年度版',
          author: '滝澤ななみ（TAC出版）',
          type: 'テキスト',
          note: '21年連続売上No.1。猫キャラのイラストで読みやすく、初心者に最適',
          amazonUrl: 'https://www.amazon.co.jp/dp/4300110018',
        },
        {
          title: 'パブロフ流でみんな合格 日商簿記3級 テキスト＆問題集 2025年度版',
          author: 'よせだ あつこ',
          type: 'テキスト＋問題集',
          note: '4コマ漫画で楽しく学べる。スマホ動画講義付きでスキマ時間活用に◎',
          amazonUrl: 'https://www.amazon.co.jp/dp/4798183466',
        },
        {
          title: 'スッキリうかる 日商簿記3級 本試験予想問題集 2025年度版',
          author: 'TAC出版',
          type: '過去問・予想問題',
          note: 'ネット試験・統一試験の予想問題を収録。仕上げの実戦演習に',
          amazonUrl: 'https://www.amazon.co.jp/dp/4300111561',
        },
      ],
      courses: [
        {
          title: 'CPAラーニング（無料）',
          provider: 'CPA会計学院',
          note: '講義・問題集・模擬試験がすべて無料。簿記3級の最強無料コース',
          url: 'https://cpa-learning.com/',
          isFree: true,
        },
        {
          title: 'スタディング 簿記3級講座',
          provider: 'スタディング',
          note: 'スマホで完結。動画×問題演習でスキマ時間に合格を目指せる',
          url: 'https://studying.jp/boki/',
          isFree: false,
        },
        {
          title: 'TAC簿記3級通信講座',
          provider: 'TAC',
          note: '業界最大手の資格スクール。教材の質・合格実績ともにトップクラス',
          url: 'https://www.tac-school.co.jp/kouza_boki.html',
          isFree: false,
        },
      ],
    },
  },
  {
    id: 'fp3',
    name: 'FP技能士3級',
    shortName: 'FP3級',
    category: 'ファイナンシャル',
    description: 'ファイナンシャルプランナー3級。お金の知識を幅広く学ぶ。',
    totalChapters: 6,
    color: 'green',
    icon: 'TrendingUp',
    info: {
      tagline: '保険・年金・税金・投資、一生使えるお金の知識',
      difficulty: 2,
      difficultyLabel: '初級',
      studyHours: '60〜150時間',
      studyMonths: '1〜3ヶ月',
      examFee: '4,000円（学科＋実技セット）',
      passRate: '70〜80%',
      examFormat: '年3回（1月・5月・9月）',
      examTime: '学科60分・実技60分',
      officialUrl: 'https://www.kinzai.or.jp/fp',
      registrationNote: '金融財政事情研究会（きんざい）またはFP協会から申し込み',
      valueAfterPass: [
        '保険・住宅ローン・老後資金などの相談対応力',
        '銀行・証券・保険など金融業界への就職で有利',
        'FP2級・1級へのステップアップ',
        '自分自身の資産形成・節税・保険見直しに活かせる',
      ],
      books: [],
      courses: [],
    },
  },
  {
    id: 'itp',
    name: 'ITパスポート',
    shortName: 'ITパスポート',
    category: 'IT',
    description: 'ITの基礎知識を幅広く学ぶ国家資格。テクノロジ・経営・法務を体系的に学習できます。',
    totalChapters: 6,
    color: 'blue',
    icon: 'Monitor',
    info: {
      tagline: 'IT・経営・法務をまるごとカバーする国家資格',
      difficulty: 2,
      difficultyLabel: '初級',
      studyHours: '100〜200時間',
      studyMonths: '2〜4ヶ月',
      examFee: '7,500円（税込）',
      passRate: '約50%',
      examFormat: 'CBT方式（ほぼ毎日受験可能）',
      examTime: '120分',
      officialUrl: 'https://www3.jitec.ipa.go.jp/JitesCbt/index.html',
      registrationNote: 'IPA公式サイトからCBT試験を予約・申込み',
      valueAfterPass: [
        'IT国家資格として履歴書に記載可能',
        '文系・非IT職でも取得しやすい唯一のIT国家資格',
        '基本情報技術者試験へのステップアップ',
        'DX・AI時代の必須ビジネス知識として職場で活用',
      ],
      books: [],
      courses: [],
    },
  },
]

export function getExamById(id: string): ExamMeta | undefined {
  return EXAMS_REGISTRY.find(e => e.id === id)
}
