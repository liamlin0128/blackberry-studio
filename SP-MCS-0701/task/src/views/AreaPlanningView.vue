<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Aim, Loading, Location, Refresh, Search, VideoPlay, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import {
  ElAlert, ElButton, ElIcon, ElInput, ElMessage, ElMessageBox, ElResult, ElSlider, ElTag,
} from 'element-plus'
import AreaPlanningResultPanel from '../components/planning/AreaPlanningResultPanel.vue'
import PageHeader from '../components/shell/PageHeader.vue'
import { areaPlanningResult, areaPlanningTask, areaPlanningTasks } from '../mocks/planning'
import type { AreaPlanningTask } from '../types/planning'
import type { PrototypeState } from '../types/prototype'

const searchParams = new URLSearchParams(window.location.search)
const state = (searchParams.get('state') || 'normal') as PrototypeState
const routedTask = (() => {
  const taskNo = searchParams.get('taskNo')
  if (!taskNo) return null
  const existing = areaPlanningTasks.find(item => item.taskNo === taskNo)
  if (existing) return existing
  return { taskNo, sourceNo: searchParams.get('sourceNo') ?? '—', name: searchParams.get('name') ?? '—', businessType: searchParams.get('taskType') ?? '—', status: searchParams.get('status') ?? '—', priority: Number(searchParams.get('priority') ?? 0), createdAt: searchParams.get('createdAt') ?? '—', receivedAt: searchParams.get('createdAt') ?? '—', earliestAt: searchParams.get('earliestAt') ?? '—', latestAt: searchParams.get('latestAt') ?? '—', businessMode: '—', satelliteMode: '—', keyArea: '—', satellite: searchParams.get('satellite') ?? '—', payload: '—', longitude: null, latitude: null, scaleKm: 500, maxRollAngle: 45 } satisfies AreaPlanningTask
})()
const availableTasks = routedTask && !areaPlanningTasks.some(item => item.taskNo === routedTask.taskNo) ? [...areaPlanningTasks, routedTask] : areaPlanningTasks
const taskNo = ref(routedTask?.taskNo ?? areaPlanningTask.taskNo)
const activeTask = ref<AreaPlanningTask | null>(state === 'empty' ? null : routedTask ?? areaPlanningTask)
const loadingTask = ref(false)
const calculating = ref(false)
const rollAngle = ref(areaPlanningTask.maxRollAngle)
const inputMapZoom = ref(1)
const resultVisible = ref(searchParams.get('result') === 'success' && state === 'normal')
const resultSection = ref<HTMLElement | null>(null)
const task = computed(() => activeTask.value)

function changeInputMapZoom(delta: number) { inputMapZoom.value = Math.min(1.25, Math.max(.8, inputMapZoom.value + delta)) }

async function loadTask() {
  if (!taskNo.value.trim()) { ElMessage.warning('请输入完整需求编号'); return }
  loadingTask.value = true
  await new Promise(resolve => window.setTimeout(resolve, 450))
  loadingTask.value = false
  const matchedTask = availableTasks.find(item => item.taskNo === taskNo.value.trim())
  if (!matchedTask) {
    activeTask.value = null
    resultVisible.value = false
    ElMessage.warning('未找到对应数据')
    return
  }
  activeTask.value = matchedTask
  rollAngle.value = matchedTask.maxRollAngle
  inputMapZoom.value = 1
  resultVisible.value = false
  ElMessage.success('任务需求已载入')
}

