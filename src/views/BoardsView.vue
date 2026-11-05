<script setup lang="ts">
import AppShell from '@/components/AppShell.vue'
import BoardList from '@/components/BoardList.vue'
import { useBoardsStore } from '@/stores/boards'

const store = useBoardsStore()
</script>

<template>
  <AppShell>
    <div class="page-heading">
      <div>
        <p class="eyebrow">Boards</p>
        <h1 class="page-title">Hiring pipeline.</h1>
        <p class="lede">
          One board per open role, grouped by department. Search or filter to find the pipeline that
          needs attention.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-view-dashboard-outline" to="/overview">
        Overview
      </v-btn>
    </div>

    <BoardList :groups="store.groups" />
  </AppShell>
</template>
