'use client'
// ============================================================
// 試験概要セクション — ダッシュボードページ上部に表示
// 修改此文件 → 所有考试页面的"试験紹介"区块同步更新
// ============================================================
import { useState } from 'react'
import { ExamMeta } from '@/lib/types'

interface Props {
  exam: ExamMeta
}

const DIFF_STARS = (n: number) =>
  '★'.repeat(n) + '☆'.repeat(5 - n)

export default function ExamInfoSection({ exam }: Props) {
  const [booksOpen, setBooksOpen] = useState(false)
  const info = exam.info
  if (!info) return null

  return (
    <section style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: 28,
    }}>
      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
        padding: '22px 28px',
        color: '#fff',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.08em', marginBottom: 6 }}>
          この試験について
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: 4 }}>{exam.name}</div>
        <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{info.tagline}</div>
      </div>

      {/* 基本情報グリッド */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 0,
        borderBottom: '1px solid var(--color-border)',
      }}>
        {[
          { label: '難易度', value: DIFF_STARS(info.difficulty), sub: info.difficultyLabel },
          { label: '合格率', value: info.passRate, sub: '目安' },
          { label: '学習時間', value: info.studyHours, sub: info.studyMonths },
          { label: '受験料', value: info.examFee, sub: null },
          { label: '試験形式', value: info.examFormat, sub: info.examTime },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '16px 20px',
            borderRight: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>
              {item.label}
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.3 }}>
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.sub}</div>
            )}
          </div>
        ))}
        {/* 公式サイト */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>
            公式サイト
          </div>
          <a href={info.officialUrl} target="_blank" rel="noopener noreferrer" style={{
            fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            公式ページを開く
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {info.registrationNote}
          </div>
        </div>
      </div>

      {/* 合格後の価値 */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          🎯 合格後に得られること
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {info.valueAfterPass.map((v, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: '0.78rem', fontWeight: 600,
              padding: '5px 12px', borderRadius: 99,
            }}>
              ✓ {v}
            </span>
          ))}
        </div>
      </div>

      {/* おすすめ教材（折りたたみ） */}
      {info.books && info.books.length > 0 && (
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setBooksOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 24px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)',
            }}
          >
            <span>📚 おすすめ教材・参考書（Amazon）</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: booksOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {booksOpen && (
            <div style={{ padding: '4px 24px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                ※ 以下はAmazonアフィリエイトリンクです。購入価格は変わりません。
              </p>
              {info.books.map((book, i) => (
                <a key={i} href={book.amazonUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', gap: 12, padding: '12px 16px',
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>📖</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        background: '#fef3c7', color: '#92400e',
                        padding: '2px 7px', borderRadius: 99,
                      }}>{book.type}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>{book.title}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 3 }}>{book.author}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{book.note}</div>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, alignSelf: 'center' }}>
                    Amazon →
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* おすすめ講座 */}
      {info.courses && info.courses.length > 0 && (
        <div style={{ padding: '14px 24px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: 10 }}>
            🖥️ おすすめ講座・スクール
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {info.courses.map((course, i) => (
              <a key={i} href={course.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, padding: '10px 14px',
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    {course.isFree && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700,
                        background: '#f0fdf4', color: '#16a34a',
                        padding: '1px 6px', borderRadius: 99, border: '1px solid #bbf7d0',
                      }}>無料</span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>{course.title}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{course.note}</div>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700, flexShrink: 0 }}>詳細 →</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
