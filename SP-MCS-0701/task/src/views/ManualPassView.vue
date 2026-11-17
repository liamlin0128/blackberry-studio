<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Delete, Download, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElForm, ElFormItem, ElInput, ElMessage, ElMessageBox, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn } from 'element-plus'
import ManualPassDialog from '../components/task-plan/ManualPassDialog.vue'
import ManualPlanDialog from '../components/task-plan/ManualPlanDialog.vue'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { manualPasses, satellites } from '../mocks/taskPlans'
import type { ManualPassRecord } from '../types/taskPlan'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const rows = ref(manualPasses.map(item => ({ ...item })))
const selected = ref<ManualPassRecord[]>([])
const dialog = ref(false)
const editingPass = ref<ManualPassRecord | null>(null)
const planDialog = ref(false)
const activePass = ref<ManualPassRecord | null>(null)
const currentPage = ref(1)
const pageSize = ref(30)
const filters = reactive({ range: [] as string[], planNo: '', creator: '', satellite: '' })
const applied = ref({ ...filters, range: [] as string[] })
const visibleRows = computed(() => rows.value.filter(item =>
  (!applied.value.creator || item.creator.includes(applied.value.creator))
  && (!applied.value.satellite || item.satellite === applied.value.satellite)
  && (!applied.value.range.length || (item.startedAt >= applied.value.range[0] && item.endedAt <= applied.value.range[1])),
))

onMounted(() => { if (params.get('dialog') === 'create') createPass() })
function query() { applied.value = { ...filters, range: [...filters.range] }; ElMessage.success(`查询完成，共 ${visibleRows.value.length} 条记录`) }
function reset() { Object.assign(filters, { range: [], planNo: '', creator: '', satellite: '' }); applied.value = { ...filters, range: [] }; ElMessage.success('筛选条件已重置') }
async function remove() {
  if (!selected.value.length) return ElMessage.warning('请先选择测控时段')
  try { await ElMessageBox.confirm(`确认删除 ${selected.value.length} 条手动测控时段吗？`, '删除时段确认', { type: 'warning' }) } catch { return }
  const ids = new Set(selected.value.map(item => item.id)); rows.value = rows.value.filter(item => !ids.has(item.id)); selected.value = []; ElMessage.success('已删除')
}
function pending(name: string) { ElMessage.warning(`${name}功能待确认`) }
function createPass() { editingPass.value = null; dialog.value = true }
function editPass(row: unknown) { editingPass.value = row as ManualPassRecord; dialog.value = true }
function savePass(value: ManualPassRecord) { const index = rows.value.findIndex(item => item.id === value.id); if (index >= 0) rows.value.splice(index, 1, value); else rows.value.unshift(value) }
function createPlan(row: unknown) { activePass.value = row as ManualPassRecord; planDialog.value = true }
</script>

<template>
  <section class="requirement-page manual-pass-page">
    <PageHeader title="手动测控时段管理" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="手动测控时段" />
    <template v-else>
      <div class="filter-panel compact-page-filter">
        <el-form class="filter-form">
          <el-form-item label="时间范围"><el-date-picker v-model="filters.range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
          <el-form-item label="计划号"><el-input v-model="filters.planNo" placeholder="请输入" /></el-form-item>
          <el-form-item label="创建人"><el-input v-model="filters.creator" placeholder="请输入" /></el-form-item>
          <el-form-item label="卫星"><el-select v-model="filters.satellite" placeholder="请选择" clearable><el-option v-for="item in satellites" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        </el-form>
        <div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button><el-button :icon="Download" @click="pending('导出')">导出</el-button></div>
      </div>
      <div class="batch-actions"><el-button type="primary" :icon="Plus" @click="createPass">创建手动测控时段</el-button><el-button type="danger" plain :icon="Delete" @click="remove">删除</el-button><span>时间：北京时间（UTC+8）</span></div>
      <div class="table-region"><el-table :data="visibleRows" height="100%" class="requirement-table" @selection-change="selected = $event"><el-table-column type="selection" width="42" /><el-table-column prop="id" label="编号" min-width="190" /><el-table-column prop="startedAt" label="开始时间" min-width="170" /><el-table-column prop="endedAt" label="结束时间" min-width="170" /><el-table-column prop="satellite" label="执行卫星" min-width="100" /><el-table-column prop="creator" label="创建人" min-width="190" /><el-table-column prop="remark" label="备注信息" min-width="160" /><el-table-column label="操作" width="92" fixed="right"><template #default="{ row }"><div class="icon-actions"><el-button link type="primary" :icon="Plus" aria-label="添加计划" title="添加计划" @click="createPlan(row)" /><el-button link type="primary" :icon="Edit" aria-label="编辑时段" title="编辑" @click="editPass(row)" /></div></template></el-table-column></el-table></div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="rows.length" :page-sizes="[10, 30, 50, 100, 200]" /></div>
    </template>
    <ManualPassDialog v-model:visible="dialog" :record="editingPass" @saved="savePass" />
    <ManualPlanDialog v-model:visible="planDialog" default-type="轨控" :context="activePass ? { passId: activePass.id, satellite: activePass.satellite, startedAt: activePass.startedAt, endedAt: activePass.endedAt } : null" />
  </section>
</template>
