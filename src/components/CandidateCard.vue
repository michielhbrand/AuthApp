<script setup lang="ts">
import { computed } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import { initials as getInitials, isOverTarget, nextStep, stepById } from '@/lib/pipeline'
import type { Board, Candidate } from '@/types/pipeline'

const props = defineProps<{
  board: Board
  candidate: Candidate
}>()

const store = useBoardsStore()

const step = computed(() => stepById(props.board, props.candidate.stepId))
const overTarget = computed(() => isOverTarget(props.board, props.candidate))
const next = computed(() => nextStep(props.board, props.candidate))

const initials = computed(() => getInitials(props.candidate.name))

const moveTargets = computed(() =>
  props.board.steps.filter((target) => target.id !== props.candidate.stepId),
)

const daysLabel = computed(() => {
  const days = props.candidate.daysInStep

  if (days === 0) {
    return 'Entered this step today'
  }

  return `${days} ${days === 1 ? 'day' : 'days'} in step`
})

function advance(): void {
  if (next.value) {
    store.advanceCandidate(props.candidate.id)
    return
  }

  store.hireCandidate(props.candidate.id)
}
</script>

<template>
  <article class="candidate-card" :class="{ 'candidate-card--flagged': overTarget }">
    <div class="candidate-card__top">
      <span class="candidate-avatar" aria-hidden="true">{{ initials }}</span>
      <div class="candidate-card__identity">
        <p class="candidate-name">{{ candidate.name }}</p>
        <p class="candidate-source">{{ candidate.source }}</p>
      </div>
      <span class="candidate-score" :title="`Score ${candidate.score}`">{{ candidate.score }}</span>
    </div>

    <p class="candidate-days" :class="{ 'candidate-days--over': overTarget }">
      {{ daysLabel }}<template v-if="overTarget">, over target</template>. Applied
      {{ candidate.daysSinceApplied }} {{ candidate.daysSinceApplied === 1 ? 'day' : 'days' }} ago.
    </p>

    <div class="candidate-actions">
      <v-btn
        block
        color="primary"
        :variant="next ? 'outlined' : 'flat'"
        size="small"
        @click="advance"
      >
        {{ next ? `Advance to ${next.name}` : 'Mark hired' }}
      </v-btn>
    </div>

    <details class="candidate-more">
      <summary>Move or reject</summary>
      <div class="candidate-more__list">
        <v-btn
          v-for="target in moveTargets"
          :key="target.id"
          size="small"
          variant="text"
          @click="store.moveCandidate(candidate.id, target.id)"
        >
          {{ target.name }}
        </v-btn>
        <v-btn
          color="error"
          size="small"
          variant="text"
          @click="store.rejectCandidate(candidate.id)"
        >
          Reject
        </v-btn>
      </div>
    </details>

    <p v-if="step" class="candidate-step">Current step: {{ step.name }}</p>
  </article>
</template>
