'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { PracticeField, Question } from '@/lib/types'
import {
  answersToRecord,
  gradePracticeAnswers,
  recordToAnswers,
} from '@/lib/questions/practice-grading'

interface Props {
  question: Question
  storedAnswer: string | string[] | null
  onSubmit: (answers: string[], isCorrect: boolean) => void
}

function fieldInputMode(field: PracticeField): 'text' | 'numeric' {
  return field.kind === 'number' ? 'numeric' : 'text'
}

export default function NonChoiceQuestion({ question, storedAnswer, onSubmit }: Props) {
  const sheet = question.practiceSheet!

  const initialValues = useMemo(
    () => answersToRecord(sheet.fields, storedAnswer),
    [sheet.fields, storedAnswer],
  )
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [submitted, setSubmitted] = useState(storedAnswer !== null)
  const [validationMessage, setValidationMessage] = useState('')

  const grade = useMemo(
    () => submitted ? gradePracticeAnswers(sheet.fields, values) : null,
    [sheet.fields, submitted, values],
  )
  const fieldById = useMemo(
    () => new Map(sheet.fields.map(field => [field.id, field])),
    [sheet.fields],
  )
  const resultById = useMemo(
    () => new Map((grade?.fields ?? []).map(result => [result.id, result])),
    [grade],
  )

  function updateField(fieldId: string, value: string) {
    if (submitted) return
    setValues(current => ({ ...current, [fieldId]: value }))
    setValidationMessage('')
  }

  function submit() {
    if (submitted) return
    const missing = sheet.fields.some(field => (values[field.id] ?? '').trim() === '')
    if (missing) {
      setValidationMessage('すべての入力欄を埋めてから採点してください。')
      return
    }
    const nextGrade = gradePracticeAnswers(sheet.fields, values)
    setSubmitted(true)
    onSubmit(recordToAnswers(sheet.fields, values), nextGrade.isCorrect)
  }

  function renderField(fieldId: string, compact = false) {
    const field = fieldById.get(fieldId)
    if (!field) return <span aria-label={`未定義の入力欄 ${fieldId}`}>—</span>
    const result = resultById.get(field.id)
    const borderColor = !submitted
      ? 'var(--color-border)'
      : result?.isCorrect
        ? 'var(--color-success)'
        : 'var(--color-error)'

    return (
      <div className="practice-input-wrap" style={{ minWidth: compact ? 120 : 180 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {field.prefix && <span style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)' }}>{field.prefix}</span>}
          <input
            aria-label={field.label}
            autoComplete="off"
            inputMode={fieldInputMode(field)}
            value={values[field.id] ?? ''}
            placeholder={field.placeholder ?? field.label}
            disabled={submitted}
            onChange={event => updateField(field.id, event.target.value)}
            style={{
              width: '100%',
              minHeight: 46,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              background: submitted ? 'var(--color-bg-muted)' : 'var(--color-bg)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
          {field.suffix && <span style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{field.suffix}</span>}
        </div>
        {field.help && !submitted && (
          <div style={{ marginTop: 5, fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {field.help}
          </div>
        )}
        {submitted && result && (
          <div style={{
            marginTop: 6,
            fontSize: '0.78rem',
            lineHeight: 1.55,
            color: result.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
            fontWeight: 700,
          }}>
            {result.isCorrect ? '✓ 正解' : `✗ 正解：${field.correctAnswer}${field.suffix ?? ''}`}
          </div>
        )}
      </div>
    )
  }

  function renderFields() {
    return (
      <div className="practice-fields-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
        {sheet.fields.map(field => (
          <label key={field.id} style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: 7, fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
              {field.label}
            </span>
            {renderField(field.id)}
          </label>
        ))}
      </div>
    )
  }

  function renderJournal() {
    return (
      <div className="practice-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['借方科目', '借方金額', '貸方科目', '貸方金額'].map(header => (
                <th key={header} style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(sheet.journalRows ?? []).map(row => (
              <tr key={row.id}>
                {[row.debitAccountFieldId, row.debitAmountFieldId, row.creditAccountFieldId, row.creditAmountFieldId].map((fieldId, index) => (
                  <td key={`${row.id}-${index}`} style={{ padding: '9px 8px', borderBottom: '1px solid var(--color-border)' }}>
                    {fieldId ? renderField(fieldId, true) : <span>—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function renderTable() {
    const table = sheet.table
    if (!table) return null
    return (
      <div className="practice-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: Math.max(520, table.headers.length * 150), borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {table.headers.map(header => (
                <th key={header} style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map(row => (
              <tr key={row.id}>
                {row.cells.map((cell, index) => (
                  <td key={`${row.id}-${index}`} style={{ padding: '9px 8px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' }}>
                    {cell.fieldId ? renderField(cell.fieldId, true) : cell.text ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="practice-sheet" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
        fontSize: '0.84rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.75,
      }}>
        選択肢を使わずに入力してください。全角数字、半角数字、千位区切り、一般的な空白差は自動で整えますが、実質的に異なる科目や金額は正解になりません。
      </div>

      {sheet.kind === 'fields' && renderFields()}
      {sheet.kind === 'journal' && renderJournal()}
      {sheet.kind === 'table' && renderTable()}

      {!submitted && (
        <div>
          {validationMessage && (
            <div role="alert" style={{ marginBottom: 10, color: 'var(--color-error)', fontSize: '0.84rem', fontWeight: 700 }}>
              {validationMessage}
            </div>
          )}
          <button
            type="button"
            onClick={submit}
            style={{
              minHeight: 46,
              padding: '11px 24px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              color: 'var(--color-bg)',
              fontFamily: 'inherit',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(201,162,75,0.20)',
            }}
          >
            {sheet.submitLabel ?? '解答を採点する'}
          </button>
        </div>
      )}

      {submitted && grade && (
        <div style={{
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${grade.isCorrect ? 'var(--color-success)' : 'var(--color-error)'}`,
          background: grade.isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
        }}>
          <div style={{ fontWeight: 900, color: grade.isCorrect ? 'var(--color-success)' : 'var(--color-error)', marginBottom: 10 }}>
            {grade.isCorrect ? 'すべて正解です' : `${grade.correctCount}/${grade.totalCount}欄が正解です`}
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--color-text)', margin: 0 }}>
            {question.explanation}
          </p>

          {(question.explanationSteps?.length ?? 0) > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 900, marginBottom: 8 }}>計算・判断の手順</div>
              <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, fontSize: '0.88rem' }}>
                {question.explanationSteps?.map(step => <li key={step}>{step}</li>)}
              </ol>
            </div>
          )}

          {!grade.isCorrect && (question.commonMistakes?.length ?? 0) > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 900, marginBottom: 8 }}>誤りの原因</div>
              <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, fontSize: '0.88rem' }}>
                {question.commonMistakes?.map(mistake => <li key={mistake}>{mistake}</li>)}
              </ul>
            </div>
          )}

          {question.guideLink && (
            <Link href={question.guideLink.href} style={{
              display: 'inline-flex',
              marginTop: 16,
              padding: '9px 13px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-primary-dark)',
              textDecoration: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
            }}>
              教材で復習：{question.guideLink.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
