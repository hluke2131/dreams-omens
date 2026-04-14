'use client'

/**
 * History — Route: /history
 *
 * Free / Basic: local storage entries only, no pattern dashboard.
 * Reflect+: cloud entries from Supabase + pattern dashboard + CSV export.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getHistory } from '@/lib/storage'
import PageFooter from '@/app/components/PageFooter'
import type { Interpretation, InterpretationRow, SymbolRow } from '@/lib/types'

// SymbolRow already includes insight (nullable) — use it directly
type SymbolWithInsight = SymbolRow

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMonthGroup(isoMonth: string): string {
  const [year, month] = isoMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year:  'numeric',
  })
}

function groupByMonth(items: Interpretation[]): Map<string, Interpretation[]> {
  const map = new Map<string, Interpretation[]>()
  for (const item of items) {
    const d = item.date instanceof Date ? item.date : new Date(item.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const group = map.get(key) ?? []
    group.push(item)
    map.set(key, group)
  }
  return map
}

function rowToInterpretation(row: InterpretationRow): Interpretation {
  return {
    id:     row.id,
    date:   new Date(row.created_at),
    type:   row.type,
    input:  row.input,
    tags:   row.tags,
    lens:   row.lens,
    result: row.result,
  }
}

function exportCSV(items: Interpretation[]) {
  const headers = ['Date', 'Type', 'Input', 'Tags', 'Lens', 'Interpretation']
  const rows = items.map(item => [
    (item.date instanceof Date ? item.date : new Date(item.date))
      .toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    item.type === 'dream' ? 'Dream' : 'Omen',
    item.input.replace(/"/g, '""'),
    item.tags.join('; '),
    item.lens === 'none' ? '' : item.lens,
    item.result.replace(/"/g, '""'),
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `dreams-omens-history-${new Date().toISOString().substring(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Entry component ────────────────────────────────────────────────────────────

function HistoryEntry({ item }: { item: Interpretation }) {
  const [expanded, setExpanded] = useState(false)
  const typeLabel = item.type === 'dream' ? 'Dream' : 'Omen'
  const typeIcon  = item.type === 'dream' ? '🌙' : '👁'
  const d = item.date instanceof Date ? item.date : new Date(item.date)

  return (
    <div
      style={{
        borderBottom: '1px solid var(--divider)',
        paddingBottom: 16,
        marginBottom: 16,
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width:      '100%',
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          textAlign:  'left',
          padding:    0,
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.05em',
                  background:    item.type === 'dream' ? 'var(--cedar)' : 'var(--moss)',
                  color:         'white',
                  padding:       '2px 8px',
                  borderRadius:  20,
                }}
              >
                {typeIcon} {typeLabel.toUpperCase()}
              </span>
              {item.lens !== 'none' && (
                <span
                  style={{
                    fontSize:      10,
                    fontWeight:    600,
                    letterSpacing: '0.04em',
                    color:         'var(--owl-brown)',
                    background:    'var(--sand)',
                    padding:       '2px 8px',
                    borderRadius:  20,
                    border:        '1px solid var(--stroke-soft)',
                  }}
                >
                  {item.lens}
                </span>
              )}
            </div>
            <p
              className="text-helper"
              style={{
                color:      'var(--ink)',
                overflow:   'hidden',
                whiteSpace: expanded ? 'normal' : 'nowrap',
                textOverflow: expanded ? 'unset' : 'ellipsis',
              }}
            >
              {item.input}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <p className="text-caption" style={{ color: 'var(--owl-brown)', whiteSpace: 'nowrap' }}>
              {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
            <span style={{ color: 'var(--owl-brown)', fontSize: 11 }}>
              {expanded ? '▲' : '▼'}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          {item.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {item.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize:   11,
                    padding:    '2px 8px',
                    borderRadius: 20,
                    background: 'var(--sand)',
                    color:      'var(--owl-brown)',
                    border:     '1px solid var(--stroke-soft)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div
            style={{
              background:   'var(--bone)',
              borderRadius: 'var(--radius-s)',
              padding:      '12px 14px',
              border:       '1px solid var(--stroke-soft)',
            }}
          >
            <p className="text-caption" style={{ color: 'var(--owl-brown)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interpretation
            </p>
            <p className="text-helper" style={{ color: 'var(--ink)', lineHeight: '20px', whiteSpace: 'pre-wrap' }}>
              {item.result}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pattern dashboard ─────────────────────────────────────────────────────────

function PatternDashboard({ symbols, entryCount }: { symbols: SymbolWithInsight[]; entryCount: number }) {
  if (entryCount < 3) {
    return (
      <div className="card-secondary" style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🔭</div>
        <p className="text-body" style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 6 }}>
          Patterns
        </p>
        <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
          Not enough data yet — keep interpreting to unlock patterns.
          <br />({entryCount}/3 entries saved)
        </p>
      </div>
    )
  }

  return (
    <div className="card-secondary" style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>🔭</span>
        <p className="text-title-m" style={{ color: 'var(--ink)' }}>Patterns</p>
      </div>

      {symbols.length === 0 ? (
        <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
          Symbol data is being built up — keep interpreting.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {symbols.map((sym, i) => (
            <div
              key={sym.id}
              style={{
                display:      'flex',
                gap:          12,
                alignItems:   'flex-start',
                paddingBottom: i < symbols.length - 1 ? 14 : 0,
                borderBottom:  i < symbols.length - 1 ? '1px solid var(--divider)' : 'none',
              }}
            >
              <div
                style={{
                  minWidth:       32,
                  height:         32,
                  borderRadius:   '50%',
                  background:     'var(--sage)',
                  color:          'white',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       13,
                  fontWeight:     700,
                  flexShrink:     0,
                }}
              >
                {sym.count}
              </div>
              <div style={{ flex: 1 }}>
                <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 2, textTransform: 'capitalize' }}>
                  {sym.name}
                </p>
                {sym.insight ? (
                  <p className="text-caption" style={{ color: 'var(--text-secondary)', lineHeight: '16px' }}>
                    {sym.insight}
                  </p>
                ) : (
                  <p className="text-caption" style={{ color: 'var(--owl-brown)', fontStyle: 'italic' }}>
                    Generating insight…
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter()

  const [isReflectPlus, setIsReflectPlus] = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [entries,       setEntries]       = useState<Interpretation[]>([])
  const [symbols,       setSymbols]       = useState<SymbolWithInsight[]>([])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data }) => {
      // Always load local history regardless of tier
      const local = getHistory()

      if (!data.user) {
        setEntries(local)
        setLoading(false)
        return
      }

      // Check subscription
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', data.user.id)
        .single()

      const isRP =
        profile?.subscription_status === 'active' &&
        profile?.subscription_tier === 'reflect_plus'

      setIsReflectPlus(isRP)

      if (!isRP) {
        setEntries(local)
        setLoading(false)
        return
      }

      // Reflect+: load cloud history
      const { data: rows } = await supabase
        .from('interpretations')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

      const cloud: Interpretation[] = (rows ?? []).map(rowToInterpretation)
      setEntries(cloud)

      // Load top 5 symbols
      const { data: symRows } = await supabase
        .from('symbols')
        .select('*')
        .eq('user_id', data.user.id)
        .order('count', { ascending: false })
        .limit(5)

      const symsWithInsights: SymbolWithInsight[] = (symRows ?? []).map(s => ({
        ...s,
        insight: s.insight ?? null,
      }))

      setSymbols(symsWithInsights)
      setLoading(false)

      // For symbols missing insights, generate them (one API call covers all)
      const missing = symsWithInsights.filter(s => !s.insight)
      if (missing.length > 0) {
        generateInsights(data.user.id, missing, symsWithInsights, setSymbols, supabase)
      }
    })
  }, [router])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
      </main>
    )
  }

  const grouped = groupByMonth(entries)
  const sortedMonths = [...grouped.keys()].sort((a, b) => b.localeCompare(a))

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
          <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>History</h1>
        </div>
        {isReflectPlus && entries.length > 0 && (
          <button
            onClick={() => exportCSV(entries)}
            style={{
              background:   'none',
              border:       '1px solid var(--stroke-soft)',
              borderRadius: 'var(--radius-s)',
              padding:      '6px 12px',
              fontSize:     12,
              fontWeight:   600,
              color:        'var(--cedar)',
              cursor:       'pointer',
              fontFamily:   'inherit',
            }}
          >
            Export CSV
          </button>
        )}
      </header>

      {/* Pattern Dashboard (Reflect+ only) */}
      {isReflectPlus && (
        <PatternDashboard symbols={symbols} entryCount={entries.length} />
      )}

      {/* Upsell for non-Reflect+ */}
      {!isReflectPlus && (
        <div
          className="card-secondary"
          style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <div>
            <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 2 }}>
              Cloud history &amp; patterns
            </p>
            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              Reflect+ saves everything automatically.
            </p>
          </div>
          <Link href="/paywall" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button
              style={{
                background:   'var(--sage)',
                color:        'white',
                border:       'none',
                borderRadius: 'var(--radius-s)',
                padding:      '8px 14px',
                fontSize:     12,
                fontWeight:   700,
                cursor:       'pointer',
                fontFamily:   'inherit',
              }}
            >
              Upgrade
            </button>
          </Link>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="card-primary" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
          <p className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>
            Nothing saved yet
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            Your interpretations will appear here after your first session.
          </p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Start Interpreting</button>
          </Link>
        </div>
      )}

      {/* Grouped entries */}
      {sortedMonths.map(month => (
        <div key={month} style={{ marginBottom: 32 }}>
          <p
            className="text-caption"
            style={{
              color:         'var(--owl-brown)',
              fontWeight:    700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom:  14,
            }}
          >
            {formatMonthGroup(month)}
          </p>
          {(grouped.get(month) ?? []).map(item => (
            <HistoryEntry key={item.id} item={item} />
          ))}
        </div>
      ))}

      <footer style={{ textAlign: 'center', marginTop: 16 }}>
        <PageFooter />
      </footer>

    </main>
  )
}

// ── Insight generation ─────────────────────────────────────────────────────────

async function generateInsights(
  userId:      string,
  missing:     SymbolWithInsight[],
  allSymbols:  SymbolWithInsight[],
  setSymbols:  React.Dispatch<React.SetStateAction<SymbolWithInsight[]>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase:    any,
) {
  for (const sym of missing) {
    try {
      const res = await fetch('/api/symbols/insight', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ symbolId: sym.id, name: sym.name, count: sym.count }),
      })
      if (!res.ok) continue
      const { insight } = await res.json() as { insight: string }

      // Update local state immediately
      setSymbols(prev =>
        prev.map(s => s.id === sym.id ? { ...s, insight } : s),
      )
    } catch {
      // Non-critical; skip silently
    }
  }
}
