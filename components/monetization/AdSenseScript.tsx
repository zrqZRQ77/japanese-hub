import Script from 'next/script'

const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT

export default function AdSenseScript() {
  if (!adsenseClient) return null

  return (
    <Script
      id="google-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  )
}
