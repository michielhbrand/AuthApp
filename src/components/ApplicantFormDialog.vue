<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import type { Board } from '@/types/pipeline'

const props = defineProps<{
  modelValue: boolean
  board?: Board | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: []
}>()

const store = useBoardsStore()
const submitting = ref(false)
const localError = ref('')
const name = ref('')
const email = ref('')
const phone = ref('')
const currentRole = ref('')
const education = ref('')
const experience = ref('')
const stepId = ref('')

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const steps = computed(() => props.board?.steps ?? [])

function syncForm(): void {
  name.value = ''
  email.value = ''
  phone.value = ''
  currentRole.value = ''
  education.value = ''
  experience.value = ''
  stepId.value = steps.value[0]?.id ?? ''
  localError.value = ''
}

watch([() => props.modelValue, () => props.board?.id], ([value]) => {
  if (value) {
    syncForm()
  }
})

async function submit(): Promise<void> {
  localError.value = ''

  if (!props.board) {
    return
  }

  if (!name.value.trim()) {
    localError.value = 'Enter the applicant name.'
    return
  }

  if (!email.value.trim() || !email.value.includes('@')) {
    localError.value = 'Enter a valid email address.'
    return
  }

  if (!phone.value.trim()) {
    localError.value = 'Enter a phone number.'
    return
  }

  submitting.value = true

  try {
    const created = await store.createApplicant(props.board.id, {
      name: name.value,
      email: email.value,
      phone: phone.value,
      currentRole: currentRole.value,
      education: education.value,
      experience: experience.value,
      stepId: stepId.value,
    })

    if (created) {
      emit('created')
      open.value = false
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="680">
    <v-card class="orbital-dialog">
      <form @submit.prevent="submit">
        <div class="orbital-dialog__head">
          <div>
            <p class="eyebrow">Applicant</p>
            <h2 class="panel-title">Add an applicant</h2>
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

          <div class="orbital-dialog__grid">
            <v-text-field
              v-model="name"
              class="orbital-field"
              label="Full name"
              variant="outlined"
              autofocus
            />
            <v-text-field
              v-model="email"
              class="orbital-field"
              label="Email"
              type="email"
              variant="outlined"
            />
            <v-text-field
              v-model="phone"
              class="orbital-field"
              label="Phone number"
              type="tel"
              variant="outlined"
            />
            <v-text-field
              v-model="currentRole"
              class="orbital-field"
              label="Current role"
              variant="outlined"
            />
          </div>

          <v-select
            v-model="stepId"
            class="orbital-field"
            label="Starting column"
            :items="steps"
            item-title="name"
            item-value="id"
            variant="outlined"
          />

          <v-textarea
            v-model="education"
            class="orbital-field"
            label="Career"
            variant="outlined"
            rows="3"
            auto-grow
          />

          <v-textarea
            v-model="experience"
            class="orbital-field"
            label="Work experience"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </div>

        <div class="orbital-dialog__actions">
          <v-btn variant="text" @click="open = false">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="submitting">Add applicant</v-btn>
        </div>
      </form>
    </v-card>
  </v-dialog>
</template>
