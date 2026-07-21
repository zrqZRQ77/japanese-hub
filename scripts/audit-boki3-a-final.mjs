import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import matter from 'gray-matter'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const guideRoot = path.join(root, 'content/exams/boki3/guide')
const questionRoot = path.join(root, 'content/exams/boki3/questions')
const cardRoot = path.join(root, 'content/exams/boki3/cards')
const score = require('../content/exams/boki3/a-grade/final-score.js')
const issues = []
const checks = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const strictResult = spawnSync(process.execPath, ['--no-warnings', '--experimental-strip-types', 'scripts/validate-boki3-a-grade.mjs'], {
  cwd: root,
  encoding: 'utf8',
  env: process.env,
})
assert(strictResult.status === 0, 'strict A-grade validator passes')

const guideMetrics = []
for (const chapterId of fs.readdirSync(guideRoot).filter(name => /^ch\d+$/.test(name))) {
  for (const file of fs.readdirSync(path.join(guideRoot, chapterId)).filter(name => name.endsWith('.mdx'))) {
    const parsed = matter(fs.readFileSync(path.join(guideRoot, chapterId, file), 'utf8'))
    const body = parsed.content
    guideMetrics.push({
      id: path.basename(file, '.mdx'),
      chars: body.replace(/\s+/g, '').length,
      hasCase: /例|ケース|取引|練習/.test(body),
      hasError: /誤り|間違/.test(body),
      hasSelfCheck: /自検|自己点検|チェック|確認項目/.test(body),
      hasContentLink: /\]\(\/exams\/boki3\//.test(body),
      updatedAt: String(parsed.data.updatedAt),
    })
  }
}
const minimumGuideChars = Math.min(...guideMetrics.map(item => item.chars))
const caseGuides = guideMetrics.filter(item => item.hasCase).length
const errorGuides = guideMetrics.filter(item => item.hasError).length
const selfCheckGuides = guideMetrics.filter(item => item.hasSelfCheck).length
const contentLinkedGuides = guideMetrics.filter(item => item.hasContentLink).length

assert(guideMetrics.length === 45, `guide audit covers 45 sections, got ${guideMetrics.length}`)
assert(minimumGuideChars >= 1700, `minimum guide depth is at least 1,700 chars, got ${minimumGuideChars}`)
assert(caseGuides === 45, `all guides contain cases or transactions, got ${caseGuides}`)
assert(errorGuides >= 44, `at least 44 guides contain error diagnosis, got ${errorGuides}`)
assert(selfCheckGuides >= 36, `at least 36 guides contain explicit self-checks, got ${selfCheckGuides}`)
assert(contentLinkedGuides >= 44, `at least 44 guide bodies contain internal content links, got ${contentLinkedGuides}`)
assert(guideMetrics.every(item => /^2026-07-(17|18|19|20)$/.test(item.updatedAt)), 'all guide updatedAt values are in the final 2026 audit window')

const questionSets = fs.readdirSync(questionRoot).filter(name => /^ch\d+\.json$/.test(name)).map(name => loadJson(path.join(questionRoot, name)))
const questions = questionSets.flatMap(set => set.questions)
const choiceQuestions = questions.filter(question => !question.practiceSheet)
const nonChoiceQuestions = questions.filter(question => question.practiceSheet)
const questionTypeCounts = nonChoiceQuestions.reduce((result, question) => {
  result[question.type] = (result[question.type] ?? 0) + 1
  return result
}, {})
const journalLayoutCount = nonChoiceQuestions.filter(question => question.practiceSheet.kind === 'journal').length

