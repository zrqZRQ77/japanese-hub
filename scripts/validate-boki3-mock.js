const fs = require('fs')

const DATA_PATH = 'content/exams/boki3/mock-exam/questions.json'
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
const questions = data.questions ?? []
const byId = new Map(questions.map(question => [question.id, question]))

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function amount(value) {
  return Number(String(value).replace(/[,\s　円]/g, ''))
}

function blanks(questionId) {
  const question = byId.get(questionId)
  assert(question, `Missing question: ${questionId}`)
  return Object.fromEntries((question.answerSheet?.blanks ?? []).map(blank => [blank.id, amount(blank.answer)]))
}

assert(questions.length === 15, `Expected 15 subquestions, found ${questions.length}`)
assert(questions.filter(question => question.chapterId === 'mock-s1').length === 9, '第1問 must contain 9 questions')
assert(questions.filter(question => question.chapterId === 'mock-s2').length === 2, '第2問 must contain 2 questions')
assert(questions.filter(question => question.chapterId === 'mock-s3').length === 4, '第3問 must contain 4 questions')

for (const question of questions.filter(item => item.answerSheet?.kind === 'journal')) {
  const lines = question.answerSheet.lines ?? []
  const debit = lines.filter(line => line.side === '借方').reduce((sum, line) => sum + amount(line.amount), 0)
  const credit = lines.filter(line => line.side === '貸方').reduce((sum, line) => sum + amount(line.amount), 0)
  assert(debit === credit, `${question.id}: debit ${debit} does not equal credit ${credit}`)
}

const inventory = blanks('boki3-mock-s2-q1')
assert(inventory.avg1 === (48000 + 36800) / 200, 's2-q1 first average is incorrect')
assert(inventory.cost1 === 90 * inventory.avg1, 's2-q1 first issue cost is incorrect')
assert(inventory.avg2 === (46640 + 32200) / 180, 's2-q1 second average is incorrect')
assert(inventory.cost2 === 100 * inventory.avg2, 's2-q1 second issue cost is incorrect')
assert(inventory.cogs === inventory.cost1 + inventory.cost2, 's2-q1 COGS is incorrect')
assert(inventory.profit === 90 * 650 + 100 * 680 - inventory.cogs, 's2-q1 gross profit is incorrect')

const fixedAssets = blanks('boki3-mock-s2-q2')
assert(fixedAssets.a === 2400000 / 6, 's2-q2 asset A depreciation is incorrect')
assert(fixedAssets.b === 1800000 / 5 * 9 / 12, 's2-q2 asset B depreciation is incorrect')
assert(fixedAssets.c === 960000 / 4 * 2 / 12, 's2-q2 asset C depreciation is incorrect')
assert(fixedAssets.deprTotal === fixedAssets.a + fixedAssets.b + fixedAssets.c, 's2-q2 total depreciation is incorrect')
assert(fixedAssets.monthly === 792000 / 6, 's2-q2 monthly rent is incorrect')
assert(fixedAssets.prepaid === fixedAssets.monthly * 4, 's2-q2 prepaid rent is incorrect')
assert(fixedAssets.rentExpense === 480000 + 720000 + fixedAssets.monthly * 2, 's2-q2 rent expense is incorrect')

const allowance = blanks('boki3-mock-s3-q1')
assert(allowance.cash === 90100, 's3-q1 cash balance is incorrect')
assert(allowance.communication === 2900, 's3-q1 communication expense is incorrect')
assert(allowance.loss === 93600 - 90100 - allowance.communication, 's3-q1 miscellaneous loss is incorrect')
assert(allowance.receivables === 1240000 - 40000, 's3-q1 corrected receivables are incorrect')
assert(allowance.allowance === allowance.receivables * 0.02, 's3-q1 required allowance is incorrect')
assert(allowance.expense === allowance.allowance - 9000, 's3-q1 allowance expense is incorrect')

const tax = blanks('boki3-mock-s3-q2')
assert(tax.cost === 2760000 + tax.opening - tax.ending, 's3-q2 COGS is incorrect')
assert(tax.tax === tax.received - tax.paid, 's3-q2 consumption tax payable is incorrect')

const depreciation = blanks('boki3-mock-s3-q3')
assert(depreciation.old === 900000 / 5, 's3-q3 old asset depreciation is incorrect')
assert(depreciation.new === 600000 / 5 * 6 / 12, 's3-q3 new asset depreciation is incorrect')
assert(depreciation.total === depreciation.old + depreciation.new, 's3-q3 total depreciation is incorrect')
assert(depreciation.months === 4, 's3-q3 accrued interest months are incorrect')
assert(depreciation.interest === 1800000 * 0.024 * depreciation.months / 12, 's3-q3 accrued interest is incorrect')

const profit = blanks('boki3-mock-s3-q4')
assert(profit.revenue === 4380000 + 8000, 's3-q4 revenue total is incorrect')
assert(profit.expense === 2725000 + 860000 + 240000 + 15000 + 14400 + 128000, 's3-q4 expense total is incorrect')
assert(profit.profit === profit.revenue - profit.expense, 's3-q4 net income is incorrect')

console.log(JSON.stringify({
  examId: data.examId,
  totalQuestions: questions.length,
  sections: {
    section1: 9,
    section2: 2,
    section3: 4,
  },
  totalPoints: 100,
  durationMinutes: 60,
  passScore: 70,
  arithmeticChecks: 'passed',
}, null, 2))
