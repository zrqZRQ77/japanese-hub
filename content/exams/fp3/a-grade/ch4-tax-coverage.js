const ch4TaxCoverage = {
  examId: 'fp3',
  chapterId: 'ch4',
  batch: 2,
  verifiedAt: '2026-07-21',
  lawReferenceDate: '2026-04-01',
  protectedChoiceQuestions: 20,
  addedNonChoiceQuestions: 8,
  abilityCoverage: [
    {
      abilityId: 'fp3-ability-13',
      label: '所得区分と各種所得金額',
      guideSectionIds: ['ch4-s1', 'ch4-s2', 'ch4-s3', 'ch4-s4'],
      practiceQuestionIds: [
        'fp3-ch4-practice1',
        'fp3-ch4-practice2',
        'fp3-ch4-practice3',
        'fp3-ch4-practice4',
        'fp3-ch4-practice5',
      ],
    },
    {
      abilityId: 'fp3-ability-14',
      label: '損益通算・所得控除・税額控除・申告',
      guideSectionIds: ['ch4-s5', 'ch4-s6'],
      practiceQuestionIds: [
        'fp3-ch4-practice5',
        'fp3-ch4-practice6',
        'fp3-ch4-practice7',
        'fp3-ch4-practice8',
      ],
    },
  ],
  calculationAssertions: [
    { id: 'fp3-tax-calc-01', baselineCalculationId: null, label: '給与所得控除と給与所得', questionId: 'fp3-ch4-practice2' },
    { id: 'fp3-tax-calc-02', baselineCalculationId: 'fp3-calc-10', label: '退職所得控除と退職所得', questionId: 'fp3-ch4-practice3' },
    { id: 'fp3-tax-calc-03', baselineCalculationId: 'fp3-calc-11', label: '一時所得と総所得算入額', questionId: 'fp3-ch4-practice4' },
    { id: 'fp3-tax-calc-04', baselineCalculationId: 'fp3-calc-12', label: '不動産赤字の通算限度と合計所得', questionId: 'fp3-ch4-practice5' },
    { id: 'fp3-tax-calc-05', baselineCalculationId: 'fp3-calc-12', label: '医療費控除・所得控除・課税所得', questionId: 'fp3-ch4-practice6' },
    { id: 'fp3-tax-calc-06', baselineCalculationId: 'fp3-calc-12', label: '速算税額・税額控除・復興特別所得税', questionId: 'fp3-ch4-practice7' },
  ],
  officialSourceGroups: [
    '国税庁 所得税の仕組み・所得区分',
    '国税庁 給与所得・退職所得・一時所得',
    '国税庁 損益通算・所得控除・税率',
    '国税庁 確定申告・復興特別所得税',
    '金融財政事情研究会 法令基準日',
  ],
  boundaries: {
    usesOnlyLawEffectiveAtReferenceDate: true,
    excludesReformEffectiveAfterReferenceDate: true,
    officialQuestionTextCopied: false,
    mockExamIncluded: false,
  },
}

module.exports = ch4TaxCoverage
