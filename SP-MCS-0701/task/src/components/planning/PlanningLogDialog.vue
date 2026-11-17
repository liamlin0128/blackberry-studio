<script setup lang="ts">
import { ElDialog, ElTag } from 'element-plus'
import { planningLogs } from '../../mocks/planning'
import type { PlanningRecord } from '../../types/planning'

const visible = defineModel<boolean>('visible', { required: true })
defineProps<{ record: PlanningRecord | null }>()
</script>

<template>
  <el-dialog v-model="visible" title="日志详情" width="860px" class="planning-dialog log-dialog" destroy-on-close>
    <div class="log-toolbar"><span>{{ record?.id || '记录待确认' }} · 证据示例日志</span><span>仅保存 7 天 · 北京时间（UTC+8）</span></div>
    <ol class="planning-log-list">
      <li v-for="item in planningLogs" :key="item.sequence">
        <span class="log-sequence">{{ item.sequence }}</span>
        <div class="log-content">
          <div><el-tag size="small" effect="plain">{{ item.stage }}</el-tag><time>{{ item.time }}</time></div>
          <strong>{{ item.message }}</strong>
          <small v-if="item.detail">{{ item.detail }}</small>
        </div>
      </li>
    </ol>
  </el-dialog>
</template>
