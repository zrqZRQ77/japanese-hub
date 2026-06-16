const fs = require('fs');
const path = require('path');

// 1. 定义文件路径（恢复极简命名）
const baseDir = process.cwd();
const guideDir = path.join(baseDir, 'content', 'exams', 'itp', 'guide', 'ch3');
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
chapterId: ch3
chapterNumber: 3
chapterTitle: 情報セキュリティ
sectionNumber: "3-1"
sectionTitle: セキュリティの脅威と暗号化技術
updatedAt: "2026-06-16"
---

# セキュリティの脅威と暗号化技術

ITパスポート試験において、情報セキュリティは最も出題数が多い最重要分野です。脅威の種類と、それを防ぐ技術をセットで覚えましょう。

## 1. マルウェアとサイバー攻撃
悪意のあるソフトウェアの総称を**マルウェア（Malware）**と呼びます。

- **ランサムウェア（Ransomware）**: PCやファイルを暗号化して使用不能にし、元に戻すことと引き換えに身代金（ランサム）を要求する不正プログラム。
- **トロイの木馬**: 有用なソフトウェアを装って侵入し、バックドア（裏口）を作ったりデータを盗んだりするプログラム。

### 代表的な攻撃手法
- **フィッシング（Phishing）**: 偽のメールやWebサイトを使って、パスワードやクレジットカード番号を騙し取る詐欺。
- **DoS / DDoS攻撃**: 標的のサーバに大量のデータを送りつけ、システムをダウンさせる攻撃。
- **SQLインジェクション**: データベースと連動したWebサイトの入力フォームに不正なSQL文を入力し、データを改ざん・漏えいさせる攻撃。

## 2. 暗号化技術
データを第三者に読み取られないようにする技術です。暗号化と復号（元に戻すこと）には「鍵」を使います。

- **共通鍵暗号方式**: 暗号化と復号に「同じ鍵」を使います。処理が高速ですが、鍵を安全に相手に渡す必要があります。
- **公開鍵暗号方式**: 暗号化には「公開鍵（誰でも使える）」、復号には「秘密鍵（自分だけが持つ）」という異なる2つの鍵を使います。処理は遅いですが、鍵の受け渡しが安全です。（※RSAなどが代表的）

## 3. 防御と認証技術
- **ファイアウォール（Firewall）**: 内部ネットワークと外部ネットワークの境界に設置し、不正なアクセスをブロックする仕組み。
- **バイオメトリクス認証（生体認証）**: 指紋、静脈、顔、虹彩など、人間の身体的特徴や行動的特徴を用いて本人確認を行う技術。
`;

// 3. 練習問題 JSON内容
const questionsData = {
  "examId": "itp",
  "chapterId": "ch3",
  "chapterTitle": "情報セキュリティ",
  "questions": [
    {
      "id": "itp-ch3-q1",
      "examId": "itp",
      "chapterId": "ch3",
      "type": "single",
      "text": "公開鍵暗号方式において、送信者が受信者に暗号文を送る場合、暗号化に使用する鍵はどれか。",
      "options": [
        { "label": "A", "text": "送信者の公開鍵" },
        { "label": "B", "text": "送信者の秘密鍵" },
        { "label": "C", "text": "受信者の公開鍵" },
        { "label": "D", "text": "受信者の秘密鍵" }
      ],
      "correctAnswer": "C",
      "explanation": "公開鍵暗号方式では、暗号化には「受信者の公開鍵（広く公開されている）」を使い、復号には「受信者の秘密鍵（受信者本人しか持っていない）」を使います。これにより、受信者だけが暗号文を解読できます。",
      "tags": ["テクノロジ系", "セキュリティ", "暗号化"]
    },
    {
      "id": "itp-ch3-q2",
      "examId": "itp",
      "chapterId": "ch3",
      "type": "single",
      "text": "PC内のファイルを勝手に暗号化し、元に戻すためのパスワードを教える条件として金銭を要求するマルウェアはどれか。",
      "options": [
        { "label": "A", "text": "キーロガー" },
        { "label": "B", "text": "ランサムウェア" },
        { "label": "C", "text": "スパイウェア" },
        { "label": "D", "text": "ボット" }
      ],
      "correctAnswer": "B",
      "explanation": "ランサムウェア（Ransomware）は、Ransom（身代金）とSoftware（ソフトウェア）を組み合わせた造語で、データを人質に取って身代金を要求するマルウェアです。",
      "tags": ["テクノロジ系", "セキュリティ", "マルウェア"]
    }
  ]
};

// 4. 知識カード JSON内容
const cardsData = {
  "examId": "itp",
  "chapterId": "ch3",
  "chapterTitle": "情報セキュリティ",
  "cards": [
    {
      "id": "itp-ch3-card1",
      "examId": "itp",
      "chapterId": "ch3",
      "front": "実在する企業などを装ったメールを送り、偽のWebサイトに誘導して個人情報を入力させる詐欺手法は？",
      "back": "フィッシング（Phishing）",
      "tags": ["セキュリティ", "サイバー攻撃"]
    },
    {
      "id": "itp-ch3-card2",
      "examId": "itp",
      "chapterId": "ch3",
      "front": "内部ネットワークとインターネットの境界に設置され、許可されていない不正な通信を遮断する仕組みは？",
      "back": "ファイアウォール（Firewall）",
      "tags": ["セキュリティ", "ネットワーク"]
    },
    {
      "id": "itp-ch3-card3",
      "examId": "itp",
      "chapterId": "ch3",
      "front": "データベースと連携したWebアプリケーションの脆弱性を突き、不正な命令文を入力してデータを改ざん・窃取する攻撃は？",
      "back": "SQLインジェクション",
      "tags": ["セキュリティ", "サイバー攻撃"]
    }
  ]
};

// 5. 生成文件（使用极简命名）
fs.writeFileSync(path.join(guideDir, 'ch3-s1.mdx'), mdxContent, 'utf8');
fs.writeFileSync(path.join(questionsDir, 'ch3.json'), JSON.stringify(questionsData, null, 2), 'utf8');
fs.writeFileSync(path.join(cardsDir, 'ch3.json'), JSON.stringify(cardsData, null, 2), 'utf8');

console.log("✅ 第3章（情報セキュリティ）のファイル生成が完了しました！");
console.log("- Guide: content/exams/itp/guide/ch3/ch3-s1.mdx");
console.log("- Questions: content/exams/itp/questions/ch3.json");
console.log("- Cards: content/exams/itp/cards/ch3.json");