// ============================================================
// 章节注册表 — 按考试ID管理章节结构
// 添加新考试时在此追加对应章节列表
// ============================================================
import { ChapterMeta } from './index'

export const CHAPTERS_REGISTRY: Record<string, ChapterMeta[]> = {
  boki3: [
    {
      id: 'ch1', number: 1, title: '簿記の基本',
      sections: [
        { id: 'ch1-s1', number: '1-1', title: '簿記とは' },
        { id: 'ch1-s2', number: '1-2', title: '資産・負債・純資産' },
        { id: 'ch1-s3', number: '1-3', title: '収益と費用' },
      ],
    },
    {
      id: 'ch2', number: 2, title: '勘定科目と5要素',
      sections: [
        { id: 'ch2-s1', number: '2-1', title: '勘定科目とは' },
        { id: 'ch2-s2', number: '2-2', title: '5要素の分類' },
      ],
    },
    {
      id: 'ch3', number: 3, title: '仕訳の基礎',
      sections: [
        { id: 'ch3-s1', number: '3-1', title: '仕訳のルール' },
        { id: 'ch3-s2', number: '3-2', title: '借方と貸方' },
      ],
    },
    {
      id: 'ch4', number: 4, title: '現金と預金',
      sections: [
        { id: 'ch4-s1', number: '4-1', title: '現金とは' },
        { id: 'ch4-s2', number: '4-2', title: '現金として扱うもの' },
        { id: 'ch4-s3', number: '4-3', title: '当座預金とは' },
        { id: 'ch4-s4', number: '4-4', title: '普通預金とは' },
        { id: 'ch4-s5', number: '4-5', title: '小口現金とは' },
      ],
    },
    {
      id: 'ch5', number: 5, title: '商品売買',
      sections: [
        { id: 'ch5-s1', number: '5-1', title: '商品の仕入れ' },
        { id: 'ch5-s2', number: '5-2', title: '商品の売上げ' },
        { id: 'ch5-s3', number: '5-3', title: '返品の処理' },
        { id: 'ch5-s4', number: '5-4', title: '諸掛り' },
      ],
    },
    {
      id: 'ch6', number: 6, title: '売掛金・買掛金',
      sections: [
        { id: 'ch6-s1', number: '6-1', title: '売掛金とクレジット売掛金' },
        { id: 'ch6-s2', number: '6-2', title: '買掛金' },
      ],
    },
    {
      id: 'ch7', number: 7, title: '手形',
      sections: [
        { id: 'ch7-s1', number: '7-1', title: '約束手形' },
        { id: 'ch7-s2', number: '7-2', title: '電子記録債権' },
        { id: 'ch7-s3', number: '7-3', title: '手形の裏書・割引' },
      ],
    },
    {
      id: 'ch8', number: 8, title: 'その他の債権・債務',
      sections: [
        { id: 'ch8-s1', number: '8-1', title: '貸付金・借入金' },
        { id: 'ch8-s2', number: '8-2', title: '未収金・未払金' },
        { id: 'ch8-s3', number: '8-3', title: '前払金・前受金' },
      ],
    },
    {
      id: 'ch9', number: 9, title: '固定資産',
      sections: [
        { id: 'ch9-s1', number: '9-1', title: '固定資産の取得' },
        { id: 'ch9-s2', number: '9-2', title: '減価償却' },
        { id: 'ch9-s3', number: '9-3', title: '固定資産の売却' },
      ],
    },
    {
      id: 'ch10', number: 10, title: '費用・収益の見越し繰延べ',
      sections: [
        { id: 'ch10-s1', number: '10-1', title: '費用の繰延べ・収益の繰延べ' },
        { id: 'ch10-s2', number: '10-2', title: '費用の見越し・収益の見越し' },
        { id: 'ch10-s3', number: '10-3', title: '再振替仕訳まとめ' },
      ],
    },
    {
      id: 'ch11', number: 11, title: '決算整理',
      sections: [
        { id: 'ch11-s1', number: '11-1', title: '決算整理とは' },
        { id: 'ch11-s2', number: '11-2', title: '売上原価の計算' },
        { id: 'ch11-s3', number: '11-3', title: '貸倒引当金' },
        { id: 'ch11-s4', number: '11-4', title: '消耗品の処理' },
      ],
    },
    {
      id: 'ch12', number: 12, title: '試算表と精算表',
      sections: [
        { id: 'ch12-s1', number: '12-1', title: '試算表' },
        { id: 'ch12-s2', number: '12-2', title: '精算表' },
        { id: 'ch12-s3', number: '12-3', title: '決算の流れ' },
      ],
    },
    {
      id: 'ch13', number: 13, title: '財務諸表',
      sections: [
        { id: 'ch13-s1', number: '13-1', title: '貸借対照表' },
        { id: 'ch13-s2', number: '13-2', title: '損益計算書' },
        { id: 'ch13-s3', number: '13-3', title: '財務諸表のまとめ' },
      ],
    },
  ],
  fp3: [
    {
      id: 'ch1', number: 1, title: 'ライフプランニングと資金計画',
      sections: [
        { id: 'ch1-s1', number: '1-1', title: 'FPとは' },
        { id: 'ch1-s2', number: '1-2', title: 'ライフプランニング' },
      ],
    },
    {
      id: 'ch2', number: 2, title: 'リスク管理',
      sections: [
        { id: 'ch2-s1', number: '2-1', title: '保険の基礎知識' },
      ],
    },
  ],
}

export function getChaptersByExam(examId: string): ChapterMeta[] {
  return CHAPTERS_REGISTRY[examId] ?? []
}

export function getChapterById(examId: string, chapterId: string): ChapterMeta | undefined {
  return getChaptersByExam(examId).find(c => c.id === chapterId)
}
