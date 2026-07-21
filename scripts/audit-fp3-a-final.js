const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const score = require('../content/exams/fp3/a-grade/final-score.js')
const freeze = require('../content/exams/fp3/a-grade/final-freeze-v1.js')
const issues = []
const checks = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

const strictResult = spawnSync(process.execPath, ['scripts/validate-fp3-a-final.js'], {
  cwd: root,
  encoding: 'utf8',
  env: process.env,
  timeout: 180000,
})
assert(strictResult.status === 0, 'strict final validator passes')
assert(score.examId === 'fp3', 'score exam id is fp3')
assert(score.version === freeze.version, 'score and freeze versions agree')
assert(score.assessedAt === freeze.frozenAt, 'score and freeze dates agree')
assert(score.grade === 'A', 'final grade is A')
assert(score.maximum === 100, 'score maximum is 100')
assert(score.total === 97, 'final score is 97')
assert(score.total >= score.minimumTotal, 'score meets the grade threshold')
assert(score.dimensions.length === 6, 'six score dimensions exist')
for (const dimension of score.dimensions) {
  assert(dimension.score <= dimension.maximum, `${dimension.id}: score is within maximum`)
  assert(dimension.score >= dimension.minimum, `${dimension.id}: score meets minimum`)
  assert(dimension.evidence.length >= 3, `${dimension.id}: evidence exists`)
  if (dimension.score < dimension.maximum) assert(Boolean(dimension.deduction), `${dimension.id}: deduction is documented`)
}
assert(score.vetoChecks.length === 7, 'seven blocking checks exist')
assert(score.vetoChecks.every(item => item.blocked === false), 'all blocking checks are clear')
assert(freeze.counts.chapters === 6, 'freeze records six chapters')
assert(freeze.counts.guideSections === 36, 'freeze records 36 guides')
assert(freeze.counts.choiceQuestions === 135, 'freeze records 135 choice questions')
assert(freeze.counts.nonChoiceQuestions === 62, 'freeze records 62 non-choice questions')
assert(freeze.counts.totalQuestions === 197, 'freeze records 197 questions')
assert(freeze.counts.cards === 135, 'freeze records 135 cards')
assert(freeze.officialAbilityIds.length === 18, 'freeze records 18 abilities')
assert(freeze.highRiskCalculationIds.length === 18, 'freeze records 18 calculations')
assert(Object.values(freeze.aggregateHashes).every(value => /^[a-f0-9]{64}$/.test(value)), 'freeze hashes are SHA-256')
assert(freeze.boundaries.mockExamPublic === false, 'mock exam remains hidden')
assert(freeze.boundaries.mockExamIncludedInAGrade === false, 'mock exam remains outside the score')

const reportPath = path.join(root, 'docs/fp3-a-final-audit.md')
assert(fs.existsSync(reportPath), 'final report exists')
if (fs.existsSync(reportPath)) {
  const report = fs.readFileSync(reportPath, 'utf8')
  for (const token of ['97/100', 'FP3 v1.0', '36节', '135道选择题', '62道非选择式题', '197道', '135张知识卡片', '18/18', '3,431项', '已知但不影响A级']) {
    assert(report.includes(token), `final report contains ${token}`)
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
assert(packageJson.scripts['validate:fp3-a-final'] === 'node ./scripts/validate-fp3-a-final.js', 'package exposes strict final validator')
assert(packageJson.scripts['audit:fp3-a-final'] === 'node ./scripts/audit-fp3-a-final.js', 'package exposes final audit command')

const result = {
  summary: {
    version: freeze.version,
    score: score.total,
    maximum: score.maximum,
    grade: score.grade,
    blockingChecks: score.vetoChecks.length,
    blockingChecksClear: score.vetoChecks.filter(item => item.blocked).length === 0,
    strictValidatorPassed: strictResult.status === 0,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
