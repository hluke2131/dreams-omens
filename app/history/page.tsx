/**
 * History — Route: /history
 *
 * Paginated list of saved interpretations.
 * Free tier: local storage only.
 * Reflect+: cloud history from Supabase + top symbols.
 * Stub — full UI in next session.
 */
export default function HistoryPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="text-title-l" style={{ color: 'var(--ink)', marginBottom: 8 }}>
        History
      </h1>
      <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
        [Stub] History screen coming soon.
      </p>
    </main>
  )
}
