const ch2RiskManagementCoverage = {
  examId: 'fp3',
  chapterId: 'ch2',
  batch: 6,
  verifiedAt: '2026-07-21',
  lawReferenceDate: '2026-04-01',
  protectedChoiceQuestions: 20,
  protectedCards: 20,
  addedNonChoiceQuestions: 12,
  guideSectionIds: ['ch2-s1', 'ch2-s2', 'ch2-s3', 'ch2-s4'],
  abilityCoverage: [
    {
      abilityId: 'fp3-ability-07',
      label: '保険制度・契約ルール・生命保険商品・生命保険税務',
      guideSectionIds: ['ch2-s1', 'ch2-s2'],
      practiceQuestionIds: [
        'fp3-ch2-practice1', 'fp3-ch2-practice2', 'fp3-ch2-practice3',
        'fp3-ch2-practice4', 'fp3-ch2-practice5', 'fp3-ch2-practice6',
      ],
    },
    {
      abilityId: 'fp3-ability-08',
      label: '損害保険・自動車保険・第三分野保険の補償判断',
      guideSectionIds: ['ch2-s3', 'ch2-s4'],
      practiceQuestionIds: [
        'fp3-ch2-practice7', 'fp3-ch2-practice8', 'fp3-ch2-practice9',
        'fp3-ch2-practice10', 'fp3-ch2-practice11', 'fp3-ch2-practice12',
      ],
    },
  ],
  calculationAssertions: [
    { id: 'fp3-risk-calc-01', baselineCalculationId: null, label: '必要保障額', questionId: 'fp3-ch2-practice1' },
    { id: 'fp3-risk-calc-02', baselineCalculationId: 'fp3-calc-05', label: '死亡保険金の課税区分', questionId: 'fp3-ch2-practice4' },
    { id: 'fp3-risk-calc-03', baselineCalculationId: 'fp3-calc-05', label: '満期保険金の一時所得', questionId: 'fp3-ch2-practice5' },
    { id: 'fp3-risk-calc-04', baselineCalculationId: 'fp3-calc-05', label: '死亡保険金非課税限度額', questionId: 'fp3-ch2-practice6' },
    { id: 'fp3-risk-calc-05', baselineCalculationId: null, label: '地震保険金額', questionId: 'fp3-ch2-practice7' },
    { id: 'fp3-risk-calc-06', baselineCalculationId: null, label: '自賠責限度額と超過損害', questionId: 'fp3-ch2-practice9' },
    { id: 'fp3-risk-calc-07', baselineCalculationId: null, label: '医療保険給付金', questionId: 'fp3-ch2-practice10' },
    { id: 'fp3-risk-calc-08', baselineCalculationId: null, label: '所得補償保険給付額', questionId: 'fp3-ch2-practice12' },
  ],
  officialSourceGroups: [
    '国税庁 死亡保険金・満期保険金・相続税非課税限度額',
    '生命保険文化センター 必要保障額・商品選択',
    '日本損害保険協会 地震保険',
    '国土交通省 自賠責保険',
  ],
  boundaries: {
    existingChoiceQuestionsPreserved: true,
    existingCardsPreserved: true,
    usesOnlyLawEffectiveAtReferenceDate: true,
    insuranceExamplesStateAssumptions: true,
    officialQuestionTextCopied: false,
    mockExamIncluded: false,
  },
}

module.exports = ch2RiskManagementCoverage
