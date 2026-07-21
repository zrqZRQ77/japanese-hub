const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const matter = require('gray-matter')

const root = path.resolve(__dirname, '..')
const guideRoot = path.join(root, 'content/exams/fp3/guide/ch3')
const questionPath = path.join(root, 'content/exams/fp3/questions/ch3.json')
const bodyHashes = require('../content/exams/fp3/a-grade/ch3-investment-body-hashes.js')
const investmentCase = require('../content/exams/fp3/a-grade/ch3-investment-case-2026.js')
const coverage = require('../content/exams/fp3/a-grade/ch3-investment-coverage.js')
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
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env: process.env })
  childValidators.push({ name, passed: result.status === 0 })
  assert(result.status === 0, `sub-validator ${name} passes`)
}

runValidator('fp3-content', 'scripts/validate-fp3-content.js')
runValidator('fp3-batch0-baseline', 'scripts/validate-fp3-a-baseline.js')
runValidator('fp3-batch1-official-annual', 'scripts/validate-fp3-a-batch1.js')
runValidator('fp3-batch2-tax', 'scripts/validate-fp3-a-batch2.js')
runValidator('fp3-batch3-realestate-inheritance', 'scripts/validate-fp3-a-batch3.js')
runValidator('fp3-batch4-lifeplanning', 'scripts/validate-fp3-a-batch4.js')

const guideFiles = fs.readdirSync(guideRoot).filter(name => name.endsWith('.mdx')).sort()
assert(guideFiles.length === 8, 'financial-assets chapter contains eight guides')
assert(Object.keys(bodyHashes).length === 8, 'eight financial-assets body hashes are frozen')

