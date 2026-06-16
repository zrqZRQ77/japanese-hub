const fs = require('fs');
const path = require('path');

// 1. 定义文件路径（使用极简命名）
const baseDir = process.cwd();
const guideDir = path.join(baseDir, 'content', 'exams', 'itp', 'guide', 'ch2');
const questionsDir = path.join(baseDir, 'content', 'exams', 'itp', 'questions');
const cardsDir = path.join(baseDir, 'content', 'exams', 'itp', 'cards');

// 自动创建目录
[guideDir, questionsDir, cardsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. MDX 学習ガイド内容（涵盖网络、DB、UI/UX）
const mdxContent = `---
examId: itp
chapterId: ch2
chapterNumber: 2
chapterTitle: ネットワークとデータ
sectionNumber: "2-1"
sectionTitle: ネットワーク・DB・情報デザイン
updatedAt: "2026-06-16"
---

# ネットワーク・データベース・情報デザイン

ITパスポートのテクノロジ系において、データの保存（DB）、データの伝送（ネットワーク）、そしてデータを人間にどう見せるか（情報デザイン）はセットで出題されます。

## 1. ネットワークの基礎
コンピュータ同士を繋ぐネットワークの基本です。

- **LAN（Local Area Network）**: 会社や家庭など、限られた範囲のネットワーク。
- **WAN（Wide Area Network）**: 通信事業者の回線を利用し、遠隔地のLAN同士を結ぶ広域ネットワーク。
- **TCP/IP**: インターネットで標準的に使われる通信プロトコル（通信の約束事）。
- **DNS（Domain Name System）**: 「www.example.com」のようなドメイン名と、「192.168.1.1」のようなIPアドレスを相互に変換する仕組みです。

## 2. データベース（DB）の基礎
現在主流なのは、データを「行」と「列」を持つ表形式で管理する **関係データベース（リレーショナルデータベース：RDB）** です。

- **主キー（Primary Key）**: 表の中で、1つの行を特定するための列（例：社員番号）。重複や空（NULL）は許されません。
- **外部キー（Foreign Key）**: 別の表の主キーを参照し、表同士を関連付けるための列。
- **SQL**: データベースを操作するための言語（SELECT、UPDATE、INSERT、DELETEなど）。

## 3. 情報デザインとUI/UX
システムを人間が使いやすくするための設計思想です。

- **UI（User Interface）**: 画面のレイアウトやボタンの配置など、ユーザとシステムの接点。
- **UX（User Experience）**: 製品やサービスを通じてユーザが得られる体験や満足感。
- **アクセシビリティ（Accessibility）**: 年齢や障害の有無にかかわらず、誰もが情報やサービスを支障なく利用できる度合いのこと。
`;

// 3. 練習問題 JSON内容
const questionsData = {
  "examId": "itp",
  "chapterId": "ch2",
  "chapterTitle": "ネットワークとデータ",
  "questions": [
    {
      "id": "itp-ch2-q1",
      "examId": "itp",
      "chapterId": "ch2",
      "type": "single",
      "text": "インターネットにおいて、ドメイン名とIPアドレスを相互に変換する仕組みはどれか。",
      "options": [
        { "label": "A", "text": "DHCP" },
        { "label": "B", "text": "DNS" },
        { "label": "C", "text": "FTP" },
        { "label": "D", "text": "NTP" }
      ],
      "correctAnswer": "B",
      "explanation": "DNS（Domain Name System）は、人間が覚えやすいドメイン名と、コンピュータが処理するIPアドレスを紐付けて変換するシステムです。DHCPはIPアドレスの自動割り当て、FTPはファイル転送、NTPは時刻同期のプロトコルです。",
      "tags": ["テクノロジ系", "ネットワーク", "DNS"]
    },
    {
      "id": "itp-ch2-q2",
      "examId": "itp",
      "chapterId": "ch2",
      "type": "single",
      "text": "年齢や障害の有無にかかわらず、多様な人々がWebサイトやシステムを支障なく利用できる度合いを示す用語はどれか。",
      "options": [
        { "label": "A", "text": "アクセシビリティ" },
        { "label": "B", "text": "トレーサビリティ" },
        { "label": "C", "text": "スケーラビリティ" },
        { "label": "D", "text": "ダイバーシティ" }
      ],
      "correctAnswer": "A",
      "explanation": "アクセシビリティ（Accessibility）は「アクセスのしやすさ」を意味し、誰でも使える状態を指します。トレーサビリティは追跡可能性、スケーラビリティは拡張性を示します。",
      "tags": ["テクノロジ系", "情報デザイン", "アクセシビリティ"]
    }
  ]
};

// 4. 知識カード JSON内容
const cardsData = {
  "examId": "itp",
  "chapterId": "ch2",
  "chapterTitle": "ネットワークとデータ",
  "cards": [
    {
      "id": "itp-ch2-card1",
      "examId": "itp",
      "chapterId": "ch2",
      "front": "製品やシステムを通じて、ユーザが獲得する体験や満足感の総称をアルファベット2文字で何というか？",
      "back": "UX（User Experience）",
      "tags": ["情報デザイン", "UX"]
    },
    {
      "id": "itp-ch2-card2",
      "examId": "itp",
      "chapterId": "ch2",
      "front": "関係データベースにおいて、特定の行を一意に識別するため、重複や空値が許されない項目（列）は？",
      "back": "主キー（Primary Key）",
      "tags": ["データベース", "主キー"]
    },
    {
      "id": "itp-ch2-card3",
      "examId": "itp",
      "chapterId": "ch2",
      "front": "インターネットなどの通信ネットワークにおいて、標準的に利用されている通信プロトコル（規約）は？",
      "back": "TCP/IP",
      "tags": ["ネットワーク", "プロトコル"]
    }
  ]
};

// 5. 生成文件（严格遵照第一章的极简命名）
fs.writeFileSync(path.join(guideDir, 'ch2-s1.mdx'), mdxContent, 'utf8');
fs.writeFileSync(path.join(questionsDir, 'ch2.json'), JSON.stringify(questionsData, null, 2), 'utf8');
fs.writeFileSync(path.join(cardsDir, 'ch2.json'), JSON.stringify(cardsData, null, 2), 'utf8');

console.log("✅ 第2章（ネットワークとデータ）のファイル生成が完了しました！");
console.log("- Guide: content/exams/itp/guide/ch2/ch2-s1.mdx");
console.log("- Questions: content/exams/itp/questions/ch2.json");
console.log("- Cards: content/exams/itp/cards/ch2.json");