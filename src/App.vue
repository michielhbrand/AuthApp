<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')

async function syncTheme(): Promise<void> {
  await theme.change(colorScheme.matches ? 'orbitalDark' : 'orbitalLight')
}

syncTheme()
colorScheme.addEventListener('change', syncTheme)
onBeforeUnmount(() => colorScheme.removeEventListener('change', syncTheme))
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
