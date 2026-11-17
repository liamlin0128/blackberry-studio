<script setup lang="ts">
import { Loading, Lock, WarningFilled } from '@element-plus/icons-vue'

defineProps<{ state: 'loading' | 'empty' | 'error' | 'forbidden' }>()
</script>

<template>
  <el-card class="page-state-panel" shadow="never">
    <el-empty v-if="state === 'empty'" description="暂无数据" />
    <div v-else-if="state === 'loading'" class="state-message"><el-icon class="is-loading"><Loading /></el-icon><span>正在加载</span></div>
    <div v-else-if="state === 'error'" class="state-message is-error"><el-icon><WarningFilled /></el-icon><span>数据加载失败</span></div>
    <div v-else class="state-message"><el-icon><Lock /></el-icon><span>暂无访问权限</span></div>
  </el-card>
</template>
