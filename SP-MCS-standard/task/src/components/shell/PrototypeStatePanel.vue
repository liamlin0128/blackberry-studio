<script setup lang="ts">
import { ElEmpty, ElResult, ElSkeleton, ElSkeletonItem } from 'element-plus'
import type { PrototypeState } from '../../types/prototype'

defineProps<{ state: Exclude<PrototypeState, 'normal'>; subject: string }>()
</script>

<template>
  <div class="prototype-state-panel">
    <el-skeleton v-if="state === 'loading'" animated :rows="7">
      <template #template><el-skeleton-item variant="h1" style="width: 28%" /><el-skeleton-item v-for="index in 7" :key="index" variant="p" /></template>
    </el-skeleton>
    <el-empty v-else-if="state === 'empty'" :description="`暂无${subject}`" />
    <el-result v-else-if="state === 'error'" icon="error" title="加载失败" :sub-title="`${subject}加载失败；服务端错误文案待确认。`" />
    <el-result v-else icon="warning" title="暂无权限" sub-title="权限申请入口与提示文案待确认。" />
  </div>
</template>
