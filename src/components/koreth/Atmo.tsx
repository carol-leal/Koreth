'use client'

import React, { useEffect, useRef } from 'react'

export const Atmo: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; tw: number }
    const dust: P[] = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.0002,
      vy: -Math.random() * 0.0004 - 0.00005,
      a: Math.random() * 0.5 + 0.1,
      tw: Math.random() * 6,
    }))
    const stars: P[] = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.5,
      r: Math.random() * 1.2 + 0.2,
      vx: 0,
      vy: 0,
      a: 1,
      tw: Math.random() * 6,
    }))

    let w = 0
    let h = 0
    const resize = () => {
      w = c.clientWidth
      h = c.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)

    let raf = 0
    let t = 0
    const loop = () => {
      t++
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const tw = (Math.sin(t * 0.015 + s.tw) + 1) * 0.5
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, 6.3)
        ctx.fillStyle = `oklch(0.95 0.04 290 / ${0.25 + 0.45 * tw})`
        ctx.fill()
      }
      for (const d of dust) {
        d.x += d.vx
        d.y += d.vy
        if (d.y < -0.05) {
          d.y = 1.05
          d.x = Math.random()
        }
        const tw = (Math.sin(t * 0.02 + d.tw) + 1) * 0.5
        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.r, 0, 6.3)
        ctx.fillStyle = `oklch(0.78 0.08 295 / ${d.a * (0.4 + 0.6 * tw)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="atmo">
      <canvas ref={ref} />
    </div>
  )
}
