import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBoardsStore } from '@/stores/boards'

describe('boards store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('advances a candidate to the next step and resets their time in step', () => {
    const store = useBoardsStore()
    const board = store.boards[0]

    expect(board).toBeDefined()
    if (!board) return

    const candidate = board.candidates.find(
      (item) =>
        item.status === 'active' &&
        board.steps.findIndex((step) => step.id === item.stepId) < board.steps.length - 1,
    )

    expect(candidate).toBeDefined()
    if (!candidate) return

    const originalStep = candidate.stepId
    store.advanceCandidate(candidate.id)

    expect(candidate.stepId).not.toBe(originalStep)
    expect(candidate.daysInStep).toBe(0)
  })

  it('moves a candidate to an explicit step', () => {
    const store = useBoardsStore()
    const board = store.boards[0]
    const target = board ? board.steps[board.steps.length - 1] : undefined
    const candidate = board?.candidates[0]

    expect(target).toBeDefined()
    expect(candidate).toBeDefined()
    if (!target || !candidate) return

    store.moveCandidate(candidate.id, target.id)

    expect(candidate.stepId).toBe(target.id)
    expect(candidate.status).toBe('active')
    expect(candidate.daysInStep).toBe(0)
  })

  it('rejects, reopens, and hires candidates', () => {
    const store = useBoardsStore()
    const candidate = store.boards[0]?.candidates[0]

    expect(candidate).toBeDefined()
    if (!candidate) return

    store.rejectCandidate(candidate.id)
    expect(candidate.status).toBe('rejected')

    store.reopenCandidate(candidate.id)
    expect(candidate.status).toBe('active')

    store.hireCandidate(candidate.id)
    expect(candidate.status).toBe('hired')
  })

  it('updates applicant profile fields and favourites', () => {
    const store = useBoardsStore()
    const candidate = store.boards[0]?.candidates[0]

    expect(candidate).toBeDefined()
    if (!candidate) return

    store.updateCandidateField(candidate.id, 'email', 'new.address@example.com')
    store.updateCandidateField(candidate.id, 'currentRole', 'Staff Engineer')

    expect(candidate.email).toBe('new.address@example.com')
    expect(candidate.currentRole).toBe('Staff Engineer')

    const initialFavorite = candidate.favorite
    store.toggleFavorite(candidate.id)
    expect(candidate.favorite).toBe(!initialFavorite)

    store.toggleFavorite(candidate.id)
    expect(candidate.favorite).toBe(initialFavorite)
  })

  it('updates the education and experience notes', () => {
    const store = useBoardsStore()
    const candidate = store.boards[0]?.candidates[0]

    expect(candidate).toBeDefined()
    if (!candidate) return

    store.updateCandidateField(candidate.id, 'education', 'BSc Design, 2020 - 2024')
    store.updateCandidateField(candidate.id, 'experience', 'Designer, Northwind Labs')

    expect(candidate.education).toBe('BSc Design, 2020 - 2024')
    expect(candidate.experience).toBe('Designer, Northwind Labs')
  })

  it('derives needs-attention boards and totals', () => {
    const store = useBoardsStore()

    expect(store.summaries.length).toBe(store.boards.length)
    expect(store.totals.active).toBeGreaterThan(0)
    expect(store.needsAttention.every((summary) => summary.overTarget > 0)).toBe(true)
  })

  it('resets back to the seeded data', () => {
    const store = useBoardsStore()
    const initialActive = store.totals.active
    const candidate = store.boards[0]?.candidates.find((item) => item.status === 'active')

    expect(candidate).toBeDefined()
    if (!candidate) return

    store.hireCandidate(candidate.id)
    expect(store.totals.active).toBe(initialActive - 1)

    store.reset()
    expect(store.totals.active).toBe(initialActive)
  })
})
