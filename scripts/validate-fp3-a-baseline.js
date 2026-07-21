const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const baseline = require('../content/exams/fp3/a-grade/batch0-baseline.js')

const root = path.resolve(__dirname, '..')
const contentRoot = path.join(root, 'content/exams/fp3')
const guideRoot = path.join(contentRoot, 'guide')
const questionRoot = path.join(contentRoot, 'questions')
const cardRoot = path.join(contentRoot, 'cards')
const issues = []
const warnings = []
const checks = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function normalize(text) {
  return String(text ?? '')
    .normalize('NFKC')
    .replace(/[\s、。・（）()「」『』【】0-9０-９,，円％%]/g, '')
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))]
}

function loadJsonSets(dir) {
  return fs.readdirSync(dir)
    .filter(name => /^ch\d+\.json$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)) - Number(b.match(/\d+/)))
    .map(name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')))
}

function readFp3RegistryBlock() {
  const source = fs.readFileSync(path.join(root, 'lib/types/chapters-registry.ts'), 'utf8')
  const marker = '  fp3: ['
  const start = source.indexOf(marker)
  const end = source.indexOf('\n  ],\n\n  itp:', start)
  if (start < 0 || end < 0) throw new Error('Unable to locate fp3 registry block')
  const body = source.slice(start + marker.length, end)
  return Function(`"use strict"; return [${body}\n]`)()
}

const registry = readFp3RegistryBlock()
const registryByChapter = new Map(registry.map(chapter => [chapter.id, chapter]))
const registeredSectionIds = registry.flatMap(chapter => chapter.sections.map(section => section.id))

