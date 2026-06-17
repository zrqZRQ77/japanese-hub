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
  const info = exam.info
  if (!info) return null
  return (
    <section style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%)',
      border: '1px solid rgba(20,24,40,0.06)',
      borderRadius: '14px',
      overflow: 'hidden',
      marginBottom: 28,
      boxShadow: '0 6px 18px rgba(15,23,42,0.06)'
    }}>
      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(90deg, #0b2447 0%, #12306b 50%, #1b4bd1 100%)',
        padding: '28px 32px',
        color: '#fff',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', marginBottom: 8 }}>
          この試験について
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.45rem', marginBottom: 6 }}>{exam.name}</div>
        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', opacity: 0.95 }}>{info.tagline}</div>
      </div>

      {/* 基本情報グリッド */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 0,
        borderBottom: '1px solid rgba(20,24,40,0.04)',
      }}>
        {[
          { label: '難易度', value: DIFF_STARS(info.difficulty), sub: info.difficultyLabel },
          { label: '合格率', value: info.passRate, sub: '目安' },
          { label: '学習時間', value: info.studyHours, sub: info.studyMonths },
          { label: '受験料', value: info.examFee, sub: null },
          { label: '試験形式', value: info.examFormat, sub: info.examTime },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '18px 22px',
            borderRight: i !== 4 ? '1px solid rgba(20,24,40,0.04)' : 'none',
            borderBottom: '1px solid rgba(20,24,40,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(20,24,40,0.45)', fontWeight: 800, marginBottom: 8, letterSpacing: '0.06em' }}>
              {item.label}
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--color-text)', lineHeight: 1.2 }}>
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(20,24,40,0.5)', marginTop: 6 }}>{item.sub}</div>
            )}
          </div>
        ))}
        {/* 公式サイト */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>
            公式サイト
          </div>
          <a href={info.officialUrl} target="_blank" rel="noopener noreferrer" style={{
            fontWeight: 700, fontSize: '0.9rem', color: '#0f62fe',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 8, background: 'rgba(15,98,254,0.06)'
          }}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f62fe" strokeWidth="1.8">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              公式ページを開く
            </span>
          </a>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {info.registrationNote}
          </div>
        </div>
      </div>

      {/* 主体内容：三栏布局 — 指标 / 合格价值 / 教材与讲座 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, padding: '18px 22px', alignItems: 'start' }}>
        {/* 合格後の価値（中间列） */}
        <div style={{ gridColumn: '2 / 3' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            🎯 合格後に得られること
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {info.valueAfterPass.map((v, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#f7fbff',
                color: '#0369a1',
                fontSize: '0.82rem', fontWeight: 700,
                padding: '6px 14px', borderRadius: 999,
                boxShadow: 'inset 0 -1px 0 rgba(2,6,23,0.02)'
              }}>
                ✓ {v}
              </span>
            ))}
          </div>
        </div>

        {/* おすすめ教材（右侧列） — 直接展示，並列卡片 */}
        <div style={{ gridColumn: '3 / 4' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 10 }}>📚 おすすめ教材・参考書（Amazon）</div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(20,24,40,0.55)', marginBottom: 12 }}>
            ※ 以下はAmazonアフィリエイトリンクです。購入価格は変わりません。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {info.books.map((book, i) => (
              <a key={i} href={book.amazonUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', gap: 12, padding: '12px 16px',
                  background: '#fff',
                  border: '1px solid rgba(20,24,40,0.04)',
                  borderRadius: 12,
                  textDecoration: 'none', color: 'inherit',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>📖</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800,
                      background: '#fff7ed', color: '#92400e',
                      padding: '3px 8px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.08)'
                    }}>{book.type}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{book.title}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(20,24,40,0.6)', marginBottom: 4 }}>{book.author}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(20,24,40,0.5)' }}>{book.note}</div>
                </div>
                <div style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0, alignSelf: 'center' }}>
                  Amazon →
                </div>
              </a>
            ))}
          </div>

          {/* 講座 */}
          {info.courses && info.courses.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>🖥️ おすすめ講座・スクール</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {info.courses.map((course, i) => (
                  <a key={i} href={course.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, padding: '10px 14px', background: '#fbfbff', border: '1px solid rgba(20,24,40,0.03)', borderRadius: 10, textDecoration: 'none', color: 'inherit'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {course.isFree && <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#ecfdf5', color: '#16a34a', padding: '2px 6px', borderRadius: 99, border: '1px solid rgba(34,197,94,0.12)' }}>無料</span>}
                        <span style={{ fontWeight: 800 }}>{course.title}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(20,24,40,0.55)' }}>{course.note}</div>
                    </div>
                    <div style={{ color: '#0f62fe', fontWeight: 800 }}>詳細 →</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
