const fs = require('fs');
const path = require('path');

// 1. 定义文件路径（维持极简命名规则）
const baseDir = process.cwd();
const guideDir = path.join(baseDir, 'content', 'exams', 'itp', 'guide', 'ch5');
const questionsDir = path.join(baseDir, 'content', 'exams', 'itp', 'questions');
const cardsDir = path.join(baseDir, 'content', 'exams', 'itp', 'cards');

// 自动创建目录
[guideDir, questionsDir, cardsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. MDX 学習ガイド内容（全面覆盖战略系核心）
const mdxContent = `---
examId: itp
chapterId: ch5
chapterNumber: 5
chapterTitle: ITと企業商業戦略
sectionNumber: "5-1"
sectionTitle: 企業活動・経営戦略・システム企画
updatedAt: "2026-06-16"
---

# 企業活動・経営戦略・システム企画

ITパスポートのストラテジ系（戦略系）は、ITをビジネスにどう活かすかを問う分野です。企業経営の基礎、マーケティング、そして最新のデジタルトランスフォーメーション（DX）まで幅広く出題されます。

## 1. 企業活動と会計基礎
企業が利益を上げ、社会に貢献するための基本的な仕組みと、その成績を表す財務の知識です。

- **PDCAサイクル**: Plan（計画）、Do（実行）、Check（評価）、Act（改善）を繰り返し、業務を継続的に改善する手法。
- **財務諸表（決算書）**: 企業の経営状況を示す書類。
  - **貸借対照表（B/S）**: ある「時点」での企業の財産（資産・負債・純資産）の状態を示す。
  - **損益計算書（P/L）**: ある「期間」の企業の成績（売上・費用・利益）を示す。
- **損益分岐点**: 売上高と総費用が等しくなり、利益がゼロになる売上高のこと。これを超えると黒字になる。
- **ROI（投資利益率）**: 投資したコストに対して、どれだけの利益が得られたかを示す指標。

## 2. 経営戦略とマーケティング
企業が競争に勝ち抜くための分析手法と戦略です。

- **SWOT分析**: 自社の環境を、**強み（Strengths）、弱み（Weaknesses）、機会（Opportunities）、脅威（Threats）**の4つに分けて分析する手法。
- **PPM（プロダクト・ポートフォリオ・マネジメント）**: 市場成長率と市場シェアの2軸で、自社製品を「花形」「金のなる木」「問題児」「負け犬」の4つに分類し、経営資源の配分を決定する手法。
- **マーケティングミックス（4P）**: 顧客に製品を届けるための4つの要素。Product（製品）、Price（価格）、Place（流通）、Promotion（販売促進）。

## 3. ビジネスインダストリとシステム戦略
最新のIT動向と、システム導入に向けた上流工程のプロセスです。

- **DX（デジタルトランスフォーメーション）**: ITやデジタル技術を活用して、製品やサービス、ビジネスモデルを根底から変革し、競争上の優位性を確立すること。
- **システム戦略と調達**:
  - **EA（エンタープライズアーキテクチャ）**: 企業全体の業務とシステムを統一的な手法でモデル化し、最適化する枠組み。
  - **RFI（情報提供依頼書）**: ベンダ（IT企業）に対して、技術動向やシステム事例などの情報提供を依頼する文書。
  - **RFP（提案依頼書）**: ベンダに対して、システムの具体的な要件を示し、具体的な提案（システム構成、費用、スケジュールなど）を依頼する文書。非常に頻出です。
`;

// 3. 練習問題 JSON内容
const questionsData = {
  "examId": "itp",
  "chapterId": "ch5",
  "chapterTitle": "ITと企業商業戦略",
  "questions": [
    {
      "id": "itp-ch5-q1",
      "examId": "itp",
      "chapterId": "ch5",
      "type": "single",
      "text": "自社の事業の現状を評価し、経営資源をどのように配分すべきかを決定するために、市場成長率と市場シェアの2つの軸で事業を「花形」「金のなる木」「問題児」「負け犬」に分類する手法はどれか。",
      "options": [
        { "label": "A", "text": "SWOT分析" },
        { "label": "B", "text": "PPM（プロダクト・ポートフォリオ・マネジメント）" },
        { "label": "C", "text": "ABC分析" },
        { "label": "D", "text": "バリューチェーン分析" }
      ],
      "correctAnswer": "B",
      "explanation": "PPMは、市場成長率（縦軸）と市場占有率（横軸）を用いて、製品や事業を4つのカテゴリに分類し、戦略的な投資配分を検討する手法です。SWOT分析は自社の強み・弱みと外部環境の機会・脅威を分析する手法です。",
      "tags": ["ストラテジ系", "経営戦略", "PPM"]
    },
    {
      "id": "itp-ch5-q2",
      "examId": "itp",
      "chapterId": "ch5",
      "type": "single",
      "text": "新たに情報システムを導入する際、発注元の企業がシステム開発企業（ベンダ）に対して、システムの目的や必要な機能、要件などを提示し、具体的なシステム構成や開発費用、スケジュールなどの提案を求める文書はどれか。",
      "options": [
        { "label": "A", "text": "NDA" },
        { "label": "B", "text": "RFI" },
        { "label": "C", "text": "RFP" },
        { "label": "D", "text": "SLA" }
      ],
      "correctAnswer": "C",
      "explanation": "RFP（Request for Proposal：提案依頼書）は、具体的なシステム提案や見積もりを依頼する文書です。RFI（情報提供依頼書）は提案の前段階で技術情報などを集めるための文書、SLAはサービスレベルの合意書です。",
      "tags": ["ストラテジ系", "システム企画", "RFP"]
    },
    {
      "id": "itp-ch5-q3",
      "examId": "itp",
      "chapterId": "ch5",
      "type": "single",
      "text": "企業の財務諸表のうち、ある一定期間における企業の経営成績（売上高、費用、利益）を明らかにするものはどれか。",
      "options": [
        { "label": "A", "text": "貸借対照表" },
        { "label": "B", "text": "損益計算書" },
        { "label": "C", "text": "キャッシュフロー計算書" },
        { "label": "D", "text": "株主資本等変動計算書" }
      ],
      "correctAnswer": "B",
      "explanation": "損益計算書（P/L：Profit and Loss statement）は、一会計期間の収益と費用を対比し、その期間の利益（経営成績）を示す書類です。一方、貸借対照表（B/S）はある時点での財産状態（資産・負債など）を示します。",
      "tags": ["ストラテジ系", "企業活動", "財務諸表"]
    }
  ]
};

// 4. 知識カード JSON内容
const cardsData = {
  "examId": "itp",
  "chapterId": "ch5",
  "chapterTitle": "ITと企業商業戦略",
  "cards": [
    {
      "id": "itp-ch5-card1",
      "examId": "itp",
      "chapterId": "ch5",
      "front": "内部環境の「強み・弱み」と、外部環境の「機会・脅威」をマトリックスに当てはめて事業環境を分析する手法は？",
      "back": "SWOT分析",
      "tags": ["経営戦略", "SWOT"]
    },
    {
      "id": "itp-ch5-card2",
      "examId": "itp",
      "chapterId": "ch5",
      "front": "システム調達において、ベンダ（開発会社）に対して具体的なシステム構成、費用、スケジュールの提案を求める文書は？",
      "back": "RFP（提案依頼書）",
      "tags": ["システム企画", "RFP"]
    },
    {
      "id": "itp-ch5-card3",
      "examId": "itp",
      "chapterId": "ch5",
      "front": "ITやデジタル技術を活用して、製品やサービス、ビジネスモデルを変革し、競争上の優位性を確立することをアルファベット2文字で？",
      "back": "DX（デジタルトランスフォーメーション）",
      "tags": ["経営戦略", "DX"]
    },
    {
      "id": "itp-ch5-card4",
      "examId": "itp",
      "chapterId": "ch5",
      "front": "売上高と総費用が等しくなり、利益がちょうどゼロになる売上高のことを何というか？",
      "back": "損益分岐点",
      "tags": ["企業活動", "会計"]
    }
  ]
};

// 5. 生成文件
fs.writeFileSync(path.join(guideDir, 'ch5-s1.mdx'), mdxContent, 'utf8');
fs.writeFileSync(path.join(questionsDir, 'ch5.json'), JSON.stringify(questionsData, null, 2), 'utf8');
fs.writeFileSync(path.join(cardsDir, 'ch5.json'), JSON.stringify(cardsData, null, 2), 'utf8');

console.log("✅ 第5章（ITと企業商業戦略）のファイル生成が完了しました！");
console.log("- Guide: content/exams/itp/guide/ch5/ch5-s1.mdx");
console.log("- Questions: content/exams/itp/questions/ch5.json");
console.log("- Cards: content/exams/itp/cards/ch5.json");