const ch2RiskManagementCase2026 = {
  "examId": "fp3",
  "chapterId": "ch2",
  "caseId": "aoba-risk-management-2026",
  "lawReferenceDate": "2026-04-01",
  "facts": {
    "futureExpenses": 45000000,
    "futureIncome": 25000000,
    "currentAssets": 5000000,
    "maturityBenefit": 8000000,
    "paidPremiums": 5000000,
    "temporaryIncomeDeduction": 500000,
    "legalHeirs": 4,
    "deathBenefitReceived": 30000000,
    "deathBenefitExemptionPerHeir": 5000000,
    "fireBuildingAmount": 40000000,
    "fireHouseholdAmount": 12000000,
    "earthquakeRatio": 0.5,
    "earthquakeBuildingCap": 50000000,
    "earthquakeHouseholdCap": 10000000,
    "autoDeathDamage": 38000000,
    "compulsoryDeathLimit": 30000000,
    "hospitalDailyBenefit": 10000,
    "hospitalDays": 10,
    "surgeryBenefit": 200000,
    "incomeMonthlyBenefit": 250000,
    "disabilityMonths": 6,
    "waitingMonths": 1
  },
  "calculations": {
    "requiredCoverage": 15000000,
    "temporaryIncome": 2500000,
    "temporaryIncomeInclusion": 1250000,
    "deathBenefitExemption": 20000000,
    "deathBenefitTaxable": 10000000,
    "earthquakeBuildingAmount": 20000000,
    "earthquakeHouseholdAmount": 6000000,
    "compulsoryDeathPayment": 30000000,
    "voluntaryExcess": 8000000,
    "hospitalBenefit": 100000,
    "medicalBenefitTotal": 300000,
    "incomePaymentMonths": 5,
    "incomeBenefitTotal": 1250000
  },
  "officialSources": [
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1750.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1755.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4114.htm",
    "https://www.jili.or.jp/knows_learns/q_a/life_insurance/127.html",
    "https://www.jili.or.jp/tebiki/chapter1.html",
    "https://soudanguide.sonpo.or.jp/home/q067.html",
    "https://www.mlit.go.jp/jidosha/jibaiseki/about/overview/index.html",
    "https://www.mlit.go.jp/jidosha/jibaiseki/about/payment/index.html",
    "https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2025/03/order3/3-3_12.htm",
    "https://www.seihohogo.jp/qa/qa12.html"
  ]
}

module.exports = ch2RiskManagementCase2026
