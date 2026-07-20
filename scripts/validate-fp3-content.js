const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const matter = require('gray-matter')

const ROOT = path.resolve(__dirname, '..')
const EXAM_ID = 'fp3'
const EXPECTED_CHAPTERS = 6
const EXPECTED_GUIDES = 36
const CONTENT_ROOT = path.join(ROOT, 'content', 'exams', EXAM_ID)
const GUIDE_ROOT = path.join(CONTENT_ROOT, 'guide')
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function readRegistry() {
  const registryPath = path.join(ROOT, 'lib', 'types', 'chapters-registry.ts')
  const source = fs.readFileSync(registryPath, 'utf8')
  const marker = `  ${EXAM_ID}: [`
  const start = source.indexOf(marker)
  const end = source.indexOf('\n  ],\n\n  itp:', start)

  if (start === -1 || end === -1) {
    throw new Error('Unable to locate fp3 registry block')
  }

  const body = source.slice(start + marker.length, end)
  return Function(`"use strict"; return [${body}\n]`)()
}

function listGuideFiles() {
  if (!fs.existsSync(GUIDE_ROOT)) return []
  return fs.readdirSync(GUIDE_ROOT)
    .filter(name => /^ch\d+$/.test(name))
    .sort()
    .flatMap(chapterId => fs.readdirSync(path.join(GUIDE_ROOT, chapterId))
      .filter(name => name.endsWith('.mdx'))
      .sort()
      .map(name => path.join(GUIDE_ROOT, chapterId, name)))
}

function loadJsonSets(kind, issues) {
  const dir = path.join(CONTENT_ROOT, kind)
  if (!fs.existsSync(dir)) {
    issues.push(`Missing ${kind} directory`)
    return []
  }

  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => {
      const file = path.join(dir, name)
      try {
        return { file, data: JSON.parse(fs.readFileSync(file, 'utf8')) }
      } catch (error) {
        issues.push(`${path.relative(ROOT, file)}: invalid JSON (${error.message})`)
        return { file, data: null }
      }
    })
}

function validateDate(value, label, issues) {
  const text = String(value ?? '')
  if (!DATE_PATTERN.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) {
    issues.push(`${label}: invalid date, expected YYYY-MM-DD`)
  }
}

function validateQuestion(question, setChapterId, ids, issues) {
  if (!question?.id) {
    issues.push(`${setChapterId}: question without id`)
    return
  }
  if (ids.has(question.id)) issues.push(`Duplicate question id: ${question.id}`)
  ids.add(question.id)

  if (question.examId !== EXAM_ID || question.chapterId !== setChapterId) {
    issues.push(`${question.id}: metadata mismatch`)
  }
  if (!question.text || !question.explanation) {
    issues.push(`${question.id}: blank text or explanation`)
  }

  const type = question.type ?? 'single'
  const options = Array.isArray(question.options) ? question.options : []
  const labels = options.map(option => option.label)

  if (new Set(labels).size !== labels.length) {
    issues.push(`${question.id}: duplicate option labels`)
  }
  if (options.some(option => !option.label || !option.text)) {
    issues.push(`${question.id}: blank option label or text`)
  }

  if (type === 'single') {
    if (typeof question.correctAnswer !== 'string' || !labels.includes(question.correctAnswer)) {
      issues.push(`${question.id}: single correctAnswer does not map to an option`)
    }
  } else if (type === 'multiple') {
    if (!Array.isArray(question.correctAnswer)
      || question.correctAnswer.length === 0
      || question.correctAnswer.some(answer => !labels.includes(answer))) {
      issues.push(`${question.id}: multiple correctAnswer does not map to options`)
    }
  } else if (type === 'truefalse') {
    if (!['true', 'false'].includes(String(question.correctAnswer))) {
      issues.push(`${question.id}: invalid truefalse answer`)
    }
  } else if (type === 'fillblank') {
    if (String(question.correctAnswer ?? '').trim() === '') {
      issues.push(`${question.id}: blank fillblank answer`)
    }
  } else {
    issues.push(`${question.id}: unknown question type ${type}`)
  }
}

