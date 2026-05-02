'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LinkText } from '../LinkText'
import { useAuth3 } from '../AuthContext'
import { lexicalToText } from '../textLexical'
import { FolioModal } from './FolioModal'
import type { Session } from '@/payload-types'

type Props = {
  sel: number | null
  setSel: (id: number) => void
  sessions: Session[]
}

const formatRelative = (iso?: string | null) => {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

export const Chronicle: React.FC<Props> = ({ sel, setSel, sessions }) => {
  const auth = useAuth3()
  const router = useRouter()
  const [amendOpen, setAmendOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const closeAndRefresh = (close: () => void) => () => {
    close()
    router.refresh()
  }

  const sorted = [...sessions].sort((a, b) => (b.number ?? 0) - (a.number ?? 0))
  const s = sorted.find((x) => x.id === sel) || sorted[0]

  if (!s) {
    return (
      <div className="chronicle">
        <div className="chr-toc">
          <div className="eyebrow-sm">Act III · The Chronicle</div>
          <h2>The book is empty.</h2>
          <p className="chr-toc-intro">No folio has been inscribed yet.</p>
          <div className="chr-add-row">
            {auth?.canAddSession ? (
              <button className="btn3 btn3-primary" onClick={() => setAddOpen(true)}>
                + Add session log
              </button>
            ) : (
              <span className="chr-add-locked">Sign in to inscribe.</span>
            )}
          </div>
        </div>
        {addOpen && (
          <FolioModal onClose={() => setAddOpen(false)} onSubmitted={closeAndRefresh(() => setAddOpen(false))} />
        )}
      </div>
    )
  }

  const i = sorted.findIndex((x) => x.id === s.id)
  const authorName = s.authorLabel || (typeof s.author === 'object' && s.author ? s.author.name || '' : '')
  const bodyText = lexicalToText(s.body)
  const bodyParas = bodyText.split(/\n\n+/).filter(Boolean)
  const marginText = lexicalToText(s.marginalia)
  const lastAmendedLabel = s.lastAmendedByLabel || (typeof s.lastAmendedBy === 'object' && s.lastAmendedBy ? s.lastAmendedBy.name || '' : '')
  const lastAmendedRel = formatRelative(s.lastAmendedAt)
  const wasAmended = !!s.lastAmendedAt && lastAmendedLabel && lastAmendedLabel !== authorName

  return (
    <div className="chronicle">
      <div className="chr-toc">
        <div className="eyebrow-sm">Act III · The Chronicle</div>
        <h2>
          Sessions <em>recently kept,</em>
          <br />
          in the voice of the Choir.
        </h2>
        <p className="chr-toc-intro">
          Each session is written by one of the Choir, in present tense, before they sleep. Marginalia in the warmer
          hand are scribes' afterthoughts, added the next day. Any of the Choir may amend a folio — every amendment is
          kept in the version history.
        </p>

        <div className="chr-stats">
          <div className="chr-stat">
            <div className="k">Sessions kept</div>
            <div className="v">{sessions.length}</div>
          </div>
          <div className="chr-stat">
            <div className="k">Last entry</div>
            <div className="v">{formatRelative(sorted[0]?.updatedAt) || '—'}</div>
          </div>
          <div className="chr-stat">
            <div className="k">In-world</div>
            <div className="v">Yr 350</div>
          </div>
        </div>

        <div className="chr-add-row">
          {auth?.canAddSession ? (
            <button className="btn3 btn3-primary" onClick={() => setAddOpen(true)}>
              + Add session log
            </button>
          ) : (
            <span className="chr-add-locked">Sign in to inscribe.</span>
          )}
          {auth?.user && (
            <span className="chr-add-as">
              writing as <em>{auth.user.name}</em>
            </span>
          )}
        </div>

        <div className="chr-list">
          {sorted.map((x) => {
            const xAuthor = x.authorLabel || (typeof x.author === 'object' && x.author ? x.author.name || '' : '')
            const mine = !!auth?.isPlayer && auth.user?.name === xAuthor
            return (
              <div
                key={x.id}
                className={'chr-item' + (x.id === s.id ? ' active' : '')}
                onClick={() => setSel(x.id as number)}
                style={{ position: 'relative' }}
              >
                <div className="chr-num">{String(x.number ?? 0).padStart(2, '0')}</div>
                <div className="chr-item-text">
                  <div className="chr-title">
                    {x.title}
                    {mine && (
                      <span className="folio-yours" title="written in your hand">
                        your folio
                      </span>
                    )}
                  </div>
                  <div className="chr-by">scribed by {xAuthor}</div>
                </div>
                <div className="chr-date">{(x.inWorldDate || '').split(',')[0]}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="chr-page">
        <div className="chr-spine" />
        <div className="chr-folio">
          <span>
            folio · session {String(s.number ?? 0).padStart(2, '0')} · {s.inWorldDate}
          </span>
          <span>{authorName}</span>
        </div>
        <h1 className="chr-headline">{s.title}</h1>
        <div className="chr-byline">
          <span>scribed by {authorName}</span>
          {wasAmended && (
            <span style={{ fontSize: 13, color: 'var(--ink-4)', marginLeft: 14 }}>
              · last amended by <em>{lastAmendedLabel}</em>
              {lastAmendedRel && <span style={{ marginLeft: 6 }}>{lastAmendedRel}</span>}
            </span>
          )}
          {auth?.canAddSession && (
            <span className="chr-amend" title="amend this folio" onClick={() => setAmendOpen(true)}>
              ✎ amend
            </span>
          )}
        </div>

        <div className="chr-body">
          {bodyParas.length === 0 ? (
            <p className="dropcap" style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>
              {s.excerpt || 'The page is begun, but unfinished.'}
            </p>
          ) : (
            bodyParas.map((p, idx) => (
              <p key={idx} className={idx === 0 ? 'dropcap' : undefined}>
                <LinkText text={p} />
              </p>
            ))
          )}
          {marginText && (
            <div className="chr-marg">
              <LinkText text={marginText} />
            </div>
          )}
        </div>

        <div className="chr-foot">
          <span>
            {i < sorted.length - 1
              ? `previous · session ${String(sorted[i + 1].number ?? 0).padStart(2, '0')}`
              : 'first session'}
          </span>
          <span>
            folio {i + 1} of {sorted.length}
          </span>
          <span>{i > 0 ? `next · session ${String(sorted[i - 1].number ?? 0).padStart(2, '0')}` : 'current'}</span>
        </div>
      </div>

      {amendOpen && (
        <FolioModal
          session={s}
          onClose={() => setAmendOpen(false)}
          onSubmitted={closeAndRefresh(() => setAmendOpen(false))}
        />
      )}
      {addOpen && (
        <FolioModal onClose={() => setAddOpen(false)} onSubmitted={closeAndRefresh(() => setAddOpen(false))} />
      )}
    </div>
  )
}
