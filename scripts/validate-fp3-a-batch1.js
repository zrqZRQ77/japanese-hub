const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const matter = require('gray-matter')

const root = path.resolve(__dirname, '..')
const guideRoot = path.join(root, 'content/exams/fp3/guide')
const questionRoot = path.join(root, 'content/exams/fp3/questions')
const cardRoot = path.join(root, 'content/exams/fp3/cards')
const baseline = require('../content/exams/fp3/a-grade/batch0-baseline.js')
const annual = require('../content/exams/fp3/annual/2026-rules.js')
const sample = require('../content/exams/fp3/a-grade/official-sample-2026.js')
const guideBodyHashes = require('../content/exams/fp3/annual/2026-guide-body-hashes.js')
const protectedItemHashes = require('../content/exams/fp3/annual/2026-protected-item-hashes.js')

const issues = []
const checks = []
const childValidators = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function bodyFromMdx(raw) {
  return matter(raw).content.replace(/\r\n/g, '\n').replace(/^\n+/, '')
}

function runValidator(name, script) {
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
  })
  childValidators.push({ name, passed: result.status === 0 })
  assert(result.status === 0, `sub-validator ${name} passes`)
}

runValidator('fp3-content', 'scripts/validate-fp3-content.js')
runValidator('fp3-batch0-baseline', 'scripts/validate-fp3-a-baseline.js')

assert(annual.examId === 'fp3', 'annual rule exam id is fp3')
assert(annual.version === 'fp3-2026-v1', 'annual rule version is fixed')
assert(annual.confirmedAt === '2026-07-21', 'annual rule confirmation date is fixed')
assert(annual.primaryProvider === '日本FP協会', 'primary provider is JAFP')
assert(annual.primaryPracticalSubject === '資産設計提案業務', 'primary practical subject is asset design proposal')
assert(annual.examMode === 'CBT', '2026 exam mode is CBT')
assert(annual.policyId === 'fp3-2026-dual-window', 'dual-window annual policy id is fixed')

assert(annual.windows.length === 2, 'exactly two law-reference windows are recorded')
const currentWindow = annual.windows.find(window => window.status === 'current')
const closedWindow = annual.windows.find(window => window.status === 'closed')
assert(Boolean(currentWindow), 'current law-reference window exists')
assert(Boolean(closedWindow), 'closed law-reference window exists')
assert(closedWindow?.examStart === '2026-04-01' && closedWindow?.examEnd === '2026-05-23', 'closed window dates are correct')
assert(closedWindow?.lawReferenceDate === '2025-04-01', 'closed window uses 2025-04-01 law reference')
assert(currentWindow?.examStart === '2026-06-01' && currentWindow?.examEnd === '2027-03-24', 'current window dates are correct')
assert(currentWindow?.lawReferenceDate === '2026-04-01', 'current window uses 2026-04-01 law reference')
assert(annual.suspensionPeriods.length === 3, 'three official suspension periods are recorded')
assert(annual.maintenancePolicy.currentWindowId === currentWindow?.id, 'maintenance current window id resolves')
assert(annual.maintenancePolicy.previousWindowId === closedWindow?.id, 'maintenance previous window id resolves')
assert(annual.maintenancePolicy.frontmatterStatus === 'scope-mapped', 'frontmatter status remains scope-mapped')

assert(annual.examFormat.academic.minutes === 90, 'academic duration is 90 minutes')
assert(annual.examFormat.academic.questions === 60, 'academic question count is 60')
assert(annual.examFormat.academic.passScore === 36 && annual.examFormat.academic.maximumScore === 60, 'academic pass threshold is 36/60')
assert(annual.examFormat.practical.minutes === 60, 'practical duration is 60 minutes')
assert(annual.examFormat.practical.questions === 20, 'practical question count is 20')
assert(annual.examFormat.practical.passScore === 60 && annual.examFormat.practical.maximumScore === 100, 'practical pass threshold is 60/100')
assert(annual.officialScope.academicAreas.length === 6, 'six academic areas are recorded')
assert(annual.officialScope.practicalAbilities.length === 3, 'three official practical abilities are recorded')

