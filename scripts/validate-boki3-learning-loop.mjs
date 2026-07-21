import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createReviewCardMap } from '../lib/questions/review-card.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cardRoot = path.join(root, 'content/exams/boki3/cards')
const guideRoot = path.join(root, 'content/exams/boki3/guide')
const questionRoot = path.join(root, 'content/exams/boki3/questions')
const issues = []
const checks = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function normalize(text) {
  return String(text ?? '').normalize('NFKC').replace(/[\s、。・（）()「」『』【】0-9０-９,，円]/g, '')
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

const cardSets = fs.readdirSync(cardRoot)
  .filter(name => /^ch\d+\.json$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)) - Number(b.match(/\d+/)))
  .map(name => loadJson(path.join(cardRoot, name)))

const questionSets = fs.readdirSync(questionRoot)
  .filter(name => /^ch\d+\.json$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)) - Number(b.match(/\d+/)))
  .map(name => loadJson(path.join(questionRoot, name)))

const cards = cardSets.flatMap(set => set.cards)
const questions = questionSets.flatMap(set => set.questions)
const cardIds = new Set(cards.map(card => card.id))
const questionById = new Map(questions.map(question => [question.id, question]))
const chapterIds = new Set(cardSets.map(set => set.chapterId))
const typeCounts = { '記憶': 0, '判断': 0, '手順': 0, '誤り診断': 0 }

assert(cardSets.length === 13, `card set count is 13, got ${cardSets.length}`)
assert(cards.length === 215, `card baseline remains 215, got ${cards.length}`)
assert(cardIds.size === cards.length, 'all card ids are unique')

for (const set of cardSets) {
  const chapterCards = set.cards
  const localIds = new Set(chapterCards.map(card => card.id))
  assert(localIds.size === chapterCards.length, `${set.chapterId}: local card ids are unique`)
  assert(chapterCards.some(card => card.cardType === '判断'), `${set.chapterId}: has a judgment card`)
  assert(chapterCards.some(card => ['手順', '誤り診断'].includes(card.cardType)), `${set.chapterId}: has a process or diagnostic card`)

  const chapterQuestions = questionSets.find(questionSet => questionSet.chapterId === set.chapterId)?.questions ?? []
  const reviewMap = createReviewCardMap(chapterQuestions, chapterCards)
  assert(Object.keys(reviewMap).length === chapterQuestions.length, `${set.chapterId}: every question receives a review-card entry`)

  for (const question of chapterQuestions) {
    const review = reviewMap[question.id]
    assert(Boolean(review?.href), `${question.id}: review card href exists`)
    assert(review?.href.includes(`/cards?chapter=${set.chapterId}`), `${question.id}: review card stays in chapter`)
    const cardId = new URL(review.href, 'https://example.test').searchParams.get('card')
    assert(Boolean(cardId && localIds.has(cardId)), `${question.id}: mapped review card exists`)
  }
}

for (const card of cards) {
  assert(Boolean(card.front?.trim()), `${card.id}: front is not blank`)
  assert(Boolean(card.back?.trim()), `${card.id}: back is not blank`)
  assert(['記憶', '判断', '手順', '誤り診断'].includes(card.cardType), `${card.id}: valid card type`)
  if (card.cardType) typeCounts[card.cardType] += 1

  const guideMatch = card.guideLink?.href?.match(/^\/exams\/boki3\/guide\/(ch\d+)\/(ch\d+-s\d+)$/)
  assert(Boolean(guideMatch), `${card.id}: canonical guide deep link`)
  if (guideMatch) {
    assert(guideMatch[1] === card.chapterId, `${card.id}: guide link stays in chapter`)
    assert(fs.existsSync(path.join(guideRoot, guideMatch[1], `${guideMatch[2]}.mdx`)), `${card.id}: guide target exists`)
  }

  const questionMatch = card.questionLink?.href?.match(/^\/exams\/boki3\/questions\/(ch\d+)\?question=([a-z0-9-]+)$/)
  assert(Boolean(questionMatch), `${card.id}: canonical question deep link`)
  if (questionMatch) {
    assert(questionMatch[1] === card.chapterId, `${card.id}: question link stays in chapter`)
    assert(questionMatch[2] === card.questionLink.questionId, `${card.id}: question id agrees with href`)
    const question = questionById.get(questionMatch[2])
    assert(Boolean(question), `${card.id}: linked question exists`)
    assert(question?.chapterId === card.chapterId, `${card.id}: linked question metadata agrees`)
  }

  const relatedMatch = card.relatedChapterLink?.href?.match(/^\/exams\/boki3\/guide\/(ch\d+)$/)
  assert(Boolean(relatedMatch), `${card.id}: canonical related chapter link`)
  if (relatedMatch) {
    assert(relatedMatch[1] === card.relatedChapterLink.chapterId, `${card.id}: related chapter id agrees with href`)
    assert(chapterIds.has(relatedMatch[1]), `${card.id}: related chapter exists`)
    assert(relatedMatch[1] !== card.chapterId, `${card.id}: related chapter is not self`)
  }

  if (card.cardType === '判断') {
    assert(/理由|違い|判断|ため|ではなく|権利|義務|使わ|含め|区別|分類|目的|場合|増加|減少|残高|商品|側|どちら|どう|等式/.test(`${card.front}${card.back}`), `${card.id}: judgment card contains a decision basis`)
  }
  if (card.cardType === '手順') {
    assert(/手順|順序|仕訳|処理|計算|確認|→|振り替|転記|検算|記録|求め|残高|月数|＝|−|＋/.test(`${card.front}${card.back}`), `${card.id}: process card contains an action sequence`)
  }
  if (card.cardType === '誤り診断') {
    assert(/誤|漏れ|二重|重複|してはいけない|使わない|合わない|取り違|確認|混ぜ|発見|再計上|逆/.test(`${card.front}${card.back}`), `${card.id}: diagnostic card contains an error signal`)
  }
}

