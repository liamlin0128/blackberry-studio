<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download, Refresh, Search, Setting } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn, ElTag } from 'element-plus'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { ensureOnboardProcessing, loadArcSelectionDelayMinutes, saveArcSelectionDelayMinutes } from '../mocks/onboardPlanning'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const records = ref(ensureOnboardProcessing())
const filters = reactive({ planNo: '', taskNo: '', sourceNo: '', taskType: '', processedRange: [] as string[] })
const applied = ref({ ...filters, processedRange: [] as string[] })
const currentPage = ref(1)
const pageSize = ref(30)
const configVisible = ref(params.get('dialog') === 'config')
const configuredDelayMinutes = ref(loadArcSelectionDelayMinutes())
const draftDelayMinutes = ref<number | undefined>(configuredDelayMinutes.value)
const rows = computed(() => records.value.filter(row => {
  const f = applied.value
  const date = new Date(row.processedAt).toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' })
  return (!f.planNo || row.planNo.includes(f.planNo)) && (!f.taskNo || row.taskNo.includes(f.taskNo))
    && (!f.sourceNo || row.sourceNo.includes(f.sourceNo)) && (!f.taskType || row.taskType === f.taskType)
    && (!f.processedRange.length || (date >= f.processedRange[0] && date <= f.processedRange[1]))
}))
const pageRows = computed(() => rows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const beijing = (value: string) => value ? new Date(value).toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }) : '—'
function query() { applied.value = { ...filters, processedRange: [...filters.processedRange] }; currentPage.value = 1 }
function reset() { Object.assign(filters, { planNo: '', taskNo: '', sourceNo: '', taskType: '', processedRange: [] }); query() }
function refresh() { records.value = ensureOnboardProcessing(); ElMessage.success('处理记录已刷新') }
function exportRows() {
  const header = ['处理记录号', '原需求编号', '任务需求号', '生成计划编号', '需求处理时间（北京时间）', '执行卫星', '类型', '上星状态', '结果', '处理信息']
  const values = rows.value.map(row => [row.id, row.sourceNo, row.taskNo, row.planNo, beijing(row.processedAt), row.satellite, row.taskType, row.uplinkStatus, row.result, row.message])
  const csv = [header, ...values].map(line => line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = '星上规划任务处理记录.csv'; link.click(); URL.revokeObjectURL(url)
}
function openConfig() { draftDelayMinutes.value = configuredDelayMinutes.value; configVisible.value = true }
function saveConfig() {
  const minutes = draftDelayMinutes.value
  if (minutes === undefined || !Number.isSafeInteger(minutes) || minutes < 0) return ElMessage.warning('请输入非负整数分钟')
  saveArcSelectionDelayMinutes(minutes)
  configuredDelayMinutes.value = minutes
  configVisible.value = false
  ElMessage.success('选段规则已保存，将用于之后处理的任务')
}
</script>

<template>
  <section class="stage-four-page emergency-handling-page">
    <PageHeader title="星上规划任务处理" description="0123 任务直接封装单星观测计划，并生成待安排下传文件" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="星上规划任务处理" />
    <template v-else>
      <div class="filter-panel emergency-filter"><el-form class="filter-form" label-position="left">
        <el-form-item label="计划号"><el-input v-model="filters.planNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="任务需求号"><el-input v-model="filters.taskNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="原始需求号"><el-input v-model="filters.sourceNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="任务类型"><el-select v-model="filters.taskType" placeholder="请选择" clearable><el-option label="星上规划任务" value="星上规划任务" /></el-select></el-form-item>
        <el-form-item label="处理时间" class="date-field"><el-date-picker v-model="filters.processedRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
      </el-form><div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button><el-button :icon="Download" @click="exportRows">导出</el-button></div></div>
      <div class="list-toolbar"><el-button :icon="Setting" @click="openConfig">星上规划任务处理配置</el-button><el-button link :icon="Refresh" @click="refresh">刷新</el-button><span>可选弧段：处理时间后 {{ configuredDelayMinutes }} 分钟起 · 北京时间（UTC+8）</span></div>
      <div class="table-region"><el-table :data="pageRows" height="100%" class="requirement-table" empty-text="暂无星上规划任务处理记录">
        <el-table-column prop="id" label="处理记录号" min-width="170" fixed="left" show-overflow-tooltip />
        <el-table-column prop="sourceNo" label="原需求编号" min-width="150" />
        <el-table-column prop="taskNo" label="任务需求号" min-width="180" />
        <el-table-column prop="planNo" label="生成计划编号" min-width="160" />
        <el-table-column label="需求处理时间" min-width="165"><template #default="{ row }">{{ beijing(row.processedAt) }}</template></el-table-column>
        <el-table-column prop="satellite" label="执行卫星" min-width="170" />
        <el-table-column prop="taskType" label="类型" min-width="110" />
        <el-table-column label="上星状态" min-width="95"><template #default="{ row }"><el-tag type="info" effect="plain">{{ row.uplinkStatus }}</el-tag></template></el-table-column>
        <el-table-column label="结果" min-width="75"><template #default="{ row }"><el-tag type="success">{{ row.result }}</el-tag></template></el-table-column>
        <el-table-column prop="message" label="处理信息" min-width="275" show-overflow-tooltip />
      </el-table></div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10,30,50,100]" :total="rows.length" /></div>
    </template>
    <el-dialog v-model="configVisible" title="星上规划任务处理配置" width="520px">
      <el-form label-width="190px">
        <el-form-item label="可选弧段延后时间"><el-input-number v-model="draftDelayMinutes" :min="0" :precision="0" :step="1" /><span class="unit-suffix">分钟</span></el-form-item>
        <p class="form-hint">从任务创建并进入处理的时间起，经过设定分钟数后开始的可用上注弧段才可选择；弧段结束时间仍须早于任务最晚执行时间。</p>
        <p class="form-hint">修改配置仅影响之后处理的任务，已有计划的弧段保持不变。</p>
      </el-form><template #footer><el-button @click="configVisible = false">关闭</el-button><el-button type="primary" @click="saveConfig">保存</el-button></template>
    </el-dialog>
  </section>
</template>
