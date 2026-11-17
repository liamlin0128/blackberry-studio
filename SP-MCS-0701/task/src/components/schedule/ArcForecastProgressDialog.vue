<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { ElDialog, ElIcon, ElProgress } from 'element-plus'
import type { ArcForecastStep } from '../../types/schedule'

defineProps<{
  visible: boolean
  percentage: number
  steps: ArcForecastStep[]
}>()
</script>

<template>
  <el-dialog
    :model-value="visible"
    class="arc-forecast-progress-dialog"
    width="460px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <template #header>
      <div class="forecast-dialog-title warning">
        <strong>弧段预报计算中</strong>
        <span>预报范围：未来 3 天</span>
      </div>
    </template>

    <el-progress :percentage="percentage" :stroke-width="8" color="var(--sp-color-warning)" />
    <ol class="forecast-step-list">
      <li v-for="(step, index) in steps" :key="step.label" :class="step.state">
        <span class="step-icon">
          <el-icon v-if="step.state === 'done'"><Check /></el-icon>
          <i v-else-if="step.state === 'active'" />
          <b v-else>{{ index + 1 }}</b>
        </span>
        <span>{{ step.label }}</span>
        <small>{{ step.state === 'done' ? '已完成' : step.state === 'active' ? '进行中' : '等待中' }}</small>
      </li>
    </ol>
  </el-dialog>
</template>
