<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import { departments, type Board, type Department } from '@/types/pipeline'

const props = defineProps<{
  modelValue: boolean
  board?: Board | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [board: Board]
  deleted: [boardId: string]
}>()

const store = useBoardsStore()
const submitting = ref(false)
const localError = ref('')
const name = ref('')
const department = ref<Department>('Engineering')
const deadline = ref('')
const openPositions = ref<number>(1)

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function defaultDeadline(): string {
  return new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)
}

function syncForm(): void {
  name.value = props.board?.name ?? ''
  department.value = props.board?.department ?? 'Engineering'
  deadline.value = props.board?.deadline ?? defaultDeadline()
  openPositions.value = props.board?.openPositions ?? 1
  localError.value = ''
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      syncForm()
    }
  },
)

async function removeBoard(): Promise<void> {
  const board = props.board

  if (
    !board ||
    !window.confirm(
      `Delete "${board.name}"? All columns and applicants will be permanently deleted.`,
    )
  ) {
    return
  }

  submitting.value = true
  const deleted = await store.deleteBoard(board.id)
  submitting.value = false

  if (deleted) {
    emit('deleted', board.id)
    open.value = false
  }
}

async function submit(): Promise<void> {
  localError.value = ''

  if (!name.value.trim()) {
    localError.value = 'Enter a board name.'
    return
  }

  if (!deadline.value) {
    localError.value = 'Choose a deadline.'
    return
  }

  const positions = Number(openPositions.value)

  if (!Number.isInteger(positions) || positions < 0) {
    localError.value = 'Open positions must be zero or a positive whole number.'
    return
  }

  submitting.value = true

  try {
    if (props.board) {
      const updated = await store.updateBoard(props.board.id, {
        name: name.value.trim(),
        department: department.value,
        deadline: deadline.value,
        openPositions: positions,
      })

      if (updated) {
        const board = store.boardById(props.board.id)
        if (board) emit('saved', board)
        open.value = false
      }
    } else {
      const board = await store.createBoard({
        name: name.value.trim(),
        department: department.value,
        deadline: deadline.value,
        openPositions: positions,
      })

      if (board) {
        emit('saved', board)
        open.value = false
      }
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="560">
    <v-card class="orbital-dialog">
      <form @submit.prevent="submit">
        <div class="orbital-dialog__head">
          <div>
            <p class="eyebrow">{{ board ? 'Edit board' : 'New board' }}</p>
            <h2 class="panel-title">{{ board ? 'Board settings' : 'Create a role board' }}</h2>
          </div>
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="open = false" />
        </div>

        <div class="orbital-dialog__body">
          <v-alert
            v-if="localError || store.error"
            class="orbital-alert"
            type="error"
            density="compact"
          >
            {{ localError || store.error }}
          </v-alert>

          <v-text-field
            v-model="name"
            class="orbital-field"
            label="Board name"
            variant="outlined"
            autofocus
          />

          <div class="orbital-dialog__grid">
            <v-select
              v-model="department"
              class="orbital-field"
              label="Department"
              :items="departments"
              variant="outlined"
            />
            <v-text-field
              v-model="deadline"
              class="orbital-field"
              label="Deadline"
              type="date"
              variant="outlined"
            />
          </div>

          <v-text-field
            v-model.number="openPositions"
            class="orbital-field"
            label="Open positions"
            type="number"
            min="0"
            variant="outlined"
          />
        </div>

        <div class="orbital-dialog__actions">
          <v-btn
            v-if="board"
            class="orbital-dialog__danger"
            variant="text"
            color="error"
            prepend-icon="mdi-delete-outline"
            :disabled="submitting"
            @click="removeBoard"
          >
            Delete board
          </v-btn>
          <v-btn variant="text" @click="open = false">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="submitting">
            {{ board ? 'Save changes' : 'Create board' }}
          </v-btn>
        </div>
      </form>
    </v-card>
  </v-dialog>
</template>
