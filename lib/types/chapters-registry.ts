import { ChapterMeta } from './index'

export const CHAPTERS_REGISTRY: Record<string, ChapterMeta[]> = {
  boki3: [
    { id: 'ch1', number: 1, title: '簿記の基本', sections: [
      { id: 'ch1-s1', number: '1-1', title: '簿記の目的と企業活動の見える化' },
      { id: 'ch1-s2', number: '1-2', title: '帳簿と財務諸表ができるまで' },
      { id: 'ch1-s3', number: '1-3', title: '一つの取引から五要素と財務諸表へ' },
    ]},
    { id: 'ch2', number: 2, title: '勘定科目と5要素', sections: [
      { id: 'ch2-s1', number: '2-1', title: '取引事実から勘定科目と5要素を選ぶ' },
      { id: 'ch2-s2', number: '2-2', title: '五要素の増減と借方・貸方' },
    ]},
    { id: 'ch3', number: 3, title: '仕訳の基礎', sections: [
      { id: 'ch3-s1', number: '3-1', title: '取引を会計の変化に分解する' },
      { id: 'ch3-s2', number: '3-2', title: '取引から仕訳を完成させる' },
      { id: 'ch3-s3', number: '3-3', title: '仕訳帳から元帳・試算表へ' },
    ]},
    { id: 'ch4', number: 4, title: '現金と預金', sections: [
      { id: 'ch4-s1', number: '4-1', title: '現金の範囲と現金過不足' },
      { id: 'ch4-s2', number: '4-2', title: '当座預金・小切手・当座借越' },
      { id: 'ch4-s3', number: '4-3', title: '普通預金・定期預金と複数口座管理' },
      { id: 'ch4-s4', number: '4-4', title: '小口現金と定額資金前渡法' },
      { id: 'ch4-s5', number: '4-5', title: '現金過不足' },
    ]},
    { id: 'ch5', number: 5, title: '商品売買', sections: [
      { id: 'ch5-s1', number: '5-1', title: '三分法' },
      { id: 'ch5-s2', number: '5-2', title: '売上・仕入の処理（掛取引）' },
      { id: 'ch5-s3', number: '5-3', title: '返品の処理' },
      { id: 'ch5-s4', number: '5-4', title: '諸掛り' },
      { id: 'ch5-s5', number: '5-5', title: '補助簿と商品有高帳' },
    ]},
    { id: 'ch6', number: 6, title: '売掛金・買掛金', sections: [
      { id: 'ch6-s1', number: '6-1', title: '売掛金・買掛金の発生・返品・決済・元帳' },
      { id: 'ch6-s2', number: '6-2', title: 'クレジット売掛金と決済手数料' },
    ]},
    { id: 'ch7', number: 7, title: '手形', sections: [
      { id: 'ch7-s1', number: '7-1', title: '約束手形の振出・受入・取立・支払' },
      { id: 'ch7-s2', number: '7-2', title: '電子記録債権・電子記録債務' },
    ]},
    { id: 'ch8', number: 8, title: 'その他の債権・債務', sections: [
      { id: 'ch8-s1', number: '8-1', title: '科目選択の共通判断と貸付金・借入金' },
      { id: 'ch8-s2', number: '8-2', title: '未収入金・未払金と似た科目の比較' },
      { id: 'ch8-s3', number: '8-3', title: '前払金・前受金・差入保証金' },
      { id: 'ch8-s4', number: '8-4', title: '仮払金・仮受金・立替金・預り金' },
      { id: 'ch8-s5', number: '8-5', title: '税金・消費税の債権と債務' },
      { id: 'ch8-s6', number: '8-6', title: '受取商品券の受取・換金・残高管理' },
    ]},
    { id: 'ch9', number: 9, title: '固定資産', sections: [
      { id: 'ch9-s1', number: '9-1', title: '固定資産の判断と取得原価' },
      { id: 'ch9-s2', number: '9-2', title: '減価償却と固定資産台帳' },
      { id: 'ch9-s3', number: '9-3', title: '固定資産の売却' },
    ]},
    { id: 'ch10', number: 10, title: '費用・収益の見越し繰延べ', sections: [
      { id: 'ch10-s1', number: '10-1', title: '4つの決算整理を1つの判断法で理解する' },
      { id: 'ch10-s2', number: '10-2', title: '費用・収益の見越しと整理後残高' },
      { id: 'ch10-s3', number: '10-3', title: '再振替と翌期の支払・受取' },
    ]},
    { id: 'ch11', number: 11, title: '決算整理', sections: [
      { id: 'ch11-s1', number: '11-1', title: '決算整理とは' },
      { id: 'ch11-s2', number: '11-2', title: '売上原価の計算' },
      { id: 'ch11-s3', number: '11-3', title: '貸倒引当金' },
      { id: 'ch11-s4', number: '11-4', title: '消耗品の処理' },
    ]},
    { id: 'ch12', number: 12, title: '試算表と精算表', sections: [
      { id: 'ch12-s1', number: '12-1', title: '試算表' },
      { id: 'ch12-s2', number: '12-2', title: '精算表' },
      { id: 'ch12-s3', number: '12-3', title: '決算の流れ' },
      { id: 'ch12-s4', number: '12-4', title: '証ひょうと伝票会計' },
    ]},
    { id: 'ch13', number: 13, title: '財務諸表', sections: [
      { id: 'ch13-s1', number: '13-1', title: '精算表から損益計算書を作る' },
      { id: 'ch13-s2', number: '13-2', title: '精算表から貸借対照表を作る' },
      { id: 'ch13-s3', number: '13-3', title: 'P/L・B/Sのつながりと誤りの見つけ方' },
    ]},
  ],

  fp3: [
    { id: 'ch1', number: 1, title: 'ライフプランニングと資金計画', sections: [
      { id: 'ch1-s1', number: '1-1', title: 'FPの基礎と関連法規' },
      { id: 'ch1-s2', number: '1-2', title: 'ライフプランニングの手法' },
      { id: 'ch1-s3', number: '1-3', title: '社会保険の基礎' },
      { id: 'ch1-s4', number: '1-4', title: '公的年金' },
      { id: 'ch1-s5', number: '1-5', title: '企業年金と個人年金' },
      { id: 'ch1-s6', number: '1-6', title: '資金計画（住宅ローン）' },
    ]},
    { id: 'ch2', number: 2, title: 'リスク管理', sections: [
      { id: 'ch2-s1', number: '2-1', title: '保険の基礎と関連法規' },
      { id: 'ch2-s2', number: '2-2', title: '生命保険と税金' },
      { id: 'ch2-s3', number: '2-3', title: '損害保険' },
      { id: 'ch2-s4', number: '2-4', title: '第三分野の保険' },
    ]},
    { id: 'ch3', number: 3, title: '金融資産運用', sections: [
      { id: 'ch3-s1', number: '3-1', title: '金融・経済の基本' },
      { id: 'ch3-s2', number: '3-2', title: '預貯金と預金保険制度' },
      { id: 'ch3-s3', number: '3-3', title: '債券投資' },
      { id: 'ch3-s4', number: '3-4', title: '株式投資' },
      { id: 'ch3-s5', number: '3-5', title: '投資信託' },
      { id: 'ch3-s6', number: '3-6', title: '外貨建金融商品' },
      { id: 'ch3-s7', number: '3-7', title: '金融商品の税金と新NISA' },
      { id: 'ch3-s8', number: '3-8', title: 'ポートフォリオと派生商品' },
    ]},
    { id: 'ch4', number: 4, title: 'タックスプランニング', sections: [
      { id: 'ch4-s1', number: '4-1', title: '所得税の基本' },
      { id: 'ch4-s2', number: '4-2', title: '各種所得の計算1（利子・配当・不動産・事業）' },
      { id: 'ch4-s3', number: '4-3', title: '各種所得の計算2（給与・退職）' },
      { id: 'ch4-s4', number: '4-4', title: '各種所得の計算3（譲渡・一時・雑）' },
      { id: 'ch4-s5', number: '4-5', title: '損益通算と所得控除' },
      { id: 'ch4-s6', number: '4-6', title: '税額控除と申告・納付' },
    ]},
    { id: 'ch5', number: 5, title: '不動産', sections: [
      { id: 'ch5-s1', number: '5-1', title: '不動産の見方（登記と価格）' },
      { id: 'ch5-s2', number: '5-2', title: '不動産の取引' },
      { id: 'ch5-s3', number: '5-3', title: '不動産に関する法令（都市計画法・建築基準法）' },
      { id: 'ch5-s4', number: '5-4', title: '不動産の取得・保有にかかる税金' },
      { id: 'ch5-s5', number: '5-5', title: '不動産の譲渡にかかる税金' },
      { id: 'ch5-s6', number: '5-6', title: '不動産の有効活用と投資指標' },
    ]},
    { id: 'ch6', number: 6, title: '相続・事業承継', sections: [
      { id: 'ch6-s1', number: '6-1', title: '相続の基礎知識' },
      { id: 'ch6-s2', number: '6-2', title: '遺言と遺留分' },
      { id: 'ch6-s3', number: '6-3', title: '相続税の仕組みと計算' },
      { id: 'ch6-s4', number: '6-4', title: '相続財産の評価' },
      { id: 'ch6-s5', number: '6-5', title: '贈与税の仕組み' },
      { id: 'ch6-s6', number: '6-6', title: '贈与税の特例と事業承継' },
    ]},
  ],

  itp: [
    { id: 'ch1', number: 1, title: 'ITの基礎とコンピュータ', sections: [
      { id: 'ch1-s1', number: '1-1', title: '基礎理論' },
      { id: 'ch1-s2', number: '1-2', title: 'アルゴリズムとプログラミング' },
      { id: 'ch1-s3', number: '1-3', title: 'コンピュータ構成要素' },
      { id: 'ch1-s4', number: '1-4', title: 'システム構成要素' },
      { id: 'ch1-s5', number: '1-5', title: 'ソフトウェア' },
      { id: 'ch1-s6', number: '1-6', title: 'ハードウェア' },
    ]},
    { id: 'ch2', number: 2, title: '技術要素とデータ活用', sections: [
      { id: 'ch2-s1', number: '2-1', title: '情報デザイン' },
      { id: 'ch2-s2', number: '2-2', title: '情報メディア' },
      { id: 'ch2-s3', number: '2-3', title: 'データベース' },
      { id: 'ch2-s4', number: '2-4', title: 'ネットワーク' },
    ]},
    { id: 'ch3', number: 3, title: '情報セキュリティ', sections: [
      { id: 'ch3-s1', number: '3-1', title: 'セキュリティの基礎とリスク' },
      { id: 'ch3-s2', number: '3-2', title: '脅威と攻撃手法' },
      { id: 'ch3-s3', number: '3-3', title: '暗号・認証・セキュリティ対策' },
    ]},
    { id: 'ch4', number: 4, title: '開発・マネジメント・監査', sections: [
      { id: 'ch4-s1', number: '4-1', title: 'システム開発技術' },
      { id: 'ch4-s2', number: '4-2', title: 'ソフトウェア開発管理技術' },
      { id: 'ch4-s3', number: '4-3', title: 'プロジェクトマネジメント' },
      { id: 'ch4-s4', number: '4-4', title: 'サービスマネジメント' },
      { id: 'ch4-s5', number: '4-5', title: 'システム監査' },
    ]},
    { id: 'ch5', number: 5, title: '企業活動と経営戦略', sections: [
      { id: 'ch5-s1', number: '5-1', title: '企業活動' },
      { id: 'ch5-s2', number: '5-2', title: '経営戦略マネジメント' },
      { id: 'ch5-s3', number: '5-3', title: '技術戦略マネジメント' },
      { id: 'ch5-s4', number: '5-4', title: 'ビジネスインダストリ' },
      { id: 'ch5-s5', number: '5-5', title: 'システム戦略' },
      { id: 'ch5-s6', number: '5-6', title: 'システム企画' },
    ]},
    { id: 'ch6', number: 6, title: '法務とコンプライアンス', sections: [
      { id: 'ch6-s1', number: '6-1', title: '法務' },
      { id: 'ch6-s2', number: '6-2', title: 'コンプライアンスと標準化' },
    ]},
  ],
}

export function getChaptersByExam(examId: string): ChapterMeta[] {
  return CHAPTERS_REGISTRY[examId] ?? []
}

export function getChapterById(examId: string, chapterId: string): ChapterMeta | undefined {
  return getChaptersByExam(examId).find(c => c.id === chapterId)
}
