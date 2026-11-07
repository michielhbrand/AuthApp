import type {
  Board,
  BoardGroup,
  BoardSummary,
  Candidate,
  PipelineStep,
  PipelineTotals,
} from '@/types/pipeline'
import { departments } from '@/types/pipeline'

const DAY_MS = 86_400_000

export function stepById(board: Board, stepId: string): PipelineStep | undefined {
  return board.steps.find((step) => step.id === stepId)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function activeCandidates(board: Board): Candidate[] {
  return board.candidates.filter((candidate) => candidate.status === 'active')
}

export function candidatesInStep(board: Board, stepId: string): Candidate[] {
  return activeCandidates(board).filter((candidate) => candidate.stepId === stepId)
}

export function closedCandidates(board: Board, status: 'hired' | 'rejected'): Candidate[] {
  return board.candidates.filter((candidate) => candidate.status === status)
}

export function daysSince(isoDate: string, now: Date = new Date()): number {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return 0
  }

  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_MS))
}

export function daysInStep(candidate: Candidate, now: Date = new Date()): number {
  return daysSince(candidate.stepEnteredAt, now)
}

export function daysSinceApplied(candidate: Candidate, now: Date = new Date()): number {
  return daysSince(candidate.appliedAt, now)
}

export function isOverdue(board: Board, now: Date = new Date()): boolean {
  return board.deadline < now.toISOString().slice(0, 10)
}

export function formatDeadline(deadline: string): string {
  const parts = deadline.split('-').map(Number)

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return deadline
  }

  const [year, month, day] = parts as [number, number, number]

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function nextStep(board: Board, candidate: Candidate): PipelineStep | undefined {
  const index = board.steps.findIndex((step) => step.id === candidate.stepId)
  return index >= 0 ? board.steps[index + 1] : undefined
}

export function previousStep(board: Board, candidate: Candidate): PipelineStep | undefined {
  const index = board.steps.findIndex((step) => step.id === candidate.stepId)
  return index > 0 ? board.steps[index - 1] : undefined
}

export function isInFinalStep(board: Board, candidate: Candidate): boolean {
  const index = board.steps.findIndex((step) => step.id === candidate.stepId)
  return index === board.steps.length - 1
}

export function summariseBoard(board: Board): BoardSummary {
  const active = activeCandidates(board)

  return {
    board,
    active: active.length,
    overdue: isOverdue(board),
    hired: closedCandidates(board, 'hired').length,
    rejected: closedCandidates(board, 'rejected').length,
    stepCounts: board.steps.map((step) => ({
      step,
      count: active.filter((candidate) => candidate.stepId === step.id).length,
    })),
    pipelineCounts: board.steps.map(
      (step) => active.filter((candidate) => candidate.stepId === step.id).length,
    ),
  }
}

export function groupBoards(boards: Board[], order: readonly string[] = departments): BoardGroup[] {
  const grouped = new Map<string, Board[]>()

  for (const board of boards) {
    const list = grouped.get(board.department) ?? []
    list.push(board)
    grouped.set(board.department, list)
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }

  const known = new Set(order)
  const groups: BoardGroup[] = order
    .filter((department) => grouped.has(department))
    .map((department) => ({
      department,
      boards: grouped.get(department) ?? [],
    }))

  for (const [department, list] of grouped) {
    if (!known.has(department)) {
      groups.push({ department, boards: list })
    }
  }

  return groups
}

export function flattenBoards(groups: BoardGroup[]): Board[] {
  return groups.flatMap((group) => group.boards)
}

export function summariseBoards(boards: Board[]): PipelineTotals {
  return boards.reduce<PipelineTotals>(
    (totals, board) => {
      const summary = summariseBoard(board)
      totals.openPositions += board.openPositions
      totals.active += summary.active
      totals.overdue += summary.overdue ? 1 : 0
      totals.hired += summary.hired
      totals.rejected += summary.rejected
      return totals
    },
    { openPositions: 0, active: 0, overdue: 0, hired: 0, rejected: 0 },
  )
}

export function departmentTotals(group: BoardGroup): PipelineTotals {
  return summariseBoards(group.boards)
}
