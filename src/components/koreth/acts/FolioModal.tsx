'use client'

import React, { useState } from 'react'
import { textToLexical, lexicalToText } from '../textLexical'
import { useAuth3 } from '../AuthContext'
import type { Session } from '@/payload-types'

type Props = {
  session?: Session
  onClose: () => void
  onSubmitted: () => void
}

export const FolioModal: React.FC<Props> = ({ session, onClose, onSubmitted }) => {
  const auth = useAuth3()
  const isEdit = !!session
  const author = auth.user?.name || 'Anonymous'

  const [title, setTitle] = useState(session?.title || '')
  const [date, setDate] = useState(session?.inWorldDate || 'Yr 350, late spring')
  const [excerpt, setExcerpt] = useState(session?.excerpt || '')
  const [body, setBody] = useState(lexicalToText(session?.body))
  const [marginalia, setMarginalia] = useState(lexicalToText(session?.marginalia))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    if (!title.trim()) return
    setBusy(true)
    setErr('')
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        inWorldDate: date,
        excerpt: excerpt.trim(),
        body: body.trim() ? textToLexical(body) : textToLexical(excerpt.trim() || 'The page is begun, but unfinished.'),
        marginalia: marginalia.trim() ? textToLexical(marginalia) : null,
      }

      let res: Response
      if (isEdit) {
        res = await fetch(`/api/sessions/${session!.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        const existing = await fetch('/api/sessions?limit=1&sort=-number', { credentials: 'include' }).then((r) => r.json())
        const nextNumber = (existing?.docs?.[0]?.number ?? 0) + 1
        res = await fetch('/api/sessions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, number: nextNumber, authorLabel: author }),
        })
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || 'Could not save folio')
      }
      onSubmitted()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const monoEye: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    letterSpacing: '.22em',
    color: 'var(--ink-3)',
    textTransform: 'uppercase',
  }

  return (
    <div className="modal-bg2" onClick={onClose}>
      <div className="modal2" onClick={(e) => e.stopPropagation()}>
        <div className="modal2-head">
          <div>
            <div style={monoEye}>
              {isEdit ? `Amend folio · session ${String(session!.number ?? 0).padStart(2, '0')}` : 'New folio'}
            </div>
            <h2>
              {isEdit ? (
                <>
                  {session!.title} <em>· edit</em>
                </>
              ) : (
                <>
                  Add a session <em>log</em>
                </>
              )}
            </h2>
          </div>
          <div className="modal2-close" onClick={onClose}>
            ✕
          </div>
        </div>

        <div className="modal2-body">
          {isEdit ? (
            <div className="f-row">
              <div>
                <label className="f-label">Title</label>
                <input className="f-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="f-label">In-world date</label>
                <input className="f-input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="f-label">Title</label>
                <input
                  className="f-input"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Trial Begins"
                />
              </div>
              <div className="f-row">
                <div>
                  <label className="f-label">Scribed by</label>
                  <div className="f-fixed">{author}</div>
                </div>
                <div>
                  <label className="f-label">In-world date</label>
                  <input className="f-input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="f-label">Opening line</label>
            <textarea
              className="f-textarea"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="The dropcap line."
            />
          </div>

          <div>
            <label className="f-label">Body — paragraphs separated by a blank line</label>
            <textarea
              className="f-textarea"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What was witnessed, in present tense."
            />
          </div>

          <div>
            <label className="f-label">Marginalia — a note in the warmer hand</label>
            <textarea
              className="f-textarea"
              rows={3}
              value={marginalia}
              onChange={(e) => setMarginalia(e.target.value)}
              placeholder="Added the next day, in someone else's hand."
            />
          </div>

          {err && (
            <div
              style={{
                color: 'oklch(0.7 0.16 28)',
                fontSize: 13,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {err}
            </div>
          )}
        </div>

        <div className="modal2-foot">
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '.18em',
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
            }}
          >
            {isEdit ? 'amendments are kept in the version history' : 'saves to the chronicle'}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn3 btn3-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn3 btn3-primary" onClick={submit} disabled={busy}>
              {busy ? (isEdit ? 'Saving…' : 'Inscribing…') : isEdit ? 'Save amendment' : 'Inscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