const memoryRatio = typeCounts['記憶'] / cards.length
const judgmentRatio = typeCounts['判断'] / cards.length
const processRatio = (typeCounts['手順'] + typeCounts['誤り診断']) / cards.length
assert(memoryRatio >= 0.25 && memoryRatio <= 0.35, `memory ratio is about 30%, got ${(memoryRatio * 100).toFixed(1)}%`)
assert(judgmentRatio >= 0.35 && judgmentRatio <= 0.45, `judgment ratio is about 40%, got ${(judgmentRatio * 100).toFixed(1)}%`)
assert(processRatio >= 0.25 && processRatio <= 0.35, `process/diagnostic ratio is about 30%, got ${(processRatio * 100).toFixed(1)}%`)
assert(typeCounts['誤り診断'] >= 12, `at least 12 diagnostic cards, got ${typeCounts['誤り診断']}`)

const cardById = new Map(cards.map(card => [card.id, card]))
const requiredTopicMappings = {
  'boki3-ch1-card3': ['ch1-s2', 'boki3-ch1-q3'],
  'boki3-ch1-card6': ['ch1-s1', 'boki3-ch1-q8'],
  'boki3-ch2-card8': ['ch2-s1', 'boki3-ch2-q6'],
  'boki3-ch4-card7': ['ch4-s1', 'boki3-ch4-q6'],
  'boki3-ch5-card2': ['ch5-s2', 'boki3-ch5-q2'],
  'boki3-ch5-card3': ['ch5-s2', 'boki3-ch5-q8'],
  'boki3-ch12-card7': ['ch12-s3', 'boki3-ch12-q4'],
  'boki3-ch13-card1': ['ch13-s1', 'boki3-ch13-q16'],
}
for (const [cardId, [sectionId, questionId]] of Object.entries(requiredTopicMappings)) {
  const card = cardById.get(cardId)
  assert(card?.guideLink?.href.endsWith(`/${sectionId}`), `${cardId}: high-risk guide topic mapping is exact`)
  assert(card?.questionLink?.questionId === questionId, `${cardId}: high-risk question topic mapping is exact`)
}

const normalizedGroups = new Map()
for (const card of cards) {
  const key = normalize(`${card.front}|${card.back}`)
  const group = normalizedGroups.get(key) ?? []
  group.push(card.id)
  normalizedGroups.set(key, group)
}
for (const group of normalizedGroups.values()) {
  assert(group.length === 1, `no normalized exact duplicate cards: ${group.join(', ')}`)
}

let highSimilarityPairs = 0
const cardGrams = cards.map(card => ({ card, value: grams(`${card.front}|${card.back}`) }))
for (let left = 0; left < cardGrams.length; left += 1) {
  for (let right = left + 1; right < cardGrams.length; right += 1) {
    const value = similarity(cardGrams[left].value, cardGrams[right].value)
    if (value >= 0.82) {
      highSimilarityPairs += 1
      assert(false, `near-duplicate cards ${cardGrams[left].card.id}/${cardGrams[right].card.id}: ${value.toFixed(3)}`)
    }
  }
}
assert(highSimilarityPairs === 0, `near-duplicate pair count is zero, got ${highSimilarityPairs}`)

const flashcardSource = fs.readFileSync(path.join(root, 'components/features/cards/FlashcardDeck.tsx'), 'utf8')
const guideSource = fs.readFileSync(path.join(root, 'components/features/guide/GuideContent.tsx'), 'utf8')
const questionSource = fs.readFileSync(path.join(root, 'components/features/questions/QuestionClient.tsx'), 'utf8')
const nonChoiceSource = fs.readFileSync(path.join(root, 'components/features/questions/NonChoiceQuestion.tsx'), 'utf8')
for (const token of ['flashcard-type-badge', 'flashcard-learning-links', 'activeCard.guideLink', 'activeCard.questionLink', 'activeCard.relatedChapterLink']) {
  assert(flashcardSource.includes(token), `flashcard UI contains ${token}`)
}
assert(guideSource.includes('知識カードで復習'), 'guide links to chapter cards')
assert(questionSource.includes('間違えた内容をカードで復習'), 'choice wrong answer links to exact card')
assert(nonChoiceSource.includes('reviewCardLink'), 'non-choice wrong answer links to exact card')

const result = {
  summary: {
    cards: cards.length,
    questions: questions.length,
    typeCounts,
    chapters: cardSets.length,
    highSimilarityPairs,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
