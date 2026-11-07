<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import type { Board, PipelineStep } from '@/types/pipeline'

const props = defineProps<{
  modelValue: boolean
  board?: Board | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useBoardsStore()
const drafts = ref<Record<string, string>>({})
const newColumn = ref('')
const savingId = ref<string | null>(null)
const movingId = ref<string | null>(null)

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const steps = computed(() => props.board?.steps ?? [])

function syncDrafts(): void {
  drafts.value = Object.fromEntries(steps.value.map((step) => [step.id, step.name]))
  newColumn.value = ''
}

function setDraft(id: string, value: unknown): void {
  drafts.value[id] = String(value ?? '')
}

watch([() => props.modelValue, () => props.board?.id], ([value]) => {
  if (value) {
    syncDrafts()
  }
})

async function rename(step: PipelineStep): Promise<void> {
  const name = (drafts.value[step.id] ?? '').trim()

  if (!name || name === step.name) {
    return
  }

  savingId.value = step.id
  const saved = await store.renameColumn(props.board?.id ?? '', step.id, name)
  savingId.value = null

  if (saved) {
    syncDrafts()
  }
}

async function move(step: PipelineStep, offset: number): Promise<void> {
  if (!props.board) {
    return
  }

  const ids = steps.value.map((item) => item.id)
  const index = ids.indexOf(step.id)
  const target = index + offset

  if (index < 1 || target < 1 || target >= ids.length) {
    return
  }

  const reordered = [...ids]
  const current = reordered[index] as string
  reordered[index] = reordered[target] as string
  reordered[target] = current

  movingId.value = step.id
  const saved = await store.reorderColumns(props.board.id, reordered)
  movingId.value = null

  if (saved) {
    syncDrafts()
  }
}

async function add(): Promise<void> {
  const name = newColumn.value.trim()

  if (!name || !props.board) {
    return
  }

  const saved = await store.addColumn(props.board.id, name)

  if (saved) {
    syncDrafts()
  }
}

async function remove(step: PipelineStep): Promise<void> {
  if (
    !props.board ||
    !window.confirm(`Delete "${step.name}"? Applicants will move to the first column.`)
  ) {
    return
  }

  const saved = await store.deleteColumn(props.board.id, step.id)

  if (saved) {
    syncDrafts()
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="660">
    <v-card class="orbital-dialog">
      <div class="orbital-dialog__head">
        <div>
          <p class="eyebrow">Pipeline</p>
          <h2 class="panel-title">Manage columns</h2>
        </div>
        <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="open = false" />
      </div>

      <div class="orbital-dialog__body">
        <v-alert v-if="store.error" class="orbital-alert" type="error" density="compact">
          {{ store.error }}
        </v-alert>

        <p class="column-manage__hint">
          The first column is fixed as the fallback for applicants whose column is deleted. Deleting
          a column moves its applicants to the first column.
        </p>

        <div class="column-manage">
          <div v-for="(step, index) in steps" :key="step.id" class="column-manage__row">
            <span class="mono-label">{{ index + 1 }}</span>
            <v-text-field
              class="orbital-field"
              :model-value="drafts[step.id] ?? step.name"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="setDraft(step.id, $event)"
              @keyup.enter="rename(step)"
            />
            <v-btn
              icon="mdi-arrow-up"
              variant="text"
              aria-label="Move column up"
              :loading="movingId === step.id"
              :disabled="index <= 1"
              @click="move(step, -1)"
            />
            <v-btn
              icon="mdi-arrow-down"
              variant="text"
              aria-label="Move column down"
              :loading="movingId === step.id"
              :disabled="index === 0 || index === steps.length - 1"
              @click="move(step, 1)"
            />
            <v-btn
              icon="mdi-content-save-outline"
              variant="text"
              aria-label="Save column name"
              :loading="savingId === step.id"
              :disabled="(drafts[step.id] ?? step.name) === step.name"
              @click="rename(step)"
            />
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              color="error"
              aria-label="Delete column"
              :disabled="index === 0"
              @click="remove(step)"
            />
          </div>
        </div>

        <div class="column-manage__add">
          <v-text-field
            v-model="newColumn"
            class="orbital-field"
            label="New column name"
            variant="outlined"
            hide-details
            @keyup.enter="add"
          />
          <v-btn color="primary" variant="outlined" prepend-icon="mdi-plus" @click="add">
            Add
          </v-btn>
        </div>
      </div>

      <div class="orbital-dialog__actions">
        <v-btn color="primary" @click="open = false">Done</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
