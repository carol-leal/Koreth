'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export const LoginForm: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.message || j?.errors?.[0]?.message || 'Sign in failed')
      }
      router.push('/')
      router.refresh()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label className="f-label" htmlFor="login-email">Email</label>
      <input
        id="login-email"
        className="f-input"
        type="email"
        autoFocus
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@koreth.tale"
      />

      <label className="f-label" htmlFor="login-pw" style={{ marginTop: 14 }}>Password</label>
      <input
        id="login-pw"
        className="f-input"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      {err && <div className="login-err">{err}</div>}

      <button type="submit" className="btn3 btn3-primary login-submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
