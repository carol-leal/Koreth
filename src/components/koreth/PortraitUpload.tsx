'use client'

import React, { useRef, useState } from 'react'
import { useT } from '@/i18n/LocaleContext'
import type { Media } from '@/payload-types'

type Props = {
  /** Current value: a media doc (after depth>=1 fetch) or just an id, or null. */
  value: Media | number | string | null | undefined
  /** Called when the user uploads a new file (id) or removes the current one (null). */
  onChange: (id: number | null) => void
  /** alt text written to the new media doc — defaults to the entity name. */
  alt?: string
  /** Diameter in px of the preview square. */
  size?: number
}

/** Pull a usable preview URL out of a media doc. Prefers the small/square thumb. */
const previewUrlOf = (m: Props['value']): string | null => {
  if (!m || typeof m !== 'object') return null
  const sizes = (m as Media).sizes
  if (sizes?.square?.url) return sizes.square.url
  if (sizes?.thumbnail?.url) return sizes.thumbnail.url
  if ((m as Media).url) return (m as Media).url ?? null
  return null
}

export const PortraitUpload: React.FC<Props> = ({ value, onChange, alt, size = 88 }) => {
  const { t } = useT()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [previewOverride, setPreviewOverride] = useState<string | null>(null)
  const url = previewOverride || previewUrlOf(value)

  const onPick = async (file: File) => {
    setBusy(true)
    setErr('')
    // Optimistic preview from the local file.
    setPreviewOverride(URL.createObjectURL(file))
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (alt) fd.append('alt', alt)
      const res = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || t('portrait.err.upload'))
      }
      const j = await res.json()
      const doc = j.doc || j
      onChange(doc.id as number)
    } catch (e) {
      setErr((e as Error).message)
      setPreviewOverride(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="portrait-upload">
      <button
        type="button"
        className="portrait-thumb"
        style={{ width: size, height: size }}
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        title={t('portrait.click')}
      >
        {url ? (
          <img src={url} alt="" />
        ) : (
          <span className="portrait-empty">{busy ? t('portrait.uploading') : t('portrait.empty')}</span>
        )}
        {busy && <span className="portrait-busy">{t('portrait.uploading')}</span>}
      </button>

      <div className="portrait-actions">
        <button
          type="button"
          className="portrait-action"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {url ? t('portrait.replace') : t('portrait.upload')}
        </button>
        {url && (
          <button
            type="button"
            className="portrait-action portrait-action-danger"
            onClick={() => {
              setPreviewOverride(null)
              onChange(null)
            }}
            disabled={busy}
          >
            {t('portrait.remove')}
          </button>
        )}
      </div>

      {err && <div className="portrait-err">{err}</div>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
