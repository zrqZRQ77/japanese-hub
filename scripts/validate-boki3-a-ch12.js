const fs = require('fs')
const path = require('path')
const data = require('../content/exams/boki3/a-grade/ch12-continuous-case')

const root = path.resolve(__dirname, '..')
const issues = []
const checks = []

function fail(message) {
  issues.push(message)
}

function sumLines(lines) {
  return lines.reduce((sum, [, amount]) => sum + amount, 0)
}

function assertEqual(actual, expected, label) {
  checks.push({ label, actual, expected })
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`)
}

function assertBalanced(entry, label) {
  const debit = sumLines(entry.debit)
  const credit = sumLines(entry.credit)
  assertEqual(debit, credit, `${label} debit/credit`)
}

function netMap(balanceRows, entries = []) {
  const map = new Map()
  for (const [account, debit, credit] of balanceRows) {
    map.set(account, (map.get(account) || 0) + debit - credit)
  }
  for (const entry of entries) {
    for (const [account, amount] of entry.debit) map.set(account, (map.get(account) || 0) + amount)
    for (const [account, amount] of entry.credit) map.set(account, (map.get(account) || 0) - amount)
  }
  return map
}

function normalizedBalanceMap(rows) {
  return new Map(rows.map(([account, debit, credit]) => [account, debit - credit]))
}

function assertMapsEqual(actual, expected, label) {
  const accounts = new Set([...actual.keys(), ...expected.keys()])
  for (const account of accounts) {
    assertEqual(actual.get(account) || 0, expected.get(account) || 0, `${label}: ${account}`)
  }
}

function collapseEntries(entries) {
  return netMap([], entries)
}

function assertVoucherMatches(caseData, methodName, label) {
  const expected = collapseEntries([caseData.fullJournal])
  const actual = collapseEntries(caseData[methodName])
  assertMapsEqual(actual, expected, `${label} ${methodName}`)
  const finalDebit = [...actual.values()].filter(value => value > 0).reduce((sum, value) => sum + value, 0)
  const finalCredit = [...actual.values()].filter(value => value < 0).reduce((sum, value) => sum - value, 0)
  assertEqual(finalDebit, 80000, `${label} ${methodName} final debit`)
  assertEqual(finalCredit, 80000, `${label} ${methodName} final credit`)
}

const openingDebit = data.openingBalances.reduce((sum, [, debit]) => sum + debit, 0)
const openingCredit = data.openingBalances.reduce((sum, [, , credit]) => sum + credit, 0)
assertEqual(openingDebit, 2570000, 'opening trial balance debit')
assertEqual(openingCredit, 2570000, 'opening trial balance credit')

for (const transaction of data.transactions) assertBalanced(transaction, transaction.id)
const computedPreAdjustment = netMap(data.openingBalances, data.transactions)
const expectedPreAdjustment = normalizedBalanceMap(data.preAdjustmentBalances)
assertMapsEqual(computedPreAdjustment, expectedPreAdjustment, 'pre-adjustment balance')
const preAdjustmentDebit = data.preAdjustmentBalances.reduce((sum, [, debit]) => sum + debit, 0)
const preAdjustmentCredit = data.preAdjustmentBalances.reduce((sum, [, , credit]) => sum + credit, 0)
assertEqual(preAdjustmentDebit, 2860000, 'pre-adjustment trial balance debit')
assertEqual(preAdjustmentCredit, 2860000, 'pre-adjustment trial balance credit')

for (const adjustment of data.adjustments) assertBalanced(adjustment, adjustment.id)
const adjustmentDebit = data.adjustments.reduce((sum, entry) => sum + sumLines(entry.debit), 0)
const adjustmentCredit = data.adjustments.reduce((sum, entry) => sum + sumLines(entry.credit), 0)
assertEqual(adjustmentDebit, 491800, 'adjustment column debit')
assertEqual(adjustmentCredit, 491800, 'adjustment column credit')
assertEqual(240000 * 0.02, 4800, 'allowance calculation')
assertEqual(60000 - 18000, 42000, 'supplies expense calculation')
assertEqual(15000 * 2, 30000, 'prepaid rent calculation')
assertEqual(720000 + 120000 - 150000, 690000, 'cost of goods sold calculation')

const revenue = sumLines(data.profitAndLoss.revenue)
const expenses = sumLines(data.profitAndLoss.expenses)
assertEqual(revenue, 1600000, 'P/L revenue')
assertEqual(expenses, 1391800, 'P/L expenses')
assertEqual(revenue - expenses, data.profitAndLoss.netIncome, 'net income calculation')
assertEqual(expenses + data.profitAndLoss.netIncome, data.profitAndLoss.totalAfterNetIncome, 'P/L tie-out')

const balanceSheetDebit = sumLines(data.balanceSheet.debit)
const balanceSheetCredit = sumLines(data.balanceSheet.credit)
assertEqual(balanceSheetDebit, data.balanceSheet.total, 'B/S debit total')
assertEqual(balanceSheetCredit, data.balanceSheet.total, 'B/S credit total')
assertEqual(data.balanceSheet.total, 1618000, 'B/S worksheet total')

for (const entry of data.closingEntries) assertBalanced(entry, entry.id)
assertEqual(100000 + data.profitAndLoss.netIncome, data.endingRetainedEarnings, 'ending retained earnings')

assertVoucherMatches(data.voucherCases.sale, 'splitMethod', 'sale voucher')
assertVoucherMatches(data.voucherCases.sale, 'deemedCreditMethod', 'sale voucher')
assertVoucherMatches(data.voucherCases.purchase, 'splitMethod', 'purchase voucher')
assertVoucherMatches(data.voucherCases.purchase, 'deemedCreditMethod', 'purchase voucher')

const guideDir = path.join(root, 'content/exams/boki3/guide/ch12')
const guideFiles = ['ch12-s1.mdx', 'ch12-s2.mdx', 'ch12-s3.mdx', 'ch12-s4.mdx']
const guides = Object.fromEntries(guideFiles.map(file => [file, fs.readFileSync(path.join(guideDir, file), 'utf8')]))
const combinedGuide = Object.values(guides).join('\n')

for (const [file, text] of Object.entries(guides)) {
  if (!text.includes('updatedAt: "2026-07-20"')) fail(`${file}: updatedAt is not 2026-07-20`)
  if (/mock-exam|模擬試験/.test(text)) fail(`${file}: mock exam reference is forbidden in A-grade guide scope`)
  if (/\?section=/.test(text)) fail(`${file}: legacy ?section= link remains`)
}

const requiredTerms = [
  '青空商事株式会社',
  '2,570,000',
  '2,860,000',
  '491,800',
  '1,391,800',
  '208,200',
  '1,618,000',
  '貯蔵品',
  '繰越利益剰余金',
  '取引分解法',
  '全額掛取引とみなす方法',
]
for (const term of requiredTerms) {
  if (!combinedGuide.includes(term)) fail(`guide content is missing required term: ${term}`)
}

const forbiddenTerms = ['反查', '推導', '自检', '教学', '題目']
for (const term of forbiddenTerms) {
  if (combinedGuide.includes(term)) fail(`guide content contains non-natural term: ${term}`)
}

const exerciseHeadings = combinedGuide.match(/^## .*?(?:練習|演習)/gm) || []
assertEqual(exerciseHeadings.length, data.requiredGuideExerciseCount, 'chapter 12 guide exercise count')

const questions = JSON.parse(fs.readFileSync(path.join(root, 'content/exams/boki3/questions/ch12.json'), 'utf8')).questions
const cards = JSON.parse(fs.readFileSync(path.join(root, 'content/exams/boki3/cards/ch12.json'), 'utf8')).cards
assertEqual(questions.length, 8, 'chapter 12 choice question count')
assertEqual(cards.length, 12, 'chapter 12 card count')
if (!questions.find(question => question.id === 'boki3-ch12-q8')?.text.includes('取引分解法')) {
  fail('boki3-ch12-q8 must specify 取引分解法 to ensure a unique answer')
}
const cardTypeTags = new Set(['記憶', '判断', '手順', '誤り診断'])
const cardTypeCounts = { 記憶: 0, 判断: 0, 手順: 0, 誤り診断: 0 }
for (const card of cards) {
  const matched = card.tags.filter(tag => cardTypeTags.has(tag))
  if (matched.length !== 1) fail(`${card.id}: must have exactly one card type tag`)
  if (matched[0]) cardTypeCounts[matched[0]] += 1
}
if (cardTypeCounts.判断 < 4) fail(`chapter 12 requires at least 4 judgment cards, got ${cardTypeCounts.判断}`)
if (cardTypeCounts.手順 + cardTypeCounts.誤り診断 < 5) {
  fail(`chapter 12 requires at least 5 process/diagnostic cards, got ${cardTypeCounts.手順 + cardTypeCounts.誤り診断}`)
}

const result = {
  summary: {
    continuousCase: data.id,
    openingTrialBalance: openingDebit,
    preAdjustmentTrialBalance: preAdjustmentDebit,
    adjustmentColumn: adjustmentDebit,
    expenses,
    netIncome: data.profitAndLoss.netIncome,
    worksheetProfitAndLossTotal: data.profitAndLoss.totalAfterNetIncome,
    worksheetBalanceSheetTotal: data.balanceSheet.total,
    guideExercises: exerciseHeadings.length,
    choiceQuestions: questions.length,
    cards: cards.length,
    cardTypeCounts,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
