'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth3 } from '../AuthContext'
import { LeadsBoard } from './LeadsBoard'
import { useT } from '@/i18n/LocaleContext'
import type { DictKey } from '@/i18n'
import type { Quest, Lead, Session } from '@/payload-types'

const QUEST_SECTIONS: { id: NonNullable<Quest['status']>; titleKey: DictKey; subKey: DictKey }[] = [
  { id: 'active', titleKey: 'quests.section.active.title', subKey: 'quests.section.active.sub' },
  { id: 'open', titleKey: 'quests.section.open.title', subKey: 'quests.section.open.sub' },
  { id: 'complete', titleKey: 'quests.section.complete.title', subKey: 'quests.section.complete.sub' },
]

const PRIORITY_KEY: Record<NonNullable<Quest['priority']>, DictKey> = {
  main: 'quests.priority.main',
  side: 'quests.priority.side',
  mystery: 'quests.priority.mystery',
}

const PRIORITY_NEXT: Record<NonNullable<Quest['priority']>, NonNullable<Quest['priority']>> = {
  main: 'side',
  side: 'mystery',
  mystery: 'main',
}

export const Quests: React.FC<{ quests: Quest[]; leads: Lead[]; sessions: Session[] }> = ({
  quests,
  leads,
  sessions,
}) => {
  const { t } = useT()
  const [tab, setTab] = useState<'quests' | 'leads'>('quests')

  return (
    <div>
      <div className="qs-tabs">
        <button
          className={'qs-tab' + (tab === 'quests' ? ' active' : '')}
          onClick={() => setTab('quests')}
        >
          {t('qs.tab.quests')} <span className="qs-tab-count">{quests.length}</span>
        </button>
        <button
          className={'qs-tab' + (tab === 'leads' ? ' active' : '')}
          onClick={() => setTab('leads')}
        >
          {t('qs.tab.leads')} <span className="qs-tab-count">{leads.length}</span>
        </button>
      </div>
      {tab === 'quests' ? <QuestsBoard quests={quests} /> : <LeadsBoard leads={leads} sessions={sessions} />}
    </div>
  )
}

