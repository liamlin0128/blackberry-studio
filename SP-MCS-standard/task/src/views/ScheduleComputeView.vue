<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Clock, Connection, Refresh, VideoPlay } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElIcon, ElMessage, ElPagination, ElProgress, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { useRouter } from 'vue-router'
import ArcForecastProgressDialog from '../components/schedule/ArcForecastProgressDialog.vue'
import ArcForecastResultDialog from '../components/schedule/ArcForecastResultDialog.vue'
import ScheduleStartDialog from '../components/schedule/ScheduleStartDialog.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { arcForecasts, arcForecastSteps, scheduleLogs, scheduleRecords } from '../mocks/schedule'
import type { PrototypeState } from '../types/prototype'
import type { ArcForecastStep } from '../types/schedule'

const params = new URLSearchParams(window.location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const router = useRouter()
const startVisible = ref(false)
const range = ref<string[]>([])
const refreshing = ref(false)
const rows = computed(() => state === 'empty' ? [] : scheduleRecords)
const forecastRunning = ref(false)
const forecastProgressVisible = ref(false)
const forecastResultVisible = ref(false)
const forecastPercentage = ref(0)
const forecastDates = ref<string[]>([])
const lastForecastAt = ref('尚未执行')
const liveLogs = scheduleLogs
const forecastStepStates = ref<ArcForecastStep[]>(arcForecastSteps.map(label => ({ label, state: 'waiting' })))
let forecastRunToken = 0

onMounted(() => {
  startVisible.value = params.get('dialog') === 'manual'
  if (params.get('dialog') === 'forecast-result') openIndependentResult()
  if (params.get('dialog') === 'forecast-progress') void forecast()
})
onBeforeUnmount(() => { forecastRunToken += 1 })

async function refresh() { refreshing.value = true; await new Promise(resolve => window.setTimeout(resolve, 400)); refreshing.value = false; ElMessage.success('规划记录已刷新') }

function formatDate(date: Date) {
  const part = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}`
}

function formatDateTime(date: Date) {
  const part = (value: number) => String(value).padStart(2, '0')
  return `${formatDate(date)} ${part(date.getHours())}:${part(date.getMinutes())}:${part(date.getSeconds())}`
}

function nextThreeDays(base: Date) {
  return [1, 2, 3].map(offset => {
    const date = new Date(base)
    date.setDate(base.getDate() + offset)
    return formatDate(date)
  })
}

function delay(milliseconds: number) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}

function openIndependentResult() {
  forecastDates.value = nextThreeDays(new Date())
  forecastResultVisible.value = true
}

async function forecast() {
  if (forecastRunning.value) return
  const runToken = ++forecastRunToken
  forecastRunning.value = true
  forecastDates.value = nextThreeDays(new Date())
  forecastPercentage.value = 0
  forecastStepStates.value = arcForecastSteps.map(label => ({ label, state: 'waiting' }))
  forecastProgressVisible.value = true
  for (let index = 0; index < forecastStepStates.value.length; index += 1) {
    forecastStepStates.value[index].state = 'active'
    await delay(500)
    if (runToken !== forecastRunToken) return
    forecastStepStates.value[index].state = 'done'
    forecastPercentage.value = (index + 1) * 25
  }

  await delay(300)
  if (runToken !== forecastRunToken) return
  lastForecastAt.value = formatDateTime(new Date())
  forecastProgressVisible.value = false
  forecastRunning.value = false
  forecastResultVisible.value = true
}
</script>

<template>
  <section class="stage-four-page schedule-compute-page">
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="规划计算数据" />
    <template v-else>
      <div class="schedule-columns">
        <section class="schedule-live-card">
          <header class="card-heading"><div><h2>规划计算</h2></div></header>
          <div class="schedule-command-row">
            <div class="command-actions"><el-button type="primary" size="large" :icon="VideoPlay" @click="startVisible = true">开始规划</el-button><el-button :icon="Connection" :loading="forecastRunning" :disabled="forecastRunning" @click="forecast">{{ forecastRunning ? '预报计算中' : '弧段预报' }}</el-button><el-button @click="router.push('/app/mccs/tasksys/schedule/config')">查看规划配置</el-button></div>
            <div class="schedule-next"><el-icon><Clock /></el-icon><span>下次规划时间</span><strong>2026-09-10 12:00:00</strong><small>北京时间（UTC+8）</small></div>
            <div class="schedule-last-forecast"><el-icon><Connection /></el-icon><span>最近预报完成时间</span><strong>{{ lastForecastAt }}</strong></div>
          </div>
          <div class="live-section-title"><strong>规划动态</strong></div>
          <div class="schedule-dynamic-card">
            <header><strong>2097870786526728192</strong><span><i />完成</span></header>
            <dl class="schedule-status-grid">
              <div><dt>任务需求数量</dt><dd>1</dd></div>
              <div><dt>执行算法</dt><dd>巡查优先+任务数量优化策略模型</dd></div>
              <div><dt>开始时间</dt><dd>2026-09-10 10:12:38</dd></div>
              <div><dt>结束时间</dt><dd>2026-09-10 10:12:40</dd></div>
            </dl>
            <div class="schedule-progress"><span>计算进度</span><strong>100%</strong><el-progress :percentage="100" :stroke-width="8" /></div>
          </div>
          <div class="live-section-title"><strong>规划日志</strong></div>
          <ol class="schedule-log-stream"><li v-for="log in liveLogs" :key="`${log.time}-${log.message}`"><time>{{ log.time }}</time><code><b>[{{ log.stage }}]</b>{{ log.message }}</code></li></ol>
        </section>

        <section class="schedule-history-card">
          <header class="card-heading"><div><h2>规划记录</h2><span>共 250 条</span></div><el-button link type="primary" :icon="Refresh" :loading="refreshing" @click="refresh">刷新</el-button></header>
          <div class="compact-filter"><label>创建时间</label><el-date-picker v-model="range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /><el-button type="primary">查询</el-button><el-button @click="range = []">重置</el-button></div>
          <div class="schedule-history-table"><el-table :data="rows" height="100%" table-layout="auto" empty-text="暂无规划记录">
            <el-table-column prop="id" label="记录编号" min-width="170" show-overflow-tooltip />
            <el-table-column prop="startedAt" label="开始时间" min-width="142" />
            <el-table-column prop="endedAt" label="结束时间" min-width="142" />
            <el-table-column label="总时长(S)" width="80" align="right"><template #default="{ row }">{{ row.durationSeconds }}</template></el-table-column>
            <el-table-column label="结果" width="70" align="center"><template #default="{ row }"><el-tag :type="row.result === '完成' ? 'success' : 'danger'" effect="light">{{ row.result }}</el-tag></template></el-table-column>
            <el-table-column label="进度" width="110"><template #default="{ row }"><div class="table-progress"><el-progress :percentage="row.progress" :stroke-width="6" :show-text="false" /><span>{{ row.progress }}%</span></div></template></el-table-column>
            <el-table-column prop="triggerType" label="启动类型" width="76" align="center" />
          </el-table></div>
          <div class="pagination-bar"><el-pagination background layout="total, prev, pager, next" :total="250" :page-size="30" /></div>
        </section>
      </div>
    </template>
    <ScheduleStartDialog v-model:visible="startVisible" />
    <ArcForecastProgressDialog :visible="forecastProgressVisible" :percentage="forecastPercentage" :steps="forecastStepStates" />
    <ArcForecastResultDialog v-model:visible="forecastResultVisible" :forecasts="arcForecasts" :dates="forecastDates" />
  </section>
</template>
