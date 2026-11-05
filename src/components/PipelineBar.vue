<script setup lang="ts">
import { computed } from 'vue'
import type { PipelineStep } from '@/types/pipeline'

const props = defineProps<{
  steps: PipelineStep[]
  counts: number[]
}>()

const segments = computed(() =>
  props.steps
    .map((step, index) => ({
      step,
      count: props.counts[index] ?? 0,
      opacity: 0.35 + 0.65 * (index / Math.max(1, props.steps.length - 1)),
    }))
    .filter((segment) => segment.count > 0),
)
</script>

<template>
  <span class="pipeline-bar" aria-hidden="true">
    <span
      v-for="segment in segments"
      :key="segment.step.id"
      class="pipeline-bar__segment"
      :style="{ flexGrow: segment.count, opacity: segment.opacity }"
      :title="`${segment.step.name}: ${segment.count}`"
    />
  </span>
</template>
