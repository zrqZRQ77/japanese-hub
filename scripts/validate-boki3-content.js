const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const matter = require('gray-matter')

const ROOT = path.resolve(__dirname, '..')
const EXAM_ID = 'boki3'
const CONTENT_ROOT = path.join(ROOT, 'content', 'exams', EXAM_ID)
const GUIDE_ROOT = path.join(CONTENT_ROOT, 'guide')

function readRegistry() {
  const registryPath = path.join(ROOT, 'lib', 'types', 'chapters-registry.ts')
  const source = fs.readFileSync(registryPath, 'utf8')
  const marker = `  ${EXAM_ID}: [`
  const start = source.indexOf(marker)
  const end = source.indexOf('\n  ],\n\n  fp3:', start)

  if (start === -1 || end === -1) {
    throw new Error('Unable to locate boki3 registry block')
  }

  const body = source.slice(start + marker.length, end)
  return Function(`"use strict"; return [${body}\n]`)()
}

function listGuideFiles() {
  return fs.readdirSync(GUIDE_ROOT)
    .filter(name => /^ch\d+$/.test(name))
    .flatMap(chapterId => fs.readdirSync(path.join(GUIDE_ROOT, chapterId))
      .filter(name => name.endsWith('.mdx'))
      .sort()
      .map(name => path.join(GUIDE_ROOT, chapterId, name)))
}

function loadJsonSets(kind) {
  const dir = path.join(CONTENT_ROOT, kind)
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => ({
      file: path.join(dir, name),
      data: JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')),
    }))
}

const MOCK_SECTION_BLUEPRINTS = [
  { chapterId: 'mock-s1', title: '第1問', points: 45, count: 9 },
  { chapterId: 'mock-s2', title: '第2問', points: 20, count: 2 },
  { chapterId: 'mock-s3', title: '第3問', points: 35, count: 4 },
]

function validateMockAnswerSheet(question, issues) {
  if (!question.answerSheet) {
    if (!Array.isArray(question.options)
      || !question.options.some(option => option.label === question.correctAnswer)) {
      issues.push(`${question.id}: mock correctAnswer does not map to an option`)
    }
    return
  }

  if (question.answerSheet.kind === 'journal') {
    const lines = question.answerSheet.lines ?? []
    if (lines.length === 0) issues.push(`${question.id}: journal answer sheet has no lines`)
    if (new Set(lines.map(line => line.id)).size !== lines.length) {
      issues.push(`${question.id}: duplicate journal line ids`)
    }
    for (const line of lines) {
      if (!line.account || !line.amount || !['借方', '貸方'].includes(line.side)) {
        issues.push(`${question.id}: invalid journal answer line ${line.id}`)
      }
    }
    return
  }

  const blanks = question.answerSheet.blanks ?? []
  if (blanks.length === 0) issues.push(`${question.id}: blank answer sheet has no fields`)
  if (new Set(blanks.map(blank => blank.id)).size !== blanks.length) {
    issues.push(`${question.id}: duplicate blank ids`)
  }
  for (const blank of blanks) {
    if (!blank.label || String(blank.answer).trim() === '') {
      issues.push(`${question.id}: invalid blank ${blank.id}`)
    }
  }
}