const guideMetrics = []
let guideInternalLinks = 0
for (const chapterId of fs.readdirSync(guideRoot).filter(name => /^ch\d+$/.test(name)).sort()) {
  for (const file of fs.readdirSync(path.join(guideRoot, chapterId)).filter(name => name.endsWith('.mdx')).sort()) {
    const parsed = matter(fs.readFileSync(path.join(guideRoot, chapterId, file), 'utf8'))
    const body = parsed.content
    const links = (body.match(/\]\(\/exams\/fp3\//g) || []).length
    guideInternalLinks += links
    guideMetrics.push({
      id: path.basename(file, '.mdx'),
      chapterId,
      chars: body.replace(/\s+/g, '').length,
      hasCase: /例|ケース|事例|計算例|設例|シミュレーション/.test(body),
      hasProcess: /手順|ステップ|流れ|計算式|判断/.test(body),
      hasError: /誤り|間違|注意|落とし穴|ミス/.test(body),
      hasSelfCheck: /自検|自己点検|チェック|確認項目|確認しよう/.test(body),
      internalLinks: links,
      updatedAt: parsed.data.updatedAt,
      lawReferenceDate: parsed.data.lawReferenceDate,
      dataAsOf: parsed.data.dataAsOf,
    })
  }
}

const questionSets = loadJsonSets(questionRoot)
const cardSets = loadJsonSets(cardRoot)
const questions = questionSets.flatMap(set => set.questions)
const multipleChoiceQuestions = questions.filter(question => !question.practiceSheet)
const nonChoiceQuestions = questions.filter(question => question.practiceSheet)
const cards = cardSets.flatMap(set => set.cards)
const questionById = new Map(questions.map(question => [question.id, question]))
const questionChapterIds = new Set(questionSets.map(set => set.chapterId))
const cardChapterIds = new Set(cardSets.map(set => set.chapterId))

const explanationLengths = multipleChoiceQuestions.map(question => String(question.explanation ?? '').replace(/\s+/g, '').length)
const calculationQuestions = multipleChoiceQuestions.filter(question => /いくら|何円|何％|求め|計算|年額|月額|利回り|控除額|相続分|課税/.test(`${question.text} ${question.explanation}`))
const datedQuestions = multipleChoiceQuestions.filter(question => /令和\d+年度|20\d{2}年度|20\d{2}年|法令基準日/.test(`${question.text} ${question.explanation}`))
const cardBackLengths = cards.map(card => String(card.back ?? '').replace(/\s+/g, '').length)

const duplicateCardGroups = []
const cardGroups = new Map()
for (const card of cards) {
  const key = normalize(`${card.front}|${card.back}`)
  const group = cardGroups.get(key) ?? []
  group.push(card.id)
  cardGroups.set(key, group)
}
for (const group of cardGroups.values()) if (group.length > 1) duplicateCardGroups.push(group.sort())
duplicateCardGroups.sort((a, b) => a.join('|').localeCompare(b.join('|')))

assert(baseline.examId === 'fp3', 'baseline exam id is fp3')
assert(baseline.batch === 0, 'baseline batch is 0')
assert(/^2026-07-\d{2}$/.test(baseline.frozenAt), 'baseline freeze date is in July 2026')
assert(baseline.baseCommit === '3385d79063ecac403728fe169110f165a03e1e2f', 'baseline base commit is frozen')

assert(baseline.officialScope.baselineYear === 2026, 'official baseline year is 2026')
assert(baseline.officialScope.examMode === 'CBT', 'official exam mode is CBT')
assert(baseline.officialScope.commonAcademicAreas.length === 6, 'six official academic areas are recorded')
assert(new Set(baseline.officialScope.commonAcademicAreas).size === 6, 'official academic areas are unique')
for (const url of baseline.officialScope.sourceUrls) {
  assert(/^https:\/\/(www\.)?(jafp|kinzai)\.or\.jp\//.test(url), `official source uses JAFP or Kinzai: ${url}`)
}
assert(baseline.officialScope.lawReferencePeriods.length === 2, '2026 dual law-reference periods are recorded')
assert(baseline.officialScope.lawReferencePeriods[0].lawReferenceDate === '2025-04-01', 'April-May law reference date is 2025-04-01')
assert(baseline.officialScope.lawReferencePeriods[1].lawReferenceDate === '2026-04-01', 'June-March law reference date is 2026-04-01')
assert(baseline.officialScope.officialSample.reviewStatus === 'pending-detailed-audit', 'official 2026 sample detailed audit is explicitly pending')

assert(registry.length === baseline.frozenCounts.chapters, `chapter count remains ${baseline.frozenCounts.chapters}`)
assert(guideMetrics.length === baseline.frozenCounts.guideSections, `guide count remains ${baseline.frozenCounts.guideSections}`)
assert(multipleChoiceQuestions.length === baseline.frozenCounts.multipleChoiceQuestions, `protected choice question count remains ${baseline.frozenCounts.multipleChoiceQuestions}`)
assert(nonChoiceQuestions.length >= baseline.frozenCounts.nonChoiceQuestions, 'non-choice question count does not regress below baseline')
assert(cards.length === baseline.frozenCounts.cards, `card count remains ${baseline.frozenCounts.cards}`)
assert(guideInternalLinks >= baseline.frozenCounts.guideInternalLinks, `guide internal link count does not regress below ${baseline.frozenCounts.guideInternalLinks}`)

for (const question of multipleChoiceQuestions) {
  assert((question.type ?? 'single') === 'single', `${question.id}: remains single-choice at baseline`)
  assert(Array.isArray(question.options) && question.options.length >= 3, `${question.id}: has at least three options`)
  assert(question.options.filter(option => option.label === question.correctAnswer).length === 1, `${question.id}: exactly one correct option label`)
}

const guideChars = guideMetrics.map(item => item.chars)
const guideExpected = baseline.contentMetrics.guides
assert(Math.min(...guideChars) >= guideExpected.minimumChars, 'minimum guide chars do not regress below baseline')
assert(percentile(guideChars, 0.25) >= guideExpected.p25Chars, 'guide p25 chars do not regress below baseline')
assert(percentile(guideChars, 0.5) >= guideExpected.medianChars, 'guide median chars do not regress below baseline')
assert(percentile(guideChars, 0.75) >= guideExpected.p75Chars, 'guide p75 chars do not regress below baseline')
assert(Math.max(...guideChars) >= guideExpected.maximumChars, 'maximum guide chars do not regress below baseline')
assert(guideMetrics.filter(item => item.chars < 800).length <= guideExpected.under800Chars, 'guide count under 800 chars does not worsen')
assert(guideMetrics.filter(item => item.chars < 1000).length <= guideExpected.under1000Chars, 'guide count under 1,000 chars does not worsen')
assert(guideMetrics.filter(item => item.chars < 1500).length <= guideExpected.under1500Chars, 'guide count under 1,500 chars does not worsen')
assert(guideMetrics.filter(item => item.hasCase).length >= guideExpected.withCase, 'guide case coverage does not regress')
assert(guideMetrics.filter(item => item.hasProcess).length >= guideExpected.withProcess, 'guide process coverage does not regress')
assert(guideMetrics.filter(item => item.hasError).length >= guideExpected.withErrorDiagnosis, 'guide error coverage does not regress')
assert(guideMetrics.filter(item => item.hasSelfCheck).length >= guideExpected.withExplicitSelfCheck, 'guide self-check coverage does not regress')
assert(guideMetrics.filter(item => item.internalLinks > 0).length >= guideExpected.withBodyInternalLink, 'guide linked-page count does not regress')
assert(guideMetrics.filter(item => item.lawReferenceDate).length >= guideExpected.withLawReferenceDate, 'guide lawReferenceDate coverage does not regress below baseline')
assert(guideMetrics.filter(item => item.dataAsOf).length >= guideExpected.withDataAsOf, 'guide dataAsOf coverage does not regress below baseline')
assert(guideMetrics.every(item => /^2026-\d{2}-\d{2}$/.test(String(item.updatedAt))), 'all guide updatedAt values are valid 2026 dates')

const questionExpected = baseline.contentMetrics.questions
assert(multipleChoiceQuestions.filter(question => (question.type ?? 'single') === 'single').length === questionExpected.singleChoice, 'single-choice count matches baseline')
assert(multipleChoiceQuestions.filter(question => (question.type ?? 'single') !== 'single').length === questionExpected.otherTypes, 'legacy other question type count matches baseline')
assert(calculationQuestions.length === questionExpected.detectedCalculationQuestions, 'detected calculation question count matches baseline')
assert(percentile(explanationLengths, 0.5) === questionExpected.medianExplanationChars, 'median explanation length matches baseline')
assert(datedQuestions.length === questionExpected.datedQuestions, 'dated question count matches baseline')

const cardExpected = baseline.contentMetrics.cards
assert(cards.filter(card => String(card.back ?? '').replace(/\s+/g, '').length < 30).length === cardExpected.shortBackUnder30Chars, 'short card count matches baseline')
assert(percentile(cardBackLengths, 0.5) === cardExpected.medianBackChars, 'median card back length matches baseline')
assert(cards.filter(card => card.cardType).length === cardExpected.withCardType, 'typed card count matches baseline')
assert(cards.filter(card => card.guideLink).length === cardExpected.withGuideLink, 'card guide-link count matches baseline')
assert(cards.filter(card => card.questionLink).length === cardExpected.withQuestionLink, 'card question-link count matches baseline')
assert(cards.filter(card => card.relatedChapterLink).length === cardExpected.withRelatedChapterLink, 'card related-link count matches baseline')
assert(JSON.stringify(duplicateCardGroups) === JSON.stringify(cardExpected.exactDuplicateGroups), 'exact duplicate card groups match baseline')

assert(baseline.chapterBaselines.length === 6, 'six chapter baselines are recorded')
for (const chapterBaseline of baseline.chapterBaselines) {
  const registryChapter = registryByChapter.get(chapterBaseline.id)
  const questionSet = questionSets.find(set => set.chapterId === chapterBaseline.id)
  const cardSet = cardSets.find(set => set.chapterId === chapterBaseline.id)
  assert(Boolean(registryChapter), `${chapterBaseline.id}: registry chapter exists`)
  assert(registryChapter?.title === chapterBaseline.title, `${chapterBaseline.id}: title matches registry`)
  assert(registryChapter?.sections.length === chapterBaseline.sections, `${chapterBaseline.id}: section count matches baseline`)
  assert(questionSet?.questions.filter(question => !question.practiceSheet).length === chapterBaseline.multipleChoiceQuestions, `${chapterBaseline.id}: protected choice question count matches baseline`)
  assert(cardSet?.cards.length === chapterBaseline.cards, `${chapterBaseline.id}: card count matches baseline`)
}

assert(baseline.officialAbilityMap.length === 18, '18 core abilities are recorded')
const abilityIds = baseline.officialAbilityMap.map(ability => ability.id)
assert(new Set(abilityIds).size === abilityIds.length, 'ability ids are unique')
const mappedSectionIds = []
for (const ability of baseline.officialAbilityMap) {
  assert(baseline.officialScope.commonAcademicAreas.includes(ability.officialArea), `${ability.id}: official area is valid`)
  assert(ability.guideSectionIds.length > 0, `${ability.id}: guide coverage exists`)
  assert(ability.practiceCoverage.nonChoiceStatus === 'missing', `${ability.id}: baseline non-choice gap is explicit`)
  for (const sectionId of ability.guideSectionIds) {
    assert(registeredSectionIds.includes(sectionId), `${ability.id}: guide section ${sectionId} exists`)
    mappedSectionIds.push(sectionId)
  }
  for (const chapterId of ability.questionChapterIds) assert(questionChapterIds.has(chapterId), `${ability.id}: question chapter ${chapterId} exists`)
  for (const chapterId of ability.cardChapterIds) assert(cardChapterIds.has(chapterId), `${ability.id}: card chapter ${chapterId} exists`)
}
assert(mappedSectionIds.length === registeredSectionIds.length, 'ability map contains 36 section assignments')
assert(new Set(mappedSectionIds).size === registeredSectionIds.length, 'each guide section belongs to exactly one core ability')
assert(registeredSectionIds.every(sectionId => mappedSectionIds.includes(sectionId)), 'all registered guide sections are mapped')
assert(JSON.stringify(baseline.knownBatch0Gaps.missingNonChoicePracticeAbilityIds) === JSON.stringify(abilityIds), 'all 18 abilities are frozen as missing non-choice practice')

assert(baseline.highRiskCalculationPoints.length === 18, '18 high-risk calculation points are recorded')
const calculationIds = baseline.highRiskCalculationPoints.map(point => point.id)
assert(new Set(calculationIds).size === calculationIds.length, 'high-risk calculation ids are unique')
const implementedCalculations = baseline.highRiskCalculationPoints.filter(point => point.assertionStatus === 'implemented')
const plannedCalculations = baseline.highRiskCalculationPoints.filter(point => point.assertionStatus === 'planned')
assert(implementedCalculations.length === baseline.frozenCounts.calculationAssertions, 'eight existing calculation assertions are mapped')
assert(plannedCalculations.length === 10, 'ten missing calculation assertions are frozen')
for (const point of implementedCalculations) {
  assert(point.evidenceQuestionIds.length > 0, `${point.id}: implemented assertion has evidence`)
  for (const questionId of point.evidenceQuestionIds) assert(questionById.has(questionId), `${point.id}: evidence question ${questionId} exists`)
}
assert(JSON.stringify(plannedCalculations.map(point => point.id)) === JSON.stringify(baseline.knownBatch0Gaps.missingCalculationAssertionIds), 'planned calculation gaps match known gaps')

assert(baseline.assessmentBoundary.mockExamIncludedInAGradeScore === false, 'mock exam is excluded from A-grade score')
assert(baseline.assessmentBoundary.existingChoiceQuestionsMustBePreserved === 135, '135 choice questions are protected')
assert(baseline.assessmentBoundary.contentChangesAllowedInBatch0 === false, 'Batch0 content changes are forbidden')
const examRegistrySource = fs.readFileSync(path.join(root, 'lib/types/exams-registry.ts'), 'utf8')
const fp3Start = examRegistrySource.indexOf("    id: 'fp3'")
const fp3End = examRegistrySource.indexOf("    id: 'itp'", fp3Start)
const fp3Block = examRegistrySource.slice(fp3Start, fp3End)
assert(!/status:\s*'public'/.test(fp3Block), 'fp3 mock exam is not marked public')
assert(baseline.publicRouteBaseline.routeCounts.publicTotalExcludingRedirects === 52, 'public route baseline total is 52')

assert(baseline.scorecard.maximum === 100, 'scorecard maximum is 100')
assert(baseline.scorecard.aGradeThreshold === 90, 'A-grade threshold is 90')
assert(baseline.scorecard.grade === 'B', 'frozen baseline grade is B')
assert(baseline.scorecard.dimensions.reduce((sum, dimension) => sum + dimension.maximum, 0) === 100, 'dimension maximums sum to 100')
assert(baseline.scorecard.dimensions.reduce((sum, dimension) => sum + dimension.score, 0) === baseline.scorecard.total, 'dimension scores sum to baseline total')
assert(baseline.scorecard.total === 60, 'frozen baseline score is 60')
assert(baseline.scorecard.total < baseline.scorecard.aGradeThreshold, 'baseline remains below A-grade threshold')

for (const abilityId of baseline.knownBatch0Gaps.missingNonChoicePracticeAbilityIds) warnings.push(`${abilityId}: non-choice practice coverage is missing`)
for (const calculationId of baseline.knownBatch0Gaps.missingCalculationAssertionIds) warnings.push(`${calculationId}: calculation assertion is planned`)
for (const sectionId of baseline.knownBatch0Gaps.shallowGuideSectionIds) warnings.push(`${sectionId}: listed among the ten shallowest guide sections`)
for (const group of baseline.knownBatch0Gaps.duplicateCardGroups) warnings.push(`${group.join('/')}: exact duplicate card content`)
if (baseline.knownBatch0Gaps.missingDetailedOfficialSampleAudit) warnings.push('2026 official sample set still requires detailed ability audit')
if (baseline.knownBatch0Gaps.dualLawReferencePeriodNotEncodedSitewide) warnings.push('2026 dual law-reference periods are not encoded sitewide')

const result = {
  summary: {
    counts: {
      chapters: registry.length,
      guideSections: guideMetrics.length,
      multipleChoiceQuestions: multipleChoiceQuestions.length,
      nonChoiceQuestions: nonChoiceQuestions.length,
      cards: cards.length,
    },
    guideMetrics: {
      minimumChars: Math.min(...guideChars),
      medianChars: percentile(guideChars, 0.5),
      under1000Chars: guideMetrics.filter(item => item.chars < 1000).length,
      cases: guideMetrics.filter(item => item.hasCase).length,
      errorDiagnosis: guideMetrics.filter(item => item.hasError).length,
      explicitSelfCheck: guideMetrics.filter(item => item.hasSelfCheck).length,
      linkedPages: guideMetrics.filter(item => item.internalLinks > 0).length,
    },
    questionMetrics: {
      singleChoice: multipleChoiceQuestions.length,
      detectedCalculationQuestions: calculationQuestions.length,
      medianExplanationChars: percentile(explanationLengths, 0.5),
    },
    cardMetrics: {
      shortUnder30Chars: cards.filter(card => String(card.back ?? '').replace(/\s+/g, '').length < 30).length,
      exactDuplicateGroups: duplicateCardGroups.length,
      cardsWithLearningLinks: cards.filter(card => card.guideLink || card.questionLink || card.relatedChapterLink).length,
    },
    abilities: baseline.officialAbilityMap.length,
    highRiskCalculationPoints: baseline.highRiskCalculationPoints.length,
    implementedCalculationAssertions: implementedCalculations.length,
    baselineScore: baseline.scorecard.total,
    baselineGrade: baseline.scorecard.grade,
    checks: checks.length,
    warningCount: warnings.length,
  },
  issueCount: issues.length,
  issues,
  warnings,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
