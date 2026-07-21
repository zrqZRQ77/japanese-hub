const ch4TaxCase2026 = {
  "examId": "fp3",
  "chapterId": "ch4",
  "caseId": "aoba-naoto-2026-tax",
  "lawReferenceDate": "2026-04-01",
  "taxpayer": "青葉直人",
  "facts": {
    "salaryRevenue": 6000000,
    "rentalRevenue": 1200000,
    "rentalExpenses": 1500000,
    "landAcquisitionInterest": 100000,
    "temporaryRevenue": 3000000,
    "temporaryDirectCost": 2200000,
    "miscIncome": 200000,
    "socialInsuranceDeduction": 700000,
    "medicalExpensePaid": 300000,
    "medicalReimbursement": 50000,
    "idecoDeduction": 240000,
    "lifeInsuranceDeduction": 80000,
    "housingLoanTaxCredit": 100000
  },
  "calculations": {
    "salaryDeduction": 1640000,
    "salaryIncome": 4360000,
    "rentalIncome": -300000,
    "rentalLossEligibleForOffset": 200000,
    "temporaryIncome": 300000,
    "temporaryIncludedAmount": 150000,
    "aggregateIncome": 4510000,
    "medicalExpenseDeduction": 150000,
    "basicDeduction": 680000,
    "totalIncomeDeductions": 1850000,
    "taxableIncome": 2660000,
    "calculatedIncomeTax": 168500,
    "incomeTaxAfterCredit": 68500,
    "reconstructionSpecialIncomeTax": 1438,
    "incomeAndReconstructionTax": 69938
  },
  "officialSources": [
    "https://www.kinzai.or.jp/ginou/fp/law.html",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1000.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1300.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1420.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1490.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2250.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1120.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm",
    "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900.htm",
    "https://www.nta.go.jp/users/gensen/2025kiso/index.htm",
    "https://www.nta.go.jp/users/gensen/2026kiso/index.htm"
  ]
}

module.exports = ch4TaxCase2026
