const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const EXAM_ID = 'boki3'
const CONTENT_ROOT = path.join(ROOT, 'content', 'exams', EXAM_ID)
const GUIDE_ROOT = path.join(CONTENT_ROOT, 'guide')
const baseline = require('../content/exams/boki3/a-grade/batch0-baseline')

function issue(list, message) {
  list.push(message)
}

function readRegistry() {
  const registryPath = path.join(ROOT, 'lib', 'types', 'chapters-registry.ts')
  const source = fs.readFileSync(registryPath, 'utf8')
  const marker = `  ${EXAM_ID}: [`
  const start = source.indexOf(marker)
  const end = source.indexOf('\n  ],\n\n  fp3:', start)
  if (start === -1 || end === -1) throw new Error('Unable to locate boki3 registry block')
  const body = source.slice(start + marker.length, end)
  return Function(`"use strict"; return [${body}\n]`)()
}

function loadJson(kind, chapterId) {
  const data = JSON.parse(fs.readFileSync(path.join(CONTENT_ROOT, kind, `${chapterId}.json`), 'utf8'))
  return data[kind] ?? []
}

function getAllJsonItems(kind, chapters) {
  return chapters.flatMap(chapter => loadJson(kind, chapter.id))
}

function getGuideSectionIds() {
  return fs.readdirSync(GUIDE_ROOT)
    .filter(name => /^ch\d+$/.test(name))
    .flatMap(chapterId => fs.readdirSync(path.join(GUIDE_ROOT, chapterId))
      .filter(name => name.endsWith('.mdx'))
      .map(name => path.basename(name, '.mdx')))
}

function expectedPublicRoutes(registry) {
  const routes = [
    { route: '/exams/boki3', kind: 'examHome' },
    { route: '/exams/boki3/guide', kind: 'guideIndex' },
  ]

  for (const chapter of registry) {
    routes.push({ route: `/exams/boki3/guide/${chapter.id}`, kind: 'guideChapter' })
    for (const section of chapter.sections) {
      routes.push({ route: `/exams/boki3/guide/${chapter.id}/${section.id}`, kind: 'guideSection' })
    }
  }

  routes.push({ route: '/exams/boki3/questions', kind: 'questionsIndex' })
  for (const chapter of registry) {
    routes.push({ route: `/exams/boki3/questions/${chapter.id}`, kind: 'questionChapter' })
  }
  routes.push({ route: '/exams/boki3/cards', kind: 'cardsPage' })

  return routes
}

