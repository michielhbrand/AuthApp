<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const provider = computed(() => auth.user?.app_metadata.provider ?? 'email')

const sessionExpiry = computed(() => {
  if (!auth.session?.expires_at) {
    return 'Unknown'
  }

  return new Date(auth.session.expires_at * 1000).toLocaleString()
})

async function signOut(): Promise<void> {
  await auth.signOut()
  await router.replace('/')
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="7" lg="5">
        <v-card elevation="8" rounded="lg">
          <v-card-item>
            <v-card-title>Signed in</v-card-title>
            <v-card-subtitle>Your Supabase session is active.</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-alert v-if="auth.error" class="mb-4" density="compact" type="error" variant="tonal">
              {{ auth.error }}
            </v-alert>

            <v-list lines="two">
              <v-list-item
                prepend-icon="mdi-email-outline"
                subtitle="Email"
                :title="auth.user?.email ?? 'Unknown'"
              />
              <v-list-item
                prepend-icon="mdi-identifier"
                subtitle="User ID"
                :title="auth.user?.id ?? 'Unknown'"
              />
              <v-list-item
                prepend-icon="mdi-shield-account-outline"
                subtitle="Auth provider"
                :title="provider"
              />
              <v-list-item
                prepend-icon="mdi-clock-outline"
                subtitle="Session expires"
                :title="sessionExpiry"
              />
            </v-list>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" :loading="auth.loading" variant="flat" @click="signOut">
              Sign out
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
