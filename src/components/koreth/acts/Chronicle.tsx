'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LinkText } from '../LinkText'
import { useAuth3 } from '../AuthContext'
import { lexicalToText } from '../textLexical'
import { FolioModal } from './FolioModal'
import { useT } from '@/i18n/LocaleContext'
import type { Session, Folio } from '@/payload-types'

type Props = {
  sel: number | null
  setSel: (id: number) => void
  sessions: Session[]
  folios: Folio[]
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

/** A folio's session can be a relationship doc or a bare id depending on depth. */
const folioSessionId = (f: Folio): number | null => {
  const s = f.session
  if (typeof s === 'object' && s) return (s.id as number) ?? null
  if (typeof s === 'number') return s
  return null
}

export const Chronicle: React.FC<Props> = ({ sel, setSel, sessions, folios }) => {
  const auth = useAuth3()
  const router = useRouter()
  const { t } = useT()
  const [editFolio, setEditFolio] = useState<Folio | null>(null)
  const [addFolioFor, setAddFolioFor] = useState<Session | null>(null)
  const [addSessionOpen, setAddSessionOpen] = useState(false)

  const closeAndRefresh = (close: () => void) => () => {
    close()
    router.refresh()
  }

  const sorted = [...sessions].sort((a, b) => (b.number ?? 0) - (a.number ?? 0))
  const s = sorted.find((x) => x.id === sel) || sorted[0]
  // Folios for the selected session, oldest first.
  const folioBySession = (sessionId: number | undefined) =>
    folios
      .filter((f) => folioSessionId(f) === sessionId)
      .sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      )
  const sessionFolios = s ? folioBySession(s.id as number) : []

  // Counts for the TOC stat row.
  const totalFolios = folios.length
  const lastFolio = [...folios].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
  )[0]

  if (!s) {
    return (
      <div className="chronicle">
        <div className="chr-toc">
          <div className="eyebrow-sm">{t('chronicle.eyebrow')}</div>
          <h2>{t('chronicle.empty.title')}</h2>
          <p className="chr-toc-intro">{t('chronicle.empty.sub')}</p>
          <div className="chr-add-row">
            {auth?.canAddSession ? (
              <button className="btn3 btn3-primary" onClick={() => setAddSessionOpen(true)}>
                {t('chronicle.add')}
              </button>
            ) : (
              <span className="chr-add-locked">{t('chronicle.locked')}</span>
            )}
          </div>
        </div>
        {addSessionOpen && (
          <FolioModal
            onClose={() => setAddSessionOpen(false)}
            onSubmitted={closeAndRefresh(() => setAddSessionOpen(false))}
          />
        )}
      </div>
    )
  }

  const i = sorted.findIndex((x) => x.id === s.id)

  return (
    <div className="chronicle">
      <div className="chr-toc">
        <div className="eyebrow-sm">{t('chronicle.eyebrow')}</div>
        <h2>
          {t('chronicle.headline.a')} <em>{t('chronicle.headline.b')}</em>
          <br />
          {t('chronicle.headline.c')}
        </h2>
        <p className="chr-toc-intro">{t('chronicle.intro')}</p>

        <div className="chr-stats">
          <div className="chr-stat">
            <div className="k">{t('chronicle.stat.kept')}</div>
            <div className="v">{sessions.length}</div>
          </div>
          <div className="chr-stat">
            <div className="k">{t('chronicle.stat.lastEntry')}</div>
            <div className="v">{formatRelative(lastFolio?.updatedAt) || '—'}</div>
          </div>
          <div className="chr-stat">
            <div className="k">{t('chronicle.stat.inWorld')}</div>
            <div className="v">Yr 350</div>
          </div>
        </div>

        <div className="chr-add-row">
          {auth?.canAddSession ? (
            <button className="btn3 btn3-primary" onClick={() => setAddSessionOpen(true)}>
              {t('chronicle.add')}
            </button>
          ) : (
            <span className="chr-add-locked">{t('chronicle.locked')}</span>
          )}
          {auth?.user && (
            <span className="chr-add-as">
              {t('chronicle.writingAs')} <em>{auth.user.name}</em>
            </span>
          )}
        </div>

        <div className="chr-list">
          {sorted.map((x) => {
            const xFolios = folioBySession(x.id as number)
            const mine =
              !!auth?.isPlayer &&
              xFolios.some((f) => {
                const a = f.author
                if (typeof a === 'object' && a) return a.id === auth.user?.id
                return a === auth.user?.id
              })
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
                      <span className="folio-yours" title={t('chronicle.yourFolio.title')}>
                        {t('chronicle.yourFolio')}
                      </span>
                    )}
                  </div>
                  <div className="chr-by">
                    {xFolios.length === 0
                      ? t('chronicle.session.noFolios')
                      : t('chronicle.session.folioCount', { n: xFolios.length })}
                  </div>
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
            {t('chronicle.folioMeta', { num: String(s.number ?? 0).padStart(2, '0'), date: s.inWorldDate || '' })}
          </span>
          <span>{sessionFolios.length} {sessionFolios.length === 1 ? t('chronicle.folio') : t('chronicle.folios')}</span>
        </div>
        <h1 className="chr-headline">{s.title}</h1>

        {sessionFolios.length === 0 ? (
          <div className="chr-empty-folios">
            <p style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>{t('chronicle.session.empty')}</p>
            {auth?.user && (
              <button className="btn3 btn3-primary" onClick={() => setAddFolioFor(s)}>
                {t('chronicle.folio.addFirst')}
              </button>
            )}
          </div>
        ) : (
          sessionFolios.map((f, fi) => {
            const fAuthor =
              f.authorLabel || (typeof f.author === 'object' && f.author ? f.author.name || '' : '')
            const bodyText = lexicalToText(f.body)
            const bodyParas = bodyText.split(/\n\n+/).filter(Boolean)
            const marginText = lexicalToText(f.marginalia)
            const lastAmendedLabel =
              f.lastAmendedByLabel ||
              (typeof f.lastAmendedBy === 'object' && f.lastAmendedBy ? f.lastAmendedBy.name || '' : '')
            const lastAmendedRel = formatRelative(f.lastAmendedAt)
            const wasAmended = !!f.lastAmendedAt && lastAmendedLabel && lastAmendedLabel !== fAuthor
            const folioOwn =
              !!auth?.user &&
              ((typeof f.author === 'object' && f.author && f.author.id === auth.user.id) ||
                f.author === auth.user.id)
            const canAmend = auth?.canEditAny || folioOwn

            return (
              <div className="chr-folio-block" key={f.id}>
                {fi > 0 && <div className="chr-folio-sep" />}
                <div className="chr-byline">
                  <span>{t('chronicle.scribedBy', { name: fAuthor })}</span>
                  {wasAmended && (
                    <span style={{ fontSize: 13, color: 'var(--ink-4)', marginLeft: 14 }}>
                      {t('chronicle.lastAmendedBy')} <em>{lastAmendedLabel}</em>
                      {lastAmendedRel && <span style={{ marginLeft: 6 }}>{lastAmendedRel}</span>}
                    </span>
                  )}
                  {canAmend && (
                    <span
                      className="chr-amend"
                      title={t('chronicle.amend.title')}
                      onClick={() => setEditFolio(f)}
                    >
                      {t('chronicle.amend')}
                    </span>
                  )}
                </div>

                <div className="chr-body">
                  {bodyParas.length === 0 ? (
                    <p className="dropcap" style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>
                      {f.excerpt || t('chronicle.unfinished')}
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
              </div>
            )
          })
        )}

        {sessionFolios.length > 0 && auth?.user && (
          <div className="chr-add-folio-row">
            <button
              className="btn3 btn3-ghost"
              onClick={() => setAddFolioFor(s)}
              title={t('chronicle.folio.addAnother.title')}
            >
              {t('chronicle.folio.addAnother')}
            </button>
          </div>
        )}

        <div className="chr-foot">
          <span>
            {i < sorted.length - 1
              ? t('chronicle.previous', { num: String(sorted[i + 1].number ?? 0).padStart(2, '0') })
              : t('chronicle.first')}
          </span>
          <span>{t('chronicle.folioOf', { i: i + 1, n: sorted.length })}</span>
          <span>
            {i > 0 ? t('chronicle.next', { num: String(sorted[i - 1].number ?? 0).padStart(2, '0') }) : t('chronicle.current')}
          </span>
        </div>
      </div>

      {editFolio && (
        <FolioModal
          folio={editFolio}
          onClose={() => setEditFolio(null)}
          onSubmitted={closeAndRefresh(() => setEditFolio(null))}
          onDeleted={closeAndRefresh(() => setEditFolio(null))}
        />
      )}
      {addFolioFor && (
        <FolioModal
          session={addFolioFor}
          onClose={() => setAddFolioFor(null)}
          onSubmitted={closeAndRefresh(() => setAddFolioFor(null))}
        />
      )}
      {addSessionOpen && (
        <FolioModal
          onClose={() => setAddSessionOpen(false)}
          onSubmitted={closeAndRefresh(() => setAddSessionOpen(false))}
        />
      )}
    </div>
  )
}