function main() {
  const issues = []
  const warnings = []
  const registry = readRegistry()
  const guideSectionIds = getGuideSectionIds()
  const guideSet = new Set(guideSectionIds)
  const questionItems = getAllJsonItems('questions', registry)
  const multipleChoiceQuestionItems = questionItems.filter(question => !question.practiceSheet)
  const cardItems = getAllJsonItems('cards', registry)
  const questionChapterSet = new Set(registry.filter(chapter => loadJson('questions', chapter.id).length > 0).map(chapter => chapter.id))
  const cardChapterSet = new Set(registry.filter(chapter => loadJson('cards', chapter.id).length > 0).map(chapter => chapter.id))
  const routeBaseline = baseline.publicRouteBaseline.publicRoutes ?? []
  const expectedRoutes = expectedPublicRoutes(registry)

  if (baseline.examId !== EXAM_ID) issue(issues, 'baseline examId must be boki3')
  if (baseline.frozenAt !== '2026-07-20') issue(issues, 'baseline frozenAt must be 2026-07-20')
  if (baseline.officialScope.baselineYear !== 2026) issue(issues, 'official baselineYear must be 2026')
  if (baseline.officialScope.confirmedAt !== '2026-07-20') issue(issues, 'official confirmedAt must be 2026-07-20')
  if (!baseline.officialScope.applicableRangeTable.includes('2022年度')) {
    issue(issues, 'official applicable range table must reference 2022年度')
  }
  for (const url of baseline.officialScope.sourceUrls ?? []) {
    if (!/^https:\/\/www\.kentei\.ne\.jp\//.test(url)) issue(issues, `non-official source URL: ${url}`)
  }

  const counts = {
    chapters: registry.length,
    guideSections: guideSectionIds.length,
    multipleChoiceQuestions: multipleChoiceQuestionItems.length,
    cards: cardItems.length,
  }
  for (const [key, actual] of Object.entries(counts)) {
    if (baseline.frozenCounts[key] !== actual) issue(issues, `${key}: expected ${baseline.frozenCounts[key]}, found ${actual}`)
  }

  const chapterBaselineById = new Map(baseline.chapterBaselines.map(chapter => [chapter.id, chapter]))
  for (const chapter of registry) {
    const expected = chapterBaselineById.get(chapter.id)
    if (!expected) {
      issue(issues, `missing chapter baseline: ${chapter.id}`)
      continue
    }
    const questions = loadJson('questions', chapter.id).filter(question => !question.practiceSheet).length
    const cards = loadJson('cards', chapter.id).length
    if (expected.sections !== chapter.sections.length) issue(issues, `${chapter.id}: section count mismatch`)
    if (expected.multipleChoiceQuestions !== questions) issue(issues, `${chapter.id}: question count mismatch`)
    if (expected.cards !== cards) issue(issues, `${chapter.id}: card count mismatch`)
  }

  if (routeBaseline.length !== baseline.publicRouteBaseline.routeCounts.publicTotalExcludingRedirects) {
    issue(issues, 'public route list length does not match frozen route count')
  }
  if (routeBaseline.length !== expectedRoutes.length) {
    issue(issues, `public route list length mismatch: expected ${expectedRoutes.length}, found ${routeBaseline.length}`)
  }
  const routeByPath = new Map(routeBaseline.map(route => [route.route, route]))
  for (const expected of expectedRoutes) {
    const actual = routeByPath.get(expected.route)
    if (!actual) {
      issue(issues, `missing public route baseline: ${expected.route}`)
      continue
    }
    if (actual.kind !== expected.kind) issue(issues, `${expected.route}: route kind mismatch`)
    if (actual.public !== true) issue(issues, `${expected.route}: route must be marked public`)
  }

  for (const ability of baseline.officialAbilityMap) {
    if (!ability.id || !ability.coreAbility) issue(issues, 'ability missing id or coreAbility')
    if (!ability.guideSectionIds?.length) issue(issues, `${ability.id}: no guide sections`)
    for (const sectionId of ability.guideSectionIds ?? []) {
      if (!guideSet.has(sectionId)) issue(issues, `${ability.id}: unknown guide section ${sectionId}`)
    }
    for (const chapterId of ability.questionChapterIds ?? []) {
      if (!questionChapterSet.has(chapterId)) issue(issues, `${ability.id}: unknown question chapter ${chapterId}`)
    }
    for (const chapterId of ability.cardChapterIds ?? []) {
      if (!cardChapterSet.has(chapterId)) issue(issues, `${ability.id}: unknown card chapter ${chapterId}`)
    }
    for (const chapterId of ability.practiceCoverage?.multipleChoiceChapterIds ?? []) {
      if (!questionChapterSet.has(chapterId)) issue(issues, `${ability.id}: unknown multiple-choice practice chapter ${chapterId}`)
    }
    if (ability.requiresNonChoicePractice && ability.practiceCoverage?.nonChoiceStatus !== 'missing') {
      issue(issues, `${ability.id}: batch0 must explicitly mark missing non-choice practice`)
    }
    if (ability.requiresNonChoicePractice) warnings.push(`${ability.id}: non-choice practice coverage is not yet implemented`)
  }

  const mappedSections = new Set(baseline.officialAbilityMap.flatMap(ability => ability.guideSectionIds ?? []))
  for (const sectionId of guideSet) {
    if (!mappedSections.has(sectionId)) issue(issues, `guide section is not mapped to an official ability: ${sectionId}`)
  }

  for (const point of baseline.highRiskCalculationPoints) {
    if (point.assertionStatus !== 'planned') issue(issues, `${point.id}: batch0 calculation assertion status must be planned`)
    warnings.push(`${point.id}: calculation assertion is planned for a later batch`)
  }

  const knownMissing = baseline.knownBatch0Gaps?.missingNonChoicePracticeAbilityIds ?? []
  const missingFromAbilities = baseline.officialAbilityMap
    .filter(ability => ability.requiresNonChoicePractice && ability.practiceCoverage?.nonChoiceStatus === 'missing')
    .map(ability => ability.id)
  if (knownMissing.length !== missingFromAbilities.length) {
    issue(issues, 'known missing non-choice practice gap count mismatch')
  }
  for (const abilityId of missingFromAbilities) {
    if (!knownMissing.includes(abilityId)) issue(issues, `known gaps missing non-choice ability: ${abilityId}`)
  }

  const plannedAssertions = baseline.knownBatch0Gaps?.plannedCalculationAssertionIds ?? []
  for (const point of baseline.highRiskCalculationPoints) {
    if (!plannedAssertions.includes(point.id)) issue(issues, `known gaps missing planned calculation assertion: ${point.id}`)
  }

  const scoreTotal = baseline.aGradeScorecard.dimensions.reduce((sum, item) => sum + item.points, 0)
  const baselineScore = baseline.aGradeScorecard.dimensions.reduce((sum, item) => sum + item.baselineScore, 0)
  if (scoreTotal !== baseline.aGradeScorecard.totalPoints) issue(issues, `scorecard total mismatch: ${scoreTotal}`)
  if (baseline.aGradeScorecard.totalPoints !== 100) issue(issues, 'A-grade scorecard must total 100 points')
  if (baseline.aGradeScorecard.minimumAGradePoints !== 90) issue(issues, 'A-grade minimum must be 90 points')
  if (baselineScore !== baseline.aGradeScorecard.baselineAssessment.total) {
    issue(issues, `baseline score mismatch: ${baselineScore}`)
  }
  for (const dimension of baseline.aGradeScorecard.dimensions) {
    if (dimension.baselineScore > dimension.points) issue(issues, `${dimension.id}: baseline score exceeds available points`)
    if (dimension.minimum > dimension.points) issue(issues, `${dimension.id}: minimum exceeds available points`)
    if (!dimension.checks?.length) issue(issues, `${dimension.id}: score dimension has no checks`)
  }
  if (baseline.aGradeScorecard.mockExamIncluded !== false) issue(issues, 'mock exam must be excluded from A-grade score')
  if (baseline.assessmentBoundary.mockExamExcludedFromAGradeScore !== true) issue(issues, 'assessment boundary must exclude mock exam')

  const examsRegistry = fs.readFileSync(path.join(ROOT, 'lib', 'types', 'exams-registry.ts'), 'utf8')
  if (!/id: 'boki3'[\s\S]*?mockExam:\s*\{[\s\S]*?status: 'draft'/.test(examsRegistry)) {
    issue(issues, 'boki3 mock exam must remain draft in exams registry')
  }

  const summary = {
    counts,
    abilities: baseline.officialAbilityMap.length,
    highRiskCalculationPoints: baseline.highRiskCalculationPoints.length,
    publicRoutes: routeBaseline.length,
    scorecardPoints: scoreTotal,
    frozenBaselineScore: baselineScore,
    mockExamIncludedInAGradeScore: baseline.aGradeScorecard.mockExamIncluded,
    warningCount: warnings.length,
  }

  if (issues.length > 0) {
    console.error(JSON.stringify({ summary, issueCount: issues.length, issues, warnings }, null, 2))
    process.exit(1)
  }

  console.log(JSON.stringify({ summary, issueCount: 0, warnings }, null, 2))
}

try {
  main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
