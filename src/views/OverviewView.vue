<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppShell from '@/components/AppShell.vue'
import { departmentTotals } from '@/lib/pipeline'
import { useBoardsStore } from '@/stores/boards'

const store = useBoardsStore()

const departmentRows = computed(() =>
  store.groups.map((group) => ({
    ...group,
    totals: departmentTotals(group),
  })),
)
</script>

<template>
  <AppShell>
    <div class="page-heading">
      <div>
        <p class="eyebrow">Hiring workspace</p>
        <h1 class="page-title">Hiring overview.</h1>
        <p class="lede">
          Every open role, active candidate, and step that needs attention, grouped by department.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-view-column-outline" to="/boards">
        Open boards
      </v-btn>
    </div>

    <div class="stat-grid stat-grid--four">
      <article class="stat-card">
        <span class="mono-label">Open positions</span>
        <strong class="stat-value">{{ store.totals.openPositions }}</strong>
        <span class="stat-meta">Across {{ store.boards.length }} role boards</span>
      </article>
      <article class="stat-card">
        <span class="mono-label">Active candidates</span>
        <strong class="stat-value">{{ store.totals.active }}</strong>
        <span class="stat-meta">In an open pipeline</span>
      </article>
      <article class="stat-card">
        <span class="mono-label">Over target</span>
        <strong class="stat-value">{{ store.totals.overTarget }}</strong>
        <span class="stat-meta">Past their step target</span>
      </article>
      <article class="stat-card">
        <span class="mono-label">Hired</span>
        <strong class="stat-value">{{ store.totals.hired }}</strong>
        <span class="stat-meta">Closed as hired</span>
      </article>
    </div>

    <div class="overview-grid">
      <section class="data-panel" aria-labelledby="attention-title">
        <div class="data-panel-head">
          <div>
            <p class="mono-label">Attention</p>
            <h2 id="attention-title" class="panel-title mt-1">Roles over target</h2>
          </div>
          <span class="status-badge">{{ store.needsAttention.length }}</span>
        </div>

        <div class="data-panel-body">
          <p v-if="!store.needsAttention.length" class="overview-empty">
            Every active candidate is inside their step target.
          </p>

          <RouterLink
            v-for="summary in store.needsAttention"
            :key="summary.board.id"
            class="attention-row"
            :to="{ name: 'board', params: { boardId: summary.board.id } }"
          >
            <div>
              <p class="attention-title">{{ summary.board.title }}</p>
              <p class="attention-meta">
                {{ summary.board.department }} &middot; {{ summary.active }} active
              </p>
            </div>
            <span class="attention-count">{{ summary.overTarget }} over target</span>
            <v-icon icon="mdi-chevron-right" size="20" />
          </RouterLink>
        </div>
      </section>

      <section class="data-panel" aria-labelledby="departments-title">
        <div class="data-panel-head">
          <div>
            <p class="mono-label">Workload</p>
            <h2 id="departments-title" class="panel-title mt-1">Department load</h2>
          </div>
          <RouterLink class="text-link" to="/boards">All boards</RouterLink>
        </div>

        <div class="data-panel-body">
          <div v-for="group in departmentRows" :key="group.department" class="department-row">
            <div>
              <p class="department-name">{{ group.department }}</p>
              <p class="department-meta">{{ group.boards.length }} roles</p>
            </div>
            <div class="department-numbers">
              <span>{{ group.totals.active }} active</span>
              <span v-if="group.totals.overTarget" class="over">
                {{ group.totals.overTarget }} over
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </AppShell>
</template>
