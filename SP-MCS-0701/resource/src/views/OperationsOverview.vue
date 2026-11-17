<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Warning } from '@element-plus/icons-vue'
import TelemetryTable from '../components/ops/TelemetryTable.vue'
import { satelliteSnapshots } from '../mocks/satellites'

const dialogVisible = ref(false)
const activeTab = ref('telemetry')
const metrics = [
  { title: '在管卫星', value: '12', detail: '11 正常 · 1 告警' },
  { title: '当前测控任务', value: '3', detail: '2 执行中 · 1 待执行' },
  { title: '今日可见弧段', value: '26', detail: '下一弧段 14:48 UTC+8' },
]
</script>

<template>
  <div class="page-stack">
    <div class="page-heading">
      <div><h2>运行总览</h2><p>监视星座状态、测控任务和实时遥测摘要。</p></div>
      <el-button type="primary" :icon="Plus" @click="dialogVisible = true">新建测控任务</el-button>
    </div>

    <div class="metric-grid">
      <el-card v-for="metric in metrics" :key="metric.title" shadow="never">
        <div class="metric-label">{{ metric.title }}</div><div class="metric-value">{{ metric.value }}</div><div class="metric-detail">{{ metric.detail }}</div>
      </el-card>
    </div>

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="遥测快照" name="telemetry"><div class="panel-heading"><h3>卫星遥测快照</h3><p>示例数据用于验证表格密度、单位和状态表达。</p></div><TelemetryTable :rows="satelliteSnapshots" /></el-tab-pane>
        <el-tab-pane label="任务状态" name="tasks"><el-empty description="当前没有需要人工介入的任务" /></el-tab-pane>
        <el-tab-pane label="告警" name="alerts"><el-alert title="试验十三号链路质量下降" description="下行信噪比连续 3 个采样周期低于模拟阈值。" type="error" show-icon :closable="false" /></el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="dialogVisible" title="创建模拟测控任务" width="520px">
      <el-alert title="命令确认示例" description="该操作只写入原型本地状态。正式原型应展示目标卫星、地面站、时间窗和指令摘要。" type="warning" :icon="Warning" show-icon :closable="false" />
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="dialogVisible = false">确认创建</el-button></template>
    </el-dialog>
  </div>
</template>