const QuestsBoard: React.FC<{ quests: Quest[] }> = ({ quests: initial }) => {
  const auth = useAuth3()
  const { t } = useT()
  const canEdit = auth.isDM || auth.isPlayer
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>(initial)

  // Sync local state from the prop after every server refresh so edits made
  // here (or elsewhere) are reflected without a page reload.
  useEffect(() => {
    setQuests(initial)
  }, [initial])

  const patch = async (id: number, data: Partial<Quest>) => {
    setQuests((qs) => qs.map((q) => (q.id === id ? ({ ...q, ...data } as Quest) : q)))
    await fetch(`/api/quests/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
  }

  const create = async (status: NonNullable<Quest['status']>) => {
    const res = await fetch('/api/quests', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: t('quests.untitled'),
        status,
        priority: 'side',
        summary: t('quests.placeholder.summary'),
        steps: [],
      }),
    })
    if (res.ok) {
      const j = await res.json()
      const doc = j.doc || j
      setQuests((qs) => [...qs, doc as Quest])
      router.refresh()
    }
  }

  const remove = async (id: number) => {
    setQuests((qs) => qs.filter((q) => q.id !== id))
    await fetch(`/api/quests/${id}`, { method: 'DELETE', credentials: 'include' })
    router.refresh()
  }

  return (
    <div className="quests">
      <div className="quests-head">
        <div>
          <div className="eyebrow-sm">{t('quests.eyebrow')}</div>
          <h2>
            {t('quests.headline.a')} <em>{t('quests.headline.b')}</em>
            <br />
            {t('quests.headline.c')}
          </h2>
        </div>
        <div className="sub">{canEdit ? t('quests.sub.canEdit') : t('quests.sub.locked')}</div>
      </div>

      {QUEST_SECTIONS.map((sec) => {
        const list = quests.filter((q) => q.status === sec.id)
        const sectionTitle = t(sec.titleKey)
        return (
          <div className="quests-section" key={sec.id}>
            <div className="quests-section-title">
              <h3>
                {sectionTitle}{' '}
                <span style={{ color: 'var(--ink-4)', fontSize: 14, marginLeft: 8 }}>· {t(sec.subKey)}</span>
              </h3>
              <span className="count">
                {list.length === 1
                  ? t('quests.section.count.one', { n: list.length })
                  : t('quests.section.count.many', { n: list.length })}
              </span>
            </div>

            {list.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                canEdit={canEdit}
                onUpdate={(data) => patch(q.id as number, data)}
                onRemove={() => remove(q.id as number)}
                onCyclePriority={() => patch(q.id as number, { priority: PRIORITY_NEXT[q.priority] })}
                onToggleComplete={() => patch(q.id as number, { status: q.status === 'complete' ? 'active' : 'complete' })}
              />
            ))}

            {list.length === 0 && (
              <div className="quest-locked">{t('quests.empty', { section: sectionTitle.toLowerCase() })}</div>
            )}

            {canEdit && sec.id !== 'complete' && (
              <div className="quest-add-card" onClick={() => create(sec.id)}>
                {t('quests.add', { section: sectionTitle })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const QuestCard: React.FC<{
  quest: Quest
  canEdit: boolean
  onUpdate: (data: Partial<Quest>) => void
  onRemove: () => void
  onCyclePriority: () => void
  onToggleComplete: () => void
}> = ({ quest: q, canEdit, onUpdate, onRemove, onCyclePriority, onToggleComplete }) => {
  const { t } = useT()
  const editable = canEdit ? 'true' : 'false'
  const steps = q.steps || []
  return (
    <div className={'quest-card' + (q.status === 'complete' ? ' complete' : '')}>
      <div
        className={'quest-priority ' + q.priority}
        onClick={canEdit ? onCyclePriority : undefined}
        title={canEdit ? t('quests.priority.title') : ''}
      >
        {t(PRIORITY_KEY[q.priority])}
      </div>

      <div className="quest-body">
        <h4
          className="quest-title"
          contentEditable={editable as any}
          suppressContentEditableWarning
          onBlur={(e) =>
            onUpdate({ title: e.currentTarget.textContent?.trim() || 'Untitled' })
          }
          dangerouslySetInnerHTML={{ __html: q.title }}
        />
        <p
          className="quest-summary"
          contentEditable={editable as any}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ summary: e.currentTarget.textContent?.trim() || '' })}
          dangerouslySetInnerHTML={{ __html: q.summary || '' }}
        />

        {(steps.length > 0 || canEdit) && (
          <ul className="quest-steps">
            {steps.map((s, i) => (
              <li key={i} className={'quest-step' + (s.done ? ' done' : '')}>
                <div
                  className={'quest-step-check' + (s.done ? ' done' : '')}
                  onClick={
                    canEdit
                      ? () => {
                          const next = steps.map((x, j) => (j === i ? { ...x, done: !x.done } : x))
                          onUpdate({ steps: next })
                        }
                      : undefined
                  }
                >
                  {s.done ? '✓' : ''}
                </div>
                <div
                  className="quest-step-text"
                  contentEditable={editable as any}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const t = e.currentTarget.textContent?.trim() || ''
                    if (!t) onUpdate({ steps: steps.filter((_, j) => j !== i) })
                    else onUpdate({ steps: steps.map((x, j) => (j === i ? { ...x, text: t } : x)) })
                  }}
                  dangerouslySetInnerHTML={{ __html: s.text }}
                />
              </li>
            ))}
            {canEdit && (
              <div
                className="quest-add-step"
                onClick={() => onUpdate({ steps: [...steps, { text: t('quests.step.new'), done: false }] })}
              >
                {t('quests.step.add')}
              </div>
            )}
          </ul>
        )}
      </div>

      {canEdit && (
        <div className="quest-actions">
          {q.status !== 'complete' && (
            <span className="quest-action" onClick={onToggleComplete}>
              {t('quests.action.complete')}
            </span>
          )}
          {q.status === 'complete' && (
            <span className="quest-action" onClick={onToggleComplete}>
              {t('quests.action.reopen')}
            </span>
          )}
          <span className="quest-action danger" onClick={onRemove}>
            {t('quests.action.remove')}
          </span>
        </div>
      )}
    </div>
  )
}
