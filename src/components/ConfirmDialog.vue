<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    message: string
    eyebrow?: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
  }>(),
  {
    eyebrow: 'Confirm',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    loading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function cancel(): void {
  if (!props.loading) {
    open.value = false
  }
}

function confirm(): void {
  if (!props.loading) {
    emit('confirm')
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="440" :persistent="loading">
    <v-card class="orbital-dialog">
      <div class="orbital-dialog__head">
        <div>
          <p class="eyebrow">{{ eyebrow }}</p>
          <h2 class="panel-title">{{ title }}</h2>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          aria-label="Close"
          :disabled="loading"
          @click="cancel"
        />
      </div>

      <div class="orbital-dialog__body">
        <p class="confirm-dialog__message">{{ message }}</p>
      </div>

      <div class="orbital-dialog__actions">
        <v-btn variant="text" :disabled="loading" @click="cancel">{{ cancelLabel }}</v-btn>
        <v-btn color="error" :loading="loading" @click="confirm">{{ confirmLabel }}</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
