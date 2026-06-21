'use client'
// ============================================================
// 試験概要セクション — ダッシュボードページ上部に表示
// 修改此文件 → 所有考试页面的"试験紹介"区块同步更新
// ============================================================
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
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: 28,
      boxShadow: 'var(--shadow-card)'
    }}>
      {/* ヘッダー */}
      <div style={{
        background: 'var(--color-brand)',
        padding: '22px 32px',
        color: 'var(--color-bg)',
        borderBottom: '3px solid var(--color-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: '1.28rem' }}>{exam.name}について</div>
        </div>
        <div style={{ fontSize: '0.95rem', color: 'rgba(244,243,239,0.78)', marginTop: 8 }}>{info.tagline}</div>
      </div>

      {/* 基本情報グリッド */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
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
            padding: '18px 22px',
            borderRight: i !== 4 ? '1px solid var(--color-border)' : 'none',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, marginBottom: 8, letterSpacing: '0.06em' }}>
              {item.label}
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--color-text)', lineHeight: 1.2 }}>
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 6 }}>{item.sub}</div>
            )}
          </div>
        ))}
        {/* 公式サイト */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>
            公式サイト
          </div>
          <a href={info.officialUrl} target="_blank" rel="noopener noreferrer" style={{
            fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary-dark)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-light)'
          }}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

      {/* 主体内容：改回竖排 — 每个区块垂直排列 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '18px 22px' }}>
        {/* 合格後の価値 */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            合格後に得られること
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {info.valueAfterPass.map((v, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                fontSize: '0.82rem', fontWeight: 700,
                padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                boxShadow: 'inset 0 -1px 0 rgba(2,6,23,0.02)'
              }}>
                ✓ {v}
              </span>
            ))}
          </div>
        </div>

        {info.courses.some(course => course.isFree) && (
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 10 }}>
              無料で使える外部学習サービス
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {info.courses.filter(course => course.isFree).map(course => (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={course.title}
                  style={{
                    padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-primary-dark)', background: 'var(--color-bg)', textDecoration: 'none',
                    fontSize: '0.8rem', fontWeight: 700,
                  }}
                >
                  {course.title} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
