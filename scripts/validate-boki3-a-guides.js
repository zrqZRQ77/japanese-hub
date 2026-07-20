const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const caseData = require('../content/exams/boki3/a-grade/ch4-cash-over-short-case')

const root = path.resolve(__dirname, '..')
const issues = []
const checks = []

function fail(message) {
  issues.push(message)
}

function assert(condition, label) {
  checks.push(label)
  if (!condition) fail(label)
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8')
}

function readGuide(chapter, file) {
  const relative = `content/exams/boki3/guide/${chapter}/${file}`
  const parsed = matter(read(relative))
  return { relative, frontmatter: parsed.data, body: parsed.content, text: read(relative) }
}

function sumLines(lines) {
  return lines.reduce((sum, [, amount]) => sum + amount, 0)
}

function entryDelta(entry, account) {
  let delta = 0
  for (const [name, amount] of entry.debit) {
    if (name === account) delta += amount
  }
  for (const [name, amount] of entry.credit) {
    if (name === account) delta -= amount
  }
  return delta
}

function sideAmountFromNet(net) {
  if (net > 0) return { side: 'debit', amount: net }
  if (net < 0) return { side: 'credit', amount: -net }
  return { side: 'zero', amount: 0 }
}

function assertBalanced(entry, label) {
  assert(sumLines(entry.debit) === sumLines(entry.credit), `${label}: debit and credit must balance`)
}

function assertBalance(actual, expected, label) {
  assert(actual.side === expected.side && actual.amount === expected.amount, `${label}: expected ${expected.side} ${expected.amount}, got ${actual.side} ${actual.amount}`)
}

function assertIncludes(text, terms, label) {
  for (const term of terms) {
    assert(text.includes(term), `${label}: missing "${term}"`)
  }
}

function assertPattern(text, pattern, label) {
  assert(pattern.test(text), `${label}: pattern not found`)
}

function validateCases() {
  assert(caseData.id === 'boki3-ch4-cash-over-short-a-grade-case', 'case id')
  assert(caseData.confirmedAt === '2026-07-20', 'case confirmedAt')
  assert(caseData.fiscalYear === 2026, 'case fiscalYear')
  assert(caseData.cases.length === 2, 'case count')

  for (const item of caseData.cases) {
    const absoluteDifference = Math.abs(item.bookCash - item.actualCash)
    assert(absoluteDifference === item.initialDifference, `${item.id}: initial difference`)
    let cashOverShortNet = 0
    item.entries.forEach((entry, index) => {
      assertBalanced(entry, `${item.id}/${entry.id}`)
      cashOverShortNet += entryDelta(entry, '現金過不足')
      assertBalance(sideAmountFromNet(cashOverShortNet), entry.cashOverShortBalanceAfter, `${item.id}/${entry.id} balance after`)
      if (index > 0) {
        const cashDelta = entryDelta(entry, '現金')
        assert(cashDelta === 0, `${item.id}/${entry.id}: cash must not move after discovery`)
      }
    })
    assertBalance(sideAmountFromNet(cashOverShortNet), item.finalCashOverShortBalance, `${item.id}: final cash over short`)
    assert(cashOverShortNet === 0, `${item.id}: cash over short must close to zero`)
  }
}

