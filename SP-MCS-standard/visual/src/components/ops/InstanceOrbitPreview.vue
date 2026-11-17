<script setup lang="ts">
import type { SimulationInstance } from '../../types/simulation'

defineProps<{ instance: SimulationInstance }>()
</script>

<template>
  <div class="orbit-preview" :style="{ '--orbit-color': instance.color }">
    <svg viewBox="0 0 360 150" role="img" :aria-label="`${instance.name}运行轨迹示意`">
      <defs><radialGradient id="earth" cx="40%" cy="35%"><stop offset="0" stop-color="#5ca5e9" /><stop offset="1" stop-color="#174f8e" /></radialGradient></defs>
      <circle cx="178" cy="75" r="27" fill="url(#earth)" opacity=".9" />
      <circle cx="178" cy="75" r="46" class="orbit-line" />
      <ellipse cx="178" cy="75" rx="96" ry="40" class="orbit-line" transform="rotate(-18 178 75)" />
      <ellipse cx="178" cy="75" rx="135" ry="55" class="orbit-line orbit-line--muted" transform="rotate(20 178 75)" />
      <circle cx="260" cy="47" r="5" fill="var(--orbit-color)" class="orbit-satellite" />
      <path d="m267 43 11-5-5 11z" fill="var(--orbit-color)" opacity=".9" />
    </svg>
  </div>
</template>
