const fs = require('fs');
const path = require('path');

// 1. 定义文件路径（极简命名规则）
const baseDir = process.cwd();
const guideDir = path.join(baseDir, 'content', 'exams', 'itp', 'guide', 'ch6');
const questionsDir = path.join(baseDir, 'content', 'exams', 'itp', 'questions');
const cardsDir = path.join(baseDir, 'content', 'exams', 'itp', 'cards');

// 自动创建目录
[guideDir, questionsDir, cardsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. MDX 学習ガイド内容（涵盖知识产权、安全法规、劳动法规）
const mdxContent = `---
examId: itp
chapterId: ch6
chapterNumber: 6
chapterTitle: 法務とコンプライアンス
sectionNumber: "6-1"
sectionTitle: 知的財産権・セキュリティ法規・労働法
updatedAt: "2026-06-16"
---

# 法務とコンプライアンス（法令遵守）

ITパスポートでは、ITエンジニアやビジネスパーソンが実務で必ず直面する法律の知識が問われます。「知的財産」「セキュリティ・個人情報」「労働と契約」の3つのカテゴリに分けて整理しましょう。

## 1. 知的財産権（アイデアや表現を守る法律）
人間の知的活動によって生み出されたアイデアや創作物などには、財産的な価値が認められ、法律で保護されます。

- **特許権**: 新しく高度な「発明（自然法則を利用した技術的思想の創作）」を保護する権利。（出願して登録される必要がある＝方式主義）
- **商標権**: 自社の商品やサービスを他社と区別するための「マーク（文字、図形、ロゴなど）」を保護する権利。
- **著作権**: 小説、音楽、絵画、そして**プログラム（ソースコード）**などの「思想又は感情を創作的に表現したもの」を保護する権利。
  - ※注意点※：作成した時点で自動的に権利が発生します（無方式主義）。ただし、プログラムの「アルゴリズム（処理手順）」や「プログラム言語そのもの」は著作権法では保護されません。
- **不正競争防止法**: 企業の「営業秘密（顧客リストや未公開の技術ノウハウなど）」を不正に取得したり使用したりする行為を禁止する法律。

## 2. セキュリティ関連法規と個人情報保護
デジタル社会において、データとシステムを守るためのルールです。

- **個人情報保護法**: 生存する特定の個人を識別できる情報（氏名、生年月日、顔写真、マイナンバーなど）の取り扱いルールを定めた法律。
- **不正アクセス禁止法**: 他人のIDやパスワードを無断で使用（なりすまし）したり、システムの脆弱性を突いてコンピュータに不正に侵入したりする行為を禁止・処罰する法律。
- **サイバーセキュリティ基本法**: 日本のサイバーセキュリティに関する施策の基本理念や、国・地方公共団体・インフラ事業者の責務を定めた法律。

## 3. 労働関連法規とその他の企業法務
特にIT業界で頻出する「契約形態」の違いは確実に出題されます。

- **労働者派遣と請負の違い（超頻出）**:
  - **派遣契約**: 派遣元の企業が雇用する労働者を、派遣先の企業に派遣します。労働者への**指揮命令権（仕事の指示を出す権利）は「派遣先（客先）」**にあります。
  - **請負契約**: 成果物（完成したシステムなど）を納品することを約束する契約です。労働者への**指揮命令権は「請負元（自社）」**にあります。客先が直接指示を出すと「偽装請負（違法）」になります。
- **下請法（下請代金支払遅延等防止法）**: 立場が弱い下請け企業を守るため、親事業者による不当な減額や支払いの遅延などを禁止する法律。
- **PL法（製造物責任法）**: 製品の欠陥によって消費者の生命、身体、財産に損害が生じた場合、製造業者が損害賠償の責任を負うことを定めた法律。（※ソフトウェアそのものは「製造物」に含まれませんが、ソフトウェアが組み込まれたハードウェアは対象になります）。
`;

// 3. 練習問題 JSON内容
const questionsData = {
  "examId": "itp",
  "chapterId": "ch6",
  "chapterTitle": "法務とコンプライアンス",
  "questions": [
    {
      "id": "itp-ch6-q1",
      "examId": "itp",
      "chapterId": "ch6",
      "type": "single",
      "text": "著作権法による保護の対象となるものはどれか。",
      "options": [
        { "label": "A", "text": "プログラムを作成するために使用したプログラミング言語" },
        { "label": "B", "text": "プログラムの論理的な手順であるアルゴリズム" },
        { "label": "C", "text": "データ通信のやり取りのルールであるプロトコル" },
        { "label": "D", "text": "自社で開発したシステムのソースコード" }
      ],
      "correctAnswer": "D",
      "explanation": "著作権法では「思想又は感情を創作的に表現したもの」が保護されます。プログラムのソースコードは保護対象ですが、その作成に使った「プログラム言語」「アルゴリズム（解法）」「プロトコル（規約）」は、誰もが使う公的なルールやアイデアとみなされ、著作権法では保護されません。",
      "tags": ["ストラテジ系", "法務", "著作権法"]
    },
    {
      "id": "itp-ch6-q2",
      "examId": "itp",
      "chapterId": "ch6",
      "type": "single",
      "text": "システム開発の契約形態において、発注元の企業（客先）が、受注側の企業の労働者に対して直接業務の指揮命令（作業指示）を行ってよい契約はどれか。",
      "options": [
        { "label": "A", "text": "請負契約" },
        { "label": "B", "text": "労働者派遣契約" },
        { "label": "C", "text": "準委任契約" },
        { "label": "D", "text": "秘密保持契約（NDA）" }
      ],
      "correctAnswer": "B",
      "explanation": "労働者派遣契約では、労働者への指揮命令権は「派遣先（客先）」にあります。請負契約や準委任契約において、発注元が労働者に直接指示を出すと「偽装請負」という違法行為になります。",
      "tags": ["ストラテジ系", "法務", "労働者派遣法"]
    },
    {
      "id": "itp-ch6-q3",
      "examId": "itp",
      "chapterId": "ch6",
      "type": "single",
      "text": "他人のIDとパスワードを無断で使用して、インターネット経由で社内システムにログインする行為を処罰の対象としている法律はどれか。",
      "options": [
        { "label": "A", "text": "不正アクセス禁止法" },
        { "label": "B", "text": "個人情報保護法" },
        { "label": "C", "text": "不正競争防止法" },
        { "label": "D", "text": "プロバイダ責任制限法" }
      ],
      "correctAnswer": "A",
      "explanation": "不正アクセス禁止法は、他人のIDやパスワードを不正に入手・使用して（なりすまし）、本来アクセス権限のないシステムへ侵入する行為を禁止しています。",
      "tags": ["ストラテジ系", "法務", "不正アクセス禁止法"]
    }
  ]
};

// 4. 知識カード JSON内容
const cardsData = {
  "examId": "itp",
  "chapterId": "ch6",
  "chapterTitle": "法務とコンプライアンス",
  "cards": [
    {
      "id": "itp-ch6-card1",
      "examId": "itp",
      "chapterId": "ch6",
      "front": "ソフトウェアのソースコードなど、創作した時点で自動的に権利が発生し、手続きを必要としない（無方式主義）知的財産権は何か？",
      "back": "著作権",
      "tags": ["法務", "知的財産権"]
    },
    {
      "id": "itp-ch6-card2",
      "examId": "itp",
      "chapterId": "ch6",
      "front": "顧客名簿や未公開の技術ノウハウなど、企業が持つ「営業秘密」を不正に取得したり使用したりする行為を禁じる法律は？",
      "back": "不正競争防止法",
      "tags": ["法務", "不正競争防止法"]
    },
    {
      "id": "itp-ch6-card3",
      "examId": "itp",
      "chapterId": "ch6",
      "front": "成果物の完成（システムの納品など）に対して報酬が支払われる契約であり、発注元が労働者に直接指揮命令をしてはいけない契約形態は？",
      "back": "請負契約",
      "tags": ["法務", "労働法"]
    },
    {
      "id": "itp-ch6-card4",
      "examId": "itp",
      "chapterId": "ch6",
      "front": "親事業者による不当な代金減額や、支払いの遅延などを禁止し、立場の弱い受注側を守るための法律は？",
      "back": "下請法（下請代金支払遅延等防止法）",
      "tags": ["法務", "企業法務"]
    }
  ]
};

// 5. 生成文件
fs.writeFileSync(path.join(guideDir, 'ch6-s1.mdx'), mdxContent, 'utf8');
fs.writeFileSync(path.join(questionsDir, 'ch6.json'), JSON.stringify(questionsData, null, 2), 'utf8');
fs.writeFileSync(path.join(cardsDir, 'ch6.json'), JSON.stringify(cardsData, null, 2), 'utf8');

console.log("✅ 第6章（法務とコンプライアンス）のファイル生成が完了しました！");
console.log("- Guide: content/exams/itp/guide/ch6/ch6-s1.mdx");
console.log("- Questions: content/exams/itp/questions/ch6.json");
console.log("- Cards: content/exams/itp/cards/ch6.json");