assert(choiceQuestions.length === 204, `choice audit covers 204 questions, got ${choiceQuestions.length}`)
assert(nonChoiceQuestions.length === 45, `non-choice audit covers 45 questions, got ${nonChoiceQuestions.length}`)
assert(journalLayoutCount === 25, `journal-layout question count is 25, got ${journalLayoutCount}`)
for (const type of ['journal', 'numeric', 'table', 'classification', 'correction']) assert((questionTypeCounts[type] ?? 0) > 0, `final practice includes ${type}`)
for (const question of choiceQuestions) {
  const labels = (question.options ?? []).filter(option => option.label === question.correctAnswer)
  assert(labels.length === 1, `${question.id}: choice answer maps to exactly one option`)
}
for (const question of nonChoiceQuestions) {
  const fields = question.practiceSheet.fields ?? []
  assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: non-choice answer is complete`)
  for (const field of fields) {
    const accepted = [field.correctAnswer, ...(field.acceptedAnswers ?? [])].map(value => String(value).normalize('NFKC').replace(/[\s　,，円・･]/g, '').replace(/勘定$/, ''))
    assert(accepted.every(value => value === accepted[0]), `${question.id}/${field.id}: accepted formatting variants remain substantively identical`)
  }
}

const cardSets = fs.readdirSync(cardRoot).filter(name => /^ch\d+\.json$/.test(name)).map(name => loadJson(path.join(cardRoot, name)))
const cards = cardSets.flatMap(set => set.cards)
const typeCounts = cards.reduce((result, card) => {
  result[card.cardType] = (result[card.cardType] ?? 0) + 1
  return result
}, {})
assert(cards.length === 215, `card audit covers 215 cards, got ${cards.length}`)
assert(cards.every(card => card.guideLink && card.questionLink && card.relatedChapterLink), 'all cards have the three learning-loop links')
assert(typeCounts['記憶'] === 65 && typeCounts['判断'] === 91 && typeCounts['手順'] === 43 && typeCounts['誤り診断'] === 16, 'card type counts match the final audited distribution')

const searchSource = fs.readFileSync(path.join(root, 'app/api/search/route.ts'), 'utf8')
const sitemapSource = fs.readFileSync(path.join(root, 'app/sitemap.ts'), 'utf8')
const questionPageSource = fs.readFileSync(path.join(root, 'app/exams/[examId]/questions/[chapterId]/page.tsx'), 'utf8')
const cardPageSource = fs.readFileSync(path.join(root, 'app/exams/[examId]/cards/page.tsx'), 'utf8')
const guidePageSource = fs.readFileSync(path.join(root, 'app/exams/[examId]/guide/[chapterId]/[sectionId]/page.tsx'), 'utf8')
assert(searchSource.includes('学習ガイド全文検索') && searchSource.includes('練習問題 JSON 検索') && searchSource.includes('知識カード JSON 検索'), 'search covers guides, questions, and cards')
assert(searchSource.includes('?question=${q2.id}') && searchSource.includes('&card=${card.id}'), 'search results use exact question and card deep links')
assert(sitemapSource.includes('isMockExamPublic') && sitemapSource.includes('/guide/') && sitemapSource.includes('/questions/') && sitemapSource.includes('/cards'), 'sitemap covers public learning routes and gates mock exam')
assert(questionPageSource.includes('createPageMetadata') && guidePageSource.includes('createPageMetadata') && cardPageSource.includes('createPageMetadata'), 'guide, question, and card pages use shared SEO metadata')
assert(questionPageSource.includes('application/ld+json') && cardPageSource.includes('application/ld+json') && guidePageSource.includes('application/ld+json'), 'guide, question, and card pages expose breadcrumb JSON-LD')

assert(score.examId === 'boki3', 'score exam id is boki3')
assert(score.grade === 'A', 'final grade is A')
assert(score.maximum === 100, `score maximum is 100, got ${score.maximum}`)
assert(score.total === 95, `final score is 95, got ${score.total}`)
assert(score.total >= score.minimumTotal, `final score meets ${score.minimumTotal}-point A threshold`)
for (const dimension of score.dimensions) {
  assert(dimension.score <= dimension.maximum, `${dimension.id}: score does not exceed maximum`)
  assert(dimension.score >= dimension.minimum, `${dimension.id}: score meets dimension minimum`)
  assert(dimension.evidence.length >= 3, `${dimension.id}: has at least three evidence items`)
  if (dimension.score < dimension.maximum) assert(Boolean(dimension.deduction), `${dimension.id}: deduction is documented`)
}
assert(score.vetoChecks.length === 6, `six veto checks are recorded, got ${score.vetoChecks.length}`)
assert(score.vetoChecks.every(item => item.blocked === false), 'no A-grade veto is triggered')

const reportPath = path.join(root, 'docs/boki3-a-final-audit.md')
assert(fs.existsSync(reportPath), 'final audit report exists')
if (fs.existsSync(reportPath)) {
  const report = fs.readFileSync(reportPath, 'utf8')
  for (const token of ['95/100', '204道', '45道', '215张', '1,437', '已知但不影响A级']) {
    assert(report.includes(token), `final audit report contains ${token}`)
  }
}

const result = {
  summary: {
    score: score.total,
    grade: score.grade,
    guideMetrics: {
      sections: guideMetrics.length,
      minimumChars: minimumGuideChars,
      cases: caseGuides,
      errorDiagnosis: errorGuides,
      explicitSelfCheck: selfCheckGuides,
      internalBodyLinks: contentLinkedGuides,
    },
    practice: {
      choice: choiceQuestions.length,
      nonChoice: nonChoiceQuestions.length,
      journalLayout: journalLayoutCount,
      typeCounts: questionTypeCounts,
    },
    cards: {
      total: cards.length,
      typeCounts,
    },
    vetoesTriggered: score.vetoChecks.filter(item => item.blocked).length,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
