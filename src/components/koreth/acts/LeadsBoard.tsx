'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth3 } from '../AuthContext'
import { LinkText } from '../LinkText'
import type { Lead, Session } from '@/payload-types'

type Status = 'open' | 'following' | 'resolved' | 'dead-end'
const STATUS_ORDER: Status[] = ['open', 'following', 'resolved', 'dead-end']
const NEXT_STATUS: Record<Status, Status> = {
  open: 'following',
  following: 'resolved',
  resolved: 'dead-end',
  'dead-end': 'open',
}

const STATUS_LABEL: Record<Status, string> = {
  open: 'open',
  following: 'following',
  resolved: 'resolved',
  'dead-end': 'dead end',
}

const formatRelative = (iso?: string | null) => {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const diff = Math.max(0, Date.now() - then)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

type LeadNote = NonNullable<Lead['notes']>[number]

export const LeadsBoard: React.FC<{ leads: Lead[]; sessions: Session[] }> = ({ leads: initial, sessions }) => {
  const auth = useAuth3()
  const router = useRouter()
  const canEdit = !!auth?.user
  const [leads, setLeads] = useState<Lead[]>(initial)
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [editingTitle, setEditingTitle] = useState<number | null>(null)
  const [editingBody, setEditingBody] = useState<number | null>(null)

  const visible = filter === 'all' ? leads : leads.filter((l) => l.status === filter)

  const counts: Record<Status | 'all', number> = {
    all: leads.length,
    open: leads.filter((l) => l.status === 'open').length,
    following: leads.filter((l) => l.status === 'following').length,
    resolved: leads.filter((l) => l.status === 'resolved').length,
    'dead-end': leads.filter((l) => l.status === 'dead-end').length,
  }

  const patch = async (id: number, data: Partial<Lead>) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? ({ ...l, ...data } as Lead) : l)))
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
  }

  const create = async () => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Untitled lead',
        body: '',
        status: 'open',
      }),
    })
    if (res.ok) {
      const j = await res.json()
      const doc = (j.doc || j) as Lead
      setLeads((ls) => [doc, ...ls])
      setEditingTitle(doc.id as number)
      router.refresh()
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this lead?')) return
    setLeads((ls) => ls.filter((l) => l.id !== id))
    await fetch(`/api/leads/${id}`, { method: 'DELETE', credentials: 'include' })
    router.refresh()
  }

  const addNote = async (lead: Lead, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const note: LeadNote = {
      author: typeof auth.user?.id === 'number' ? (auth.user.id as number) : null,
      authorLabel: auth.user?.name || null,
      text: trimmed,
      createdAt: new Date().toISOString(),
    }
    const next = [...((lead.notes as LeadNote[]) || []), note]
    await patch(lead.id as number, { notes: next })
  }

  return (
    <div className="leads-act">
      <div className="leads-head">
        <div>
          <div className="eyebrow-sm">Leads</div>
          <h2>
            Hunches, half-clues, <em>and threads we'd lose</em>
            <br />
            if no one wrote them down.
          </h2>
        </div>
        <div className="sub">
          {canEdit
            ? 'Anyone in the Choir can add or amend a lead. Move it along as the picture clears.'
            : 'Sign in to scribble a hunch.'}
        </div>
      </div>

      <div className="leads-filter">
        {(['all', ...STATUS_ORDER] as const).map((k) => (
          <button
            key={k}
            className={'lf-chip' + (filter === k ? ' active' : '') + (k !== 'all' ? ' s-' + k : '')}
            onClick={() => setFilter(k)}
          >
            {k === 'all' ? 'all' : STATUS_LABEL[k]}
            <span className="lf-count">{counts[k]}</span>
          </button>
        ))}
        {canEdit && (
          <button className="lf-add" onClick={create}>
            + new lead
          </button>
        )}
      </div>

      {visible.length === 0 && (
        <div className="leads-empty">
          {leads.length === 0
            ? 'No leads yet. The first hunch lives here.'
            : `Nothing under "${filter === 'all' ? 'all' : STATUS_LABEL[filter as Status]}".`}
        </div>
      )}

      <div className="leads-grid">
        {visible.map((l) => {
          const status = (l.status || 'open') as Status
          const sessionRef = typeof l.linkedSession === 'object' ? l.linkedSession : null
          return (
            <div key={l.id} className={'lead-card s-' + status}>
              <div className="lead-top">
                <button
                  className={'lead-status s-' + status}
                  onClick={canEdit ? () => patch(l.id as number, { status: NEXT_STATUS[status] }) : undefined}
                  title={canEdit ? 'click to advance status' : ''}
                  disabled={!canEdit}
                >
                  {STATUS_LABEL[status]}
                </button>
                {canEdit && (
                  <button className="lead-x" onClick={() => remove(l.id as number)} title="delete lead">
                    ✕
                  </button>
                )}
              </div>

              {editingTitle === l.id ? (
                <input
                  className="lead-title-input"
                  defaultValue={l.title}
                  autoFocus
                  onBlur={(e) => {
                    const v = e.currentTarget.value.trim() || 'Untitled lead'
                    setEditingTitle(null)
                    if (v !== l.title) patch(l.id as number, { title: v })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'Escape') setEditingTitle(null)
                  }}
                />
              ) : (
                <h4
                  className="lead-title"
                  onClick={canEdit ? () => setEditingTitle(l.id as number) : undefined}
                  title={canEdit ? 'click to edit' : ''}
                >
                  {l.title}
                </h4>
              )}

              {editingBody === l.id ? (
                <textarea
                  className="lead-body-input"
                  defaultValue={l.body || ''}
                  autoFocus
                  rows={4}
                  placeholder="What's the hunch?"
                  onBlur={(e) => {
                    const v = e.currentTarget.value
                    setEditingBody(null)
                    if (v !== (l.body || '')) patch(l.id as number, { body: v })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setEditingBody(null)
                  }}
                />
              ) : (
                <div
                  className={'lead-body' + (!l.body ? ' empty' : '')}
                  onClick={canEdit ? () => setEditingBody(l.id as number) : undefined}
                  title={canEdit ? 'click to edit' : ''}
                >
                  {l.body ? <LinkText text={l.body} /> : canEdit ? <span className="lead-placeholder">add a description…</span> : null}
                </div>
              )}

              {sessionRef && (
                <div className="lead-meta">
                  <span className="lead-chip">session {String(sessionRef.number ?? 0).padStart(2, '0')}</span>
                </div>
              )}

              <NotesThread
                lead={l}
                canEdit={canEdit}
                onAdd={(text) => addNote(l, text)}
              />

              <div className="lead-foot">
                <span>by {l.authorLabel || (typeof l.author === 'object' && l.author ? l.author.name : 'unknown')}</span>
                <span>{formatRelative(l.updatedAt)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Suppress unused-var warning for sessions; reserved for v2 picker. */}
      <span style={{ display: 'none' }} aria-hidden>{sessions.length}</span>
    </div>
  )
}

const NotesThread: React.FC<{
  lead: Lead
  canEdit: boolean
  onAdd: (text: string) => Promise<void>
}> = ({ lead, canEdit, onAdd }) => {
  const notes = (lead.notes as LeadNote[]) || []
  const [open, setOpen] = useState(notes.length > 0 && notes.length <= 3)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!draft.trim()) return
    setBusy(true)
    try {
      await onAdd(draft)
      setDraft('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="lead-notes">
      <button className="lead-notes-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '−' : '+'} {notes.length} {notes.length === 1 ? 'note' : 'notes'}
      </button>
      {open && (
        <>
          {notes.length > 0 && (
            <ul className="lead-notes-list">
              {notes.map((n, i) => (
                <li key={i} className="lead-note">
                  <div className="lead-note-by">
                    <span>{n.authorLabel || (typeof n.author === 'object' && n.author ? n.author.name : 'someone')}</span>
                    <span>{formatRelative(n.createdAt)}</span>
                  </div>
                  <div className="lead-note-text">
                    <LinkText text={n.text} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {canEdit && (
            <div className="lead-add-note">
              <textarea
                rows={2}
                placeholder="add a note…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    submit()
                  }
                }}
              />
              <button onClick={submit} disabled={busy || !draft.trim()}>
                {busy ? '…' : 'post'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
