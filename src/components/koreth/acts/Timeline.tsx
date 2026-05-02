'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth3 } from '../AuthContext'
import { LinkText } from '../LinkText'
import { useT } from '@/i18n/LocaleContext'
import type { DictKey } from '@/i18n'
import type { Event } from '@/payload-types'

type Kind = 'event' | 'battle' | 'discovery' | 'death' | 'pact' | 'prophecy' | 'disaster'
const KINDS: Kind[] = ['event', 'battle', 'discovery', 'death', 'pact', 'prophecy', 'disaster']

const KIND_KEY: Record<Kind, DictKey> = {
  event: 'timeline.kind.event',
  battle: 'timeline.kind.battle',
  discovery: 'timeline.kind.discovery',
  death: 'timeline.kind.death',
  pact: 'timeline.kind.pact',
  prophecy: 'timeline.kind.prophecy',
  disaster: 'timeline.kind.disaster',
}

const KIND_GLYPH: Record<Kind, string> = {
  event: '◆',
  battle: '✕',
  discovery: '✦',
  death: '☠',
  pact: '◈',
  prophecy: '☼',
  disaster: '⚠',
}

type Field = 'title' | 'inWorldDate' | 'description' | 'kind' | 'sortOrder'

export const Timeline: React.FC<{ events: Event[] }> = ({ events: initial }) => {
  const auth = useAuth3()
  const router = useRouter()
  const { t } = useT()
  const canEdit = auth.canEditAny
  const [events, setEvents] = useState<Event[]>(initial)
  const [editing, setEditing] = useState<{ id: number; field: Field } | null>(null)

  // Sync local state from the prop after every server refresh so edits made
  // here (or elsewhere) are reflected without a page reload. Optimistic
  // updates land immediately; this catches the authoritative server state
  // when router.refresh() resolves.
  useEffect(() => {
    setEvents(initial)
  }, [initial])

  const sorted = [...events].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const patch = async (id: number, data: Partial<Event>) => {
    setEvents((es) => es.map((e) => (e.id === id ? ({ ...e, ...data } as Event) : e)))
    setEditing(null)
    await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
  }

  const create = async () => {
    // Default new events to the end of the timeline.
    const maxOrder = events.reduce((m, e) => Math.max(m, e.sortOrder ?? 0), 0)
    const base = t('timeline.untitled')
    const taken = new Set(events.map((e) => e.title))
    let title = base
    for (let n = 2; taken.has(title); n++) title = `${base} ${n}`
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          inWorldDate: '',
          kind: 'event',
          sortOrder: maxOrder + 10,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.errors?.[0]?.message || j?.message || res.statusText)
      }
      const j = await res.json()
      const doc = (j.doc || j) as Event
      setEvents((es) => [...es, doc])
      setEditing({ id: doc.id as number, field: 'title' })
      router.refresh()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  const remove = async (id: number) => {
    if (!confirm(t('timeline.delete.confirm'))) return
    setEvents((es) => es.filter((e) => e.id !== id))
    await fetch(`/api/events/${id}`, { method: 'DELETE', credentials: 'include' })
    router.refresh()
  }

  const cycleKind = (id: number, current: Kind) => {
    const idx = KINDS.indexOf(current)
    const next = KINDS[(idx + 1) % KINDS.length]
    patch(id, { kind: next })
  }

  const isEditing = (id: number, field: Field) => editing?.id === id && editing?.field === field

  return (
    <div className="timeline-act">
      <div className="timeline-head">
        <div>
          <div className="eyebrow-sm">{t('timeline.eyebrow')}</div>
          <h2>
            {t('timeline.headline.a')} <em>{t('timeline.headline.b')}</em>
          </h2>
        </div>
        <div className="sub">{canEdit ? t('timeline.sub.canEdit') : t('timeline.sub.locked')}</div>
      </div>

      {canEdit && (
        <div className="timeline-add-row">
          <button className="lf-add" onClick={create}>
            {t('timeline.add')}
          </button>
        </div>
      )}

      {sorted.length === 0 && <div className="timeline-empty">{t('timeline.empty')}</div>}

      <div className="timeline-list">
        <div className="timeline-spine" aria-hidden />

        {sorted.map((e) => {
          const id = e.id as number
          const kind = (e.kind || 'event') as Kind
          const sessionRef = typeof e.linkedSession === 'object' ? e.linkedSession : null
          return (
            <div className={'tl-row tl-kind-' + kind} key={id}>
              <button
                className={'tl-marker tl-kind-' + kind}
                onClick={canEdit ? () => cycleKind(id, kind) : undefined}
                disabled={!canEdit}
                title={canEdit ? t('timeline.kind.click') : t(KIND_KEY[kind])}
              >
                {KIND_GLYPH[kind]}
              </button>

              <div className="tl-card">
                <div className="tl-row-top">
                  {isEditing(id, 'inWorldDate') ? (
                    <input
                      className="tl-edit-input tl-edit-date"
                      defaultValue={e.inWorldDate || ''}
                      autoFocus
                      placeholder={t('timeline.placeholder.date')}
                      onBlur={(ev) => patch(id, { inWorldDate: ev.currentTarget.value.trim() })}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter') (ev.target as HTMLInputElement).blur()
                        if (ev.key === 'Escape') setEditing(null)
                      }}
                    />
                  ) : (
                    <span
                      className={'tl-date' + (canEdit ? ' tl-editable' : '')}
                      onClick={canEdit ? () => setEditing({ id, field: 'inWorldDate' }) : undefined}
                      title={canEdit ? t('timeline.click') : ''}
                    >
                      {e.inWorldDate || (canEdit ? t('timeline.placeholder.date') : '—')}
                    </span>
                  )}
                  <span className="tl-kind-label">{t(KIND_KEY[kind])}</span>
                  {canEdit && (
                    <>
                      <span className="tl-spacer" />
                      <button
                        className="tl-x"
                        onClick={() => remove(id)}
                        title={t('timeline.delete.title')}
                        aria-label={t('timeline.delete.title')}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>

                {isEditing(id, 'title') ? (
                  <input
                    className="tl-edit-input tl-edit-title"
                    defaultValue={e.title || ''}
                    autoFocus
                    placeholder={t('timeline.placeholder.title')}
                    onBlur={(ev) => {
                      const v = ev.currentTarget.value.trim() || t('timeline.untitled')
                      patch(id, { title: v })
                    }}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter') (ev.target as HTMLInputElement).blur()
                      if (ev.key === 'Escape') setEditing(null)
                    }}
                  />
                ) : (
                  <h3
                    className={'tl-title' + (canEdit ? ' tl-editable' : '')}
                    onClick={canEdit ? () => setEditing({ id, field: 'title' }) : undefined}
                    title={canEdit ? t('timeline.click') : ''}
                  >
                    {e.title}
                  </h3>
                )}

                {isEditing(id, 'description') ? (
                  <textarea
                    className="tl-edit-input tl-edit-desc"
                    defaultValue={e.description || ''}
                    autoFocus
                    rows={3}
                    placeholder={t('timeline.placeholder.description')}
                    onBlur={(ev) => patch(id, { description: ev.currentTarget.value })}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Escape') setEditing(null)
                    }}
                  />
                ) : (
                  <div
                    className={'tl-desc' + (canEdit ? ' tl-editable' : '') + (!e.description ? ' tl-empty' : '')}
                    onClick={canEdit ? () => setEditing({ id, field: 'description' }) : undefined}
                    title={canEdit ? t('timeline.click') : ''}
                  >
                    {e.description ? <LinkText text={e.description} /> : canEdit ? t('timeline.placeholder.description') : null}
                  </div>
                )}

                <div className="tl-foot">
                  {sessionRef && (
                    <span className="tl-chip">
                      {t('timeline.session', { num: String(sessionRef.number ?? 0).padStart(2, '0') })}
                    </span>
                  )}
                  {canEdit && (
                    isEditing(id, 'sortOrder') ? (
                      <input
                        className="tl-edit-input tl-edit-order"
                        type="number"
                        defaultValue={String(e.sortOrder ?? 0)}
                        autoFocus
                        onBlur={(ev) => {
                          const n = Number(ev.currentTarget.value)
                          patch(id, { sortOrder: Number.isFinite(n) ? n : 0 })
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter') (ev.target as HTMLInputElement).blur()
                          if (ev.key === 'Escape') setEditing(null)
                        }}
                      />
                    ) : (
                      <span
                        className="tl-chip tl-editable"
                        onClick={() => setEditing({ id, field: 'sortOrder' })}
                        title={t('timeline.sortOrder.click')}
                      >
                        {t('timeline.sortOrder.label', { n: e.sortOrder ?? 0 })}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
