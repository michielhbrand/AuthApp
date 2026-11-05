import type { Board, Candidate, Department, PipelineStep } from '@/types/pipeline'

interface BoardSpec {
  title: string
  department: Department
  openPositions: number
  size: number
  steps: Array<[name: string, targetDays: number]>
}

const SPECS: BoardSpec[] = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    openPositions: 2,
    size: 7,
    steps: [
      ['Applied', 2],
      ['Recruiter screen', 3],
      ['Technical interview', 5],
      ['System design', 4],
      ['Offer', 5],
    ],
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    openPositions: 1,
    size: 6,
    steps: [
      ['Applied', 2],
      ['Recruiter screen', 3],
      ['Coding test', 4],
      ['Technical interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Engineering Manager',
    department: 'Engineering',
    openPositions: 1,
    size: 4,
    steps: [
      ['Applied', 3],
      ['Recruiter screen', 3],
      ['Leadership interview', 5],
      ['Panel interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    openPositions: 1,
    size: 5,
    steps: [
      ['Applied', 2],
      ['Phone screen', 3],
      ['Infrastructure exercise', 5],
      ['Technical interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    openPositions: 1,
    size: 6,
    steps: [
      ['Applied', 2],
      ['Portfolio review', 4],
      ['Design exercise', 6],
      ['Panel interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'UX Researcher',
    department: 'Design',
    openPositions: 1,
    size: 5,
    steps: [
      ['Applied', 2],
      ['Portfolio review', 4],
      ['Research exercise', 6],
      ['Panel interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Data Analyst',
    department: 'Analytics',
    openPositions: 1,
    size: 8,
    steps: [
      ['Applied', 2],
      ['Recruiter screen', 3],
      ['SQL assessment', 4],
      ['Case interview', 5],
      ['Final panel', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Data Scientist',
    department: 'Analytics',
    openPositions: 2,
    size: 6,
    steps: [
      ['Applied', 2],
      ['Recruiter screen', 3],
      ['Take-home project', 6],
      ['Technical interview', 5],
      ['Final panel', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Account Executive',
    department: 'Sales',
    openPositions: 3,
    size: 6,
    steps: [
      ['Applied', 2],
      ['Phone screen', 3],
      ['Role play', 4],
      ['Final interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Sales Development Representative',
    department: 'Sales',
    openPositions: 4,
    size: 9,
    steps: [
      ['Applied', 1],
      ['Phone screen', 2],
      ['Cold call test', 3],
      ['Final interview', 4],
      ['Offer', 4],
    ],
  },
  {
    title: 'Operations Coordinator',
    department: 'Operations',
    openPositions: 1,
    size: 4,
    steps: [
      ['Applied', 2],
      ['Phone screen', 3],
      ['Skills test', 4],
      ['Panel interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer success',
    openPositions: 1,
    size: 5,
    steps: [
      ['Applied', 2],
      ['Phone screen', 3],
      ['Scenario call', 4],
      ['Final interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Support Lead',
    department: 'Customer success',
    openPositions: 1,
    size: 3,
    steps: [
      ['Applied', 2],
      ['Phone screen', 3],
      ['Scenario call', 4],
      ['Panel interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Content Strategist',
    department: 'Marketing',
    openPositions: 1,
    size: 5,
    steps: [
      ['Applied', 2],
      ['Portfolio review', 4],
      ['Writing exercise', 6],
      ['Panel interview', 5],
      ['Offer', 5],
    ],
  },
  {
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    openPositions: 1,
    size: 4,
    steps: [
      ['Applied', 2],
      ['Recruiter screen', 3],
      ['Campaign exercise', 5],
      ['Final panel', 5],
      ['Offer', 5],
    ],
  },
]

const FIRST = [
  'Amara',
  'Liam',
  'Sofia',
  'Daniel',
  'Priya',
  'Owen',
  'Lena',
  'Kwame',
  'Mei',
  'Jonas',
  'Noor',
  'Ethan',
  'Zara',
  'Marco',
  'Hana',
  'Tomas',
  'Aisha',
  'Ravi',
  'Clara',
  'Jamal',
  'Yuki',
  'Lucas',
  'Nadia',
  'Kofi',
  'Ingrid',
  'Mateo',
  'Leah',
  'Samuel',
  'Farah',
  'Theo',
]

const LAST = [
  'Okafor',
  'Chen',
  'Rossi',
  'Mensah',
  'Raman',
  'Price',
  'Fischer',
  'Asante',
  'Lin',
  'Berg',
  'Haddad',
  'Brooks',
  'Idowu',
  'Silva',
  'Kim',
  'Vidal',
  'Hassan',
  'Iyer',
  'Moreau',
  'Reid',
  'Tanaka',
  'Novak',
  'Farouk',
  'Quinn',
  'Lindqvist',
  'Ortega',
  'Adler',
  'Brandt',
  'Pereira',
  'Weber',
]

const SOURCES = ['LinkedIn', 'Referral', 'Careers site', 'Indeed', 'Agency']

function mulberry32(seed: number): () => number {
  let value = seed

  return () => {
    value = (value + 0x6d2b79f5) | 0
    let next = value
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function createBoards(): Board[] {
  const rand = mulberry32(2026)
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)] as T
  const between = (low: number, high: number): number => low + Math.floor(rand() * (high - low + 1))
  const usedNames = new Set<string>()
  let candidateId = 0

  return SPECS.map((spec) => {
    const steps: PipelineStep[] = spec.steps.map(([name, targetDays], index) => ({
      id: `s${index + 1}`,
      name,
      targetDays,
    }))
    const candidates: Candidate[] = []

    for (let index = 0; index < spec.size; index += 1) {
      let name = ''

      for (let attempt = 0; attempt < 50 && !name; attempt += 1) {
        const next = `${pick(FIRST)} ${pick(LAST)}`
        if (!usedNames.has(next)) {
          name = next
        }
      }

      if (!name) {
        name = `${pick(FIRST)} ${pick(LAST)} ${usedNames.size + 1}`
      }

      usedNames.add(name)

      const stepIndex = Math.floor(Math.pow(rand(), 1.4) * steps.length)
      const step = steps[stepIndex]

      if (!step) {
        continue
      }

      const roll = rand()
      let status: Candidate['status'] = 'active'

      if (stepIndex === steps.length - 1 && roll < 0.3) {
        status = 'hired'
      } else if (roll > 0.88) {
        status = 'rejected'
      }

      candidateId += 1
      candidates.push({
        id: `c${candidateId}`,
        name,
        source: pick(SOURCES),
        score: between(56, 96),
        stepId: step.id,
        status,
        daysInStep: rand() < 0.2 ? step.targetDays + between(1, 4) : between(0, step.targetDays),
        daysSinceApplied: between(1, 30),
      })
    }

    return {
      id: slugify(spec.title),
      title: spec.title,
      department: spec.department,
      openPositions: spec.openPositions,
      steps,
      candidates,
    }
  })
}
