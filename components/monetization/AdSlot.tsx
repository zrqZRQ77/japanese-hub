'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

interface AdSlotProps {
  slot?: string
  label?: string
  className?: string
}

const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT

export default function AdSlot({
  slot,
  label = '広告',
  className = '',
}: AdSlotProps) {
  const isConfigured = Boolean(adsenseClient && slot)
  const showPreview = process.env.NODE_ENV === 'development' && !isConfigured

  useEffect(() => {
    if (!isConfigured) return

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // The ad network may be blocked by the browser; learning content remains usable.
    }
  }, [isConfigured, slot])

  if (!isConfigured && !showPreview) return null

  return (
    <aside className={`ad-slot ${className}`.trim()} aria-label={label}>
      <div className="ad-slot__label">{label}</div>
      {isConfigured ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="ad-slot__preview">レスポンシブ広告スペース</div>
      )}
    </aside>
  )
}
