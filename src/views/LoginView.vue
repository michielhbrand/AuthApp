<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

const emailRules = [
  (value: string) => Boolean(value) || 'Email is required',
  (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address',
]

const passwordRules = [(value: string) => Boolean(value) || 'Password is required']

async function submit(): Promise<void> {
  const validation = await form.value?.validate()
  if (!validation?.valid) {
    return
  }

  const signedIn = await auth.signIn(email.value, password.value)
  if (!signedIn) {
    return
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  await router.replace(redirect)
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-2" elevation="8" rounded="lg">
          <v-card-title class="pt-4">Sign in</v-card-title>
          <v-card-subtitle>Vue 3 + Supabase authentication demo</v-card-subtitle>

          <v-card-text class="pt-4">
            <v-alert v-if="auth.error" class="mb-4" density="compact" type="error" variant="tonal">
              {{ auth.error }}
            </v-alert>

            <v-form ref="form" @submit.prevent="submit">
              <v-text-field
                v-model="email"
                autocomplete="email"
                label="Email"
                prepend-inner-icon="mdi-email-outline"
                required
                :rules="emailRules"
                type="email"
              />

              <v-text-field
                v-model="password"
                autocomplete="current-password"
                label="Password"
                prepend-inner-icon="mdi-lock-outline"
                required
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
              />

              <v-btn
                block
                class="mt-2"
                color="primary"
                :loading="auth.loading"
                size="large"
                type="submit"
              >
                Sign in
              </v-btn>
            </v-form>

            <v-divider class="my-4" />

            <p class="text-caption text-medium-emphasis mb-0">
              Accounts are provisioned manually in Supabase; sign-up is disabled.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
