const finalScore = {
  examId: 'boki3',
  assessedAt: '2026-07-20',
  grade: 'A',
  minimumTotal: 90,
  dimensions: [
    {
      id: 'official-accuracy',
      label: '官方范围与准确性',
      maximum: 20,
      minimum: 18,
      score: 19,
      evidence: [
        '2026年度范围与日本商工会議所2022年度适用出题区分表建立版本化映射。',
        '13项核心能力全部映射到教材、非选择式练习和卡片。',
        '10类高风险计算点均有程序复算断言。',
      ],
      deduction: '年度法令与官方出题范围变更仍需每年人工复核，扣1分。',
    },
    {
      id: 'guide-depth',
      label: '教材教学深度',
      maximum: 30,
      minimum: 27,
      score: 28,
      evidence: [
        '45个教材小节全部超过1,700个非空字符，全部包含案例或交易条件。',
        '44/45小节含错误诊断，36/45小节含显式自检或检查清单。',
        '第12章形成从试算表到精算表、P/L、B/S和当期纯利益的连续案例。',
      ],
      deduction: '9个小节未使用显式“自检”标题，1个导论小节未设独立错误诊断段，扣2分。',
    },
    {
      id: 'practice-quality',
      label: '章节练习质量',
      maximum: 25,
      minimum: 22,
      score: 24,
      evidence: [
        '保留204道原选择题，新增45道非选择式能力题。',
        '非选择式覆盖分录、复合分录、数值、表格、分类和订正，25题使用分录布局。',
        '全部13项核心能力均有非选择式覆盖，所有分录借贷平衡并可复算。',
      ],
      deduction: '多行答案仍按固定字段顺序作答，不支持任意行顺序等价输入，扣1分。',
    },
    {
      id: 'learning-loop',
      label: '教材—练习—卡片闭环',
      maximum: 10,
      minimum: 9,
      score: 10,
      evidence: [
        '215张卡片全部具有教材、对应练习和关联章节深链。',
        '选择题与非选择题答错后均可跳转到精确复习卡片。',
        '卡片分为记忆、判断、步骤、错误诊断，13章均有判断与步骤/诊断卡。',
      ],
      deduction: null,
    },
    {
      id: 'validation-consistency',
      label: '自动验证与一致性',
      maximum: 10,
      minimum: 9,
      score: 10,
      evidence: [
        '单一A级门禁聚合7个子验证器，并执行1,437项最终检查。',
        '能力题专项执行1,560项检查，学习闭环专项执行4,421项检查。',
        '严格检查年度元数据、全部深链、分录平衡、高风险公式和macOS垃圾文件。',
      ],
      deduction: null,
    },
    {
      id: 'annual-maintenance',
      label: '年度维护能力',
      maximum: 5,
      minimum: 4,
      score: 4,
      evidence: [
        '45个教材小节全部具有updatedAt，更新时间集中在2026-07-17至2026-07-20。',
        '官方范围、确认日期和来源URL已写入版本化A级覆盖文件。',
        'Sitemap使用教材updatedAt生成lastModified，并按模拟考试公开状态决定是否收录。',
      ],
      deduction: '尚未建立自动抓取官方年度变更并生成复核任务的流程，扣1分。',
    },
  ],
  vetoChecks: [
    { id: 'veto-factual-error', label: '明确事实错误或过期规则被写成现行', blocked: false },
    { id: 'veto-multiple-answers', label: '核心题存在多个合理答案', blocked: false },
    { id: 'veto-unverifiable-calculation', label: '关键计算无法复算或正文与答案矛盾', blocked: false },
    { id: 'veto-choice-only', label: '核心章节仍全部依赖选择题', blocked: false },
    { id: 'veto-ch12-incomplete', label: '第12章不能支持独立完成同类型表格任务', blocked: false },
    { id: 'veto-production-blocker', label: '构建、路由、移动端或生产环境存在阻断性错误', blocked: false },
  ],
}

finalScore.total = finalScore.dimensions.reduce((sum, dimension) => sum + dimension.score, 0)
finalScore.maximum = finalScore.dimensions.reduce((sum, dimension) => sum + dimension.maximum, 0)

module.exports = finalScore
