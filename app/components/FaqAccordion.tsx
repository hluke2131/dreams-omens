'use client'

import { useState } from 'react'

export interface FaqItem {
  q: string
  a: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  function toggle(i: number) {
    setOpen(prev => (prev === i ? null : i))
  }

  return (
    <div className="card-primary" style={{ padding: 0, overflow: 'hidden' }}>
      {items.map(({ q, a }, i) => (
        <div key={i} className="faq-item">
          <button
            className="faq-question"
            onClick={() => toggle(i)}
            aria-expanded={open === i}
          >
            <span
              className="text-title-m"
              style={{ color: 'var(--ink)', fontWeight: 600 }}
            >
              {q}
            </span>
            <span
              style={{
                color:      'var(--cedar)',
                fontSize:   22,
                lineHeight: 1,
                flexShrink: 0,
                fontWeight: 300,
                transition: 'transform 0.2s ease',
                transform:  open === i ? 'rotate(45deg)' : 'none',
              }}
            >
              +
            </span>
          </button>

          <div className={`faq-answer${open === i ? ' open' : ''}`}>
            <div className="faq-answer-inner">
              <p className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: '26px' }}>
                {a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
