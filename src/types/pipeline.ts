export const departments = [
  'Engineering',
  'Design',
  'Analytics',
  'Sales',
  'Operations',
  'Customer success',
  'Marketing',
] as const

export type Department = (typeof departments)[number]

export type CandidateStatus = 'active' | 'hired' | 'rejected'

export interface PipelineStep {
  id: string
  name: string
  targetDays: number
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  currentRole: string
  favorite: boolean
  source: string
  stepId: string
  status: CandidateStatus
  daysInStep: number
  daysSinceApplied: number
  education: string
  experience: string
}

export interface Board {
  id: string
  title: string
  department: Department
  openPositions: number
  steps: PipelineStep[]
  candidates: Candidate[]
}

export interface StepCount {
  step: PipelineStep
  count: number
}

export interface BoardSummary {
  board: Board
  active: number
  overTarget: number
  hired: number
  rejected: number
  stepCounts: StepCount[]
  pipelineCounts: number[]
}

export interface BoardGroup {
  department: string
  boards: Board[]
}

export interface PipelineTotals {
  openPositions: number
  active: number
  overTarget: number
  hired: number
  rejected: number
}
