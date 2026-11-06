import type {
  Board,
  BoardGroup,
  BoardSummary,
  Candidate,
  PipelineStep,
  PipelineTotals,
} from '@/types/pipeline'
import { departments } from '@/types/pipeline'

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

export function isOverTarget(board: Board, candidate: Candidate): boolean {
  const step = stepById(board, candidate.stepId)

  if (!step || candidate.status !== 'active') {
    return false
  }

  return candidate.daysInStep > step.targetDays
}

export function countOverTarget(board: Board): number {
  return activeCandidates(board).filter((candidate) => isOverTarget(board, candidate)).length
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
    overTarget: active.filter((candidate) => isOverTarget(board, candidate)).length,
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
    list.sort((a, b) => a.title.localeCompare(b.title))
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
      totals.overTarget += summary.overTarget
      totals.hired += summary.hired
      totals.rejected += summary.rejected
      return totals
    },
    { openPositions: 0, active: 0, overTarget: 0, hired: 0, rejected: 0 },
  )
}

export function departmentTotals(group: BoardGroup): PipelineTotals {
  return summariseBoards(group.boards)
}
