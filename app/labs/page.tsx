/**
 * Labs / Early Access — Route: /labs
 *
 * Experimental features for Reflect+ subscribers.
 * Current features are all in teaser/coming-soon state.
 * Stub — full UI in next session.
 */
const LAB_FEATURES = [
  { key: 'dream-journal',       name: 'Dream Journal',       teaser: 'Coming Soon' },
  { key: 'symbol-timeline',     name: 'Symbol Timeline',     teaser: null },
  { key: 'bulk-export',         name: 'Bulk Export',         teaser: null },
  { key: 'beta-archetype-map',  name: 'Archetype Map (Beta)', teaser: 'Early Preview' },
] as const

export default function LabsPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="text-title-l" style={{ color: 'var(--ink)', marginBottom: 8 }}>
        Labs — Early Access
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        {LAB_FEATURES.map((f) => (
          <div key={f.key} className="card-secondary" style={{ opacity: 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="text-title-m" style={{ color: 'var(--ink)' }}>{f.name}</p>
              {f.teaser && (
                <span className="text-caption" style={{ background: 'var(--cedar)', color: 'white', padding: '2px 8px', borderRadius: 8 }}>
                  {f.teaser}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-caption" style={{ color: 'var(--owl-brown)', marginTop: 20 }}>
        [Stub] Labs screen — all features locked pending implementation.
      </p>
    </main>
  )
}