function validateCh4S5() {
  const guide = readGuide('ch4', 'ch4-s5.mdx')
  assert(guide.frontmatter.updatedAt === '2026-07-20', 'ch4-s5 updatedAt')
  assertIncludes(guide.text, ['**適用年度：** 2026年度', '**最終確認日：** 2026年7月20日'], 'ch4-s5 dates')
  assertIncludes(guide.body, [
    '差額の発見 → 原因の一部判明 → 原因不明残高の確定 → 雑損・雑益への振替 → 現金過不足残高ゼロ',
    '青葉商事株式会社',
    '帳簿上の現金残高126,500円、実際有高121,000円',
    '水道光熱費 | 3,200 | 現金過不足 | 3,200',
    '現金過不足 | 1,000 | 売上 | 1,000',
    '雑損 | 3,300 | 現金過不足 | 3,300',
    '帳簿上の現金残高80,000円、実際有高84,500円',
    '現金過不足 | 2,000 | 売掛金 | 2,000',
    '現金過不足 | 2,500 | 雑益 | 2,500',
    'T勘定',
    '現金過不足の残高を必ずゼロにします',
  ], 'ch4-s5 required content')
  assertIncludes(guide.body, [
    '/exams/boki3/guide/ch4/ch4-s1',
    '/exams/boki3/guide/ch4/ch4-s4',
    '/exams/boki3/guide/ch12/ch12-s2',
    '/exams/boki3/questions/ch4',
    '/exams/boki3/cards?chapter=ch4&card=boki3-ch4-card4',
    '/exams/boki3/cards?chapter=ch4&card=boki3-ch4-card9',
    '/exams/boki3/cards?chapter=ch4&card=boki3-ch4-card10',
  ], 'ch4-s5 deep links')
  assert(!/mock-exam|模擬試験/.test(guide.body), 'ch4-s5 must not reference mock exam')
  assert(!/\?section=/.test(guide.body), 'ch4-s5 must not contain legacy ?section= links')
  for (const term of ['判断流程', '推導', '自検方法', '鏡像簡例', '自检', '反查']) {
    assert(!guide.body.includes(term), `ch4-s5 must not contain non-natural term: ${term}`)
  }
  const exerciseCount = (guide.body.match(/^## 記述式練習/gm) || []).length
  assert(exerciseCount === 2, 'ch4-s5 must contain two non-choice exercises')
  const answerCount = (guide.body.match(/^### 解答/gm) || []).length
  assert(answerCount === 2, 'ch4-s5 must contain two complete answers')
}

function validateNeighborGuides() {
  const ch4s4 = readGuide('ch4', 'ch4-s4.mdx').body
  assertIncludes(ch4s4, ['報告と補給が同時', '別仕訳2本', '相殺後の仕訳1本', '二重計上'], 'ch4-s4 same-day petty cash')
  assertPattern(ch4s4, /別仕訳2本で処理するか、相殺後の仕訳1本で処理するかのどちらか/, 'ch4-s4 exclusive methods')

  const ch8s2 = readGuide('ch8', 'ch8-s2.mdx').body
  assertIncludes(ch8s2, ['固定資産売却', '取得原価', '減価償却累計額', '帳簿価額', '固定資産売却益'], 'ch8-s2 fixed asset sale terms')

  const ch9s2 = readGuide('ch9', 'ch9-s2.mdx').body
  assertIncludes(ch9s2, ['取得日', '当期使用月数', '端数処理', '問題文に円未満の処理方法が指定されている場合は、その指示に従います'], 'ch9-s2 date/month/fraction rules')

  const ch9s3 = readGuide('ch9', 'ch9-s3.mdx').body
  assertIncludes(ch9s3, ['売却日', '当期使用月数', 'X9年8月31日に売却', '5か月'], 'ch9-s3 sale date and months')

  const ch10s3 = readGuide('ch10', 'ch10-s3.mdx').body
  assertIncludes(ch10s3, ['再振替仕訳を求められた場合', '指示のない期首仕訳を追加しない', '決算整理だけを求める問題に再振替を追加する'], 'ch10-s3 reversal only when asked')

  const ch13s2 = readGuide('ch13', 'ch13-s2.mdx').body
  assertIncludes(ch13s2, ['営業循環', '決算日の翌日から1年以内', '問題で指定された表示区分に従います'], 'ch13-s2 operating cycle and one-year rule')

  const chapterWork = [
    readGuide('ch1', 'ch1-s1.mdx').body,
    readGuide('ch1', 'ch1-s2.mdx').body,
    readGuide('ch1', 'ch1-s3.mdx').body,
    readGuide('ch2', 'ch2-s1.mdx').body,
    readGuide('ch2', 'ch2-s2.mdx').body,
    readGuide('ch13', 'ch13-s1.mdx').body,
    readGuide('ch13', 'ch13-s2.mdx').body,
    readGuide('ch13', 'ch13-s3.mdx').body,
  ].join('\n')
  assertIncludes(chapterWork, [
    '第1章：簿記が何をする仕組みか理解する',
    '第2章：取引事実から勘定科目と五要素を選ぶ',
    '第13章：損益計算書・貸借対照表を完成させる',
    '/exams/boki3/guide/ch2',
    '/exams/boki3/guide/ch13',
  ], 'ch1/ch2/ch13 division text and links')
}

function validateNoAiBridgeDependency() {
  const ownSource = fs.readFileSync(__filename, 'utf8')
  const caseSource = read('content/exams/boki3/a-grade/ch4-cash-over-short-case.js')
  const forbidden = ['.ai', 'bridge'].join('-')
  assert(!ownSource.includes(forbidden), 'validator must not reference forbidden bridge directory')
  assert(!caseSource.includes(forbidden), 'case data must not reference forbidden bridge directory')
}

validateCases()
validateCh4S5()
validateNeighborGuides()
validateNoAiBridgeDependency()

const result = {
  summary: {
    cases: caseData.cases.length,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
