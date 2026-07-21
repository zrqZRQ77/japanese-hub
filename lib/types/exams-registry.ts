// ============================================================
// 考试注册表 — 添加新考试只需在此追加一条记录
// ============================================================
import { ExamMeta } from './index'

export const EXAMS_REGISTRY: ExamMeta[] = [
  {
    id: 'boki3',
    name: '日商簿記3級',
    shortName: '簿記3級',
    shortMark: 'BK',
    category: '会計・経理',
    categorySlug: 'accounting',
    family: '簿記',
    familySlug: 'bookkeeping',
    description: '日商簿記検定3級。商業簿記の基礎を学ぶ入門資格。',
    totalChapters: 13,
    color: 'blue',
    icon: 'BookOpen',
    mockExam: {
      status: 'draft',
      durationMinutes: 60,
      passRate: 70,
      sectionBlueprints: [
        { id: 'section-1', title: '第1問', focus: '仕訳問題', points: 45, count: 9 },
        { id: 'section-2', title: '第2問', focus: '補助簿・伝票・試算表', points: 20, count: 2 },
        { id: 'section-3', title: '第3問', focus: '決算整理・精算表', points: 35, count: 4 },
      ],
    },
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
          title: 'スッキリわかる 日商簿記3級',
          author: '滝澤ななみ（TAC出版）',
          type: 'テキスト',
          note: 'イラストが多く、初学者が簿記の流れをつかみやすい定番シリーズ。購入時は最新年度版を確認してください。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=スッキリわかる+日商簿記3級+最新年度版',
        },
        {
          title: 'パブロフ流でみんな合格 日商簿記3級 テキスト＆問題集',
          author: 'よせだ あつこ',
          type: 'テキスト＋問題集',
          note: 'ストーリー形式で読み進めやすいテキスト。問題演習も合わせて進めたい人向け。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=パブロフ流+日商簿記3級+最新年度版',
        },
        {
          title: '○年○月試験をあてる TAC直前予想模試 日商簿記3級',
          author: 'TAC出版',
          type: '過去問・予想問題',
          note: '模擬試験5回分と仕訳Webアプリ収録。ネット試験・統一試験どちらの形式にも対応した仕上げ用。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=TAC予想模試+日商簿記3級+最新年度版',
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
          isAffiliate: true,
        },
        {
          title: 'TAC簿記3級通信講座',
          provider: 'TAC',
          note: '業界最大手の資格スクール。教材の質・合格実績ともにトップクラス',
          url: 'https://www.tac-school.co.jp/kouza_boki.html',
          isFree: false,
          isAffiliate: true,
        },
      ],
    },
  },
  {
    id: 'fp3',
    name: 'FP技能士3級',
    shortName: 'FP3級',
    shortMark: 'FP',
    category: 'ファイナンシャル',
    categorySlug: 'finance',
    family: 'FP技能士',
    familySlug: 'financial-planning',
    description: 'ファイナンシャルプランナー3級。お金の知識を幅広く学ぶ。',
    totalChapters: 6,
    color: 'green',
    icon: 'TrendingUp',
    mockExam: {
      durationMinutes: 30,
      passRate: 60,
    },
    info: {
      tagline: '保険・年金・税金・投資、一生使えるお金の知識',
      difficulty: 2,
      difficultyLabel: '初級',
      studyHours: '60〜150時間',
      studyMonths: '1〜3ヶ月',
      examFee: '8,000円（学科4,000円＋実技4,000円）',
      passRate: '50〜90%（実施団体・回により異なる。日本FP協会は80%台後半、きんざいは50%台が多い）',
      examFormat: 'CBT方式（通年実施）',
      examTime: '学科90分・実技60分',
      officialUrl: 'https://www.jafp.or.jp/exam/',
      registrationNote: '日本FP協会または金融財政事情研究会（きんざい）から申し込み',
      valueAfterPass: [
        '保険・住宅ローン・老後資金などの相談対応力',
        '銀行・証券・保険など金融業界への就職で有利',
        'FP2級・1級へのステップアップ',
        '自分自身の資産形成・節税・保険見直しに活かせる',
      ],
      books: [
        {
          title: 'みんなが欲しかった! FPの教科書 3級',
          author: 'TAC出版',
          type: 'テキスト',
          note: '入門者向けに図解が多く、基礎をしっかり学べる定番テキスト。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=みんなが欲しかった+FP+3級',
        },
        {
          title: 'スッキリわかる FP技能士3級 テキスト&問題集',
          author: 'TAC出版',
          type: 'テキスト＋問題集',
          note: '基礎解説と問題演習がセットになっており、学習の流れが作りやすい。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=スッキリわかる+FP+3級+最新年度版',
        },
        {
          title: 'FP教科書 いつもバタ子さんのFP3級 テキスト&過去問題集',
          author: '翔泳社',
          type: 'テキスト＋過去問',
          note: '見開き完結型でテキストと過去問題が一体化。Web提供の過去問演習も付いている。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=いつもバタ子さんのFP3級+最新年度版',
        },
      ],
      courses: [
        {
          title: 'スタディング FP3級講座',
          provider: 'スタディング',
          note: '動画＋スマホで効率学習。通勤時間などのスキマ学習に向く。',
          url: 'https://studying.jp/fp/',
          isFree: false,
          isAffiliate: true,
        },
        {
          title: 'ユーキャン FP3級講座',
          provider: 'ユーキャン',
          note: 'テキスト＋添削で学習を進める通信講座の定番。',
          url: 'https://www.u-can.co.jp/',
          isFree: false,
          isAffiliate: true,
        },
        {
          title: 'TAC FP3級 通信講座',
          provider: 'TAC',
          note: '通学・通信で実績のある資格スクール。模擬試験やサポートが充実。',
          url: 'https://www.tac-school.co.jp/',
          isFree: false,
          isAffiliate: true,
        },
      ],
    },
  },
  {
    id: 'itp',
    name: 'ITパスポート',
    shortName: 'ITパスポート',
    shortMark: 'IT',
    category: 'IT',
    categorySlug: 'it',
    family: '情報処理技術者試験',
    familySlug: 'ipa',
    description: 'ITの基礎知識を幅広く学ぶ国家資格。テクノロジ・経営・法務を体系的に学習できます。',
    totalChapters: 6,
    color: 'blue',
    icon: 'Monitor',
    indexing: {
      // 教材本文は公開中だが、公開前審査で薄内容リスクが解消するまで検索インデックス対象外とする。
      guides: 'noindex',
    },
    mockExam: {
      durationMinutes: 30,
      passRate: 60,
    },
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
      
      books: [
        {
          title: 'みんなが欲しかった！ITパスポートの教科書＆問題集',
          author: 'TAC出版',
          type: 'テキスト＋問題集',
          note: '教科書編と問題集編が分冊できるセパレートBOOK形式。問題集編はアプリ版にも対応。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=みんなが欲しかった+ITパスポート+最新年度版',
        },
        {
          title: 'スッキリわかる ITパスポート テキスト＆問題集',
          author: 'TAC出版',
          type: 'テキスト＋問題集',
          note: '最新シラバスに対応したコンパクトな一冊。短期集中で仕上げたい人向け。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=スッキリわかる+ITパスポート+最新年度版',
        },
        {
          title: '情報処理教科書 出るとこだけ！ITパスポート',
          author: '翔泳社',
          type: '問題集',
          note: '徹底的な過去問分析にもとづき、合格に必要な内容をコンパクトにまとめた仕上げ用問題集。',
          amazonUrl: 'https://www.amazon.co.jp/s?k=出るとこだけ+ITパスポート+最新年度版',
        },
      ],
      courses: [
        {
          title: 'スタディング ITパスポート講座',
          provider: 'スタディング',
          note: '動画＋スマホで学べる効率学習。短時間で要点を押さえたい人向け。',
          url: 'https://studying.jp/itpassport/',
          isFree: false,
          isAffiliate: true,
        },
        {
          title: 'Udemy ITパスポート講座（検索）',
          provider: 'Udemy',
          note: '講師ごとの講座が多数。セールで安価に購入できることが多い。',
          url: 'https://www.udemy.com/courses/search/?q=IT%20パスポート',
          isFree: false,
          isAffiliate: true,
        },
        {
          title: 'IPA（学習コンテンツ）',
          provider: 'IPA',
          note: 'IPAが提供する公式情報・学習コンテンツ。参考情報として便利（無料）。',
          url: 'https://www.ipa.go.jp/',
          isFree: true,
        },
      ],
    },
  },
]

export function getExamById(id: string): ExamMeta | undefined {
  return EXAMS_REGISTRY.find(e => e.id === id)
}

export function isMockExamPublic(exam: ExamMeta): boolean {
  return exam.mockExam?.status === 'public' && Boolean(exam.mockExam.sectionBlueprints)
}
