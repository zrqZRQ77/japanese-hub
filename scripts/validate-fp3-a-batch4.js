const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const matter = require('gray-matter')

const root = path.resolve(__dirname, '..')
const guideRoot = path.join(root, 'content/exams/fp3/guide/ch1')
const questionPath = path.join(root, 'content/exams/fp3/questions/ch1.json')
const bodyHashes = require('../content/exams/fp3/a-grade/ch1-lifeplanning-body-hashes.js')
const lifeCase = require('../content/exams/fp3/a-grade/ch1-lifeplanning-case-2026.js')
const coverage = require('../content/exams/fp3/a-grade/ch1-lifeplanning-coverage.js')
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
runValidator('fp3-batch3-realestate-inheritance', 'scripts/validate-fp3-a-batch3.js')

const guideFiles = fs.readdirSync(guideRoot).filter(name => name.endsWith('.mdx')).sort()
assert(guideFiles.length === 6, 'life-planning chapter contains six guides')
assert(Object.keys(bodyHashes).length === 6, 'six life-planning guide body hashes are frozen')

const guideMetrics = []
for (const file of guideFiles) {
  const raw = fs.readFileSync(path.join(guideRoot, file), 'utf8')
  const parsed = matter(raw)
  const sectionId = path.basename(file, '.mdx')
  const body = parsed.content.replace(/\r\n/g, '\n').replace(/^\n+/, '')
  const chars = parsed.content.replace(/\s+/g, '').length
  const links = (parsed.content.match(/\]\(\/exams\/fp3\//g) || []).length

  assert(parsed.data.examId === 'fp3' && parsed.data.chapterId === 'ch1', `${sectionId}: metadata identifies fp3 ch1`)
  assert(parsed.data.lawReferenceDate === '2026-04-01', `${sectionId}: law reference date is 2026-04-01`)
  assert(parsed.data.dataAsOf === '2026-04-01', `${sectionId}: data date is 2026-04-01`)
  assert(parsed.data.annualReviewStatus === 'content-verified', `${sectionId}: content is marked verified`)
  assert(parsed.data.annualMetadataReviewedAt === '2026-07-21', `${sectionId}: review date is recorded`)
  assert(chars >= 2800, `${sectionId}: guide has at least 2,800 non-space characters`)
  assert(/^## この節でできるようになること/m.test(parsed.content), `${sectionId}: learning objectives exist`)
  assert(/よくある誤り|誤答パターン/.test(parsed.content), `${sectionId}: error diagnosis exists`)
  assert(links >= 4, `${sectionId}: at least four internal learning links exist`)
  assert(sha256(body) === bodyHashes[sectionId], `${sectionId}: verified body hash matches`)
  guideMetrics.push({ sectionId, chars, links })
}

const guideText = guideFiles.map(file => fs.readFileSync(path.join(guideRoot, file), 'utf8')).join('\n')
assert(/平均保険料率は9\.9％/.test(guideText), '2026 health-insurance national average is recorded')
assert(/都道府県支部ごとに異な/.test(guideText), 'health-insurance prefectural variation is explicit')
assert(/5\/1,000/.test(guideText), '2026 employment-insurance worker rate example is recorded')
assert(/月額1万7,920円/.test(guideText), '2026 national pension premium is recorded')
assert(/月額7万608円/.test(guideText), '2026 basic pension full amount is recorded')
assert(/支給停止調整額は2026年4月から65万円/.test(guideText), '2026 in-service pension threshold is recorded')
assert(/2026年12月施行予定[^。]+使用しません/.test(guideText), 'later-effective DC limit is explicitly excluded')

const questionSet = JSON.parse(fs.readFileSync(questionPath, 'utf8'))
const choices = questionSet.questions.filter(question => !question.practiceSheet)
const practices = questionSet.questions.filter(question => question.practiceSheet)
const questionById = new Map(questionSet.questions.map(question => [question.id, question]))

assert(choices.length === coverage.protectedChoiceQuestions, '30 original life-planning choice questions remain')
assert(practices.length === coverage.addedNonChoiceQuestions, '14 life-planning non-choice questions exist')
assert(practices.filter(question => question.type === 'numeric').length === 8, 'eight numeric life-planning practices exist')
assert(practices.filter(question => question.type === 'classification').length === 4, 'four classification life-planning practices exist')
assert(practices.filter(question => question.type === 'table').length === 2, 'two table life-planning practices exist')
assert(practices.reduce((sum, question) => sum + question.practiceSheet.fields.length, 0) === 64, '64 life-planning input fields exist')

for (const choice of choices) {
  const expectedHash = protectedItems.questions[choice.id]
  assert(Boolean(expectedHash), `${choice.id}: protected hash exists`)
  assert(sha256(JSON.stringify(choice)) === expectedHash, `${choice.id}: original choice remains unchanged`)
}

const expectedPracticeIds = Array.from({ length: 14 }, (_, index) => `fp3-ch1-practice${index + 1}`)
assert(JSON.stringify(practices.map(question => question.id)) === JSON.stringify(expectedPracticeIds), 'practice ids are ordered from 1 through 14')

for (const question of practices) {
  const fields = question.practiceSheet.fields
  assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: answers match field count`)
  assert(question.correctAnswer.every((answer, index) => String(answer) === String(fields[index].correctAnswer)), `${question.id}: answer order is deterministic`)
  assert(Array.isArray(question.explanationSteps) && question.explanationSteps.length >= 2, `${question.id}: explanation steps exist`)
  assert(Array.isArray(question.commonMistakes) && question.commonMistakes.length >= 2, `${question.id}: common mistakes exist`)
  assert(question.guideLink.href.startsWith('/exams/fp3/guide/ch1/'), `${question.id}: guide link targets ch1`)
  assert(question.tags.includes('非選択式'), `${question.id}: non-choice tag exists`)
}

assert(coverage.examId === 'fp3' && coverage.chapterId === 'ch1' && coverage.batch === 4, 'coverage identifies FP3 Batch4')
assert(coverage.verifiedAt === '2026-07-21', 'coverage verification date is recorded')
assert(coverage.lawReferenceDate === '2026-04-01', 'coverage uses current law reference date')
assert(coverage.abilityCoverage.length === 6, 'six life-planning abilities are covered')
assert(JSON.stringify(coverage.abilityCoverage.map(item => item.abilityId)) === JSON.stringify([
  'fp3-ability-01',
  'fp3-ability-02',
  'fp3-ability-03',
  'fp3-ability-04',
  'fp3-ability-05',
  'fp3-ability-06',
]), 'ability coverage is exactly 01 through 06')

const mappedPracticeIds = new Set(coverage.abilityCoverage.flatMap(item => item.practiceQuestionIds))
for (const question of practices) assert(mappedPracticeIds.has(question.id), `${question.id}: practice is mapped to an official ability`)

assert(coverage.calculationAssertions.length === 11, '11 Batch4 calculation assertions are registered')
for (const item of coverage.calculationAssertions) assert(questionById.has(item.questionId), `${item.id}: evidence question exists`)
const baselineCalcIds = new Set(coverage.calculationAssertions.map(item => item.baselineCalculationId).filter(Boolean))
for (const id of ['fp3-calc-01', 'fp3-calc-02', 'fp3-calc-03', 'fp3-calc-04', 'fp3-calc-05']) {
  assert(baselineCalcIds.has(id), `${id}: baseline calculation gap is covered`)
}
assert(coverage.boundaries.existingChoiceQuestionsPreserved, 'coverage requires original choice preservation')
assert(coverage.boundaries.existingCardsPreserved, 'coverage requires card preservation')
assert(coverage.boundaries.usesOnlyLawEffectiveAtReferenceDate, 'coverage enforces effective-law boundary')
assert(coverage.boundaries.laterEffectiveDcLimitExcluded, 'later DC limit is excluded')
assert(coverage.boundaries.healthInsuranceRateMarkedAsNationalAverage, 'health rate is marked national average')
assert(coverage.boundaries.officialQuestionTextCopied === false, 'official question text is not copied')
assert(coverage.boundaries.mockExamIncluded === false, 'mock exam remains excluded')

const f = lifeCase.facts
const c = lifeCase.calculations
const totalDeductions = f.incomeTax + f.residentTax + f.socialInsurance
const disposableIncome = f.grossIncome - totalDeductions
const year1Income = disposableIncome
const year1Expenses = f.year1Expenses
const year1Balance = year1Income - year1Expenses
const year1EndingAssets = f.initialFinancialAssets + year1Balance
const year2Income = year1Income * (1 + f.incomeGrowthRate)
const year2Expenses = year1Expenses * (1 + f.expenseGrowthRate)
const year2Balance = year2Income - year2Expenses
const year2EndingAssets = year1EndingAssets + year2Balance
const year3Income = year2Income * (1 + f.incomeGrowthRate)
const year3RegularExpenses = year2Expenses * (1 + f.expenseGrowthRate)
const year3Expenses = year3RegularExpenses + f.year3CarPurchase
const year3Balance = year3Income - year3Expenses
const year3EndingAssets = year2EndingAssets + year3Balance
const totalAssets = Object.values(f.balanceSheetAssets).reduce((sum, value) => sum + value, 0)
const totalLiabilities = Object.values(f.balanceSheetLiabilities).reduce((sum, value) => sum + value, 0)
const netAssets = totalAssets - totalLiabilities
const annualSavingNeeded = Math.round(f.coefficientFacts.targetFutureAmount * f.coefficientFacts.sinkingFundFactor)
const futureAccumulatedAmount = f.coefficientFacts.annualSaving * f.coefficientFacts.annuityFutureFactor
const presentCapitalNeeded = f.coefficientFacts.annualReceipt * f.coefficientFacts.annuityPresentFactor
const totalMonthlyHealthPremium = f.standardMonthlyRemuneration * f.averageHealthInsuranceRate
const employeeMonthlyHealthPremium = totalMonthlyHealthPremium / 2
const employeeAnnualEmploymentPremium = f.employmentWages * f.employmentWorkerRate
const highCostLimit = f.highCostBase + (f.medicalCost - f.highCostThreshold) * 0.01
const highCostReimbursement = f.medicalCost * f.medicalWindowShare - highCostLimit
const sicknessDailyAllowance = f.sicknessAverageMonthlyRemuneration / 30 * 2 / 3
const sicknessAllowanceTotal = sicknessDailyAllowance * f.sicknessPaidDays
const nationalPensionAnnualPremium = f.nationalPensionMonthlyPremium * 12
const basicPensionForPaidMonths = Math.floor(f.basicPensionFullAnnual * f.paidPensionMonths / 480)
const earlyBasicPension = Math.floor(f.basicPensionFullAnnual * (1 - f.earlyClaimMonths * f.earlyReductionPerMonth))
const delayedBasicPension = Math.floor(f.basicPensionFullAnnual * (1 + f.delayedClaimMonths * f.delayedIncreasePerMonth))
const inServiceCombinedAmount = f.inServiceBasicMonthlyPension + f.totalMonthlyRemunerationEquivalent
const inServiceStoppedAmount = Math.max(0, (inServiceCombinedAmount - f.inServiceThreshold) / 2)
const inServicePaidEmployeePension = f.inServiceBasicMonthlyPension - inServiceStoppedAmount
const idecoMonthlyLimit = Math.min(f.idecoIndividualCap, f.idecoOverallLimit - f.employerDcContribution - f.dbEquivalentContribution)
const idecoAnnualContribution = idecoMonthlyLimit * 12
const idecoTaxReduction = idecoAnnualContribution * f.idecoTaxRateCombined
const maximumDownPayment = f.availableCashForHome - f.homeTransactionCosts - f.movingCosts - f.emergencyReserve
const monthlyPrincipalEqualPrincipal = Math.floor(f.mortgagePrincipal / (f.mortgageYears * 12))
const annualPrincipalEqualPrincipal = f.mortgagePrincipal / f.mortgageYears
const repaymentBurdenRate = f.annualMortgagePayment / f.annualGrossIncomeForBurden * 100
const annualEducationShortfall = f.futureEducationCost - f.futureAnnualSaving

const recomputed = {
  totalDeductions,
  disposableIncome,
  year1Income,
  year1Expenses,
  year1Balance,
  year1EndingAssets,
  year2Income,
  year2Expenses,
  year2Balance,
  year2EndingAssets,
  year3Income,
  year3RegularExpenses,
  year3Expenses,
  year3Balance,
  year3EndingAssets,
  totalAssets,
  totalLiabilities,
  netAssets,
  annualSavingNeeded,
  futureAccumulatedAmount,
  presentCapitalNeeded,
  totalMonthlyHealthPremium,
  employeeMonthlyHealthPremium,
  employeeAnnualEmploymentPremium,
  highCostLimit,
  highCostReimbursement,
  sicknessDailyAllowance,
  sicknessAllowanceTotal,
  nationalPensionAnnualPremium,
  basicPensionForPaidMonths,
  earlyBasicPension,
  delayedBasicPension,
  inServiceCombinedAmount,
  inServiceStoppedAmount,
  inServicePaidEmployeePension,
  idecoMonthlyLimit,
  idecoAnnualContribution,
  idecoTaxReduction,
  maximumDownPayment,
  monthlyPrincipalEqualPrincipal,
  annualPrincipalEqualPrincipal,
  repaymentBurdenRate,
  annualEducationShortfall,
}
for (const [key, value] of Object.entries(recomputed)) assert(c[key] === value, `life-planning case ${key} recalculates to ${value}`)

const expectedAnswers = {
  'fp3-ch1-practice2': ['1500000', '4500000'],
  'fp3-ch1-practice3': ['4500000','3600000','900000','3900000','4545000','3672000','873000','4773000','4590450','4745440','-154990','4618010'],
  'fp3-ch1-practice4': ['42500000','26800000','15700000'],
  'fp3-ch1-practice6': ['923000','5204000','2356750'],
  'fp3-ch1-practice8': ['39600','19800','16500'],
  'fp3-ch1-practice9': ['87430','212570','6000','120000'],
  'fp3-ch1-practice10': ['第1号被保険者','第2号被保険者','第3号被保険者','17920','215040'],
  'fp3-ch1-practice11': ['804931','643944','1203160'],
  'fp3-ch1-practice12': ['720000','35000','85000'],
  'fp3-ch1-practice13': ['10000','120000','24000','企業年金側','加入者本人'],
  'fp3-ch1-practice14': ['1200000','83333','1000000','20','600000'],
}
for (const [questionId, answers] of Object.entries(expectedAnswers)) {
  assert(JSON.stringify(questionById.get(questionId).correctAnswer) === JSON.stringify(answers), `${questionId}: answers match verified case`)
}

assert(lifeCase.lawReferenceDate === coverage.lawReferenceDate, 'case and coverage use same law date')
assert(lifeCase.officialSources.length >= 10, 'life-planning case records at least ten official sources')
assert(lifeCase.officialSources.every(url => /^https:\/\/(www\.)?(jafp\.or\.jp|nenkin\.go\.jp|kyoukaikenpo\.or\.jp|mhlw\.go\.jp|ideco-koushiki\.jp|flat35\.com)\//.test(url)), 'life-planning sources use official domains')

const result = {
  summary: {
    guides: guideMetrics.length,
    minimumGuideChars: Math.min(...guideMetrics.map(item => item.chars)),
    guideLinks: guideMetrics.reduce((sum, item) => sum + item.links, 0),
    protectedChoiceQuestions: choices.length,
    nonChoiceQuestions: practices.length,
    numericPractices: practices.filter(question => question.type === 'numeric').length,
    classificationPractices: practices.filter(question => question.type === 'classification').length,
    tablePractices: practices.filter(question => question.type === 'table').length,
    inputFields: practices.reduce((sum, question) => sum + question.practiceSheet.fields.length, 0),
    calculationAssertions: coverage.calculationAssertions.length,
    abilitiesCovered: coverage.abilityCoverage.length,
    recomputations: Object.keys(recomputed).length,
    childValidators,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
