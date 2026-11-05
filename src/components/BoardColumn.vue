<script setup lang="ts">
import CandidateCard from '@/components/CandidateCard.vue'
import type { Board, Candidate, PipelineStep } from '@/types/pipeline'

defineProps<{
  board: Board
  step: PipelineStep
  index: number
  candidates: Candidate[]
}>()
</script>

<template>
  <section class="board-column" :aria-label="step.name">
    <header class="board-column__head">
      <div class="board-column__title">
        <span class="step-index">{{ index + 1 }}</span>
        <h3>{{ step.name }}</h3>
      </div>
      <p>
        {{ step.targetDays }}-day target. {{ candidates.length }}
        {{ candidates.length === 1 ? 'candidate' : 'candidates' }}.
      </p>
    </header>

    <div class="board-column__body">
      <CandidateCard
        v-for="candidate in candidates"
        :key="candidate.id"
        :board="board"
        :candidate="candidate"
      />
      <p v-if="!candidates.length" class="board-column__empty">No one in this step.</p>
    </div>
  </section>
</template>
