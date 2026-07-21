const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const matter = require('gray-matter')

const root = path.resolve(__dirname, '..')
const guideRoot = path.join(root, 'content/exams/fp3/guide')
const questionRoot = path.join(root, 'content/exams/fp3/questions')
const bodyHashes = require('../content/exams/fp3/a-grade/ch5-ch6-body-hashes.js')
const realEstateCase = require('../content/exams/fp3/a-grade/ch5-real-estate-case-2026.js')
const inheritanceCase = require('../content/exams/fp3/a-grade/ch6-inheritance-case-2026.js')
const coverage = require('../content/exams/fp3/a-grade/ch5-ch6-coverage.js')
const protectedItems = require('../content/exams/fp3/annual/2026-protected-item-hashes.js')

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

const guideFiles = []
for (const chapterId of ['ch5', 'ch6']) {
  for (const file of fs.readdirSync(path.join(guideRoot, chapterId)).filter(name => name.endsWith('.mdx')).sort()) {
    guideFiles.push(path.join(guideRoot, chapterId, file))
  }
}

assert(guideFiles.length === 12, 'real-estate and inheritance scope contains 12 guides')
assert(Object.keys(bodyHashes).length === 12, '12 guide body hashes are frozen')

const guideMetrics = []
for (const file of guideFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = matter(raw)
  const sectionId = path.basename(file, '.mdx')
  const chapterId = path.basename(path.dirname(file))
  const body = parsed.content.replace(/\r\n/g, '\n').replace(/^\n+/, '')
  const chars = parsed.content.replace(/\s+/g, '').length
  const links = (parsed.content.match(/\]\(\/exams\/fp3\//g) || []).length

  assert(['ch5', 'ch6'].includes(chapterId), `${sectionId}: chapter is in Batch3 scope`)
  assert(parsed.data.examId === 'fp3' && parsed.data.chapterId === chapterId, `${sectionId}: metadata identifies fp3 ${chapterId}`)
  assert(parsed.data.lawReferenceDate === '2026-04-01', `${sectionId}: law reference date is 2026-04-01`)
  assert(parsed.data.dataAsOf === '2026-04-01', `${sectionId}: data date is 2026-04-01`)
  assert(parsed.data.annualReviewStatus === 'content-verified', `${sectionId}: content is marked verified`)
  assert(parsed.data.annualMetadataReviewedAt === '2026-07-21', `${sectionId}: review date is recorded`)
  assert(chars >= 1400, `${sectionId}: guide has at least 1,400 non-space characters`)
  assert(/^## この節でできるようになること/m.test(parsed.content), `${sectionId}: learning objectives exist`)
  assert(/青葉/.test(parsed.content), `${sectionId}: continuous case is connected`)
  assert(/よくある誤り/.test(parsed.content), `${sectionId}: error diagnosis exists`)
  assert(/自己点検/.test(parsed.content), `${sectionId}: self-check exists`)
  assert(links >= 1, `${sectionId}: internal learning link exists`)
  assert(sha256(body) === bodyHashes[sectionId], `${sectionId}: verified body hash matches`)

  guideMetrics.push({ chapterId, sectionId, chars, links })
}

assert(guideMetrics.filter(item => item.chapterId === 'ch5').reduce((sum, item) => sum + item.links, 0) >= 7, 'ch5 guides contain at least seven learning links')
assert(guideMetrics.filter(item => item.chapterId === 'ch6').reduce((sum, item) => sum + item.links, 0) >= 7, 'ch6 guides contain at least seven learning links')

const chapterData = {}
const allQuestions = new Map()
for (const chapterId of ['ch5', 'ch6']) {
  const set = JSON.parse(fs.readFileSync(path.join(questionRoot, `${chapterId}.json`), 'utf8'))
  const choices = set.questions.filter(question => !question.practiceSheet)
  const practices = set.questions.filter(question => question.practiceSheet)
  chapterData[chapterId] = { set, choices, practices }
  for (const question of set.questions) allQuestions.set(question.id, question)

  const expected = coverage.chapters[chapterId]
  assert(choices.length === expected.protectedChoiceQuestions, `${chapterId}: protected choice count remains ${expected.protectedChoiceQuestions}`)
  assert(practices.length === expected.addedNonChoiceQuestions, `${chapterId}: seven non-choice questions exist`)
  assert(practices.filter(question => question.type === 'numeric').length === 4, `${chapterId}: four numeric practices exist`)
  assert(practices.filter(question => question.type === 'classification').length === 3, `${chapterId}: three classification practices exist`)

  for (const choice of choices) {
    const expectedHash = protectedItems.questions[choice.id]
    assert(Boolean(expectedHash), `${choice.id}: protected hash exists`)
    assert(sha256(JSON.stringify(choice)) === expectedHash, `${choice.id}: original choice remains unchanged`)
  }

  const expectedPracticeIds = Array.from({ length: 7 }, (_, index) => `fp3-${chapterId}-practice${index + 1}`)
  assert(JSON.stringify(practices.map(question => question.id)) === JSON.stringify(expectedPracticeIds), `${chapterId}: practice ids are ordered from 1 to 7`)

  for (const question of practices) {
    const fields = question.practiceSheet.fields
    assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: answers match field count`)
    assert(question.correctAnswer.every((answer, index) => String(answer) === String(fields[index].correctAnswer)), `${question.id}: answer order is deterministic`)
    assert(Array.isArray(question.explanationSteps) && question.explanationSteps.length >= 2, `${question.id}: explanation steps exist`)
    assert(Array.isArray(question.commonMistakes) && question.commonMistakes.length >= 2, `${question.id}: common mistakes exist`)
    assert(question.guideLink.href.startsWith(`/exams/fp3/guide/${chapterId}/`), `${question.id}: guide link targets its chapter`)
    assert(question.tags.includes('非選択式'), `${question.id}: non-choice tag exists`)
  }
}

assert(coverage.examId === 'fp3' && coverage.batch === 3, 'coverage metadata identifies FP3 Batch3')
assert(coverage.verifiedAt === '2026-07-21', 'coverage verification date is recorded')
assert(coverage.lawReferenceDate === '2026-04-01', 'coverage uses current law reference date')
assert(coverage.abilityCoverage.length === 4, 'four core abilities are covered')
assert(JSON.stringify(coverage.abilityCoverage.map(item => item.abilityId)) === JSON.stringify([
  'fp3-ability-15',
  'fp3-ability-16',
  'fp3-ability-17',
  'fp3-ability-18',
]), 'ability coverage is exactly 15 through 18')

const mappedPracticeIds = new Set(coverage.abilityCoverage.flatMap(item => item.practiceQuestionIds))
for (const chapterId of ['ch5', 'ch6']) {
  for (const question of chapterData[chapterId].practices) {
    assert(mappedPracticeIds.has(question.id), `${question.id}: practice is mapped to an official ability`)
  }
}

assert(coverage.calculationAssertions.length === 9, 'nine Batch3 calculation assertions are registered')
for (const calculation of coverage.calculationAssertions) {
  assert(allQuestions.has(calculation.questionId), `${calculation.id}: evidence question exists`)
}
const baselineCalculationIds = new Set(coverage.calculationAssertions.map(item => item.baselineCalculationId).filter(Boolean))
for (const id of ['fp3-calc-13', 'fp3-calc-14', 'fp3-calc-15', 'fp3-calc-16', 'fp3-calc-17', 'fp3-calc-18']) {
  assert(baselineCalculationIds.has(id), `${id}: high-risk calculation is covered`)
}
assert(coverage.boundaries.existingChoiceQuestionsPreserved, 'coverage requires choice preservation')
assert(coverage.boundaries.existingCardsPreserved, 'coverage requires card preservation')
assert(coverage.boundaries.usesOnlyLawEffectiveAtReferenceDate, 'coverage enforces effective-law boundary')
assert(coverage.boundaries.officialQuestionTextCopied === false, 'official question text is not copied')
assert(coverage.boundaries.mockExamIncluded === false, 'mock exam remains excluded')

const rf = realEstateCase.facts
const rc = realEstateCase.calculations
const effectiveLotArea = rf.registeredLotArea - rf.setbackArea
const appliedBuildingCoverageRate = rf.designatedBuildingCoverageRate + rf.cornerLotRelaxationPoints + rf.fireproofRelaxationPoints
const maximumBuildingArea = effectiveLotArea * appliedBuildingCoverageRate / 100
const roadFloorAreaRate = rf.frontRoadWidth * rf.residentialRoadCoefficient * 100
const appliedFloorAreaRate = Math.min(rf.designatedFloorAreaRate, roadFloorAreaRate)
const maximumFloorArea = effectiveLotArea * appliedFloorAreaRate / 100
const acquisitionTaxBase = rf.fixedAssetValue * rf.acquisitionTaxLandStandardRatio
const acquisitionTax = acquisitionTaxBase * rf.acquisitionTaxRate
const smallResidentialTaxBase = rf.fixedAssetValue * rf.smallResidentialArea / rf.registeredLotArea / 6
const generalResidentialTaxBase = rf.fixedAssetValue * rf.generalResidentialArea / rf.registeredLotArea / 3
const fixedAssetTaxBase = smallResidentialTaxBase + generalResidentialTaxBase
const fixedAssetTax = fixedAssetTaxBase * rf.fixedAssetTaxRate
const taxableTransferIncome = rf.transferRevenue - rf.acquisitionCost - rf.transferCosts
const transferIncomeTax = taxableTransferIncome * rf.longTermIncomeTaxRate
const transferResidentTax = taxableTransferIncome * rf.longTermResidentTaxRate
const transferReconstructionTax = Math.floor(transferIncomeTax * rf.reconstructionRate)
const transferTotalTax = transferIncomeTax + transferResidentTax + transferReconstructionTax
const grossYield = rf.annualRent / rf.investmentAmount * 100
const noi = rf.annualRent - rf.annualOperatingExpenses
const netYield = noi / rf.investmentAmount * 100

const recomputedRealEstate = {
  effectiveLotArea,
  appliedBuildingCoverageRate,
  maximumBuildingArea,
  roadFloorAreaRate,
  appliedFloorAreaRate,
  maximumFloorArea,
  acquisitionTaxBase,
  acquisitionTax,
  smallResidentialTaxBase,
  generalResidentialTaxBase,
  fixedAssetTaxBase,
  fixedAssetTax,
  taxableTransferIncome,
  transferIncomeTax,
  transferResidentTax,
  transferReconstructionTax,
  transferTotalTax,
  grossYield,
  noi,
  netYield,
}
for (const [key, value] of Object.entries(recomputedRealEstate)) {
  assert(rc[key] === value, `real-estate case ${key} recalculates to ${value}`)
}

const inf = inheritanceCase.facts
const inc = inheritanceCase.calculations
const inheritanceBasicDeduction = 30000000 + 6000000 * inf.legalHeirCount
const insuranceExemption = 5000000 * inf.legalHeirCount
const taxableInsurance = Math.max(0, inf.deathInsurance - insuranceExemption)
const residentialLandReduction = inf.residentialLandBeforeRelief * inf.residentialLandReductionRate
const residentialLandAfterRelief = inf.residentialLandBeforeRelief - residentialLandReduction
const taxablePriceTotal = inf.otherTaxableAssets + residentialLandAfterRelief + taxableInsurance - inf.debt - inf.funeralExpenses
const taxableEstate = taxablePriceTotal - inheritanceBasicDeduction
const spouseDeemedAcquisition = taxableEstate / 2
const daughterDeemedAcquisition = taxableEstate / 4
const grandchildDeemedAcquisitionEach = taxableEstate / 8
const spouseTentativeTax = spouseDeemedAcquisition * 0.15 - 500000
const daughterTentativeTax = daughterDeemedAcquisition * 0.1
const grandchildTentativeTaxEach = grandchildDeemedAcquisitionEach * 0.1
const inheritanceTaxTotal = spouseTentativeTax + daughterTentativeTax + grandchildTentativeTaxEach * 2
const calendarGiftTaxablePrice = inf.calendarGiftAmount - 1100000
const calendarGiftTax = calendarGiftTaxablePrice * 0.15 - 100000
const settlementGiftAfterAnnualDeduction = inf.settlementGiftAmount - 1100000
const settlementGiftTaxableAfterSpecialDeduction = settlementGiftAfterAnnualDeduction - 25000000
const settlementGiftTax = settlementGiftTaxableAfterSpecialDeduction * 0.2

const recomputedInheritance = {
  inheritanceBasicDeduction,
  insuranceExemption,
  taxableInsurance,
  residentialLandReduction,
  residentialLandAfterRelief,
  taxablePriceTotal,
  taxableEstate,
  spouseDeemedAcquisition,
  spouseTentativeTax,
  daughterDeemedAcquisition,
  daughterTentativeTax,
  grandchildDeemedAcquisitionEach,
  grandchildTentativeTaxEach,
  inheritanceTaxTotal,
  calendarGiftTaxablePrice,
  calendarGiftTax,
  settlementGiftAfterAnnualDeduction,
  settlementGiftTaxableAfterSpecialDeduction,
  settlementGiftTax,
}
for (const [key, value] of Object.entries(recomputedInheritance)) {
  assert(inc[key] === value, `inheritance case ${key} recalculates to ${value}`)
}
assert(inc.spouseShare === '1/2', 'spouse legal share is one half')
assert(inc.daughterShare === '1/4', 'surviving daughter legal share is one quarter')
assert(inc.grandchildShareEach === '1/8', 'each representing grandchild share is one eighth')

const expectedAnswers = {
  'fp3-ch5-practice3': ['220', '80', '176', '160', '160', '352'],
  'fp3-ch5-practice4': ['5000000', '2000000', '7000000', '98000', '540000'],
  'fp3-ch5-practice5': ['18000000', '2700000', '900000', '56700', '3656700'],
  'fp3-ch5-practice6': ['8', '3000000', '6'],
  'fp3-ch6-practice1': ['4', '1/2', '1/4', '1/8', '1/8'],
  'fp3-ch6-practice3': ['20000000', '4000000', '54000000', '84000000', '30000000'],
  'fp3-ch6-practice4': ['15000000', '7500000', '3750000', '1750000', '750000', '375000', '3250000'],
  'fp3-ch6-practice5': ['45000000', '36000000', '9000000'],
  'fp3-ch6-practice6': ['2900000', '335000', '28900000', '3900000', '780000'],
}
for (const [questionId, answers] of Object.entries(expectedAnswers)) {
  assert(JSON.stringify(allQuestions.get(questionId).correctAnswer) === JSON.stringify(answers), `${questionId}: answers match verified cases`)
}

assert(realEstateCase.lawReferenceDate === coverage.lawReferenceDate, 'real-estate case uses coverage law date')
assert(inheritanceCase.lawReferenceDate === coverage.lawReferenceDate, 'inheritance case uses coverage law date')
assert(realEstateCase.officialSources.length >= 8, 'real-estate case records official sources')
assert(inheritanceCase.officialSources.length >= 8, 'inheritance case records official sources')
assert(realEstateCase.officialSources.every(url => /^https:\/\/(www\.)?(moj\.go\.jp|mlit\.go\.jp|tax\.metro\.tokyo\.lg\.jp|nta\.go\.jp)\//.test(url)), 'real-estate sources use official domains')
assert(inheritanceCase.officialSources.every(url => /^https:\/\/www\.nta\.go\.jp\//.test(url)), 'inheritance sources use NTA')

const result = {
  summary: {
    guides: guideMetrics.length,
    minimumGuideChars: Math.min(...guideMetrics.map(item => item.chars)),
    guideLinks: guideMetrics.reduce((sum, item) => sum + item.links, 0),
    protectedChoiceQuestions: chapterData.ch5.choices.length + chapterData.ch6.choices.length,
    nonChoiceQuestions: chapterData.ch5.practices.length + chapterData.ch6.practices.length,
    numericPractices: [...chapterData.ch5.practices, ...chapterData.ch6.practices].filter(question => question.type === 'numeric').length,
    classificationPractices: [...chapterData.ch5.practices, ...chapterData.ch6.practices].filter(question => question.type === 'classification').length,
    calculationAssertions: coverage.calculationAssertions.length,
    abilitiesCovered: coverage.abilityCoverage.length,
    realEstateRecalculations: Object.keys(recomputedRealEstate).length,
    inheritanceRecalculations: Object.keys(recomputedInheritance).length,
    childValidators,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
