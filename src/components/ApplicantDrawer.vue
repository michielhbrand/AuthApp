<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { initials as getInitials } from '@/lib/pipeline'
import { useBoardsStore, type EditableCandidateField } from '@/stores/boards'

const props = defineProps<{
  modelValue: boolean
  candidateId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useBoardsStore()
const candidate = computed(() =>
  props.candidateId ? store.candidateById(props.candidateId) : undefined,
)
const initials = computed(() => (candidate.value ? getInitials(candidate.value.name) : ''))
const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const textSections = [
  { key: 'education' as const, title: 'Education', fieldLabel: 'Education details' },
  {
    key: 'experience' as const,
    title: 'Work experience',
    fieldLabel: 'Work experience details',
  },
]

function updateField(field: EditableCandidateField, value: unknown): void {
  if (candidate.value) {
    store.updateCandidateField(candidate.value.id, field, String(value ?? ''))
  }
}

async function removeApplicant(): Promise<void> {
  const current = candidate.value

  if (!current || !window.confirm(`Delete ${current.name}? This cannot be undone.`)) {
    return
  }

  const deleted = await store.deleteApplicant(current.id)

  if (deleted) {
    open.value = false
  }
}

function setPageScrollLocked(locked: boolean): void {
  const root = document.documentElement
  const body = document.body

  root.classList.toggle('applicant-drawer-open', locked)
  body.classList.toggle('applicant-drawer-open', locked)

  if (locked) {
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    root.style.overscrollBehavior = 'none'
    body.style.overscrollBehavior = 'none'
  } else {
    root.style.removeProperty('overflow')
    body.style.removeProperty('overflow')
    root.style.removeProperty('overscroll-behavior')
    body.style.removeProperty('overscroll-behavior')
  }
}

watch(
  () => props.modelValue,
  (value) => {
    setPageScrollLocked(value)

    if (!value && props.candidateId) {
      void store.flushCandidate(props.candidateId)
    }
  },
)

onBeforeUnmount(() => setPageScrollLocked(false))
</script>

<template>
  <Teleport to="body">
    <v-navigation-drawer
      v-model="open"
      class="applicant-drawer"
      location="right"
      temporary
      width="50vw"
      aria-label="Applicant profile"
    >
      <div v-if="candidate" class="applicant-drawer__inner">
        <header class="applicant-drawer__head">
          <span class="candidate-avatar applicant-drawer__avatar" aria-hidden="true">
            {{ initials }}
          </span>

          <div class="applicant-drawer__identity">
            <p class="eyebrow">Applicant profile</p>
            <h2>{{ candidate.name }}</h2>
            <p class="mono-label">{{ candidate.currentRole || candidate.email }}</p>
          </div>

          <div class="applicant-drawer__actions">
            <v-btn
              :icon="candidate.favorite ? 'mdi-star' : 'mdi-star-outline'"
              :color="candidate.favorite ? 'primary' : undefined"
              :aria-label="candidate.favorite ? 'Remove from favourites' : 'Add to favourites'"
              :aria-pressed="candidate.favorite"
              variant="text"
              @click="store.toggleFavorite(candidate.id)"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              aria-label="Close applicant profile"
              @click="open = false"
            />
          </div>
        </header>

        <div class="applicant-drawer__body">
          <v-alert v-if="store.error" class="orbital-alert" type="error" density="compact">
            {{ store.error }}
          </v-alert>

          <section class="applicant-section">
            <p class="eyebrow">Basic information</p>

            <div class="applicant-fields">
              <v-text-field
                class="applicant-field--wide"
                label="Full name"
                :model-value="candidate.name"
                hide-details
                @update:model-value="updateField('name', $event)"
              />
              <v-text-field
                label="Email"
                type="email"
                :model-value="candidate.email"
                hide-details
                @update:model-value="updateField('email', $event)"
              />
              <v-text-field
                label="Phone number"
                type="tel"
                :model-value="candidate.phone"
                hide-details
                @update:model-value="updateField('phone', $event)"
              />
              <v-text-field
                class="applicant-field--wide"
                label="Current role"
                :model-value="candidate.currentRole"
                hide-details
                @update:model-value="updateField('currentRole', $event)"
              />
            </div>
          </section>

          <section v-for="section in textSections" :key="section.key" class="applicant-section">
            <p class="eyebrow">{{ section.title }}</p>
            <v-textarea
              class="applicant-notes-field"
              :label="section.fieldLabel"
              :model-value="candidate[section.key]"
              auto-grow
              hide-details
              rows="4"
              @update:model-value="updateField(section.key, $event)"
            />
          </section>

          <p class="applicant-drawer__note">Changes save automatically to the shared workspace.</p>

          <v-btn
            variant="text"
            color="error"
            prepend-icon="mdi-delete-outline"
            @click="removeApplicant"
          >
            Delete applicant
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>
  </Teleport>
</template>