function main() {
  const issues = []
  const registry = readRegistry()
  const registryByChapter = new Map(registry.map(chapter => [chapter.id, chapter]))
  const guideFiles = listGuideFiles()
  const guidesBySection = new Map()

  for (const file of guideFiles) {
    const relative = path.relative(ROOT, file)
    const chapterId = path.basename(path.dirname(file))
    const sectionId = path.basename(file, '.mdx')
    const parsed = matter(fs.readFileSync(file, 'utf8'))
    const data = parsed.data
    guidesBySection.set(sectionId, { relative, data, content: parsed.content })

    if (data.examId !== EXAM_ID) issues.push(`${relative}: invalid examId`)
    if (data.chapterId !== chapterId) issues.push(`${relative}: chapterId does not match directory`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.updatedAt))) {
      issues.push(`${relative}: invalid updatedAt`)
    }

    const registryChapter = registryByChapter.get(chapterId)
    const registrySection = registryChapter?.sections.find(section => section.id === sectionId)
    if (!registryChapter) {
      issues.push(`${relative}: chapter missing from registry`)
      continue
    }
    if (!registrySection) {
      issues.push(`${relative}: section missing from registry`)
      continue
    }
    if (registryChapter.title !== data.chapterTitle) {
      issues.push(`${relative}: chapter title differs from registry`)
    }
    if (Number(registryChapter.number) !== Number(data.chapterNumber)) {
      issues.push(`${relative}: chapter number differs from registry`)
    }
    if (String(registrySection.number) !== String(data.sectionNumber)) {
      issues.push(`${relative}: section number differs from registry`)
    }
    if (registrySection.title !== data.sectionTitle) {
      issues.push(`${relative}: section title differs from registry`)
    }
  }

  for (const chapter of registry) {
    for (const section of chapter.sections) {
      if (!guidesBySection.has(section.id)) {
        issues.push(`Registry section has no guide file: ${section.id}`)
      }
    }
  }

  const questionSets = loadJsonSets('questions')
  const cardSets = loadJsonSets('cards')
  const questionChapters = new Set()
  const cardChapters = new Set()
  const questionIds = new Set()
  const cardIds = new Set()
  let questionCount = 0
  let cardCount = 0

  for (const { file, data } of questionSets) {
    const relative = path.relative(ROOT, file)
    questionChapters.add(data.chapterId)
    if (data.examId !== EXAM_ID) issues.push(`${relative}: invalid examId`)
    if (!registryByChapter.has(data.chapterId)) issues.push(`${relative}: unknown chapterId`)

    for (const question of data.questions ?? []) {
      questionCount += 1
      if (questionIds.has(question.id)) issues.push(`Duplicate question id: ${question.id}`)
      questionIds.add(question.id)
      if (question.examId !== EXAM_ID || question.chapterId !== data.chapterId) {
        issues.push(`${question.id}: metadata mismatch`)
      }
      if (!Array.isArray(question.options) || !question.options.some(option => option.label === question.correctAnswer)) {
        issues.push(`${question.id}: correctAnswer does not map to an option`)
      }
      if (new Set((question.options ?? []).map(option => option.label)).size !== (question.options ?? []).length) {
        issues.push(`${question.id}: duplicate option labels`)
      }
    }
  }

  for (const { file, data } of cardSets) {
    const relative = path.relative(ROOT, file)
    cardChapters.add(data.chapterId)
    if (data.examId !== EXAM_ID) issues.push(`${relative}: invalid examId`)
    if (!registryByChapter.has(data.chapterId)) issues.push(`${relative}: unknown chapterId`)

    for (const card of data.cards ?? []) {
      cardCount += 1
      if (cardIds.has(card.id)) issues.push(`Duplicate card id: ${card.id}`)
      cardIds.add(card.id)
      if (card.examId !== EXAM_ID || card.chapterId !== data.chapterId) {
        issues.push(`${card.id}: metadata mismatch`)
      }
      if (!card.front || !card.back) issues.push(`${card.id}: blank front or back`)
    }
  }

  for (const chapter of registry) {
    if (!questionChapters.has(chapter.id)) issues.push(`Missing question set: ${chapter.id}`)
    if (!cardChapters.has(chapter.id)) issues.push(`Missing card set: ${chapter.id}`)
  }

  const internalLinks = []
  const linkPattern = /\[[^\]]*\]\((\/exams\/boki3\/[^)]+)\)/g
  for (const { relative, content } of guidesBySection.values()) {
    let match
    while ((match = linkPattern.exec(content)) !== null) {
      internalLinks.push({ relative, url: match[1] })
    }
  }

  for (const { relative, url } of internalLinks) {
    const parsed = new URL(url, 'https://example.test')
    const parts = parsed.pathname.split('/').filter(Boolean)
    const route = parts[2]

    if (route === 'guide' && parts[3]) {
      const chapter = registryByChapter.get(parts[3])
      const sectionId = parts[4]
      if (!chapter) issues.push(`${relative}: broken guide chapter link ${url}`)
      if (parsed.searchParams.has('section')) {
        issues.push(`${relative}: legacy guide query link ${url}`)
      }
      if (sectionId && !chapter?.sections.some(item => item.id === sectionId)) {
        issues.push(`${relative}: broken guide section link ${url}`)
      }
    } else if (route === 'questions' && parts[3]) {
      if (!questionChapters.has(parts[3])) issues.push(`${relative}: broken question link ${url}`)
    } else if (route === 'cards') {
      const chapterId = parsed.searchParams.get('chapter')
      if (chapterId && !cardChapters.has(chapterId)) {
        issues.push(`${relative}: broken card link ${url}`)
      }
    } else if (!['guide', 'questions', 'cards', 'mock-exam'].includes(route)) {
      issues.push(`${relative}: unknown internal route ${url}`)
    }
  }

  const mockPath = path.join(CONTENT_ROOT, 'mock-exam', 'questions.json')
  const mockSet = JSON.parse(fs.readFileSync(mockPath, 'utf8'))
  const mockQuestions = mockSet.questions ?? []
  const mockIds = new Set()
  for (const question of mockQuestions) {
    if (mockIds.has(question.id)) issues.push(`Duplicate mock question id: ${question.id}`)
    mockIds.add(question.id)
    if (question.examId !== EXAM_ID) issues.push(`${question.id}: invalid mock examId`)
    if (!/^mock-s[1-3]$/.test(question.chapterId)) {
      issues.push(`${question.id}: invalid mock chapterId`)
    }
    if (!question.material?.rows?.length) issues.push(`${question.id}: mock material is missing`)
    if (!question.prompt || !question.explanation) issues.push(`${question.id}: prompt or explanation is missing`)
    validateMockAnswerSheet(question, issues)
  }

  for (const blueprint of MOCK_SECTION_BLUEPRINTS) {
    const actual = mockQuestions.filter(question => question.chapterId === blueprint.chapterId).length
    if (actual !== blueprint.count) {
      issues.push(`${blueprint.title}: expected ${blueprint.count} questions, found ${actual}`)
    }
  }
  const mockPoints = MOCK_SECTION_BLUEPRINTS.reduce((sum, section) => sum + section.points, 0)
  if (mockPoints !== 100) issues.push(`Mock exam points must total 100, found ${mockPoints}`)
  if (mockQuestions.length !== 15) issues.push(`Mock exam must contain 15 subquestions, found ${mockQuestions.length}`)

  const trackedFiles = execFileSync('git', ['ls-files', 'content/exams/boki3'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).split('\n').filter(Boolean)
  const metadataFiles = trackedFiles.filter(file => /(^|\/)\.DS_Store$|(^|\/)\._/.test(file))
  metadataFiles.forEach(file => issues.push(`Tracked operating-system metadata file: ${file}`))

  const summary = {
    chapters: registry.length,
    guides: guideFiles.length,
    questions: questionCount,
    cards: cardCount,
    internalLinks: internalLinks.length,
    mockQuestions: mockQuestions.length,
  }

  if (issues.length > 0) {
    console.error(JSON.stringify({ summary, issueCount: issues.length, issues }, null, 2))
    process.exit(1)
  }

  console.log(JSON.stringify({ summary, issueCount: 0 }, null, 2))
}

try {
  main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
