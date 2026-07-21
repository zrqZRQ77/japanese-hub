const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const matter = require('gray-matter')

const root = path.resolve(__dirname, '..')
const fp3Root = path.join(root, 'content/exams/fp3')
const guideRoot = path.join(fp3Root, 'guide')
const questionRoot = path.join(fp3Root, 'questions')
const cardRoot = path.join(fp3Root, 'cards')
const gradeRoot = path.join(fp3Root, 'a-grade')
const baseline = require('../content/exams/fp3/a-grade/batch0-baseline.js')
const annual = require('../content/exams/fp3/annual/2026-rules.js')
const freeze = require('../content/exams/fp3/a-grade/final-freeze-v1.js')
const cardMapping = require('../content/exams/fp3/a-grade/card-learning-loop-mapping.js')
const cardHashes = require('../content/exams/fp3/a-grade/card-learning-loop-current-hashes.js')

const coverageFiles = [
  'ch1-lifeplanning-coverage.js',
  'ch2-risk-management-coverage.js',
  'ch3-investment-coverage.js',
  'ch4-tax-coverage.js',
  'ch5-ch6-coverage.js',
]
const coverageRecords = coverageFiles.map(file => require(path.join(gradeRoot, file)))
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

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function listFiles(dir, filter) {
  const result = []
  for (const name of fs.readdirSync(dir).sort()) {
    const file = path.join(dir, name)
    const stat = fs.statSync(file)
    if (stat.isDirectory()) result.push(...listFiles(file, filter))
    else if (!filter || filter(file)) result.push(file)
  }
  return result
}

function aggregateHash(files) {
  return sha256(files.map(file => {
    const relative = path.relative(fp3Root, file)
    const body = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
    return `${relative}\n${body}`
  }).join('\n---\n'))
}

function runValidator(name, commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    timeout: 180000,
  })
  childValidators.push({
    name,
    passed: result.status === 0,
    status: result.status,
    signal: result.signal,
  })
  assert(result.status === 0, `sub-validator ${name} passes`)
}

runValidator('fp3-batch6-full-chain', ['scripts/validate-fp3-a-batch6.js'])
runValidator('boki3-shared-card-loop', ['--no-warnings', '--experimental-strip-types', 'scripts/validate-boki3-learning-loop.mjs'])

assert(freeze.examId === 'fp3', 'freeze exam id is fp3')
assert(freeze.version === 'fp3-v1.0', 'freeze version is fp3-v1.0')
assert(freeze.frozenAt === '2026-07-21', 'freeze date is 2026-07-21')
assert(freeze.contentBaseCommit === '472bd3ac1453d71f28de29ed4933a80c3b2ec901', 'freeze records the final content base commit')
assert(freeze.annualPolicyId === annual.policyId, 'freeze annual policy agrees with central rules')

const guideFiles = listFiles(guideRoot, file => file.endsWith('.mdx'))
const questionFiles = listFiles(questionRoot, file => /ch\d+\.json$/.test(file))
const cardFiles = listFiles(cardRoot, file => /ch\d+\.json$/.test(file))
const coverageHashFiles = listFiles(gradeRoot, file => (
  /coverage\.js$/.test(file)
  || /case-2026\.js$/.test(file)
  || /body-hashes\.js$/.test(file)
  || /card-learning-loop-.*\.js$/.test(file)
  || /official-sample-2026\.js$/.test(file)
))

assert(guideFiles.length === 36, `guide file count is 36, got ${guideFiles.length}`)
assert(questionFiles.length === 6, `question file count is 6, got ${questionFiles.length}`)
assert(cardFiles.length === 6, `card file count is 6, got ${cardFiles.length}`)
assert(coverageHashFiles.length === 20, `coverage freeze file count is 20, got ${coverageHashFiles.length}`)
assert(aggregateHash(guideFiles) === freeze.aggregateHashes.guides, 'guide aggregate hash matches v1.0 freeze')
assert(aggregateHash(questionFiles) === freeze.aggregateHashes.questions, 'question aggregate hash matches v1.0 freeze')
assert(aggregateHash(cardFiles) === freeze.aggregateHashes.cards, 'card aggregate hash matches v1.0 freeze')
assert(aggregateHash(coverageHashFiles) === freeze.aggregateHashes.coverage, 'coverage aggregate hash matches v1.0 freeze')

