const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const cardRoot = path.join(root, 'content/exams/fp3/cards')
const guideRoot = path.join(root, 'content/exams/fp3/guide')
const questionRoot = path.join(root, 'content/exams/fp3/questions')
const mapping = require('../content/exams/fp3/a-grade/card-learning-loop-mapping.js')
const originalHashes = require('../content/exams/fp3/a-grade/card-learning-loop-original-hashes.js')
const currentHashes = require('../content/exams/fp3/a-grade/card-learning-loop-current-hashes.js')

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

function core(card) {
  return {
    id: card.id,
    front: card.front,
    back: card.back,
    tags: card.tags ?? [],
  }
}

function normalize(text) {
  return String(text ?? '')
    .normalize('NFKC')
    .replace(/[\s、。・（）()「」『』【】0-9０-９,，円％%]/g, '')
}

function grams(text) {
  const value = normalize(text)
  const result = new Set()
  for (let index = 0; index < value.length - 2; index += 1) result.add(value.slice(index, index + 3))
  return result
}

function similarity(left, right) {
  let intersection = 0
  for (const item of left) if (right.has(item)) intersection += 1
  return intersection / (left.size + right.size - intersection || 1)
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
runValidator('fp3-batch1-official-annual', 'scripts/validate-fp3-a-batch1.js')
runValidator('fp3-batch2-tax', 'scripts/validate-fp3-a-batch2.js')
runValidator('fp3-batch3-realestate-inheritance', 'scripts/validate-fp3-a-batch3.js')
runValidator('fp3-batch4-lifeplanning', 'scripts/validate-fp3-a-batch4.js')
runValidator('fp3-batch5-financial-assets', 'scripts/validate-fp3-a-batch5.js')

const cardSets = fs.readdirSync(cardRoot)
  .filter(name => /^ch\d+\.json$/.test(name))
  .sort((left, right) => Number(left.match(/\d+/)[0]) - Number(right.match(/\d+/)[0]))
  .map(name => JSON.parse(fs.readFileSync(path.join(cardRoot, name), 'utf8')))
const questionSets = fs.readdirSync(questionRoot)
  .filter(name => /^ch\d+\.json$/.test(name))
  .sort((left, right) => Number(left.match(/\d+/)[0]) - Number(right.match(/\d+/)[0]))
  .map(name => JSON.parse(fs.readFileSync(path.join(questionRoot, name), 'utf8')))
const cards = cardSets.flatMap(set => set.cards)
const questions = questionSets.flatMap(set => set.questions)
const cardIds = new Set(cards.map(card => card.id))
const questionById = new Map(questions.map(question => [question.id, question]))
const typeCounts = { '記憶': 0, '判断': 0, '手順': 0, '誤り診断': 0 }
const guideSectionCounts = {}
const linkedQuestionIds = new Set()

assert(cardSets.length === 6, 'six FP3 card sets exist')
assert(cards.length === 135, 'FP3 card count remains 135')
assert(cardIds.size === cards.length, 'all FP3 card ids are unique')
assert(mapping.examId === 'fp3' && mapping.batch === 7, 'learning-loop mapping identifies FP3 Batch7')
assert(mapping.verifiedAt === '2026-07-21', 'learning-loop mapping records verification date')
assert(mapping.cardCount === 135, 'learning-loop mapping records 135 cards')
assert(Object.keys(mapping.mappings).length === 135, 'learning-loop mapping contains 135 entries')
assert(Object.keys(originalHashes).length === 135, 'original core hashes contain 135 entries')
assert(Object.keys(currentHashes).length === 135, 'current core hashes contain 135 entries')
assert(Object.keys(mapping.approvedRewrites).length === 1, 'exactly one duplicate-resolution rewrite is approved')
assert(Boolean(mapping.approvedRewrites['fp3-ch2-card13']), 'approved rewrite is the duplicated insurance card')

for (const set of cardSets) {
  assert(set.cards.length > 0, `${set.chapterId}: card set is not empty`)
  assert(set.cards.some(card => card.cardType === '判断'), `${set.chapterId}: includes a judgment card`)
  assert(set.cards.some(card => ['手順', '誤り診断'].includes(card.cardType)), `${set.chapterId}: includes a process or diagnostic card`)
}

for (const card of cards) {
  assert(Boolean(card.front?.trim()), `${card.id}: front is not blank`)
  assert(Boolean(card.back?.trim()), `${card.id}: back is not blank`)
  assert(Array.isArray(card.tags) && card.tags.length > 0, `${card.id}: tags exist`)
  assert(['記憶', '判断', '手順', '誤り診断'].includes(card.cardType), `${card.id}: valid card type`)
  if (card.cardType) typeCounts[card.cardType] += 1

  const guideMatch = card.guideLink?.href?.match(/^\/exams\/fp3\/guide\/(ch\d+)\/(ch\d+-s\d+)$/)
  assert(Boolean(guideMatch), `${card.id}: canonical guide deep link`)
  if (guideMatch) {
    assert(guideMatch[1] === card.chapterId, `${card.id}: guide link stays in chapter`)
    assert(fs.existsSync(path.join(guideRoot, guideMatch[1], `${guideMatch[2]}.mdx`)), `${card.id}: guide target exists`)
    guideSectionCounts[guideMatch[2]] = (guideSectionCounts[guideMatch[2]] ?? 0) + 1
  }

  const questionMatch = card.questionLink?.href?.match(/^\/exams\/fp3\/questions\/(ch\d+)\?question=([a-z0-9-]+)$/)
  assert(Boolean(questionMatch), `${card.id}: canonical question deep link`)
  if (questionMatch) {
    assert(questionMatch[1] === card.chapterId, `${card.id}: question link stays in chapter`)
    assert(questionMatch[2] === card.questionLink.questionId, `${card.id}: question id agrees with href`)
    const question = questionById.get(questionMatch[2])
    assert(Boolean(question), `${card.id}: linked question exists`)
    assert(question?.chapterId === card.chapterId, `${card.id}: linked question metadata agrees`)
    linkedQuestionIds.add(questionMatch[2])
  }

  const mapped = mapping.mappings[card.id]
  assert(Boolean(mapped), `${card.id}: mapping entry exists`)
  assert(mapped?.cardType === card.cardType, `${card.id}: mapped card type agrees`)
  assert(mapped?.guideSectionId === guideMatch?.[2], `${card.id}: mapped guide section agrees`)
  assert(mapped?.questionId === questionMatch?.[2], `${card.id}: mapped question agrees`)

  const currentHash = sha256(JSON.stringify(core(card)))
  assert(currentHash === currentHashes[card.id], `${card.id}: current core hash matches freeze`)
  const rewrite = mapping.approvedRewrites[card.id]
  if (rewrite) {
    assert(rewrite.previousCoreHash === originalHashes[card.id], `${card.id}: rewrite records original hash`)
    assert(rewrite.currentCoreHash === currentHash, `${card.id}: rewrite records current hash`)
    assert(Boolean(rewrite.reason), `${card.id}: rewrite reason exists`)
  } else {
    assert(currentHash === originalHashes[card.id], `${card.id}: front/back/tags stay unchanged`)
  }
}

const registeredSections = []
for (const chapterId of fs.readdirSync(guideRoot).filter(name => /^ch\d+$/.test(name)).sort()) {
  for (const name of fs.readdirSync(path.join(guideRoot, chapterId)).filter(file => file.endsWith('.mdx'))) {
    registeredSections.push(path.basename(name, '.mdx'))
  }
}
assert(registeredSections.length === 36, '36 guide sections are registered')
assert(Object.keys(guideSectionCounts).length === 36, 'all 36 guide sections receive at least one card')
for (const sectionId of registeredSections) assert((guideSectionCounts[sectionId] ?? 0) >= 1, `${sectionId}: at least one card links to the section`)
assert(linkedQuestionIds.size >= 100, `at least 100 distinct questions receive direct card links, got ${linkedQuestionIds.size}`)

const memoryRatio = typeCounts['記憶'] / cards.length
const judgmentRatio = typeCounts['判断'] / cards.length
const processRatio = (typeCounts['手順'] + typeCounts['誤り診断']) / cards.length
assert(memoryRatio >= 0.2 && memoryRatio <= 0.45, `memory-card ratio is reasonable: ${(memoryRatio * 100).toFixed(1)}%`)
assert(judgmentRatio >= 0.12 && judgmentRatio <= 0.35, `judgment-card ratio is reasonable: ${(judgmentRatio * 100).toFixed(1)}%`)
assert(processRatio >= 0.35 && processRatio <= 0.6, `process/diagnostic ratio is reasonable: ${(processRatio * 100).toFixed(1)}%`)
assert(typeCounts['誤り診断'] >= 12, `at least 12 diagnostic cards exist, got ${typeCounts['誤り診断']}`)
assert(JSON.stringify(typeCounts) === JSON.stringify(mapping.typeCounts), 'actual card type counts agree with mapping')

const exactGroups = new Map()
for (const card of cards) {
  const key = normalize(`${card.front}|${card.back}`)
  const group = exactGroups.get(key) ?? []
  group.push(card.id)
  exactGroups.set(key, group)
}
const exactDuplicates = [...exactGroups.values()].filter(group => group.length > 1)
assert(exactDuplicates.length === 0, `exact duplicate card groups are zero, got ${exactDuplicates.length}`)

let nearDuplicatePairs = 0
const cardGrams = cards.map(card => ({ card, value: grams(`${card.front}|${card.back}`) }))
for (let left = 0; left < cardGrams.length; left += 1) {
  for (let right = left + 1; right < cardGrams.length; right += 1) {
    const value = similarity(cardGrams[left].value, cardGrams[right].value)
    if (value >= 0.88) {
      nearDuplicatePairs += 1
      assert(false, `near-duplicate cards ${cardGrams[left].card.id}/${cardGrams[right].card.id}: ${value.toFixed(3)}`)
    }
  }
}
assert(nearDuplicatePairs === 0, `near-duplicate card count is zero, got ${nearDuplicatePairs}`)

const flashcardSource = fs.readFileSync(path.join(root, 'components/features/cards/FlashcardDeck.tsx'), 'utf8')
const progressSource = fs.readFileSync(path.join(root, 'lib/hooks/useProgress.ts'), 'utf8')
const typeSource = fs.readFileSync(path.join(root, 'lib/types/index.ts'), 'utf8')
const storageSource = fs.readFileSync(path.join(root, 'lib/storage/progressAdapter.ts'), 'utf8')
const cssSource = fs.readFileSync(path.join(root, 'styles/globals.css'), 'utf8')
const guideSource = fs.readFileSync(path.join(root, 'components/features/guide/GuideContent.tsx'), 'utf8')
const choiceSource = fs.readFileSync(path.join(root, 'components/features/questions/QuestionClient.tsx'), 'utf8')
const nonChoiceSource = fs.readFileSync(path.join(root, 'components/features/questions/NonChoiceQuestion.tsx'), 'utf8')

for (const token of [
  "type ReviewMode = 'all' | 'learning' | 'mistakes' | 'random'",
  'まだ不安',
  '間違い関連',
  'ランダム10',
  'randomCardIds',
  'setCardStatus',
  'disabled={!flipped}',
  'activeCard.guideLink',
  'activeCard.questionLink',
  'marginTop: 48',
]) assert(flashcardSource.includes(token), `flashcard UI contains ${token}`)
assert((flashcardSource.match(/<AdSlot/g) ?? []).length === 1, 'flashcard page renders one ad slot after the learning shell')
assert(typeSource.includes("export type CardLearningStatus = 'learning' | 'mastered'"), 'types define two card-learning statuses')
assert(typeSource.includes('version: 3'), 'progress type is version 3')
assert(typeSource.includes('cardProgress: Record<string, CardLearningProgress>'), 'progress type stores card progress')
assert(progressSource.includes('migratedCardProgress'), 'old remembered-card progress is migrated')
assert(progressSource.includes('reviewCount: (previous?.reviewCount ?? 0) + 1'), 'card review count is persisted')
assert(progressSource.includes("setCardStatus(cardId, remembered ? 'mastered' : null"), 'legacy remembered API remains compatible')
assert(storageSource.includes('window.localStorage'), 'card progress remains local-only without a database')
assert(cssSource.includes('.flashcard-status-button.is-learning'), 'learning status button has dedicated styling')
assert(cssSource.includes('.flashcard-status-button.is-mastered'), 'mastered status button has dedicated styling')
assert(guideSource.includes('知識カードで復習'), 'guides link to chapter cards')
assert(choiceSource.includes('間違えた内容をカードで復習'), 'choice mistakes link to review cards')
assert(nonChoiceSource.includes('reviewCardLink'), 'non-choice mistakes link to review cards')
assert(!fs.existsSync(path.join(root, 'app/exams/[examId]/cards/[cardId]')), 'cards are not split into thin standalone SEO pages')

const result = {
  summary: {
    cards: cards.length,
    chapters: cardSets.length,
    typeCounts,
    guideSectionsCovered: Object.keys(guideSectionCounts).length,
    distinctQuestionsLinked: linkedQuestionIds.size,
    approvedRewrites: Object.keys(mapping.approvedRewrites).length,
    exactDuplicateGroups: exactDuplicates.length,
    nearDuplicatePairs,
    shortBacksUnder30: cards.filter(card => String(card.back ?? '').replace(/\s+/g, '').length < 30).length,
    childValidators,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
