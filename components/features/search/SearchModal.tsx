// ============================================================
// 全文検索モーダル
// Ctrl+K / Cmd+K または検索ボタンで開く
// ============================================================
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, LibraryBig, PencilLine, Search, X } from 'lucide-react'
import type { SearchResult } from '@/app/api/search/route'

const TYPE_META = {
  question: { label: '練習問題', icon: PencilLine, color: '#7c3aed' },
  card:     { label: '知識カード', icon: LibraryBig, color: '#0891b2' },
  chapter:  { label: '学習ガイド', icon: BookOpen, color: 'var(--color-primary)' },
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // モーダルを開くたびにフォーカス・状態リセット
  useEffect(() => {
    if (!open) return

    const resetId = window.setTimeout(() => {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      inputRef.current?.focus()
    }, 50)

    return () => window.clearTimeout(resetId)
  }, [open])

  // キーボードショートカット Cmd+K / Ctrl+K は Navbar 側で制御

  // 検索デバウンス
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data.results ?? [])
        setActiveIndex(0)
      } finally {
        setLoading(false)
      }
    }, 220)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    search(v)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && results[activeIndex]) {
      router.push(results[activeIndex].url)
      onClose()
    }
  }

  if (!open) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* モーダル本体 */}
      <div style={{
        position: 'fixed', top: '12vh', left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(660px, calc(100vw - 32px))',
        zIndex: 1001,
        borderRadius: 'var(--radius-lg)',
        background: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>

        {/* 入力欄 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: results.length > 0 || loading ? '1px solid var(--color-border)' : 'none',
        }}>
          <Search size={18} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="キーワードを入力（例：仕訳・当座預金・FP）"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '1rem', color: 'var(--color-text)',
              background: 'transparent',
            }}
          />
          {loading && (
            <span style={{
              width: 18, height: 18, flexShrink: 0,
              border: '2.5px solid var(--color-border)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
          {query && !loading && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: '1rem', padding: 2,
              }}
              aria-label="検索語をクリア"
            ><X size={16} /></button>
          )}
          <kbd style={{
            fontSize: '0.72rem', color: 'var(--color-text-muted)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 4, padding: '2px 6px', flexShrink: 0,
          }}>ESC</kbd>
        </div>

        {/* 結果リスト */}
        {results.length > 0 && (
          <div style={{ maxHeight: 'min(460px, 60vh)', overflowY: 'auto' }}>
            {/* 結果ヘッダー */}
            <div style={{
              padding: '8px 20px 4px',
              fontSize: '0.72rem', fontWeight: 700,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.06em',
            }}>
              {results.length}件の結果
            </div>

            {results.map((r, i) => {
              const meta = TYPE_META[r.type]
              const isActive = i === activeIndex
              const Icon = meta.icon
              return (
                <Link
                  key={`${r.type}-${r.url}-${i}`}
                  href={r.url}
                  onClick={onClose}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '12px 20px',
                    background: isActive ? 'var(--color-bg-subtle)' : 'transparent',
                    textDecoration: 'none',
                    borderLeft: isActive ? `3px solid ${meta.color}` : '3px solid transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* アイコン */}
                  <span style={{
                    width: 32, height: 32, flexShrink: 0,
                    background: `${meta.color}18`,
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 2,
                    color: meta.color,
                  }}><Icon size={17} strokeWidth={2.2} /></span>

                  {/* テキスト */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        color: meta.color,
                        background: `${meta.color}15`,
                        padding: '1px 7px', borderRadius: 99,
                        flexShrink: 0,
                      }}>{meta.label}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {r.examName} › {r.chapterTitle}
                      </span>
                    </div>
                    <div style={{
                      fontWeight: 600, fontSize: '0.9rem',
                      color: 'var(--color-text)',
                      marginBottom: 3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{r.title}</div>
                    {r.excerpt && (
                      <div style={{
                        fontSize: '0.8rem', color: 'var(--color-text-secondary)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>{r.excerpt}</div>
                    )}
                  </div>

                  {/* 矢印 */}
                  {isActive && (
                    <span style={{
                      flexShrink: 0, color: 'var(--color-text-muted)',
                      fontSize: '0.9rem', alignSelf: 'center',
                    }}>→</span>
                  )}
                </Link>
              )
            })}

            {/* フッター */}
            <div style={{
              padding: '10px 20px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              display: 'flex', gap: 16, alignItems: 'center',
            }}>
              {[
                { key: '↑↓', label: '移動' },
                { key: 'Enter', label: '開く' },
                { key: 'ESC', label: '閉じる' },
              ].map(k => (
                <div key={k.key} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: '0.72rem', color: 'var(--color-text-muted)',
                }}>
                  <kbd style={{
                    background: '#fff', border: '1px solid var(--color-border)',
                    borderRadius: 4, padding: '1px 5px', fontSize: '0.72rem',
                  }}>{k.key}</kbd>
                  {k.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空の状態 */}
        {query && !loading && results.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            color: 'var(--color-text-muted)', fontSize: '0.9rem',
          }}>
            <Search size={28} style={{ margin: '0 auto 10px', color: 'var(--color-text-muted)' }} />
            「{query}」に一致する結果が見つかりませんでした
          </div>
        )}

        {/* 初期状態（ヒント） */}
        {!query && (
          <div style={{
            padding: '24px 20px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 700,
              color: 'var(--color-text-muted)', marginBottom: 4,
            }}>検索例</div>
            {['仕訳', '当座預金', 'ライフプランニング', 'FP 保険'].map(hint => (
              <button key={hint}
                onClick={() => { setQuery(hint); search(hint) }}
                style={{
                  textAlign: 'left', background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 14px', cursor: 'pointer',
                  fontSize: '0.875rem', color: 'var(--color-text)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
