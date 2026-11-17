<script setup lang="ts">
import { Loading, Lock, WarningFilled } from '@element-plus/icons-vue'

defineProps<{ state: 'loading' | 'empty' | 'error' | 'forbidden' }>()
</script>

<template>
  <el-card class="resource-page-state" shadow="never">
    <el-empty v-if="state === 'empty'" description="暂无数据" />
    <div v-else-if="state === 'loading'" class="resource-state-message"><el-icon class="is-loading"><Loading /></el-icon><span>正在加载</span></div>
    <div v-else-if="state === 'error'" class="resource-state-message is-error"><el-icon><WarningFilled /></el-icon><span>数据加载失败</span></div>
    <div v-else class="resource-state-message"><el-icon><Lock /></el-icon><span>暂无访问权限</span></div>
  </el-card>
</template>

<style scoped>
.resource-page-state { min-height: 320px; border: 1px solid var(--sp-color-border); border-radius: var(--sp-radius-dialog); }
.resource-state-message { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 280px; color: var(--sp-color-info); font-size: var(--sp-font-size-body); }
.resource-state-message .el-icon { font-size: 20px; }
.resource-state-message.is-error { color: var(--sp-color-danger); }
</style>