for (const [key, document] of Object.entries(annual.officialDocuments)) {
  assert(/^https:\/\/www\.jafp\.or\.jp\//.test(document.url), `${key}: official document URL is JAFP`)
  assert(Number.isInteger(document.pages) && document.pages > 0, `${key}: page count is positive`)
  assert(/^[a-f0-9]{64}$/.test(document.sha256), `${key}: sha256 is valid`)
}
assert(annual.officialDocuments.academicSample.questionCount === 60, 'academic sample document records 60 questions')
assert(annual.officialDocuments.practicalSample.questionCount === 20, 'practical sample document records 20 questions')
assert(annual.officialDocuments.academicSample.lawReferenceDate === closedWindow?.lawReferenceDate, 'academic sample belongs to previous law window')
assert(annual.officialDocuments.practicalSample.lawReferenceDate === closedWindow?.lawReferenceDate, 'practical sample belongs to previous law window')
for (const url of annual.sourceUrls) {
  assert(/^https:\/\/(www\.)?(jafp|kinzai)\.or\.jp\//.test(url), `annual source is official: ${url}`)
}

const expectedSectionIds = baseline.officialAbilityMap.flatMap(ability => ability.guideSectionIds).sort()
const riskSectionIds = Object.keys(annual.sectionAnnualRisk).sort()
assert(expectedSectionIds.length === 36, 'baseline contains 36 section assignments')
assert(JSON.stringify(riskSectionIds) === JSON.stringify(expectedSectionIds), 'annual risk map covers exactly the 36 baseline sections')
const riskCounts = Object.values(annual.sectionAnnualRisk).reduce((result, risk) => {
  result[risk] = (result[risk] ?? 0) + 1
  return result
}, {})
assert(riskCounts.high === 28, `high annual-risk section count is 28, got ${riskCounts.high ?? 0}`)
assert(riskCounts.medium === 8, `medium annual-risk section count is 8, got ${riskCounts.medium ?? 0}`)
assert(!riskCounts.low, 'no section is incorrectly marked low risk at Batch1')

const topicSectionIds = annual.highChangeTopics.flatMap(topic => topic.sectionIds)
assert(new Set(topicSectionIds).size === topicSectionIds.length, 'high-change topic groups do not duplicate section ownership')
assert(topicSectionIds.every(sectionId => expectedSectionIds.includes(sectionId)), 'high-change topic sections are registered')
assert(annual.highChangeTopics.every(topic => topic.reviewTriggers.length >= 4), 'each high-change topic has review triggers')

const guideFiles = []
for (const chapterId of fs.readdirSync(guideRoot).filter(name => /^ch\d+$/.test(name)).sort()) {
  for (const file of fs.readdirSync(path.join(guideRoot, chapterId)).filter(name => name.endsWith('.mdx')).sort()) {
    guideFiles.push(path.join(guideRoot, chapterId, file))
  }
}
assert(guideFiles.length === 36, `guide metadata audit covers 36 sections, got ${guideFiles.length}`)
assert(Object.keys(guideBodyHashes).length === 36, '36 guide body hashes are frozen')

for (const file of guideFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = matter(raw)
  const sectionId = path.basename(file, '.mdx')
  const data = parsed.data
  assert(data.lawReferenceDate === currentWindow?.lawReferenceDate, `${sectionId}: current law reference date is registered`)
  assert(data.previousLawReferenceDate === closedWindow?.lawReferenceDate, `${sectionId}: previous law reference date is registered`)
  assert(/^2026-\d{2}-\d{2}$/.test(String(data.dataAsOf)), `${sectionId}: dataAsOf is a valid 2026 date`)
  assert(data.annualPolicyId === annual.policyId, `${sectionId}: annual policy id is registered`)
  assert(data.annualRisk === annual.sectionAnnualRisk[sectionId], `${sectionId}: annual risk agrees with central map`)
  assert(['scope-mapped', 'content-verified'].includes(data.annualReviewStatus), `${sectionId}: annual review status is valid`)
  assert(data.annualMetadataReviewedAt === annual.confirmedAt, `${sectionId}: metadata review date is registered`)
  if (data.annualReviewStatus === 'scope-mapped') {
    assert(sha256(bodyFromMdx(raw)) === guideBodyHashes[sectionId], `${sectionId}: scope-mapped guide body remains unchanged`)
  }
}

for (const kind of ['questions', 'cards']) {
  const dir = kind === 'questions' ? questionRoot : cardRoot
  const expectedHashes = protectedItemHashes[kind]
  const collectionKey = kind === 'questions' ? 'questions' : 'cards'
  const currentItems = new Map()

  for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.json')).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
    for (const item of data[collectionKey]) currentItems.set(item.id, item)
  }

  const expectedCount = kind === 'questions' ? 135 : 135
  assert(Object.keys(expectedHashes).length === expectedCount, `${kind}: ${expectedCount} protected item hashes are recorded`)
  for (const [itemId, expectedHash] of Object.entries(expectedHashes)) {
    const item = currentItems.get(itemId)
    assert(Boolean(item), `${kind}/${itemId}: protected item exists`)
    if (item) assert(sha256(JSON.stringify(item)) === expectedHash, `${kind}/${itemId}: protected item is unchanged`)
  }
}

assert(sample.examId === 'fp3', 'official sample audit exam id is fp3')
assert(sample.provider === '日本FP協会', 'official sample provider is JAFP')
assert(sample.publishedMonth === '2026-05', 'official sample month is May 2026')
assert(sample.auditedAt === annual.confirmedAt, 'official sample audit date matches annual confirmation')
assert(sample.lawReferenceDate === closedWindow?.lawReferenceDate, 'official sample uses previous law window')
assert(sample.practical.subject === annual.primaryPracticalSubject, 'sample practical subject matches annual target')
assert(sample.documents.academic === annual.officialDocuments.academicSample.url, 'academic sample URL agrees with annual rules')
assert(sample.documents.practical === annual.officialDocuments.practicalSample.url, 'practical sample URL agrees with annual rules')
assert(sample.documents.practicalAnswer === annual.officialDocuments.practicalAnswer.url, 'practical answer URL agrees with annual rules')

const academicNumbers = sample.academic.questions.map(question => question.number)
assert(sample.academic.questions.length === 60, 'academic sample maps 60 questions')
assert(new Set(academicNumbers).size === 60, 'academic sample question numbers are unique')
assert(academicNumbers.every((number, index) => number === index + 1), 'academic sample numbers run from 1 to 60')
assert(sample.academic.questions.filter(question => question.format === 'truefalse').length === 30, 'academic sample has 30 true/false questions')
assert(sample.academic.questions.filter(question => question.format === 'three-choice').length === 30, 'academic sample has 30 three-choice questions')
assert(Object.keys(sample.academic.areaDistribution).length === 6, 'academic sample has six area distribution entries')
assert(Object.values(sample.academic.areaDistribution).every(count => count === 10), 'each academic area has 10 questions')
assert(Object.values(sample.academic.areaDistribution).reduce((sum, count) => sum + count, 0) === 60, 'academic area distribution totals 60')
const abilityArea = new Map(baseline.officialAbilityMap.map(ability => [ability.id, ability.officialArea]))
const derivedAreaDistribution = sample.academic.questions.reduce((result, question) => {
  const area = abilityArea.get(question.abilityId)
  result[area] = (result[area] ?? 0) + 1
  return result
}, {})
assert(JSON.stringify(derivedAreaDistribution) === JSON.stringify(sample.academic.areaDistribution), 'academic area distribution is derived from ability mappings')

const practicalNumbers = sample.practical.questions.map(question => question.number)
assert(sample.practical.questions.length === 20, 'practical sample maps 20 questions')
assert(new Set(practicalNumbers).size === 20, 'practical sample question numbers are unique')
assert(practicalNumbers.every((number, index) => number === index + 1), 'practical sample numbers run from 1 to 20')
assert(sample.practical.questions.every(question => question.format === 'three-choice'), 'all practical sample questions are three-choice')
const derivedTaskSummary = {
  professionalScopeJudgment: sample.practical.questions.filter(question => question.number === 1).length,
  tableOrDocumentReading: sample.practical.questions.filter(question => question.requiresDataReading).length,
  calculationOrRelationshipAnalysis: sample.practical.questions.filter(question => /calculation|analysis/.test(question.taskKind)).length,
  legalOrCoverageJudgment: sample.practical.questions.filter(question => /judgment|classification|selection|comparison/.test(question.taskKind)).length,
}
assert(JSON.stringify(sample.practical.taskSummary) === JSON.stringify(derivedTaskSummary), 'practical task summary is derived from question mappings')
assert(sample.practical.taskSummary.tableOrDocumentReading === 18, 'practical sample includes 18 data-reading tasks')
assert(sample.practical.taskSummary.calculationOrRelationshipAnalysis === 14, 'practical sample includes 14 calculation or relationship tasks')

const baselineAbilityIds = baseline.officialAbilityMap.map(ability => ability.id).sort()
const combinedAbilityIds = [...new Set([
  ...sample.academic.questions.map(question => question.abilityId),
  ...sample.practical.questions.map(question => question.abilityId),
])].sort()
assert(JSON.stringify(combinedAbilityIds) === JSON.stringify(baselineAbilityIds), 'official samples cover all 18 baseline abilities')
assert(JSON.stringify(sample.findings.combinedAbilityCoverage) === JSON.stringify(baselineAbilityIds), 'recorded combined ability coverage is exact')
for (const question of [...sample.academic.questions, ...sample.practical.questions]) {
  assert(baselineAbilityIds.includes(question.abilityId), `sample question ${question.number}: ability id is registered`)
  assert(Boolean(question.topicKey), `sample question ${question.number}: topic key exists`)
  assert(Boolean(question.taskKind), `sample question ${question.number}: task kind exists`)
  assert(['high', 'medium'].includes(question.annualSensitivity), `sample question ${question.number}: annual sensitivity is valid`)
  for (const forbidden of ['text', 'prompt', 'options', 'answer', 'correctAnswer', 'explanation']) {
    assert(!(forbidden in question), `sample question ${question.number}: does not store official ${forbidden}`)
  }
}
assert(sample.findings.requiredLearningTasks.length >= 6, 'sample findings record required learning tasks')
assert(sample.findings.productImplications.length >= 4, 'sample findings record product implications')
assert(/公式問題本文/.test(sample.copyrightPolicy), 'sample audit records copyright protection policy')

const result = {
  summary: {
    windows: annual.windows.length,
    guideMetadata: guideFiles.length,
    guideBodiesProtected: Object.keys(guideBodyHashes).length,
    protectedQuestionItems: Object.keys(protectedItemHashes.questions).length,
    protectedCardItems: Object.keys(protectedItemHashes.cards).length,
    riskCounts,
    academicSampleQuestions: sample.academic.questions.length,
    practicalSampleQuestions: sample.practical.questions.length,
    combinedAbilities: combinedAbilityIds.length,
    practicalTaskSummary: sample.practical.taskSummary,
    subValidators: childValidators,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
