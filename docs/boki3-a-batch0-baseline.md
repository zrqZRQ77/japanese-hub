# 日商簿記3級 A級アップグレード Batch 0 Baseline

Confirmed: 2026-07-20

## Baseline Conclusion

- Current branch: `content/boki3-a-batch0-baseline`
- Base commit: `b1d1413fb5f37a0944352237ed1a4bd8776e0caf`
- Frozen public content: 13 chapters, 45 guide sections, 204 multiple-choice questions, 215 cards
- Frozen public route baseline: 75 public routes, excluding legacy redirects and draft-only mock exam
- Mock exam asset: 15 internal subquestions, draft-only, excluded from A-grade scoring
- Official annual baseline: 2026年度 continues to use the 2022年度 商工会議所簿記検定試験出題区分表
- Official URLs recorded only:
  - `https://www.kentei.ne.jp/49826`
  - `https://www.kentei.ne.jp/bookkeeping/35697-2`
  - `https://www.kentei.ne.jp/bookkeeping/class3/exam`

## Batch 0 Artifacts

- `content/exams/boki3/a-grade/batch0-baseline.js` freezes counts, the public route list, official scope metadata, ability-to-guide/practice/card mapping, high-risk calculation points, known batch 0 gaps, and the 100-point scorecard with a 90-point A-grade threshold.
- `scripts/validate-boki3-a-baseline.js` verifies the frozen baseline against the live registry and content files.
- `npm run validate:boki3-a-baseline` runs the batch 0 validation.

## Frozen Pre-upgrade Score

- Official scope and accuracy: 18/20
- Guide teaching depth: 23/30
- Chapter practice quality: 18/25
- Guide-practice-card loop: 7/10
- Automated validation and consistency: 8/10
- Annual maintenance capability: 4/5
- Total: **78/100 (B+)**

## Known Future Gaps

Batch 0 intentionally records gaps without failing the validation. Later batches should turn these into strict gates:

- Core abilities need non-choice practice coverage.
- High-risk calculations need deterministic assertions.
- Guide pages, question explanations, and cards need A-grade qualitative checks beyond current structure validation.

These gaps are emitted as warnings in batch 0. They are not failures until later batches add the missing content and promote the checks to strict gates.
