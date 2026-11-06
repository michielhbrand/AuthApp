import { describe, expect, it } from 'vitest'
import { createBoards } from '@/data/boards'
import {
  countOverTarget,
  groupBoards,
  isOverTarget,
  nextStep,
  previousStep,
  summariseBoard,
  summariseBoards,
} from '@/lib/pipeline'
import type { Board, Candidate } from '@/types/pipeline'

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 'c1',
    name: 'Amara Okafor',
    email: 'amara.okafor@example.com',
    phone: '+1 555 010 2000',
    currentRole: 'Product Designer',
    favorite: false,
    source: 'Referral',
    stepId: 's1',
    status: 'active',
    daysInStep: 2,
    daysSinceApplied: 6,
    education: '',
    experience: '',
    ...overrides,
  }
}

function board(overrides: Partial<Board> = {}): Board {
  return {
    id: 'frontend-engineer',
    title: 'Frontend Engineer',
    department: 'Engineering',
    openPositions: 1,
    steps: [
      { id: 's1', name: 'Applied', targetDays: 2 },
      { id: 's2', name: 'Interview', targetDays: 5 },
    ],
    candidates: [candidate()],
    ...overrides,
  }
}

describe('pipeline helpers', () => {
  it('creates deterministic dummy boards across departments', () => {
    const first = createBoards()
    const second = createBoards()

    expect(first.length).toBeGreaterThan(10)
    expect(first[0]?.title).toBe(second[0]?.title)
    expect(first[0]?.candidates[0]?.name).toBe(second[0]?.candidates[0]?.name)
    expect(new Set(first.map((item) => item.department)).size).toBeGreaterThan(5)
  })

  it('flags active candidates over their step target', () => {
    const item = board()

    expect(isOverTarget(item, candidate({ daysInStep: 2 }))).toBe(false)
    expect(isOverTarget(item, candidate({ daysInStep: 3 }))).toBe(true)
    expect(isOverTarget(item, candidate({ daysInStep: 9, status: 'rejected' }))).toBe(false)
    expect(countOverTarget(item)).toBe(0)
  })

  it('summarises active, closed, and per-step counts', () => {
    const item = board({
      candidates: [
        candidate({ id: 'a', daysInStep: 3 }),
        candidate({ id: 'b', stepId: 's2' }),
        candidate({ id: 'c', status: 'hired', stepId: 's2' }),
        candidate({ id: 'd', status: 'rejected' }),
      ],
    })
    const summary = summariseBoard(item)

    expect(summary.active).toBe(2)
    expect(summary.overTarget).toBe(1)
    expect(summary.hired).toBe(1)
    expect(summary.rejected).toBe(1)
    expect(summary.pipelineCounts).toEqual([1, 1])
  })

  it('finds adjacent steps and stops at the board edges', () => {
    const item = board()

    expect(nextStep(item, candidate())?.id).toBe('s2')
    expect(nextStep(item, candidate({ stepId: 's2' }))).toBeUndefined()
    expect(previousStep(item, candidate({ stepId: 's2' }))?.id).toBe('s1')
    expect(previousStep(item, candidate())).toBeUndefined()
  })

  it('groups boards in department order and sums totals', () => {
    const boards = createBoards()
    const groups = groupBoards(boards)

    expect(groups[0]?.department).toBe('Engineering')
    expect(groups[groups.length - 1]?.department).toBe('Marketing')

    const totals = summariseBoards(boards)
    expect(totals.openPositions).toBe(boards.reduce((sum, item) => sum + item.openPositions, 0))
    expect(totals.active).toBeGreaterThan(0)
  })
})
