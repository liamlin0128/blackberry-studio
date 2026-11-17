<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock, Refresh, Search, Setting, VideoPlay } from '@element-plus/icons-vue'
import {
  ElAlert, ElButton, ElDatePicker, ElIcon, ElMessage, ElMessageBox, ElPagination,
  ElProgress, ElResult, ElTable, ElTableColumn, ElTag,
} from 'element-plus'
import PlanningLogDialog from '../components/planning/PlanningLogDialog.vue'
import PlanningSettingsDialog from '../components/planning/PlanningSettingsDialog.vue'
import PageHeader from '../components/shell/PageHeader.vue'
import { planningRecords } from '../mocks/planning'
import type { PlanningRecord } from '../types/planning'
import type { PrototypeState } from '../types/prototype'

const state = (new URLSearchParams(window.location.search).get('state') || 'normal') as PrototypeState
const timeRange = ref<string[]>([])
const appliedTimeRange = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(30)
const settingsVisible = ref(false)
const logVisible = ref(false)
const activeRecord = ref<PlanningRecord | null>(null)
const running = ref(false)
const refreshing = ref(false)
const rows = computed(() => state === 'empty' ? [] : planningRecords.filter(row => !appliedTimeRange.value.length || (row.startedAt >= appliedTimeRange.value[0] && row.startedAt <= appliedTimeRange.value[1])))

function query() { appliedTimeRange.value = [...timeRange.value]; currentPage.value = 1; ElMessage.success(`查询完成，共 ${rows.value.length} 条证据样例`) }
function reset() { timeRange.value = []; appliedTimeRange.value = []; currentPage.value = 1; ElMessage.success('筛选条件已重置') }
async function refresh() { refreshing.value = true; await new Promise(resolve => window.setTimeout(resolve, 350)); refreshing.value = false; ElMessage.success('筹划记录已刷新') }
function viewLog(value: unknown) { activeRecord.value = value as PlanningRecord; logVisible.value = true }
async function startPlanning() {
  try {
    await ElMessageBox.confirm('筹划会对当前任务需求进行分解、合并和去重。确认开始筹划吗？', '开始筹划确认', { type: 'warning', confirmButtonText: '确认开始', cancelButtonText: '返回检查' })
  } catch { return }
  running.value = true
  window.setTimeout(() => { running.value = false; ElMessage.success('筹划任务已提交，执行进度待后端接入') }, 700)
}
</script>

<template>
  <section class="planning-page">
    <PageHeader title="筹划计算" />
    <el-result v-if="state === 'forbidden'" icon="warning" title="暂无访问权限" sub-title="请联系系统管理员申请筹划计算权限。" />
    <el-alert v-else-if="state === 'error'" title="筹划记录加载失败" description="请检查网络后重试。" type="error" show-icon :closable="false" />
    <template v-else>
    <div class="planning-overview">
      <div class="planning-brief">
        <div class="eyebrow">筹划计算</div>
        <div class="brief-heading"><h1>任务需求预处理</h1><span>完成时间：待确认</span></div>
        <p>对任务需求进行筹划分析判定，通过分解、合并、去重形成各种机会元任务，是规划前的必要数据处理过程。</p>
        <div class="progress-line"><span>计算进度</span><el-progress :percentage="56" :stroke-width="8" :show-text="false" /><strong>56%</strong></div>
      </div>
      <div class="next-run-card">
        <div class="next-run-heading"><span><i />计划时间</span><small>下次筹划</small></div>
        <div class="next-run-date">2026年09月10日</div>
        <div class="next-run-time" aria-label="12时00分00秒"><strong>12</strong><i>:</i><strong>00</strong><i>:</i><strong>00</strong></div>
        <div class="next-run-zone"><el-icon><Clock /></el-icon><span>北京时间</span><b>UTC+8</b></div>
      </div>
      <div class="planning-primary-actions">
        <el-button type="primary" :icon="VideoPlay" :loading="running" @click="startPlanning">开始筹划</el-button>
        <el-button :icon="Setting" @click="settingsVisible = true">筹划设置</el-button>
      </div>
    </div>

    <div class="section-heading"><div><h2>筹划记录</h2><span>历史记录</span></div><el-button link type="primary" :icon="Refresh" :loading="refreshing" @click="refresh">刷新</el-button></div>
    <div class="planning-filter">
      <label>开始时间</label>
      <el-date-picker v-model="timeRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
      <span class="filter-spacer" />
      <el-button type="primary" :icon="Search" @click="query">查 询</el-button><el-button :icon="Refresh" @click="reset">重 置</el-button>
    </div>

      <div class="planning-table-region">
        <el-table v-loading="state === 'loading'" :data="rows" height="100%" table-layout="auto" class="planning-table" empty-text="暂无筹划记录">
          <el-table-column prop="id" label="记录编号" min-width="270" show-overflow-tooltip />
          <el-table-column prop="startedAt" label="开始时间" min-width="164" />
          <el-table-column prop="endedAt" label="结束时间" min-width="164" />
          <el-table-column label="总时长" min-width="92" align="right"><template #default="{ row }">{{ row.durationSeconds === null ? '—' : `${row.durationSeconds} 秒` }}</template></el-table-column>
          <el-table-column label="结果" min-width="86" align="center"><template #default="{ row }"><el-tag :type="row.result === '完成' ? 'success' : 'warning'" effect="light">{{ row.result }}</el-tag></template></el-table-column>
          <el-table-column label="进度" min-width="142"><template #default="{ row }"><div class="record-progress"><strong>{{ row.progress }}%</strong><el-progress :percentage="row.progress" :stroke-width="7" :show-text="false" /></div></template></el-table-column>
          <el-table-column prop="triggerType" label="启动类型" min-width="88" align="center" />
          <el-table-column prop="requirementCount" label="需求任务数量" min-width="116" align="right" />
          <el-table-column prop="generatedCount" label="生成元任务" min-width="100" align="right" />
          <el-table-column label="日志信息（只保存7天）" width="166" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="viewLog(row)">查看</el-button></template></el-table-column>
        </el-table>
      </div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="793" :page-sizes="[30]" /></div>
    </template>
    <PlanningSettingsDialog v-model:visible="settingsVisible" />
    <PlanningLogDialog v-model:visible="logVisible" :record="activeRecord" />
  </section>
</template>
