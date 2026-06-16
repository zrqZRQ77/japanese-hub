const fs = require('fs');
const path = require('path');

// 1. 定义文件路径
const baseDir = process.cwd();
const guideDir = path.join(baseDir, 'content', 'exams', 'itp', 'guide', 'ch1');
const questionsDir = path.join(baseDir, 'content', 'exams', 'itp', 'questions');
const cardsDir = path.join(baseDir, 'content', 'exams', 'itp', 'cards');

// 自动创建目录
[guideDir, questionsDir, cardsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. MDX 学習ガイド内容
const mdxContent = `---
examId: itp
chapterId: ch1
chapterNumber: 1
chapterTitle: ITの基礎と論理
sectionNumber: "1-1"
sectionTitle: コンピュータの構成とソフトウェア
updatedAt: "2026-06-16"
---

# コンピュータの構成要素とソフトウェア

ITパスポートのテクノロジ系において、ハードウェアとソフトウェアの基礎はすべての土台となります。

## 1. コンピュータの5大装置
コンピュータは、人間が手作業で行う情報処理を自動化する仕組みであり、以下の5つの基本的な装置で構成されています。

1. **演算装置**: データの計算や比較を行います（CPUの役割）。
2. **制御装置**: 記憶装置からプログラムを読み込み、他の各装置に指示を出します（CPUの役割）。
3. **記憶装置**: データやプログラムを保存します。
   - **主記憶装置（メインメモリ）**: CPUが直接読み書きする高速な領域ですが、電源を切るとデータが消えます（RAM）。
   - **補助記憶装置**: 電源を切ってもデータが消えない領域です（HDD、SSD、USBメモリなど）。
4. **入力装置**: 外部からデータを読み込みます（キーボード、マウス、マイクなど）。
5. **出力装置**: 処理された結果を外部へ出します（ディスプレイ、プリンタなど）。

## 2. ソフトウェアとOSS
ソフトウェアは大きく2つの階層に分かれます。

- **基本ソフトウェア（OS）**: Windows、macOS、Linux、iOSなど。ハードウェアとアプリケーションの橋渡しをします。
- **応用ソフトウェア（アプリケーション）**: Word、Excel、ブラウザなど、特定の目的のために使われます。

### OSS（Open Source Software）
ソースコードが公開されており、一定の条件（ライセンス）のもとで、誰でも**自由に使用・複製・改変・再配布**できるソフトウェアのことです。
代表例：Linux（OS）、MySQL（データベース）、WordPress（CMS）。
`;

// 3. 練習問題 JSON内容
const questionsData = {
  "examId": "itp",
  "chapterId": "ch1",
  "chapterTitle": "ITの基礎と論理",
  "questions": [
    {
      "id": "itp-ch1-q1",
      "examId": "itp",
      "chapterId": "ch1",
      "type": "single",
      "text": "コンピュータの5大装置のうち、プログラムの命令を解読し、他の各装置に指示を与える装置はどれか。",
      "options": [
        { "label": "A", "text": "演算装置" },
        { "label": "B", "text": "記憶装置" },
        { "label": "C", "text": "制御装置" },
        { "label": "D", "text": "入力装置" }
      ],
      "correctAnswer": "C",
      "explanation": "制御装置は、主記憶装置からプログラムの命令を取り出して解読し、他の装置（演算、記憶、入力、出力）に適切な指示を出す役割を持ちます。演算装置は計算を行う部分です。",
      "tags": ["テクノロジ系", "ハードウェア", "5大装置"]
    },
    {
      "id": "itp-ch1-q2",
      "examId": "itp",
      "chapterId": "ch1",
      "type": "single",
      "text": "OSS（Open Source Software）に関する記述として、最も適切なものはどれか。",
      "options": [
        { "label": "A", "text": "ソースコードが公開されているが、無断で改変して再配布することは一切禁止されている。" },
        { "label": "B", "text": "ライセンスの条件に従えば、誰でも自由に使用、改変、再配布ができる。" },
        { "label": "C", "text": "個人利用は無料だが、企業が業務目的で利用する場合は必ず有償ライセンスが必要となる。" },
        { "label": "D", "text": "バグや脆弱性が発見された場合、開発元が修正プログラムを必ず提供する義務を負っている。" }
      ],
      "correctAnswer": "B",
      "explanation": "OSSはソースコードが公開されており、定められたライセンス条件に従うことで、利用・改変・再配布が自由にできるソフトウェアです。無保証であることが多く、開発元に修正義務（D）はありません。",
      "tags": ["テクノロジ系", "ソフトウェア", "OSS"]
    }
  ]
};

// 4. 知識カード JSON内容
const cardsData = {
  "examId": "itp",
  "chapterId": "ch1",
  "chapterTitle": "ITの基礎と論理",
  "cards": [
    {
      "id": "itp-ch1-card1",
      "examId": "itp",
      "chapterId": "ch1",
      "front": "コンピュータの5大装置をすべて挙げよ。",
      "back": "演算装置、制御装置、記憶装置、入力装置、出力装置",
      "tags": ["ハードウェア"]
    },
    {
      "id": "itp-ch1-card2",
      "examId": "itp",
      "chapterId": "ch1",
      "front": "電源を切ると記憶内容が消去される性質を持つ主記憶装置（メインメモリ）の通称は？",
      "back": "RAM（Random Access Memory）",
      "tags": ["ハードウェア", "メモリ"]
    },
    {
      "id": "itp-ch1-card3",
      "examId": "itp",
      "chapterId": "ch1",
      "front": "ソースコードが公開され、誰でも自由に使用・改変・再配布できるソフトウェアの総称は？",
      "back": "OSS（Open Source Software）",
      "tags": ["ソフトウェア"]
    }
  ]
};

// 5. 生成文件
fs.writeFileSync(path.join(guideDir, 'ch1-s1.mdx'), mdxContent, 'utf8');
fs.writeFileSync(path.join(questionsDir, 'ch1.json'), JSON.stringify(questionsData, null, 2), 'utf8');
fs.writeFileSync(path.join(cardsDir, 'ch1.json'), JSON.stringify(cardsData, null, 2), 'utf8');

console.log("✅ 第1章（ITの基礎と論理）のファイル生成が完了しました！");
console.log("- Guide: content/exams/itp/guide/ch1/ch1-s1.mdx");
console.log("- Questions: content/exams/itp/questions/ch1.json");
console.log("- Cards: content/exams/itp/cards/ch1.json");