function validateCalculationAssertions(questionById, issues) {
  const assertions = [
    {
      id: 'fp3-ch1-q25',
      answer: 'B',
      calculate: () => Math.round(3000000 - 3000000 * 0.1401),
      expected: 2579700,
      description: '可処分所得 = 年収 - 所得税等',
    },
    {
      id: 'fp3-ch1-q26',
      answer: 'C',
      calculate: () => Math.round(5000000 * 0.1846),
      expected: 923000,
      description: '減債基金係数による積立額',
    },
    {
      id: 'fp3-ch1-q27',
      answer: 'B',
      calculate: () => Math.round(70608 * 12),
      expected: 847296,
      description: '令和8年度老齢基礎年金年額',
    },
    {
      id: 'fp3-ch1-q28',
      answer: 'A',
      calculate: () => Math.round((20000000 / (20 * 12)) * 12),
      expected: 1000000,
      description: '元金均等返済の初年度元金部分',
    },
    {
      id: 'fp3-ch3-q03',
      answer: 'A',
      calculate: () => ((2 + (100 - 104) / 4) / 104) * 100,
      expected: 0.9615384615,
      tolerance: 0.000001,
      description: '固定利付債券の最終利回り',
    },
    {
      id: 'fp3-ch4-q02',
      answer: 'B',
      calculate: () => 800 + 70 * (25 - 20),
      expected: 1150,
      description: '退職所得控除額',
    },
    {
      id: 'fp3-ch4-q14',
      answer: 'A',
      calculate: () => 80 / 2,
      expected: 40,
      description: '一時所得の総所得算入額',
    },
    {
      id: 'fp3-ch6-q01',
      answer: 'C',
      calculate: () => (1 / 4) / 2,
      expected: 1 / 8,
      tolerance: 1e-12,
      description: '兄弟姉妹の法定相続分',
    },
  ]

  for (const assertion of assertions) {
    const question = questionById.get(assertion.id)
    if (!question) {
      issues.push(`Missing calculation assertion question: ${assertion.id}`)
      continue
    }
    if (question.correctAnswer !== assertion.answer) {
      issues.push(`${assertion.id}: expected answer ${assertion.answer} for ${assertion.description}`)
    }
    const actual = assertion.calculate()
    const tolerance = assertion.tolerance ?? 0
    if (Math.abs(actual - assertion.expected) > tolerance) {
      issues.push(`${assertion.id}: calculation assertion failed for ${assertion.description}`)
    }
  }
}

