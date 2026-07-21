const finalScore = {
  examId: 'fp3',
  assessedAt: '2026-07-21',
  version: 'fp3-v1.0',
  grade: 'A',
  minimumTotal: 90,
  dimensions: [
    {
      id: 'official-accuracy',
      label: '官方范围与准确性',
      maximum: 20,
      minimum: 18,
      score: 20,
      evidence: [
        '2026年度日本FP协会样题已按60道学科与20道实技建立能力映射。',
        '18项核心能力全部具备教材、非选择式练习和卡片证据。',
        '18个高风险计算点全部登记到可复算练习和专项验证器。',
        '2025-04-01与2026-04-01双法令窗口及施行日边界已编码。',
      ],
      deduction: null,
    },
    {
      id: 'guide-depth',
      label: '教材教学深度',
      maximum: 30,
      minimum: 27,
      score: 28,
      evidence: [
        '36个教材小节全部标记为content-verified，最短1,426个非空字符。',
        '36/36小节包含错误诊断，30/36小节具有显式自检，36/36小节具有内部学习链接。',
        '六大领域均建立连续案例、计算过程、判断顺序和对应练习深链。',
      ],
      deduction: '12个小节未被统一案例正则识别，6个小节未使用显式自检标题；教学内容已存在但结构一致性仍可继续提高，扣2分。',
    },
    {
      id: 'practice-quality',
      label: '章节练习质量',
      maximum: 25,
      minimum: 22,
      score: 25,
      evidence: [
        '保留135道原选择题，新增62道非选择式能力题，总计197道。',
        '非选择式包含38道数值题、22道分类题和2道表格题，共256个输入字段。',
        '全部18项核心能力和18个高风险计算点均有直接题目证据。',
        '支持全角数字、千位逗号、单位后缀、常见等价表达和逐字段错误反馈。',
      ],
      deduction: null,
    },
    {
      id: 'learning-loop',
      label: '教材—练习—卡片闭环',
      maximum: 10,
      minimum: 9,
      score: 10,
      evidence: [
        '135张卡片全部具有教材和对应题目深链，并覆盖36个教材小节。',
        '卡片支持未掌握队列、错题关联、随机10张、掌握状态和复习次数。',
        '进度使用localStorage版本3保存，并兼容迁移旧版“覚えた”记录。',
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
        'Batch 0至Batch 7全部拥有独立门禁，且原135道选择题继续逐题哈希保护。',
        '教材正文、案例计算、卡片核心内容、能力映射、深链和年度元数据均有程序断言。',
        'ESLint、Next.js Production build、桌面与手机真实Chrome验收均通过。',
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
        '36个教材小节全部记录lawReferenceDate、previousLawReferenceDate、dataAsOf和annualRisk。',
        '现行窗口、上一窗口、暂停期、官方样题来源及年度敏感度已集中编码。',
        '年度事实按官方或权威来源分组，并对施行日晚于考试基准日的改革明确排除。',
      ],
      deduction: '尚未自动抓取官方制度变更并生成复核任务，年度更新仍需人工触发，扣1分。',
    },
  ],
  vetoChecks: [
    { id: 'veto-factual-error', label: '明确事实错误或未来规则被写成现行', blocked: false },
    { id: 'veto-ability-gap', label: '18项核心能力中存在无非选择式证据的能力', blocked: false },
    { id: 'veto-calculation-gap', label: '18个高风险计算点中存在不可复算项目', blocked: false },
    { id: 'veto-ambiguous-answer', label: '核心练习存在多个未登记的合理答案', blocked: false },
    { id: 'veto-learning-loop', label: '教材、练习与卡片的关键深链断裂', blocked: false },
    { id: 'veto-annual-inconsistency', label: '法令窗口、施行日或年度元数据互相矛盾', blocked: false },
    { id: 'veto-production-blocker', label: '构建、路由、移动端或Production存在阻断性错误', blocked: false },
  ],
}

finalScore.total = finalScore.dimensions.reduce((sum, dimension) => sum + dimension.score, 0)
finalScore.maximum = finalScore.dimensions.reduce((sum, dimension) => sum + dimension.maximum, 0)

module.exports = finalScore