const guideMetrics = []
for (const file of guideFiles) {
  const raw = fs.readFileSync(path.join(guideRoot, file), 'utf8')
  const parsed = matter(raw)
  const sectionId = path.basename(file, '.mdx')
  const body = parsed.content.replace(/\r\n/g, '\n').replace(/^\n+/, '')
  const chars = parsed.content.replace(/\s+/g, '').length
  const links = (parsed.content.match(/\]\(\/exams\/fp3\//g) || []).length

  assert(parsed.data.examId === 'fp3' && parsed.data.chapterId === 'ch3', `${sectionId}: metadata identifies fp3 ch3`)
  assert(parsed.data.lawReferenceDate === '2026-04-01', `${sectionId}: law reference date is 2026-04-01`)
  assert(parsed.data.dataAsOf === '2026-04-01', `${sectionId}: data date is 2026-04-01`)
  assert(parsed.data.annualReviewStatus === 'content-verified', `${sectionId}: content is marked verified`)
  assert(parsed.data.annualMetadataReviewedAt === '2026-07-21', `${sectionId}: review date is recorded`)
  assert(chars >= 1400, `${sectionId}: guide has at least 1,400 non-space characters`)
  assert(/^## この節でできるようになること/m.test(parsed.content), `${sectionId}: learning objectives exist`)
  assert(/よくある誤り/.test(parsed.content), `${sectionId}: error diagnosis exists`)
  assert(/自己点検/.test(parsed.content), `${sectionId}: self-check exists`)
  assert(links >= 1, `${sectionId}: learning link exists`)
  assert(sha256(body) === bodyHashes[sectionId], `${sectionId}: body hash matches`)
  guideMetrics.push({ sectionId, chars, links })
}

const allGuideText = guideFiles.map(file => fs.readFileSync(path.join(guideRoot, file), 'utf8')).join('\n')
assert(/つみたて投資枠[\s\S]*120万円/.test(allGuideText), 'NISA tsumitate annual limit is recorded')
assert(/成長投資枠[\s\S]*240万円/.test(allGuideText), 'NISA growth annual limit is recorded')
assert(/非課税保有限度額[\s\S]*1,800万円/.test(allGuideText), 'NISA lifetime limit is recorded')
assert(/成長投資枠[\s\S]*1,200万円/.test(allGuideText), 'NISA growth lifetime sublimit is recorded')
assert(/取得価額200万円/.test(allGuideText), 'NISA reuse uses acquisition cost example')
assert(/2027年以後[\s\S]*混入しません/.test(allGuideText), 'future NISA changes are explicitly excluded')
assert(/基準価額＝25億2,000万円÷20億口×10,000口/.test(allGuideText), 'fund NAV formula is recorded')
assert(/最終利回り＝/.test(allGuideText), 'bond final-yield formula is recorded')
assert(/PER＝株価÷EPS/.test(allGuideText), 'PER formula is recorded')
assert(/TTS[\s\S]*円を外貨/.test(allGuideText), 'TTS direction is recorded')

const questionSet = JSON.parse(fs.readFileSync(questionPath, 'utf8'))
const choices = questionSet.questions.filter(question => !question.practiceSheet)
const practices = questionSet.questions.filter(question => question.practiceSheet)
const questionById = new Map(questionSet.questions.map(question => [question.id, question]))

assert(choices.length === coverage.protectedChoiceQuestions, '21 original financial-assets choices remain')
assert(practices.length === coverage.addedNonChoiceQuestions, '14 financial-assets non-choice questions exist')
assert(practices.filter(question => question.type === 'numeric').length === 9, 'nine numeric financial-assets practices exist')
assert(practices.filter(question => question.type === 'classification').length === 5, 'five classification financial-assets practices exist')
assert(practices.reduce((sum, question) => sum + question.practiceSheet.fields.length, 0) === 64, '64 financial-assets input fields exist')

for (const choice of choices) {
  const expectedHash = protectedItems.questions[choice.id]
  assert(Boolean(expectedHash), `${choice.id}: protected hash exists`)
  assert(sha256(JSON.stringify(choice)) === expectedHash, `${choice.id}: original choice remains unchanged`)
}

const expectedPracticeIds = Array.from({ length: 14 }, (_, index) => `fp3-ch3-practice${index + 1}`)
assert(JSON.stringify(practices.map(question => question.id)) === JSON.stringify(expectedPracticeIds), 'practice ids are ordered from 1 through 14')
for (const question of practices) {
  const fields = question.practiceSheet.fields
  assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: answers match field count`)
  assert(question.correctAnswer.every((answer, index) => String(answer) === String(fields[index].correctAnswer)), `${question.id}: answer order is deterministic`)
  assert(Array.isArray(question.explanationSteps) && question.explanationSteps.length >= 2, `${question.id}: explanation steps exist`)
  assert(Array.isArray(question.commonMistakes) && question.commonMistakes.length >= 2, `${question.id}: common mistakes exist`)
  assert(question.guideLink.href.startsWith('/exams/fp3/guide/ch3/'), `${question.id}: guide link targets ch3`)
  assert(question.tags.includes('非選択式'), `${question.id}: non-choice tag exists`)
}

assert(coverage.examId === 'fp3' && coverage.chapterId === 'ch3' && coverage.batch === 5, 'coverage identifies FP3 Batch5')
assert(coverage.verifiedAt === '2026-07-21', 'coverage verification date is recorded')
assert(coverage.lawReferenceDate === '2026-04-01', 'coverage uses current law date')
assert(coverage.abilityCoverage.length === 4, 'four financial-assets abilities are covered')
assert(JSON.stringify(coverage.abilityCoverage.map(item => item.abilityId)) === JSON.stringify([
  'fp3-ability-09', 'fp3-ability-10', 'fp3-ability-11', 'fp3-ability-12',
]), 'ability coverage is exactly 09 through 12')
const mappedPracticeIds = new Set(coverage.abilityCoverage.flatMap(item => item.practiceQuestionIds))
for (const question of practices) assert(mappedPracticeIds.has(question.id), `${question.id}: practice is mapped to an ability`)

assert(coverage.calculationAssertions.length === 10, 'ten Batch5 calculation assertions are registered')
for (const item of coverage.calculationAssertions) assert(questionById.has(item.questionId), `${item.id}: evidence question exists`)
const baselineCalcIds = new Set(coverage.calculationAssertions.map(item => item.baselineCalculationId).filter(Boolean))
for (const id of ['fp3-calc-06', 'fp3-calc-07', 'fp3-calc-08', 'fp3-calc-09']) {
  assert(baselineCalcIds.has(id), `${id}: baseline calculation is covered`)
}
assert(coverage.boundaries.existingChoiceQuestionsPreserved, 'coverage requires original choice preservation')
assert(coverage.boundaries.existingCardsPreserved, 'coverage requires card preservation')
assert(coverage.boundaries.usesOnlyLawEffectiveAtReferenceDate, 'coverage enforces current-law boundary')
assert(coverage.boundaries.futureNisaChangesExcluded, 'future NISA changes are excluded')
assert(coverage.boundaries.nisaReuseUsesAcquisitionCost, 'NISA reuse uses acquisition cost')
assert(coverage.boundaries.officialQuestionTextCopied === false, 'official question text is not copied')
assert(coverage.boundaries.mockExamIncluded === false, 'mock exam remains excluded')

const f = investmentCase.facts
const c = investmentCase.calculations
const approximateRealInterestRate = f.nominalInterestRate - f.expectedInflationRate
const protectedGeneralDepositPrincipal = Math.min(10000000, f.generalDepositsPrincipal)
const protectedSettlementDepositPrincipal = f.settlementDepositPrincipal
const depositInterestAfterTax = Math.round(f.depositInterestBeforeTax * (1 - f.depositTaxRate))
const bondAnnualCoupon = f.bondFaceValue * f.bondCouponRate
const bondCurrentYield = bondAnnualCoupon / f.bondPurchasePrice * 100
const bondAnnualRedemptionGain = (f.bondRedemptionPrice - f.bondPurchasePrice) / f.bondRemainingYears
const bondFinalYield = (bondAnnualCoupon + bondAnnualRedemptionGain) / f.bondPurchasePrice * 100
const stockEps = f.stockNetIncome / f.stockShares
const stockBps = f.stockEquity / f.stockShares
const stockPer = f.stockPrice / stockEps
const stockPbr = f.stockPrice / stockBps
const stockRoe = f.stockNetIncome / f.stockEquity * 100
const stockDividendYield = f.stockDividendPerShare / f.stockPrice * 100
const stockPayoutRatio = f.stockDividendPerShare / stockEps * 100
const fundNetAssets = f.fundAssets - f.fundLiabilities
const fundNavPer10000 = fundNetAssets / f.fundTotalUnits * 10000
const fundUnitsPurchased = f.fundInvestmentAmount / f.fundPurchaseNav * 10000
const fundLaterValue = fundUnitsPurchased / 10000 * f.fundLaterNav
const fundPurchaseFee = f.fundInvestmentAmount * f.fundPurchaseFeeRate
const fundApproxAnnualTrustFee = f.fundInvestmentAmount * f.fundTrustFeeRate
const foreignCurrencyPurchaseYen = f.usdPrincipal * f.buyTts
const foreignCurrencyMaturityUsd = f.usdPrincipal + f.usdInterest
const foreignCurrencyRedemptionYen = foreignCurrencyMaturityUsd * f.sellTtb
const foreignCurrencyYenGainLoss = foreignCurrencyRedemptionYen - foreignCurrencyPurchaseYen
const nisaAnnualCombined = f.nisaAnnualTsumitate + f.nisaAnnualGrowth
const nisaRestoredLifetimeRoom = f.nisaSoldAcquisitionCost
const nisaRestoredGrowthRoom = f.nisaSoldAcquisitionCost
const portfolioExpectedReturn = (f.portfolioStockWeight * f.portfolioStockReturn + f.portfolioBondWeight * f.portfolioBondReturn) * 100
const portfolioVariance = f.portfolioStockWeight ** 2 * f.portfolioStockRisk ** 2
  + f.portfolioBondWeight ** 2 * f.portfolioBondRisk ** 2
  + 2 * f.portfolioStockWeight * f.portfolioBondWeight * f.portfolioCorrelation * f.portfolioStockRisk * f.portfolioBondRisk
const portfolioRisk = Math.sqrt(portfolioVariance) * 100

const recomputed = {
  approximateRealInterestRate, protectedGeneralDepositPrincipal, protectedSettlementDepositPrincipal,
  depositInterestAfterTax, bondAnnualCoupon, bondCurrentYield, bondAnnualRedemptionGain, bondFinalYield,
  stockEps, stockBps, stockPer, stockPbr, stockRoe, stockDividendYield, stockPayoutRatio,
  fundNetAssets, fundNavPer10000, fundUnitsPurchased, fundLaterValue, fundPurchaseFee, fundApproxAnnualTrustFee,
  foreignCurrencyPurchaseYen, foreignCurrencyMaturityUsd, foreignCurrencyRedemptionYen, foreignCurrencyYenGainLoss,
  nisaAnnualCombined, nisaRestoredLifetimeRoom, nisaRestoredGrowthRoom,
  portfolioExpectedReturn, portfolioVariance, portfolioRisk,
}
for (const [key, value] of Object.entries(recomputed)) {
  assert(Math.abs(c[key] - value) < 1e-9, `investment case ${key} recalculates to ${value}`)
}

const expectedAnswers = {
  'fp3-ch3-practice2': ['10000000', '3000000', '79685', '対象外', '対象外'],
  'fp3-ch3-practice3': ['20000', '2.083', '10000', '3.125'],
  'fp3-ch3-practice5': ['120', '800', '20', '3', '15', '2.5', '50'],
  'fp3-ch3-practice6': ['2520000000', '12600', '800000', '1040000'],
  'fp3-ch3-practice7': ['11000', '5500', '購入時', '保有中', '換金時', '元本払戻金'],
  'fp3-ch3-practice8': ['1510000', '10200', '1509600', '-400'],
  'fp3-ch3-practice9': ['1200000', '2400000', '3600000', '18000000', '12000000'],
  'fp3-ch3-practice10': ['2000000', '2000000', '2400000'],
  'fp3-ch3-practice11': ['4.8', '0.8', '5.6'],
  'fp3-ch3-practice12': ['0.0085', '9.22', '-1'],
}
for (const [questionId, answers] of Object.entries(expectedAnswers)) {
  assert(JSON.stringify(questionById.get(questionId).correctAnswer) === JSON.stringify(answers), `${questionId}: answers match verified case`)
}

assert(investmentCase.lawReferenceDate === coverage.lawReferenceDate, 'case and coverage use same law date')
assert(investmentCase.officialSources.length >= 10, 'investment case records at least ten official sources')
assert(investmentCase.officialSources.every(url => /^https:\/\/(www\.)?(fsa\.go\.jp|jsda\.or\.jp|j-flec\.go\.jp|toushin\.or\.jp|boj\.or\.jp)\//.test(url)), 'investment sources use official domains')

const result = {
  summary: {
    guides: guideMetrics.length,
    minimumGuideChars: Math.min(...guideMetrics.map(item => item.chars)),
    guideLinks: guideMetrics.reduce((sum, item) => sum + item.links, 0),
    protectedChoiceQuestions: choices.length,
    nonChoiceQuestions: practices.length,
    numericPractices: practices.filter(question => question.type === 'numeric').length,
    classificationPractices: practices.filter(question => question.type === 'classification').length,
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