async function startCalculation() {
  try {
    await ElMessageBox.confirm(`将基于 ${task.value?.taskNo} 的轨道与载荷能力执行条带筹划，确认开始吗？`, '开始计算确认', { type: 'warning', confirmButtonText: '确认开始', cancelButtonText: '返回检查' })
  } catch { return }
  calculating.value = true
  await new Promise(resolve => window.setTimeout(resolve, 900))
  calculating.value = false
  if (task.value?.taskNo !== areaPlanningTask.taskNo) {
    ElMessage.warning('该任务的计算完成态证据待确认')
    return
  }
  resultVisible.value = true
  ElMessage.success('筹划计算完成：4 个观测条带，覆盖率 100%')
  await nextTick()
  resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section class="area-page">
    <PageHeader title="大区域筹划" description="面向大区域成像任务的观测条带筹划计算" />
    <el-alert v-if="state === 'error'" title="大区域筹划页面加载失败" description="请检查网络后重试。" type="error" show-icon :closable="false" />
    <el-result v-else-if="state === 'forbidden'" icon="warning" title="暂无访问权限" sub-title="请联系系统管理员申请大区域筹划权限。" />
    <div v-else class="area-workbench" v-loading="state === 'loading'">
      <div class="workbench-heading"><h2>规划计算</h2><span>依据任务需求、卫星轨道与载荷能力进行条带筹划</span></div>
      <div class="task-loader">
        <label><b>*</b> 任务需求编号</label>
        <el-input v-model="taskNo" placeholder="请输入完整需求编号" clearable @keyup.enter="loadTask" />
        <el-button type="primary" :icon="Search" :loading="loadingTask" @click="loadTask">载 入</el-button>
      </div>

      <template v-if="task">
        <div class="area-content-grid">
          <div class="geo-column">
            <div class="area-map" aria-label="目标区域脱机示意图">
              <div class="area-map-scene" :style="{ transform: `scale(${inputMapZoom})` }"><div class="orbital-lines" /><div class="target-zone"><span>目标区域</span></div></div>
              <div class="map-controls"><el-button :icon="ZoomIn" aria-label="放大" @click="changeInputMapZoom(.1)" /><el-button :icon="ZoomOut" aria-label="缩小" @click="changeInputMapZoom(-.1)" /><el-button :icon="Aim" aria-label="回到目标区域" @click="inputMapZoom = 1" /></div>
              <div class="map-legend"><i />目标区域边界 <small>{{ task.taskNo === areaPlanningTask.taskNo ? '176,574.78 km²' : '范围形状待确认' }}</small></div>
              <span class="map-evidence-label">脱机示意</span>
              <div class="map-scale">{{ task.scaleKm }} km</div>
              <div class="map-coordinate"><template v-if="task.longitude !== null && task.latitude !== null"><el-icon><Location /></el-icon>{{ task.longitude.toFixed(2) }}° E&nbsp;&nbsp;{{ task.latitude.toFixed(2) }}° N</template><template v-else>—</template></div>
            </div>
            <div class="roll-control"><span>侧摆范围</span><el-slider v-model="rollAngle" :min="0" :max="task.maxRollAngle" /><strong>≤ {{ rollAngle }}°</strong></div>
          </div>

          <div class="task-summary">
            <section class="summary-card">
              <div class="summary-heading"><h3>任务信息</h3><small>{{ task.taskNo }}</small></div>
              <dl class="task-info-grid">
                <div><dt>任务编号</dt><dd>{{ task.taskNo }}</dd></div><div><dt>原始编号</dt><dd>{{ task.sourceNo }}</dd></div>
                <div><dt>任务名称</dt><dd>{{ task.name }}</dd></div><div><dt>业务类型</dt><dd>{{ task.businessType }}</dd></div>
                <div><dt>任务状态</dt><dd><el-tag :type="task.status === '规划成功' ? 'success' : 'primary'" effect="plain">{{ task.status }}</el-tag></dd></div><div><dt>优先级</dt><dd>{{ task.priority }}</dd></div>
                <div><dt>创建时间</dt><dd>{{ task.createdAt }}</dd></div><div><dt>接收时间</dt><dd>{{ task.receivedAt }}</dd></div>
                <div><dt>最早执行时间</dt><dd>{{ task.earliestAt }}</dd></div><div><dt>最晚执行时间</dt><dd>{{ task.latestAt }}</dd></div>
              </dl>
            </section>
            <section class="summary-card">
              <div class="summary-heading"><h3>业务内容</h3></div>
              <dl class="business-grid">
                <div><el-icon><Aim /></el-icon><span><dt>业务类型</dt><dd>{{ task.businessType }}</dd></span></div>
                <div><el-icon><Aim /></el-icon><span><dt>业务模式</dt><dd>{{ task.businessMode }}</dd></span></div>
                <div><el-icon><Aim /></el-icon><span><dt>卫星执行模式</dt><dd>{{ task.satelliteMode }}</dd></span></div>
                <div><el-icon><Aim /></el-icon><span><dt>是否重点区域</dt><dd>{{ task.keyArea }}</dd></span></div>
                <div><el-icon><Aim /></el-icon><span><dt>执行卫星</dt><dd>{{ task.satellite }}</dd></span></div>
                <div><el-icon><Aim /></el-icon><span><dt>执行载荷</dt><dd>{{ task.payload }}</dd></span></div>
              </dl>
            </section>
          </div>
        </div>
        <div class="area-submit"><p>基于载入任务的卫星轨道与载荷能力进行条带筹划</p><el-button type="primary" size="large" :icon="VideoPlay" :loading="calculating" @click="startCalculation">开始计算</el-button></div>
      </template>
      <div v-else class="area-empty"><el-icon><Loading /></el-icon><strong>等待载入任务需求</strong><span>输入完整需求编号后查看目标区域与任务信息</span><el-button :icon="Refresh" @click="taskNo = areaPlanningTask.taskNo">填入证据编号</el-button></div>
    </div>
    <div v-if="resultVisible" ref="resultSection"><AreaPlanningResultPanel :result="areaPlanningResult" /></div>
  </section>
</template>
