<script setup lang="ts">
withDefaults(
  defineProps<{
    context?: string
  }>(),
  {
    context: 'Identity console',
  },
)
</script>

<template>
  <div class="brand-lockup">
    <span class="brand-mark" aria-hidden="true">
      <v-icon icon="mdi-orbit" size="22" />
    </span>
    <span class="brand-copy">
      <span class="brand-name">AuthApp</span>
      <span v-if="context" class="brand-context">{{ context }}</span>
    </span>
  </div>
</template>
