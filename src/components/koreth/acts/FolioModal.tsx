'use client'

import React, { useState } from 'react'
import { textToLexical, lexicalToText } from '../textLexical'
import { useAuth3 } from '../AuthContext'
import { useT } from '@/i18n/LocaleContext'
import type { Session } from '@/payload-types'

type Props = {
  session?: Session
  onClose: () => void
  onSubmitted: () => void
  /** Called after a successful delete. */
  onDeleted?: () => void
}

export const FolioModal: React.FC<Props> = ({ session, onClose, onSubmitted, onDeleted }) => {
  const auth = useAuth3()
  const { t } = useT()
  const isEdit = !!session
  const author = auth.user?.name || 'Anonymous'
  const canDelete = isEdit && auth.canEditAny

  const [title, setTitle] = useState(session?.title || '')
  const [date, setDate] = useState(session?.inWorldDate || 'Yr 350, late spring')
  const [excerpt, setExcerpt] = useState(session?.excerpt || '')
  const [body, setBody] = useState(lexicalToText(session?.body))
  const [marginalia, setMarginalia] = useState(lexicalToText(session?.marginalia))
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  const remove = async () => {
    if (!canDelete || !session?.id) return
    if (!confirm(t('folio.delete.confirm'))) return
    setDeleting(true)
    setErr('')
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('folio.err.generic'))
      }
      ;(onDeleted || onSubmitted)()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const submit = async () => {
    if (!title.trim()) return
    setBusy(true)
    setErr('')
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        inWorldDate: date,
        excerpt: excerpt.trim(),
        body: body.trim() ? textToLexical(body) : textToLexical(excerpt.trim() || t('chronicle.unfinished')),
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
        throw new Error(j?.errors?.[0]?.message || j?.message || t('folio.err.generic'))
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
              {isEdit ? t('folio.amend', { num: String(session!.number ?? 0).padStart(2, '0') }) : t('folio.new')}
            </div>
            <h2>
              {isEdit ? (
                <>
                  {session!.title} <em>{t('folio.titleEdit')}</em>
                </>
              ) : (
                <>
                  {t('folio.titleAdd.a')} <em>{t('folio.titleAdd.b')}</em>
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
                <label className="f-label">{t('folio.f.title')}</label>
                <input className="f-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="f-label">{t('folio.f.inWorldDate')}</label>
                <input className="f-input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="f-label">{t('folio.f.title')}</label>
                <input
                  className="f-input"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('folio.f.titlePlaceholder')}
                />
              </div>
              <div className="f-row">
                <div>
                  <label className="f-label">{t('folio.f.scribed')}</label>
                  <div className="f-fixed">{author}</div>
                </div>
                <div>
                  <label className="f-label">{t('folio.f.inWorldDate')}</label>
                  <input className="f-input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="f-label">{t('folio.f.opening')}</label>
            <textarea
              className="f-textarea"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={t('folio.f.openingPlaceholder')}
            />
          </div>

          <div>
            <label className="f-label">{t('folio.f.body')}</label>
            <textarea
              className="f-textarea"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('folio.f.bodyPlaceholder')}
            />
          </div>

          <div>
            <label className="f-label">{t('folio.f.marginalia')}</label>
            <textarea
              className="f-textarea"
              rows={3}
              value={marginalia}
              onChange={(e) => setMarginalia(e.target.value)}
              placeholder={t('folio.f.marginaliaPlaceholder')}
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
          {canDelete ? (
            <button className="btn3 btn3-danger" onClick={remove} disabled={busy || deleting} type="button">
              {deleting ? t('folio.btn.deleting') : t('folio.btn.delete')}
            </button>
          ) : (
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '.18em',
                color: 'var(--ink-4)',
                textTransform: 'uppercase',
              }}
            >
              {isEdit ? t('folio.foot.amend') : t('folio.foot.add')}
            </span>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn3 btn3-ghost" onClick={onClose}>
              {t('folio.btn.cancel')}
            </button>
            <button className="btn3 btn3-primary" onClick={submit} disabled={busy || deleting}>
              {busy
                ? isEdit
                  ? t('folio.btn.saving')
                  : t('folio.btn.inscribing')
                : isEdit
                  ? t('folio.btn.save')
                  : t('folio.btn.inscribe')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
