<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const provider = computed(() => auth.user?.app_metadata.provider ?? 'email')

const expiryDate = computed(() =>
  auth.session?.expires_at ? new Date(auth.session.expires_at * 1000) : null,
)

const sessionExpiry = computed(() => expiryDate.value?.toLocaleString() ?? 'Unknown')

const sessionExpiryShort = computed(
  () =>
    expiryDate.value?.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) ?? 'Unknown',
)

const initials = computed(() => {
  const localPart = (auth.user?.email ?? 'authapp').split('@')[0] ?? 'authapp'
  const parts = localPart.split(/[._-]+/).filter(Boolean)
  const first = parts[0] ?? 'A'
  const second = parts[1] ?? first.charAt(1) ?? 'A'

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
})

async function signOut(): Promise<void> {
  await auth.signOut()
  await router.replace('/')
}
</script>

<template>
  <div class="orbital-page">
    <div class="orbital-orbit orbital-orbit--a" aria-hidden="true" />
    <div class="orbital-orbit orbital-orbit--b" aria-hidden="true" />

    <header class="dashboard-topbar">
      <BrandMark context="Flight deck" />
      <div class="topbar-actions">
        <ThemeToggle />
        <span class="user-avatar" aria-hidden="true">{{ initials }}</span>
      </div>
    </header>

    <main class="dashboard-main">
      <v-alert v-if="auth.error" class="mb-6" type="error">
        {{ auth.error }}
      </v-alert>

      <div class="dashboard-heading">
        <div>
          <p class="eyebrow">Flight deck</p>
          <h1 class="dashboard-title">Session overview.</h1>
          <p class="lede">
            Your Supabase identity, active session, and access details at a glance.
          </p>
        </div>

        <v-btn
          :loading="auth.loading"
          prepend-icon="mdi-logout"
          variant="outlined"
          @click="signOut"
        >
          Sign out
        </v-btn>
      </div>

      <div class="stat-grid">
        <article class="stat-card">
          <span class="mono-label">Session</span>
          <strong class="stat-value">Active</strong>
          <span class="stat-meta">JWT persisted locally</span>
        </article>
        <article class="stat-card">
          <span class="mono-label">Provider</span>
          <strong class="stat-value">{{ provider }}</strong>
          <span class="stat-meta">Supabase Auth</span>
        </article>
        <article class="stat-card">
          <span class="mono-label">Expires</span>
          <strong class="stat-value">{{ sessionExpiryShort }}</strong>
          <span class="stat-meta">Auto-refresh enabled</span>
        </article>
      </div>

      <div class="dashboard-grid">
        <section class="data-panel" aria-labelledby="identity-title">
          <div class="data-panel-head">
            <div>
              <p class="mono-label">Identity record</p>
              <h2 id="identity-title" class="panel-title mt-1">Account details</h2>
            </div>
            <span class="status-badge">Supabase auth</span>
          </div>

          <div class="data-panel-body">
            <div class="identity-row">
              <span class="identity-index">01</span>
              <div>
                <span class="identity-label">Email</span>
                <p class="identity-value">{{ auth.user?.email ?? 'Unknown' }}</p>
              </div>
              <v-icon class="identity-icon" icon="mdi-email-outline" size="20" />
            </div>

            <div class="identity-row">
              <span class="identity-index">02</span>
              <div>
                <span class="identity-label">User ID</span>
                <p class="identity-value identity-value--mono">{{ auth.user?.id ?? 'Unknown' }}</p>
              </div>
              <v-icon class="identity-icon" icon="mdi-identifier" size="20" />
            </div>

            <div class="identity-row">
              <span class="identity-index">03</span>
              <div>
                <span class="identity-label">Auth provider</span>
                <p class="identity-value">{{ provider }}</p>
              </div>
              <v-icon class="identity-icon" icon="mdi-shield-account-outline" size="20" />
            </div>

            <div class="identity-row">
              <span class="identity-index">04</span>
              <div>
                <span class="identity-label">Session expires</span>
                <p class="identity-value">{{ sessionExpiry }}</p>
              </div>
              <v-icon class="identity-icon" icon="mdi-clock-outline" size="20" />
            </div>
          </div>
        </section>

        <aside class="aside-stack">
          <section class="data-panel" aria-labelledby="status-title">
            <div class="data-panel-head">
              <div>
                <p class="mono-label">Connection</p>
                <h2 id="status-title" class="panel-title mt-1">Session status</h2>
              </div>
            </div>

            <div class="data-panel-body">
              <div class="signal-card">
                <span class="status-dot" />
                <div>
                  <strong>Session active</strong>
                  <span>Supabase Auth / auto-refresh</span>
                </div>
              </div>

              <dl class="meta-list mt-3">
                <div>
                  <dt>Expires</dt>
                  <dd>{{ sessionExpiry }}</dd>
                </div>
                <div>
                  <dt>Provider</dt>
                  <dd>{{ provider }}</dd>
                </div>
                <div>
                  <dt>Storage</dt>
                  <dd>Browser local storage</dd>
                </div>
              </dl>
            </div>
          </section>

          <div class="auth-note">
            <v-icon icon="mdi-shield-lock-outline" size="18" />
            <p>
              Your session is managed by Supabase Auth. Signing out clears it from this browser and
              returns you to secure access.
            </p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
