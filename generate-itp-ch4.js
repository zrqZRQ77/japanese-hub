const fs = require('fs');
const path = require('path');

// 1. 定义文件路径（极简命名规则）
const baseDir = process.cwd();
const guideDir = path.join(baseDir, 'content', 'exams', 'itp', 'guide', 'ch4');
const questionsDir = path.join(baseDir, 'content', 'exams', 'itp', 'questions');
const cardsDir = path.join(baseDir, 'content', 'exams', 'itp', 'cards');

// 自动创建目录
[guideDir, questionsDir, cardsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. MDX 学習ガイド内容（系统开发与管理全流程）
const mdxContent = `---
examId: itp
chapterId: ch4
chapterNumber: 4
chapterTitle: システムの開発と管理
sectionNumber: "4-1"
sectionTitle: 開発プロセス・プロジェクト・サービス管理
updatedAt: "2026-06-16"
---

# システムの開発プロセスとプロジェクト管理

ITパスポートのマネジメント系では、システムを「どのように作るか（開発技術）」、「どのように計画・進行するか（プロジェクト管理）」、「完成後にどう運用するか（サービス管理）」の3本柱が出題されます。

## 1. システム開発技術（どう作るか）
システム開発には様々な手法がありますが、代表的な2つを対比して覚えることが重要です。

- **ウォーターフォールモデル**: 水が高いところから低いところへ流れるように、要件定義→設計→プログラミング→テストという工程を順番に進める手法。原則として前の工程には戻らないため、スケジュール管理がしやすい反面、仕様変更に弱いです。
- **アジャイル開発**: 短期間（イテレーション/スプリントと呼ばれる1〜4週間）で開発とテストを繰り返し、少しずつ機能をリリースしていく手法。仕様変更に柔軟に対応できるのが特徴です。
- **DevOps**: 開発担当者（Development）と運用担当者（Operations）が連携・協力し、システムを迅速に改善していく考え方です。

### テスト工程
開発したシステムが正しく動くか確認する工程も、下から上へと段階的に行われます。
1. **単体テスト**: プログラムの最小単位（モジュール）ごとの動作確認。
2. **結合テスト**: 複数のモジュールを繋ぎ合わせて、データ連携の動作確認。
3. **システムテスト**: システム全体が要件を満たしているかの総合確認。
4. **受入テスト**: 発注者（ユーザ）側が、実際の業務で使えるかどうかを最終確認。

## 2. プロジェクトマネジメント（どう進行するか）
プロジェクトを成功させるためには、**QCD（Quality：品質、Cost：費用、Delivery：納期）**のバランスを管理する必要があります。

- **WBS（Work Breakdown Structure）**: プロジェクトの作業をツリー状に細かく分解し、やるべき作業（タスク）を洗い出す手法。スケジュールの土台となります。
- **ガントチャート**: 縦軸に作業項目、横軸に時間をとり、帯状のグラフでスケジュールの予定と実績を視覚化した図。
- **アローダイアグラム（PERT図）**: 作業の順序関係を矢印で結んだ図。プロジェクト全体の所要時間を決める、遅延が許されない最長の経路を**クリティカルパス**と呼びます。

## 3. サービスマネジメントとシステム監査（どう運用・評価するか）
完成したシステムを安定稼働させ、ユーザに価値を提供し続けるための管理です。

- **ITIL（IT Infrastructure Library）**: ITサービスマネジメントの成功事例（ベストプラクティス）を体系化したガイドライン。
- **SLA（Service Level Agreement：サービスレベル合意書）**: サービスの提供者と利用者の間で結ぶ、サービスの品質（稼働率や対応時間など）に関する明文化された約束事。
- **システム監査**: 独立した第三者（システム監査人）が、情報システムのリスク管理や統制が適切に行われているかを客観的に評価する制度です。監査人は「助言・勧告」を行いますが、自ら改善の「実行」はしません。
`;

// 3. 練習問題 JSON内容
const questionsData = {
  "examId": "itp",
  "chapterId": "ch4",
  "chapterTitle": "システムの開発と管理",
  "questions": [
    {
      "id": "itp-ch4-q1",
      "examId": "itp",
      "chapterId": "ch4",
      "type": "single",
      "text": "システム開発の手法のうち、短期間に開発とテストのサイクルを繰り返し、要件の変更に柔軟に対応することを目的とした手法はどれか。",
      "options": [
        { "label": "A", "text": "ウォーターフォールモデル" },
        { "label": "B", "text": "アジャイル開発" },
        { "label": "C", "text": "リバースエンジニアリング" },
        { "label": "D", "text": "プロトタイピング" }
      ],
      "correctAnswer": "B",
      "explanation": "アジャイル（Agile：俊敏な）開発は、短い期間単位で開発とリリースを繰り返し、仕様変更にも柔軟に対応できる現代の主流な開発手法です。ウォーターフォールモデルは原則として後戻りしない手法です。",
      "tags": ["マネジメント系", "システム開発技術", "アジャイル"]
    },
    {
      "id": "itp-ch4-q2",
      "examId": "itp",
      "chapterId": "ch4",
      "type": "single",
      "text": "プロジェクトのスケジュール管理において、作業の順序関係や依存関係を視覚的に表現し、クリティカルパスを特定するために用いられる図はどれか。",
      "options": [
        { "label": "A", "text": "特性要因図" },
        { "label": "B", "text": "パレート図" },
        { "label": "C", "text": "ガントチャート" },
        { "label": "D", "text": "アローダイアグラム" }
      ],
      "correctAnswer": "D",
      "explanation": "アローダイアグラム（PERT図）は作業の順序を矢印で結んだ図で、クリティカルパス（遅れが許されない最長経路）の特定に使われます。ガントチャートは予定と実績の進捗を横棒グラフで表すものです。",
      "tags": ["マネジメント系", "プロジェクトマネジメント", "アローダイアグラム"]
    },
    {
      "id": "itp-ch4-q3",
      "examId": "itp",
      "chapterId": "ch4",
      "type": "single",
      "text": "ITサービスマネジメントにおいて、サービスの提供者と利用者の間で、提供するサービスの内容や品質の目標値（稼働率など）を合意し、明文化した文書を何というか。",
      "options": [
        { "label": "A", "text": "NDA" },
        { "label": "B", "text": "SLA" },
        { "label": "C", "text": "RFP" },
        { "label": "D", "text": "BCP" }
      ],
      "correctAnswer": "B",
      "explanation": "SLA（Service Level Agreement）はサービスレベル合意書のことです。NDAは秘密保持契約、RFPは提案依頼書、BCPは事業継続計画を指します。",
      "tags": ["マネジメント系", "サービスマネジメント", "SLA"]
    }
  ]
};

// 4. 知識カード JSON内容
const cardsData = {
  "examId": "itp",
  "chapterId": "ch4",
  "chapterTitle": "システムの開発と管理",
  "cards": [
    {
      "id": "itp-ch4-card1",
      "examId": "itp",
      "chapterId": "ch4",
      "front": "プロジェクト管理において、プロジェクト全体の作業を細かく分割し、ツリー状に構造化して洗い出す手法は？",
      "back": "WBS（Work Breakdown Structure）",
      "tags": ["プロジェクト管理", "WBS"]
    },
    {
      "id": "itp-ch4-card2",
      "examId": "itp",
      "chapterId": "ch4",
      "front": "ITサービスマネジメントのベストプラクティス（成功事例）を集め、体系化したガイドラインの名称は？",
      "back": "ITIL（IT Infrastructure Library）",
      "tags": ["サービスマネジメント", "ITIL"]
    },
    {
      "id": "itp-ch4-card3",
      "examId": "itp",
      "chapterId": "ch4",
      "front": "開発担当者と運用担当者が緊密に連携・協力し、ソフトウェアの導入や更新を迅速に進める概念は？",
      "back": "DevOps（デブオプス）",
      "tags": ["開発技術", "DevOps"]
    },
    {
      "id": "itp-ch4-card4",
      "examId": "itp",
      "chapterId": "ch4",
      "front": "情報システムの監査において、監査人が備えておくべき最も重要なスタンス（立場）は何か？",
      "back": "独立性と客観性（第三者の立場であること）",
      "tags": ["システム監査"]
    }
  ]
};

// 5. 生成文件
fs.writeFileSync(path.join(guideDir, 'ch4-s1.mdx'), mdxContent, 'utf8');
fs.writeFileSync(path.join(questionsDir, 'ch4.json'), JSON.stringify(questionsData, null, 2), 'utf8');
fs.writeFileSync(path.join(cardsDir, 'ch4.json'), JSON.stringify(cardsData, null, 2), 'utf8');

console.log("✅ 第4章（システムの開発と管理）のファイル生成が完了しました！");
console.log("- Guide: content/exams/itp/guide/ch4/ch4-s1.mdx");
console.log("- Questions: content/exams/itp/questions/ch4.json");
console.log("- Cards: content/exams/itp/cards/ch4.json");