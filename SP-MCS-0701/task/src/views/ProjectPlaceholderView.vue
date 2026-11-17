<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const titles: Record<string, string> = {
  'requirement-submit': '需求提交',
  'requirement-submissions': '需求列表',
  'semi-automatic-planning': '定制规划',
  'data-transmission-planning': '数传规划',
  'platform-administration': '平台系统管理',
}
const title = computed(() => titles[String(route.params.feature)] || String(route.meta.title || '项目功能'))
const unavailable = computed(() => route.name === 'not-found')
</script>

<template>
  <section style="padding: 32px; max-width: 800px">
    <h1>{{ title }}</h1>
    <el-alert :title="unavailable ? '当前版本不提供此功能' : 'SP-MCS-0701 项目功能占位'" type="info" :closable="false" show-icon />
    <p v-if="unavailable">该功能在 SP-MCS 标准版保留；请切换版本查看。</p>
    <p v-else>该功能列入 0701 项目范围；业务规则或原型流程尚待补充。本页不代表功能已实现。</p>
  </section>
</template>
