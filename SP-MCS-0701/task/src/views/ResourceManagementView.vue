<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ports, previewHost } from '../version'

const route = useRoute()
const pages: Record<string, { path: string; title: string }> = {
  'resource-satellite-management': { path: 'satellite/list', title: '卫星管理' },
  'resource-payload-management': { path: 'payload/list', title: '光学载荷管理' },
  'resource-antenna-management': { path: 'antenna/list', title: '天线管理' },
}
const page = computed(() => pages[String(route.name)] || pages['resource-satellite-management'])
const source = computed(() => `http://${previewHost}:${ports.resource}/app/mccs/resourcesys/${page.value.path}?embedded=1`)
</script>

<template>
  <section class="resource-embedded-page">
    <iframe :src="source" :title="page.title" />
  </section>
</template>
