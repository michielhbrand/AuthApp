<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const password = ref('')
const confirmation = ref('')
const showPassword = ref(false)
const success = ref(false)
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

const isInvite = computed(() => auth.passwordSetupRequired)
const title = computed(() => (isInvite.value ? 'Set your password' : 'Update your password'))

const passwordRules = [
  (value: string) => Boolean(value) || 'Password is required',
  (value: string) => value.length >= 8 || 'Use at least 8 characters',
]

const confirmationRules = [
  (value: string) => Boolean(value) || 'Confirm your password',
  (value: string) => value === password.value || 'Passwords do not match',
]

async function submit(): Promise<void> {
  const validation = await form.value?.validate()
  if (!validation?.valid) {
    return
  }

  const updated = await auth.setPassword(password.value)
  if (!updated) {
    return
  }

  success.value = true
  await new Promise((resolve) => setTimeout(resolve, 900))
  await router.replace('/dashboard')
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-2" elevation="8" rounded="lg">
          <v-card-title class="pt-4">{{ title }}</v-card-title>
          <v-card-subtitle>
            {{
              auth.isAuthenticated
                ? `Choose a password for ${auth.user?.email ?? 'your account'}.`
                : 'Complete the invitation from your email.'
            }}
          </v-card-subtitle>

          <v-card-text class="pt-4">
            <v-alert v-if="!auth.isAuthenticated" class="mb-4" type="error" variant="tonal">
              {{
                auth.linkError ??
                'This invitation link is invalid or has expired. Ask an administrator to send a new invitation.'
              }}
            </v-alert>

            <template v-else>
              <v-alert v-if="success" class="mb-4" type="success" variant="tonal">
                Password saved. Taking you to the dashboard...
              </v-alert>

              <v-alert v-else-if="auth.error" class="mb-4" type="error" variant="tonal">
                {{ auth.error }}
              </v-alert>

              <v-form v-if="!success" ref="form" @submit.prevent="submit">
                <v-text-field
                  v-model="password"
                  autocomplete="new-password"
                  label="New password"
                  prepend-inner-icon="mdi-lock-outline"
                  required
                  :rules="passwordRules"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-text-field
                  v-model="confirmation"
                  autocomplete="new-password"
                  label="Confirm password"
                  prepend-inner-icon="mdi-lock-check-outline"
                  required
                  :rules="confirmationRules"
                  :type="showPassword ? 'text' : 'password'"
                />

                <v-btn
                  block
                  class="mt-2"
                  color="primary"
                  :loading="auth.loading"
                  size="large"
                  type="submit"
                >
                  Save password
                </v-btn>
              </v-form>
            </template>
          </v-card-text>

          <v-card-actions v-if="!auth.isAuthenticated">
            <v-spacer />
            <v-btn color="primary" variant="text" @click="router.replace('/')">
              Back to sign in
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
