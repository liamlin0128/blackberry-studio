<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Clock, Connection, Refresh, VideoPlay } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElIcon, ElMessage, ElPagination, ElProgress, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { useRouter } from 'vue-router'
import ArcForecastProgressDialog from '../components/schedule/ArcForecastProgressDialog.vue'
import ArcForecastResultDialog from '../components/schedule/ArcForecastResultDialog.vue'
import ScheduleStartDialog from '../components/schedule/ScheduleStartDialog.vue'
import SemiAutomaticPlanningDialog from '../components/schedule/SemiAutomaticPlanningDialog.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { arcForecasts, arcForecastSteps, scheduleLogs, scheduleRecords } from '../mocks/schedule'
import { addPlanningRun, readPlanningRuns } from '../mocks/planningRuns'
import { loadScheduleConfig, nextPlanningTime } from '../mocks/scheduleConfig'
import { batchResultExamples, type BatchResultRecord, type BatchStatus } from '../mocks/planningBatchResults'
import type { PrototypeState } from '../types/prototype'
import type { ArcForecastStep } from '../types/schedule'

const params = new URLSearchParams(window.location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const router = useRouter()
const startVisible = ref(false)
const arcForecastEntryEnabled = false
const semiVisible = ref(false)
const semiMode = ref<'task' | 'data'>('task')
const newRecords = ref<typeof scheduleRecords>(readPlanningRuns())
const range = ref<string[]>([])
const refreshing = ref(false)
const batchStatuses = ref<Record<string, BatchStatus>>({})
const historicRows = computed<BatchResultRecord[]>(() => [...newRecords.value, ...scheduleRecords].map(row => ({ ...row, batchStatus: row.result === '完成' ? '成功' : '失败', hasSnapshot: false })))
const rows = computed<BatchResultRecord[]>(() => state === 'empty' ? [] : [...batchResultExamples.map(row => ({ ...row, batchStatus: batchStatuses.value[row.id] || row.batchStatus })), ...historicRows.value])
const latestBatch = computed(() => rows.value[0])
function syncBatchStatuses() {
  const legacy: Record<string, BatchStatus> = { 待人工确认: '待确认', 自动确认中: '成功', 计算失败: '失败', 确认失败: '失败', 历史计算完成: '成功' }
  batchStatuses.value = Object.fromEntries(batchResultExamples.map(row => {
    const stored = window.localStorage.getItem('sp-mcs-0701-batch-' + row.id)
    return [row.id, stored ? (legacy[stored] || stored as BatchStatus) : row.batchStatus || '成功']
  }))
}
function openWorkbench(value: unknown) { const row = value as BatchResultRecord; const url = new URL('/planning-workbench.html', window.location.origin); url.searchParams.set('batch', row.id); url.searchParams.set('status', row.batchStatus === '待确认' ? '待人工确认' : row.batchStatus || '待人工确认'); window.open(url.toString(), '_blank', 'noopener') }
function statusTag(status?: BatchStatus): 'warning' | 'success' | 'danger' | 'info' { if (status === '待确认') return 'warning'; if (status === '已人工确认' || status === '已自动确认' || status === '成功') return 'success'; if (status === '失败' || status === '超时') return 'danger'; return 'info' }
const forecastRunning = ref(false)
const forecastProgressVisible = ref(false)
const forecastResultVisible = ref(false)
const forecastPercentage = ref(0)
const forecastDates = ref<string[]>([])
const lastForecastAt = ref('尚未执行')
const liveLogs = scheduleLogs
const currentTime = ref(new Date())
let clockTimer: number | undefined
const nextTime = computed(() => nextPlanningTime(loadScheduleConfig(), currentTime.value))
const forecastStepStates = ref<ArcForecastStep[]>(arcForecastSteps.map(label => ({ label, state: 'waiting' })))
let forecastRunToken = 0

onMounted(() => {
  syncBatchStatuses()
  window.addEventListener('focus', syncBatchStatuses)
  window.addEventListener('storage', syncBatchStatuses)
  clockTimer = window.setInterval(() => { currentTime.value = new Date() }, 30_000)
  startVisible.value = params.get('dialog') === 'manual'
  if (params.get('dialog') === 'semi') openSemi(params.get('mode') === 'data' ? 'data' : 'task')
  if (params.get('dialog') === 'forecast-result') openIndependentResult()
  if (params.get('dialog') === 'forecast-progress') void forecast()
})
onBeforeUnmount(() => { forecastRunToken += 1; window.clearInterval(clockTimer); window.removeEventListener('focus', syncBatchStatuses); window.removeEventListener('storage', syncBatchStatuses) })

async function refresh() { refreshing.value = true; await new Promise(resolve => window.setTimeout(resolve, 400)); refreshing.value = false; ElMessage.success('规划记录已刷新') }
function openSemi(mode: 'task' | 'data' = 'task') { semiMode.value = mode; semiVisible.value = true }
function completeSemi(result: { mode: 'task' | 'data'; numbers: string[] }) {
  newRecords.value = addPlanningRun()
  ElMessage.success(`${result.mode === 'task' ? '定制规划' : '数传规划'}已加入规划记录`)
}

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
            <div class="command-actions"><el-button type="primary" size="large" :icon="VideoPlay" @click="startVisible = true">规划计算</el-button><el-button @click="openSemi('task')">定制规划</el-button><el-button v-if="arcForecastEntryEnabled" :icon="Connection" :loading="forecastRunning" :disabled="forecastRunning" @click="forecast">{{ forecastRunning ? '预报计算中' : '弧段预报' }}</el-button><el-button @click="router.push('/app/mccs/tasksys/schedule/config')">查看规划配置</el-button></div>
            <div class="schedule-next"><el-icon><Clock /></el-icon><span>下次规划时间</span><strong>{{ nextTime }}</strong><small>北京时间（UTC+8）</small></div>
            <div class="schedule-last-forecast"><el-icon><Connection /></el-icon><span>最近预报完成时间</span><strong>{{ lastForecastAt }}</strong></div>
          </div>
          <div class="live-section-title"><strong>规划动态</strong></div>
          <div class="schedule-dynamic-card">
            <header><strong>{{ latestBatch?.id }}</strong><span><i />{{ latestBatch?.batchStatus }}</span></header>
            <dl class="schedule-status-grid">
              <div><dt>任务需求数量</dt><dd>{{ latestBatch?.taskCount ?? '—' }}</dd></div>
              <div><dt>执行算法</dt><dd>巡查优先+任务数量优化策略模型</dd></div>
              <div><dt>开始时间</dt><dd>{{ latestBatch?.startedAt }}</dd></div>
              <div><dt>结束时间</dt><dd>{{ latestBatch?.endedAt || '—' }}</dd></div>
            </dl>
            <div class="schedule-progress"><span>计算进度</span><strong>{{ latestBatch?.progress ?? 0 }}%</strong><el-progress :percentage="latestBatch?.progress ?? 0" :stroke-width="8" /><small>计算完成不代表计划已确认；待确认结果通过右侧工作台处理。</small></div>
          </div>
          <div class="live-section-title"><strong>规划日志</strong></div>
          <ol class="schedule-log-stream"><li v-for="log in liveLogs" :key="`${log.time}-${log.message}`"><time>{{ log.time }}</time><code><b>[{{ log.stage }}]</b>{{ log.message }}</code></li></ol>
        </section>

        <section class="schedule-history-card">
          <header class="card-heading"><div><h2>规划记录</h2><span>共 {{ 250 + newRecords.length + batchResultExamples.length }} 条</span></div><el-button link type="primary" :icon="Refresh" :loading="refreshing" @click="refresh">刷新</el-button></header>
          <div class="compact-filter"><label>创建时间</label><el-date-picker v-model="range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /><el-button type="primary">查询</el-button><el-button @click="range = []">重置</el-button></div>
          <div class="schedule-history-table"><el-table :data="rows" height="100%" table-layout="auto" empty-text="暂无规划记录">
            <el-table-column prop="id" label="记录编号" min-width="130" show-overflow-tooltip />
            <el-table-column label="计算时间（北京时间）" width="155"><template #default="{ row }"><div>起 {{ row.startedAt }}</div><div style="color:#7c8da5">止 {{ row.endedAt || '—' }}</div></template></el-table-column>
            <el-table-column label="时长(S)" width="66" align="right"><template #default="{ row }">{{ row.durationSeconds }}</template></el-table-column>
            <el-table-column label="人工审核状态" width="112" align="center"><template #default="{ row }"><el-tag :type="statusTag(row.batchStatus)" effect="light">{{ row.batchStatus }}</el-tag></template></el-table-column>
            <el-table-column label="计算进度" width="92"><template #default="{ row }"><div class="table-progress"><el-progress :percentage="row.progress" :stroke-width="6" :show-text="false" /><span>{{ row.progress }}%</span></div></template></el-table-column>
            <el-table-column prop="triggerType" label="启动" width="62" align="center" /><el-table-column label="操作" width="130" align="center" fixed="right"><template #default="{ row }"><el-button v-if="row.hasSnapshot" link type="primary" @click="openWorkbench(row)">{{ row.batchStatus === '待确认' ? '进入规划工作台' : '查看规划结果' }}</el-button><span v-else style="color:#9aa7b9;font-size:12px">无工作台结果</span></template></el-table-column>
          </el-table></div>
          <div class="pagination-bar"><el-pagination background layout="total, prev, pager, next" :total="250 + newRecords.length + batchResultExamples.length" :page-size="30" /></div>
        </section>
      </div>
    </template>
    <ScheduleStartDialog v-model:visible="startVisible" />
    <SemiAutomaticPlanningDialog v-model:visible="semiVisible" :initial-mode="semiMode" @completed="completeSemi" />
    <ArcForecastProgressDialog :visible="forecastProgressVisible" :percentage="forecastPercentage" :steps="forecastStepStates" />
    <ArcForecastResultDialog v-model:visible="forecastResultVisible" :forecasts="arcForecasts" :dates="forecastDates" />
  </section>
</template>
