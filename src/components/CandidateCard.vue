<script setup lang="ts">
import { computed } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import {
  daysInStep as getDaysInStep,
  daysSinceApplied as getDaysSinceApplied,
  initials as getInitials,
  nextStep,
  previousStep,
  stepById,
} from '@/lib/pipeline'
import type { Board, Candidate } from '@/types/pipeline'

const props = defineProps<{
  board: Board
  candidate: Candidate
  dragging?: boolean
  settling?: boolean
}>()

const emit = defineEmits<{
  'drag-start': [candidate: Candidate]
  'drag-end': []
  'open-profile': [candidate: Candidate]
}>()

const store = useBoardsStore()

const step = computed(() => stepById(props.board, props.candidate.stepId))
const next = computed(() => nextStep(props.board, props.candidate))
const previous = computed(() => previousStep(props.board, props.candidate))
const canDrag = computed(() => Boolean(next.value || previous.value))

const initials = computed(() => getInitials(props.candidate.name))

const moveTargets = computed(() =>
  props.board.steps.filter((target) => target.id !== props.candidate.stepId),
)

const daysLabel = computed(() => {
  const days = getDaysInStep(props.candidate)

  if (days === 0) {
    return 'Entered this step today'
  }

  return `${days} ${days === 1 ? 'day' : 'days'} in step`
})

const appliedLabel = computed(() => {
  const days = getDaysSinceApplied(props.candidate)

  if (days === 0) {
    return 'applied today'
  }

  return `applied ${days} ${days === 1 ? 'day' : 'days'} ago`
})

function advance(): void {
  if (next.value) {
    store.advanceCandidate(props.candidate.id)
    return
  }

  store.hireCandidate(props.candidate.id)
}

function openProfile(): void {
  if (!props.dragging) {
    emit('open-profile', props.candidate)
  }
}

function onDragStart(event: DragEvent): void {
  if (!canDrag.value || !event.dataTransfer) {
    event.preventDefault()
    return
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.candidate.id)
  emit('drag-start', props.candidate)
}

function onDragEnd(): void {
  emit('drag-end')
}
</script>

<template>
  <article
    class="candidate-card candidate-card--clickable"
    :class="{
      'candidate-card--draggable': canDrag,
      'candidate-card--dragging': dragging,
      'candidate-card--settling': settling,
    }"
    :draggable="canDrag"
    role="button"
    tabindex="0"
    :aria-label="`Open applicant profile for ${candidate.name}`"
    @click="openProfile"
    @keydown.enter.self="openProfile"
    @keydown.space.self.prevent="openProfile"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="candidate-card__top">
      <span class="candidate-avatar" aria-hidden="true">{{ initials }}</span>
      <div class="candidate-card__identity">
        <p class="candidate-name">{{ candidate.name }}</p>
        <p class="candidate-source">{{ candidate.currentRole || candidate.email }}</p>
      </div>
    </div>

    <p class="candidate-days">{{ daysLabel }}. {{ appliedLabel }}.</p>

    <div class="candidate-actions" @click.stop>
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

    <details class="candidate-more" @click.stop>
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
