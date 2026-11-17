<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <header class="page-heading">
    <span class="page-heading-accent" aria-hidden="true" />
    <div>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
  </header>
</template>
