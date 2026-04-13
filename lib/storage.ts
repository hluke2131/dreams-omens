import type { Interpretation } from './types'

const HISTORY_KEY   = 'dreams_omens_history'
const ONBOARDED_KEY = 'hasOnboarded'

// ─── History ──────────────────────────────────────────────────────────────────

export function getHistory(): Interpretation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as Array<Omit<Interpretation, 'date'> & { date: string }>
    return items.map(item => ({ ...item, date: new Date(item.date) }))
  } catch {
    return []
  }
}

export function saveInterpretation(interp: Interpretation): void {
  if (typeof window === 'undefined') return
  const history = getHistory()
  history.unshift(interp)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function getInterpretationById(id: string): Interpretation | null {
  return getHistory().find(i => i.id === id) ?? null
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export function hasOnboarded(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDED_KEY) === 'true'
}

export function setOnboarded(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDED_KEY, 'true')
}
