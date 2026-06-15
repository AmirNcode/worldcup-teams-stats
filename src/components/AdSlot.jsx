import { useEffect, useRef } from 'react'

// Config comes from build-time env (Vite inlines VITE_* ; see .env.example).
// Nothing here is secret — AdSense client/slot IDs are visible in page source
// anyway — so they can live in a committed .env or, preferably, in Netlify's
// environment variables so no code change is needed to go live.
const env = import.meta.env ?? {}
const CLIENT = env.VITE_ADSENSE_CLIENT // "ca-pub-XXXXXXXXXXXXXXXX"
const SLOT = env.VITE_ADSENSE_SLOT // "XXXXXXXXXX"
const SPONSOR_IMG = env.VITE_SPONSOR_IMAGE
const SPONSOR_URL = env.VITE_SPONSOR_URL
const SPONSOR_ALT = env.VITE_SPONSOR_ALT || 'Sponsor'
const IS_DEV = Boolean(env.DEV)

const adsenseOn = Boolean(CLIENT && SLOT)
const sponsorOn = Boolean(SPONSOR_IMG && SPONSOR_URL)

// Load Google's loader once, only if we actually have a client.
function ensureAdsenseScript() {
  if (typeof document === 'undefined') return
  if (document.querySelector('script[data-adsense]')) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`
  s.crossOrigin = 'anonymous'
  s.setAttribute('data-adsense', '')
  document.head.appendChild(s)
}

function AdSenseUnit() {
  const ref = useRef(null)
  useEffect(() => {
    ensureAdsenseScript()
    try {
      // Guard against a double push (React StrictMode in dev) — AdSense stamps
      // the element with data-adsbygoogle-status once it has filled it.
      const ins = ref.current
      if (ins && !ins.getAttribute('data-adsbygoogle-status')) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch {
      /* loader blocked (ad blocker) or not ready yet — fail silently */
    }
  }, [])
  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={CLIENT}
      data-ad-slot={SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

// A single, responsive, non-intrusive ad placement. Mounted once per page view
// (App keys it by route), it sits at the bottom of the scrollable content,
// above the tab bar. Renders nothing in production until it's configured, so
// users never see an empty box.
export default function AdSlot() {
  if (adsenseOn) {
    return (
      <aside className="ad-slot" aria-label="Advertisement">
        <span className="ad-label">Advertisement</span>
        <AdSenseUnit />
      </aside>
    )
  }
  if (sponsorOn) {
    return (
      <aside className="ad-slot" aria-label="Sponsor">
        <span className="ad-label">Sponsored</span>
        <a
          className="sponsor-banner"
          href={SPONSOR_URL}
          target="_blank"
          rel="noopener sponsored"
        >
          <img src={SPONSOR_IMG} alt={SPONSOR_ALT} loading="lazy" />
        </a>
      </aside>
    )
  }
  if (IS_DEV) {
    return (
      <aside className="ad-slot ad-placeholder" aria-hidden="true">
        <span>Ad slot</span>
        <small>Set VITE_ADSENSE_CLIENT &amp; VITE_ADSENSE_SLOT to serve ads here</small>
      </aside>
    )
  }
  return null
}