const guideMetrics = []
for (const file of guideFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = matter(raw)
  const sectionId = path.basename(file, '.mdx')
  const body = parsed.content
  const chars = body.replace(/\s+/g, '').length
  const links = (body.match(/\]\(\/exams\/fp3\//g) || []).length
  const hasCase = /例|ケース|事例|計算例|設例|シミュレーション/.test(body)
  const hasError = /誤り|間違|注意|落とし穴|ミス/.test(body)
  const hasSelfCheck = /自検|自己点検|チェック|確認項目|確認しよう/.test(body)

  assert(parsed.data.examId === 'fp3', `${sectionId}: exam metadata is fp3`)
  assert(/^ch[1-6]$/.test(String(parsed.data.chapterId)), `${sectionId}: chapter metadata is valid`)
  assert(parsed.data.annualReviewStatus === 'content-verified', `${sectionId}: content is verified`)
  assert(parsed.data.annualPolicyId === annual.policyId, `${sectionId}: annual policy is current`)
  assert(parsed.data.lawReferenceDate === freeze.currentLawReferenceDate, `${sectionId}: current law date agrees`)
  assert(parsed.data.previousLawReferenceDate === freeze.previousLawReferenceDate, `${sectionId}: previous law date agrees`)
  assert(parsed.data.dataAsOf === freeze.currentLawReferenceDate, `${sectionId}: data date agrees with current law window`)
  assert(['high', 'medium'].includes(parsed.data.annualRisk), `${sectionId}: annual risk is classified`)
  assert(parsed.data.annualRisk === annual.sectionAnnualRisk[sectionId], `${sectionId}: annual risk agrees with central map`)
  assert(/^2026-\d{2}-\d{2}$/.test(String(parsed.data.updatedAt)), `${sectionId}: updatedAt is a valid 2026 date`)
  assert(chars >= 1400, `${sectionId}: guide depth is at least 1,400 chars`)
  assert(hasError, `${sectionId}: error diagnosis exists`)
  assert(links >= 1, `${sectionId}: internal learning link exists`)

  guideMetrics.push({ sectionId, chars, links, hasCase, hasError, hasSelfCheck })
}

const sortedGuideChars = guideMetrics.map(item => item.chars).sort((a, b) => a - b)
const guideSummary = {
  count: guideMetrics.length,
  minimumChars: Math.min(...sortedGuideChars),
  medianChars: sortedGuideChars[Math.floor((sortedGuideChars.length - 1) / 2)],
  cases: guideMetrics.filter(item => item.hasCase).length,
  errorDiagnosis: guideMetrics.filter(item => item.hasError).length,
  explicitSelfCheck: guideMetrics.filter(item => item.hasSelfCheck).length,
  linkedGuides: guideMetrics.filter(item => item.links > 0).length,
  totalLinks: guideMetrics.reduce((sum, item) => sum + item.links, 0),
}
assert(guideSummary.minimumChars === freeze.guideMetrics.minimumNonSpaceChars, 'minimum guide depth matches freeze')
assert(guideSummary.medianChars === freeze.guideMetrics.medianNonSpaceChars, 'median guide depth matches freeze')
assert(guideSummary.cases === freeze.guideMetrics.guidesWithCases, 'case-guide count matches freeze')
assert(guideSummary.errorDiagnosis === freeze.guideMetrics.guidesWithErrorDiagnosis, 'error-diagnosis count matches freeze')
assert(guideSummary.explicitSelfCheck === freeze.guideMetrics.guidesWithExplicitSelfCheck, 'self-check count matches freeze')
assert(guideSummary.linkedGuides === freeze.guideMetrics.guidesWithInternalLinks, 'linked-guide count matches freeze')
assert(guideSummary.totalLinks === freeze.guideMetrics.totalInternalLinks, 'total guide-link count matches freeze')

const questionSets = questionFiles.map(loadJson)
const questions = questionSets.flatMap(set => set.questions)
const choiceQuestions = questions.filter(question => !question.practiceSheet)
const nonChoiceQuestions = questions.filter(question => question.practiceSheet)
const questionIds = new Set(questions.map(question => question.id))
const questionTypeCounts = nonChoiceQuestions.reduce((result, question) => {
  result[question.type] = (result[question.type] ?? 0) + 1
  return result
}, {})
const nonChoiceInputFields = nonChoiceQuestions.reduce((sum, question) => sum + question.practiceSheet.fields.length, 0)

assert(questionSets.length === 6, 'six FP3 question sets exist')
assert(questionIds.size === questions.length, 'all question ids are unique')
assert(choiceQuestions.length === freeze.counts.choiceQuestions, 'choice count matches freeze')
assert(nonChoiceQuestions.length === freeze.counts.nonChoiceQuestions, 'non-choice count matches freeze')
assert(questions.length === freeze.counts.totalQuestions, 'total question count matches freeze')
assert(nonChoiceInputFields === freeze.counts.nonChoiceInputFields, 'non-choice input-field count matches freeze')
assert(JSON.stringify(questionTypeCounts) === JSON.stringify(freeze.nonChoiceTypeCounts), 'non-choice type distribution matches freeze')

for (const question of choiceQuestions) {
  const options = question.options ?? []
  assert((question.type ?? 'single') === 'single', `${question.id}: remains single choice`)
  assert(options.length >= 3, `${question.id}: has at least three options`)
  assert(options.filter(option => option.label === question.correctAnswer).length === 1, `${question.id}: exactly one option matches the answer`)
  assert(Boolean(question.explanation?.trim()), `${question.id}: explanation exists`)
}
for (const question of nonChoiceQuestions) {
  const fields = question.practiceSheet.fields ?? []
  assert(['numeric', 'classification', 'table'].includes(question.type), `${question.id}: final non-choice type is supported`)
  assert(['fields', 'table'].includes(question.practiceSheet.kind), `${question.id}: practice layout is supported`)
  assert(fields.length > 0, `${question.id}: input fields exist`)
  assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: answer array is complete`)
  assert(question.correctAnswer.every((answer, index) => String(answer) === String(fields[index].correctAnswer)), `${question.id}: answer order agrees with fields`)
  assert(Array.isArray(question.explanationSteps) && question.explanationSteps.length >= 2, `${question.id}: explanation steps exist`)
  assert(Array.isArray(question.commonMistakes) && question.commonMistakes.length >= 2, `${question.id}: common mistakes exist`)
  assert(question.guideLink?.href?.startsWith(`/exams/fp3/guide/${question.chapterId}/`), `${question.id}: guide deep link stays in chapter`)
  for (const field of fields) {
    assert(Boolean(String(field.correctAnswer).trim()), `${question.id}/${field.id}: correct answer is not blank`)
    const accepted = [field.correctAnswer, ...(field.acceptedAnswers ?? [])].map(String)
    assert(new Set(accepted).size === accepted.length, `${question.id}/${field.id}: accepted answers are not duplicated`)
  }
}

const cardSets = cardFiles.map(loadJson)
const cards = cardSets.flatMap(set => set.cards)
const cardIds = new Set(cards.map(card => card.id))
const cardTypeCounts = cards.reduce((result, card) => {
  result[card.cardType] = (result[card.cardType] ?? 0) + 1
  return result
}, {})
const guideSectionIdsFromCards = new Set()
const linkedQuestionIds = new Set()

assert(cardSets.length === 6, 'six FP3 card sets exist')
assert(cards.length === freeze.counts.cards, 'card count matches freeze')
assert(cardIds.size === cards.length, 'all card ids are unique')
for (const [type, count] of Object.entries(freeze.cardTypeCounts)) {
  assert(cardTypeCounts[type] === count, `card type ${type} count matches freeze`)
}
assert(cardMapping.cardCount === cards.length, 'card mapping count agrees with content')
assert(Object.keys(cardHashes).length === cards.length, 'card core hash count agrees with content')

for (const card of cards) {
  assert(['記憶', '判断', '手順', '誤り診断'].includes(card.cardType), `${card.id}: card type is valid`)
  const guideMatch = card.guideLink?.href?.match(/^\/exams\/fp3\/guide\/(ch\d+)\/(ch\d+-s\d+)$/)
  const questionMatch = card.questionLink?.href?.match(/^\/exams\/fp3\/questions\/(ch\d+)\?question=([a-z0-9-]+)$/)
  assert(Boolean(guideMatch), `${card.id}: guide deep link is canonical`)
  assert(Boolean(questionMatch), `${card.id}: question deep link is canonical`)
  if (guideMatch) {
    assert(guideMatch[1] === card.chapterId, `${card.id}: guide link stays in chapter`)
    assert(fs.existsSync(path.join(guideRoot, guideMatch[1], `${guideMatch[2]}.mdx`)), `${card.id}: guide target exists`)
    guideSectionIdsFromCards.add(guideMatch[2])
  }
  if (questionMatch) {
    assert(questionMatch[1] === card.chapterId, `${card.id}: question link stays in chapter`)
    assert(questionMatch[2] === card.questionLink.questionId, `${card.id}: question id agrees with link`)
    assert(questionIds.has(questionMatch[2]), `${card.id}: linked question exists`)
    linkedQuestionIds.add(questionMatch[2])
  }
  const core = { id: card.id, front: card.front, back: card.back, tags: card.tags ?? [] }
  assert(sha256(JSON.stringify(core)) === cardHashes[card.id], `${card.id}: card core hash matches Batch7 freeze`)
}
assert(guideSectionIdsFromCards.size === 36, 'cards cover all 36 guide sections')
assert(linkedQuestionIds.size === 112, 'cards directly link to 112 distinct questions')

const baselineAbilityIds = baseline.officialAbilityMap.map(item => item.id).sort()
const coveredAbilityIds = [...new Set(coverageRecords.flatMap(record => record.abilityCoverage.map(item => item.abilityId)))].sort()
assert(JSON.stringify(baselineAbilityIds) === JSON.stringify(freeze.officialAbilityIds), 'freeze ability ids agree with Batch0 official map')
assert(JSON.stringify(coveredAbilityIds) === JSON.stringify(freeze.officialAbilityIds), 'all 18 official abilities have upgraded coverage')
for (const record of coverageRecords) {
  assert(record.examId === 'fp3', `${record.chapterId}: coverage exam id is fp3`)
  assert(record.lawReferenceDate === freeze.currentLawReferenceDate, `${record.chapterId}: coverage law date is current`)
  for (const ability of record.abilityCoverage) {
    assert(ability.practiceQuestionIds.length > 0, `${ability.abilityId}: non-choice evidence exists`)
    for (const questionId of ability.practiceQuestionIds) assert(questionIds.has(questionId), `${ability.abilityId}: evidence question ${questionId} exists`)
  }
}

const baselineCalculationIds = baseline.highRiskCalculationPoints.map(item => item.id).sort()
const coveredCalculationIds = [...new Set(coverageRecords.flatMap(record => (
  record.calculationAssertions.map(item => item.baselineCalculationId).filter(Boolean)
)))].sort()
assert(JSON.stringify(baselineCalculationIds) === JSON.stringify(freeze.highRiskCalculationIds), 'freeze calculation ids agree with Batch0 map')
assert(JSON.stringify(coveredCalculationIds) === JSON.stringify(freeze.highRiskCalculationIds), 'all 18 high-risk calculations have upgraded assertions')
for (const record of coverageRecords) {
  for (const item of record.calculationAssertions) {
    assert(questionIds.has(item.questionId), `${item.id}: calculation evidence question exists`)
  }
}

const currentWindow = annual.windows.find(item => item.status === 'current')
const previousWindow = annual.windows.find(item => item.status === 'closed')
assert(currentWindow?.lawReferenceDate === freeze.currentLawReferenceDate, 'current annual window agrees with freeze')
assert(previousWindow?.lawReferenceDate === freeze.previousLawReferenceDate, 'previous annual window agrees with freeze')
assert(annual.windows.length === 2, 'two annual law-reference windows remain encoded')
assert(annual.suspensionPeriods.length === 3, 'three official suspension periods remain encoded')
assert(Object.keys(annual.sectionAnnualRisk).length === 36, 'annual risk map covers 36 sections')
assert(annual.officialDocuments.academicSample.url.startsWith('https://www.jafp.or.jp/'), 'academic sample uses official JAFP URL')
assert(annual.officialDocuments.practicalSample.url.startsWith('https://www.jafp.or.jp/'), 'practical sample uses official JAFP URL')

const searchSource = fs.readFileSync(path.join(root, 'app/api/search/route.ts'), 'utf8')
const sitemapSource = fs.readFileSync(path.join(root, 'app/sitemap.ts'), 'utf8')
const questionPageSource = fs.readFileSync(path.join(root, 'app/exams/[examId]/questions/[chapterId]/page.tsx'), 'utf8')
const cardPageSource = fs.readFileSync(path.join(root, 'app/exams/[examId]/cards/page.tsx'), 'utf8')
const guidePageSource = fs.readFileSync(path.join(root, 'app/exams/[examId]/guide/[chapterId]/[sectionId]/page.tsx'), 'utf8')
const flashcardSource = fs.readFileSync(path.join(root, 'components/features/cards/FlashcardDeck.tsx'), 'utf8')
const progressSource = fs.readFileSync(path.join(root, 'lib/hooks/useProgress.ts'), 'utf8')
const storageSource = fs.readFileSync(path.join(root, 'lib/storage/progressAdapter.ts'), 'utf8')
const registrySource = fs.readFileSync(path.join(root, 'lib/types/exams-registry.ts'), 'utf8')

assert(searchSource.includes('学習ガイド全文検索') && searchSource.includes('練習問題 JSON 検索') && searchSource.includes('知識カード JSON 検索'), 'search covers guides, questions, and cards')
assert(searchSource.includes('?question=${q2.id}') && searchSource.includes('&card=${card.id}'), 'search uses exact question and card deep links')
assert(sitemapSource.includes('isMockExamPublic') && sitemapSource.includes('/guide/') && sitemapSource.includes('/questions/') && sitemapSource.includes('/cards'), 'sitemap covers learning routes and gates mock exam')
assert(questionPageSource.includes('createPageMetadata') && cardPageSource.includes('createPageMetadata') && guidePageSource.includes('createPageMetadata'), 'learning pages use shared SEO metadata')
assert(questionPageSource.includes('application/ld+json') && cardPageSource.includes('application/ld+json') && guidePageSource.includes('application/ld+json'), 'learning pages expose breadcrumb JSON-LD')
assert(flashcardSource.includes("type ReviewMode = 'all' | 'learning' | 'mistakes' | 'random'"), 'card UI has four review modes')
assert(flashcardSource.includes('disabled={!flipped}'), 'card mastery status requires answer reveal')
assert(progressSource.includes('version: 3') && progressSource.includes('migratedCardProgress'), 'card progress v3 and migration are implemented')
assert(storageSource.includes('window.localStorage'), 'learning progress remains local-only')
assert(!fs.existsSync(path.join(root, 'app/exams/[examId]/cards/[cardId]')), 'cards are not split into thin standalone pages')

const fp3Start = registrySource.indexOf("    id: 'fp3'")
const fp3End = registrySource.indexOf("    id: 'itp'", fp3Start)
const fp3Block = registrySource.slice(fp3Start, fp3End)
assert(!/status:\s*'public'/.test(fp3Block), 'FP3 mock exam is not public')
assert(freeze.boundaries.mockExamPublic === false, 'freeze records hidden mock exam')
assert(freeze.boundaries.mockExamIncludedInAGrade === false, 'freeze excludes mock exam from A-grade')
assert(freeze.boundaries.progressStorage === 'localStorage', 'freeze records local progress storage')

const forbiddenFiles = listFiles(fp3Root, file => /(^|\/)(\.DS_Store|Thumbs\.db)$/.test(file))
assert(forbiddenFiles.length === 0, 'FP3 content contains no OS junk files')

const result = {
  summary: {
    version: freeze.version,
    guides: guideSummary,
    practice: {
      choice: choiceQuestions.length,
      nonChoice: nonChoiceQuestions.length,
      total: questions.length,
      inputFields: nonChoiceInputFields,
      typeCounts: questionTypeCounts,
    },
    cards: {
      total: cards.length,
      typeCounts: cardTypeCounts,
      guideSectionsCovered: guideSectionIdsFromCards.size,
      distinctQuestionsLinked: linkedQuestionIds.size,
    },
    officialAbilitiesCovered: coveredAbilityIds.length,
    highRiskCalculationsCovered: coveredCalculationIds.length,
    aggregateHashes: freeze.aggregateHashes,
    childValidators,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