function main() {
  const issues = []
  const registry = readRegistry()
  const registryByChapter = new Map(registry.map(chapter => [chapter.id, chapter]))

  if (registry.length !== EXPECTED_CHAPTERS) {
    issues.push(`Expected ${EXPECTED_CHAPTERS} registry chapters, found ${registry.length}`)
  }
  const registrySectionCount = registry.reduce((sum, chapter) => sum + chapter.sections.length, 0)
  if (registrySectionCount !== EXPECTED_GUIDES) {
    issues.push(`Expected ${EXPECTED_GUIDES} registry sections, found ${registrySectionCount}`)
  }

  const guideFiles = listGuideFiles()
  if (guideFiles.length !== EXPECTED_GUIDES) {
    issues.push(`Expected ${EXPECTED_GUIDES} guide files, found ${guideFiles.length}`)
  }

  const guidesBySection = new Map()
  const internalLinks = []
  const legacyLinks = []
  const linkPattern = /\[[^\]]*\]\((\/exams\/fp3\/[^)]+)\)/g

  for (const file of guideFiles) {
    const relative = path.relative(ROOT, file)
    const chapterId = path.basename(path.dirname(file))
    const sectionId = path.basename(file, '.mdx')
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = matter(raw)
    const data = parsed.data

    if (guidesBySection.has(sectionId)) issues.push(`Duplicate guide section id: ${sectionId}`)
    guidesBySection.set(sectionId, { relative, data, content: parsed.content })

    if (data.examId !== EXAM_ID) issues.push(`${relative}: invalid examId`)
    if (data.chapterId !== chapterId) issues.push(`${relative}: chapterId does not match directory`)
    validateDate(data.updatedAt, `${relative}: updatedAt`, issues)
    if (data.lawReferenceDate !== undefined) {
      validateDate(data.lawReferenceDate, `${relative}: lawReferenceDate`, issues)
    }
    if (data.dataAsOf !== undefined) {
      validateDate(data.dataAsOf, `${relative}: dataAsOf`, issues)
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

    if (/\?section=/.test(raw)) legacyLinks.push(relative)
    let match
    while ((match = linkPattern.exec(parsed.content)) !== null) {
      internalLinks.push({ relative, url: match[1] })
    }
  }

  for (const chapter of registry) {
    for (const section of chapter.sections) {
      if (!guidesBySection.has(section.id)) {
        issues.push(`Registry section has no guide file (sitemap would expose a 404): ${section.id}`)
      }
    }
  }
  legacyLinks.forEach(relative => issues.push(`${relative}: contains legacy ?section= guide link`))

  const questionSets = loadJsonSets('questions', issues)
  const cardSets = loadJsonSets('cards', issues)
  const questionChapters = new Set()
  const cardChapters = new Set()
  const questionIds = new Set()
  const cardIds = new Set()
  const questionById = new Map()
  let questionCount = 0
  let cardCount = 0

  for (const { file, data } of questionSets) {
    if (!data) continue
    const relative = path.relative(ROOT, file)
    const filenameChapter = path.basename(file, '.json')
    questionChapters.add(data.chapterId)
    if (data.examId !== EXAM_ID) issues.push(`${relative}: invalid examId`)
    if (data.chapterId !== filenameChapter) issues.push(`${relative}: chapterId differs from filename`)
    if (!registryByChapter.has(data.chapterId)) issues.push(`${relative}: unknown chapterId`)
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      issues.push(`${relative}: empty questions array`)
      continue
    }

    for (const question of data.questions) {
      questionCount += 1
      validateQuestion(question, data.chapterId, questionIds, issues)
      if (question?.id) questionById.set(question.id, question)
    }
  }

  for (const { file, data } of cardSets) {
    if (!data) continue
    const relative = path.relative(ROOT, file)
    const filenameChapter = path.basename(file, '.json')
    cardChapters.add(data.chapterId)
    if (data.examId !== EXAM_ID) issues.push(`${relative}: invalid examId`)
    if (data.chapterId !== filenameChapter) issues.push(`${relative}: chapterId differs from filename`)
    if (!registryByChapter.has(data.chapterId)) issues.push(`${relative}: unknown chapterId`)
    if (!Array.isArray(data.cards) || data.cards.length === 0) {
      issues.push(`${relative}: empty cards array`)
      continue
    }

    for (const card of data.cards) {
      cardCount += 1
      if (!card?.id) {
        issues.push(`${relative}: card without id`)
        continue
      }
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
  if (questionSets.filter(item => item.data).length !== EXPECTED_CHAPTERS) {
    issues.push(`Expected ${EXPECTED_CHAPTERS} question sets, found ${questionSets.filter(item => item.data).length}`)
  }
  if (cardSets.filter(item => item.data).length !== EXPECTED_CHAPTERS) {
    issues.push(`Expected ${EXPECTED_CHAPTERS} card sets, found ${cardSets.filter(item => item.data).length}`)
  }

  for (const { relative, url } of internalLinks) {
    const parsed = new URL(url, 'https://example.test')
    const parts = parsed.pathname.split('/').filter(Boolean)
    const route = parts[2]

    if (route === 'guide') {
      const chapterId = parts[3]
      const sectionId = parts[4]
      const chapter = registryByChapter.get(chapterId)
      if (!chapter) issues.push(`${relative}: broken guide chapter link ${url}`)
      if (!sectionId) issues.push(`${relative}: guide link must target a concrete section ${url}`)
      if (sectionId && !chapter?.sections.some(item => item.id === sectionId)) {
        issues.push(`${relative}: broken guide section link ${url}`)
      }
      if (parsed.searchParams.has('section')) {
        issues.push(`${relative}: legacy guide query link ${url}`)
      }
    } else if (route === 'questions') {
      const chapterId = parts[3]
      if (!chapterId || !questionChapters.has(chapterId)) {
        issues.push(`${relative}: broken question link ${url}`)
      }
      const questionId = parsed.searchParams.get('question')
      if (questionId && !questionIds.has(questionId)) {
        issues.push(`${relative}: broken question deep link ${url}`)
      }
    } else if (route === 'cards') {
      const chapterId = parsed.searchParams.get('chapter')
      const cardId = parsed.searchParams.get('card')
      if (chapterId && !cardChapters.has(chapterId)) {
        issues.push(`${relative}: broken card chapter link ${url}`)
      }
      if (cardId && !cardIds.has(cardId)) {
        issues.push(`${relative}: broken card deep link ${url}`)
      }
    } else if (!['mock-exam'].includes(route)) {
      issues.push(`${relative}: unknown internal route ${url}`)
    }
  }

  validateCalculationAssertions(questionById, issues)

  const sitemapPath = path.join(ROOT, 'app', 'sitemap.ts')
  const sitemapSource = fs.readFileSync(sitemapPath, 'utf8')
  if (!sitemapSource.includes('getChaptersByExam(exam.id)')
    || !sitemapSource.includes('getGuideFrontmatter(exam.id, chapter.id, section.id)')) {
    issues.push('app/sitemap.ts: section sitemap generation no longer follows registered guide files')
  }

  const sectionPagePath = path.join(ROOT, 'app', 'exams', '[examId]', 'guide', '[chapterId]', '[sectionId]', 'page.tsx')
  if (!fs.existsSync(sectionPagePath)) {
    issues.push('Missing canonical guide section route')
  }

  const trackedFiles = execFileSync('git', ['ls-files', 'content/exams/fp3'], {
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
    calculationAssertions: 8,
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
