import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createBoards } from '@/data/boards'
import {
  flattenBoards,
  groupBoards,
  nextStep,
  summariseBoard,
  summariseBoards,
} from '@/lib/pipeline'
import type { Board, BoardSummary, Candidate, CandidateStatus } from '@/types/pipeline'

interface CandidateContext {
  board: Board
  candidate: Candidate
}

export const useBoardsStore = defineStore('boards', () => {
  const boards = ref<Board[]>(createBoards())

  const groups = computed(() => groupBoards(boards.value))
  const orderedBoards = computed(() => flattenBoards(groups.value))
  const summaries = computed(() => boards.value.map(summariseBoard))
  const totals = computed(() => summariseBoards(boards.value))
  const needsAttention = computed(() =>
    summaries.value
      .filter((summary) => summary.overTarget > 0)
      .sort((a, b) => b.overTarget - a.overTarget),
  )

  function boardById(id: string): Board | undefined {
    return boards.value.find((board) => board.id === id)
  }

  function summaryById(id: string): BoardSummary | undefined {
    return summaries.value.find((summary) => summary.board.id === id)
  }

  function candidateContext(candidateId: string): CandidateContext | undefined {
    for (const board of boards.value) {
      const candidate = board.candidates.find((item) => item.id === candidateId)

      if (candidate) {
        return { board, candidate }
      }
    }

    return undefined
  }

  function moveCandidate(candidateId: string, stepId: string): void {
    const context = candidateContext(candidateId)

    if (!context || !context.board.steps.some((step) => step.id === stepId)) {
      return
    }

    context.candidate.stepId = stepId
    context.candidate.status = 'active'
    context.candidate.daysInStep = 0
  }

  function advanceCandidate(candidateId: string): void {
    const context = candidateContext(candidateId)

    if (!context) {
      return
    }

    const next = nextStep(context.board, context.candidate)

    if (next) {
      moveCandidate(candidateId, next.id)
    }
  }

  function hireCandidate(candidateId: string): void {
    const context = candidateContext(candidateId)

    if (context) {
      context.candidate.status = 'hired'
    }
  }

  function rejectCandidate(candidateId: string): void {
    const context = candidateContext(candidateId)

    if (context) {
      context.candidate.status = 'rejected'
    }
  }

  function setCandidateStatus(candidateId: string, status: CandidateStatus): void {
    const context = candidateContext(candidateId)

    if (context) {
      context.candidate.status = status
    }
  }

  function reopenCandidate(candidateId: string): void {
    setCandidateStatus(candidateId, 'active')
  }

  function reset(): void {
    boards.value = createBoards()
  }

  return {
    boards,
    groups,
    orderedBoards,
    summaries,
    totals,
    needsAttention,
    boardById,
    summaryById,
    advanceCandidate,
    moveCandidate,
    hireCandidate,
    rejectCandidate,
    reopenCandidate,
    reset,
  }
})
