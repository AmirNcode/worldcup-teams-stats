import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'

const TYPES = ['Report bug', 'Feature request', 'General feedback']

// Netlify Forms are detected at build time from a static form in index.html
// (same name + fields). Here we submit it via fetch so the SPA never reloads.
// Netlify only stores submissions on the deployed site — locally the POST just
// won't reach Netlify, which we surface as a friendly error.
const encode = (data) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&')

export default function FeedbackForm({ onClose }) {
  const [type, setType] = useState(TYPES[0])
  const [message, setMessage] = useState('')
  const [bot, setBot] = useState('') // honeypot — humans leave this empty
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'feedback',
          'feedback-type': type,
          message,
          'bot-field': bot,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      track('feedback_submitted', { type })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h3 className="sheet-title">✉️ Send feedback</h3>

        {status === 'done' ? (
          <div className="feedback-done">
            <p>Thanks! Your feedback was sent. 🙌</p>
            <button className="form-btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form
            name="feedback"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={submit}
            className="feedback-form"
          >
            {/* hidden fields Netlify expects */}
            <input type="hidden" name="form-name" value="feedback" />
            <p className="hidden-field">
              <label>
                Leave blank: <input name="bot-field" value={bot} onChange={(e) => setBot(e.target.value)} />
              </label>
            </p>

            <label className="form-label" htmlFor="feedback-type">
              Type
            </label>
            <select
              id="feedback-type"
              name="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="form-label" htmlFor="feedback-message">
              Message
            </label>
            <textarea
              id="feedback-message"
              name="message"
              rows={5}
              placeholder="Describe the bug, feature, or feedback…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            {status === 'error' && (
              <p className="hint">
                Couldn’t send right now. (Submissions are saved only on the deployed
                Netlify site, not in local dev.)
              </p>
            )}

            <button
              type="submit"
              className="form-btn"
              disabled={!message.trim() || status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
