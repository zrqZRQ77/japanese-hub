const ch5Ch6Coverage = {
  examId: 'fp3',
  batch: 3,
  verifiedAt: '2026-07-21',
  lawReferenceDate: '2026-04-01',
  chapters: {
    ch5: {
      title: '不動産',
      protectedChoiceQuestions: 22,
      addedNonChoiceQuestions: 7,
      guideSectionIds: ['ch5-s1', 'ch5-s2', 'ch5-s3', 'ch5-s4', 'ch5-s5', 'ch5-s6'],
    },
    ch6: {
      title: '相続・事業承継',
      protectedChoiceQuestions: 22,
      addedNonChoiceQuestions: 7,
      guideSectionIds: ['ch6-s1', 'ch6-s2', 'ch6-s3', 'ch6-s4', 'ch6-s5', 'ch6-s6'],
    },
  },
  abilityCoverage: [
    {
      abilityId: 'fp3-ability-15',
      label: '登記・価格・権利関係・取引・法令規制',
      guideSectionIds: ['ch5-s1', 'ch5-s2', 'ch5-s3'],
      practiceQuestionIds: ['fp3-ch5-practice1', 'fp3-ch5-practice2', 'fp3-ch5-practice3'],
    },
    {
      abilityId: 'fp3-ability-16',
      label: '取得・保有・譲渡税、建蔽率・容積率、投資指標',
      guideSectionIds: ['ch5-s3', 'ch5-s4', 'ch5-s5', 'ch5-s6'],
      practiceQuestionIds: [
        'fp3-ch5-practice3',
        'fp3-ch5-practice4',
        'fp3-ch5-practice5',
        'fp3-ch5-practice6',
        'fp3-ch5-practice7',
      ],
    },
    {
      abilityId: 'fp3-ability-17',
      label: '相続人・法定相続分・遺言・遺留分・放棄',
      guideSectionIds: ['ch6-s1', 'ch6-s2'],
      practiceQuestionIds: ['fp3-ch6-practice1', 'fp3-ch6-practice2'],
    },
    {
      abilityId: 'fp3-ability-18',
      label: '相続税・財産評価・贈与税・事業承継',
      guideSectionIds: ['ch6-s3', 'ch6-s4', 'ch6-s5', 'ch6-s6'],
      practiceQuestionIds: [
        'fp3-ch6-practice3',
        'fp3-ch6-practice4',
        'fp3-ch6-practice5',
        'fp3-ch6-practice6',
        'fp3-ch6-practice7',
      ],
    },
  ],
  calculationAssertions: [
    { id: 'fp3-realestate-calc-01', baselineCalculationId: 'fp3-calc-13', label: 'セットバック・建蔽率・容積率', questionId: 'fp3-ch5-practice3' },
    { id: 'fp3-realestate-calc-02', baselineCalculationId: 'fp3-calc-14', label: '不動産取得税・固定資産税', questionId: 'fp3-ch5-practice4' },
    { id: 'fp3-realestate-calc-03', baselineCalculationId: 'fp3-calc-15', label: '土地建物の譲渡所得と税額', questionId: 'fp3-ch5-practice5' },
    { id: 'fp3-realestate-calc-04', baselineCalculationId: null, label: '表面利回り・NOI・実質利回り', questionId: 'fp3-ch5-practice6' },
    { id: 'fp3-inheritance-calc-01', baselineCalculationId: 'fp3-calc-16', label: '代襲相続を含む法定相続分', questionId: 'fp3-ch6-practice1' },
    { id: 'fp3-inheritance-calc-02', baselineCalculationId: 'fp3-calc-17', label: '保険金非課税・基礎控除・課税遺産総額', questionId: 'fp3-ch6-practice3' },
    { id: 'fp3-inheritance-calc-03', baselineCalculationId: 'fp3-calc-17', label: '法定相続分による相続税総額', questionId: 'fp3-ch6-practice4' },
    { id: 'fp3-inheritance-calc-04', baselineCalculationId: 'fp3-calc-18', label: '路線価・小規模宅地等の特例', questionId: 'fp3-ch6-practice5' },
    { id: 'fp3-inheritance-calc-05', baselineCalculationId: 'fp3-calc-18', label: '暦年課税・相続時精算課税', questionId: 'fp3-ch6-practice6' },
  ],
  officialSourceGroups: [
    '法務省 不動産登記',
    '国土交通省 地価公示・都市計画・建築基準法',
    '東京都主税局 不動産取得税・固定資産税',
    '国税庁 土地建物の譲渡所得',
    '国税庁 法定相続人・相続税・財産評価',
    '国税庁 贈与税・相続時精算課税',
  ],
  boundaries: {
    existingChoiceQuestionsPreserved: true,
    existingCardsPreserved: true,
    usesOnlyLawEffectiveAtReferenceDate: true,
    officialQuestionTextCopied: false,
    mockExamIncluded: false,
  },
}

module.exports = ch5Ch6Coverage
