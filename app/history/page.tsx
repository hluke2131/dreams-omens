'use client'

/**
 * History — Route: /history
 *
 * Free / Basic: local storage entries only, no pattern dashboard.
 * Reflect+: cloud entries from Supabase + pattern dashboard + CSV export + delete.
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

// ── Trash icon ─────────────────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg
      width="15" height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

// ── Entry component ────────────────────────────────────────────────────────────

function HistoryEntry({
  item,
  isReflectPlus,
  onDelete,
  deleting,
}: {
  item:          Interpretation
  isReflectPlus: boolean
  onDelete:      (id: string) => void
  deleting:      boolean
}) {
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
        opacity: deleting ? 0.4 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            flex:       1,
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            textAlign:  'left',
            padding:    0,
            fontFamily: 'inherit',
            minWidth:   0,
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
                  color:        'var(--ink)',
                  overflow:     'hidden',
                  whiteSpace:   expanded ? 'normal' : 'nowrap',
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

        {/* Delete button — Reflect+ only */}
        {isReflectPlus && (
          <button
            onClick={() => onDelete(item.id)}
            disabled={deleting}
            aria-label="Delete entry"
            style={{
              background:  'none',
              border:      'none',
              cursor:      deleting ? 'default' : 'pointer',
              padding:     '4px 6px',
              color:       'var(--owl-brown)',
              flexShrink:  0,
              marginTop:   2,
              borderRadius: 'var(--radius-s)',
              opacity:     deleting ? 0.3 : 0.6,
              transition:  'opacity 0.15s ease',
            }}
            onMouseEnter={e => { if (!deleting) (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            onMouseLeave={e => { if (!deleting) (e.currentTarget as HTMLButtonElement).style.opacity = '0.6' }}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          {item.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {item.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize:     11,
                    padding:      '2px 8px',
                    borderRadius: 20,
                    background:   'var(--sand)',
                    color:        'var(--owl-brown)',
                    border:       '1px solid var(--stroke-soft)',
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

// ── Delete-all confirmation modal ─────────────────────────────────────────────

function DeleteAllModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void
  onCancel:  () => void
  deleting:  boolean
}) {
  return (
    <div
      style={{
        position:   'fixed',
        inset:      0,
        background: 'rgba(29,27,22,0.5)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:     1000,
        padding:    '0 20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        style={{
          background:   'var(--bone)',
          borderRadius: 'var(--radius-m)',
          padding:      '28px 24px',
          maxWidth:     360,
          width:        '100%',
          boxShadow:    '0 16px 40px rgba(29,27,22,0.2)',
        }}
      >
        <p className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 10 }}>
          Delete all history?
        </p>
        <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          This will permanently delete all your saved interpretations and symbols. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              flex:         1,
              padding:      '12px 0',
              borderRadius: 'var(--radius-s)',
              border:       '1px solid var(--stroke-soft)',
              background:   'var(--sand)',
              color:        'var(--ink)',
              fontSize:     14,
              fontWeight:   600,
              cursor:       deleting ? 'default' : 'pointer',
              fontFamily:   'inherit',
              opacity:      deleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex:         1,
              padding:      '12px 0',
              borderRadius: 'var(--radius-s)',
              border:       'none',
              background:   'var(--cedar)',
              color:        'white',
              fontSize:     14,
              fontWeight:   700,
              cursor:       deleting ? 'default' : 'pointer',
              fontFamily:   'inherit',
              opacity:      deleting ? 0.6 : 1,
            }}
          >
            {deleting ? 'Deleting…' : 'Delete all'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter()

  const [isReflectPlus,   setIsReflectPlus]   = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [entries,         setEntries]         = useState<Interpretation[]>([])
  const [symbols,         setSymbols]         = useState<SymbolWithInsight[]>([])
  const [deletingId,      setDeletingId]      = useState<string | null>(null)
  const [showDeleteAll,   setShowDeleteAll]   = useState(false)
  const [deletingAll,     setDeletingAll]     = useState(false)

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

  async function deleteEntry(id: string) {
    if (deletingId) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/interpretations', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      setEntries(prev => prev.filter(e => e.id !== id))
      // Remove symbol insights if count drops (re-fetch symbols)
      setSymbols(prev => prev.filter(s => s.count > 0))
    } catch {
      // silently ignore — entry remains in UI
    } finally {
      setDeletingId(null)
    }
  }

  async function deleteAll() {
    setDeletingAll(true)
    try {
      const res = await fetch('/api/interpretations', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ all: true }),
      })
      if (!res.ok) throw new Error('Delete all failed')
      setEntries([])
      setSymbols([])
      setShowDeleteAll(false)
    } catch {
      // silently ignore
    } finally {
      setDeletingAll(false)
    }
  }

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
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowDeleteAll(true)}
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
              Delete All
            </button>
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
          </div>
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
            <HistoryEntry
              key={item.id}
              item={item}
              isReflectPlus={isReflectPlus}
              onDelete={deleteEntry}
              deleting={deletingId === item.id}
            />
          ))}
        </div>
      ))}

      <footer style={{ textAlign: 'center', marginTop: 16 }}>
        <PageFooter />
      </footer>

      {/* Delete-all confirmation modal */}
      {showDeleteAll && (
        <DeleteAllModal
          onConfirm={deleteAll}
          onCancel={() => setShowDeleteAll(false)}
          deleting={deletingAll}
        />
      )}

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
