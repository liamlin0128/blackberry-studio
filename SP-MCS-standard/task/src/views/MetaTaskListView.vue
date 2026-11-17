<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ArrowDown, ArrowUp, Delete, Download, Refresh, Search } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElForm, ElFormItem, ElInput, ElMessage, ElMessageBox, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn, ElTag } from 'element-plus'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { metaTasks, metaTaskStatuses, metaTaskTypes } from '../mocks/metaTasks'
import type { MetaTaskRecord } from '../types/metaTask'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(window.location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const expanded = ref(false)
const deleting = ref(false)
const currentPage = ref(1)
const pageSize = ref(30)
const selectedRows = ref<MetaTaskRecord[]>([])
const sourceRows = ref(metaTasks.map(item => ({ ...item })))
const filters = reactive({ requirementNo: '', metaTaskNo: '', status: '', type: '', plan: '', priority: '', createdRange: [] as string[] })
const applied = ref({ ...filters, createdRange: [] as string[] })

const rows = computed(() => sourceRows.value.filter(row => {
  const value = applied.value
  return (!value.requirementNo || row.requirementNo.includes(value.requirementNo))
    && (!value.metaTaskNo || row.id.includes(value.metaTaskNo))
    && (!value.status || row.status === value.status)
    && (!value.type || row.type.includes(value.type.replace('提取', '').replace('观测', '')))
    && (!value.plan || row.planningNo.includes(value.plan))
    && (!value.priority || row.priority === Number(value.priority))
    && (!value.createdRange.length || (row.createdAt >= value.createdRange[0] && row.createdAt <= value.createdRange[1]))
}))

onMounted(async () => {
  if (params.get('confirm') === 'delete') { await nextTick(); void removeRecords([sourceRows.value[0]]) }
})
function query() { applied.value = { ...filters, createdRange: [...filters.createdRange] }; ElMessage.success(`查询完成，共 ${rows.value.length} 条证据样例`) }
function reset() {
  Object.assign(filters, { requirementNo: '', metaTaskNo: '', status: '', type: '', plan: '', priority: '', createdRange: [] })
  applied.value = { ...filters, createdRange: [] }
  ElMessage.success('筛选条件已重置')
}
function exportRows() { ElMessage.success('导出任务已生成') }
function selectionChange(value: MetaTaskRecord[]) { selectedRows.value = value }
function statusType(status: string) { return status === '待规划' ? 'warning' : status === '规划失败' || status === '已取消' ? 'danger' : status === '规划成功' || status === '已完成' ? 'success' : 'primary' }
async function removeRecords(target = selectedRows.value) {
  if (!target.length) return ElMessage.warning('请先选择要删除的元任务')
  try { await ElMessageBox.confirm(`确认删除已选择的 ${target.length} 条元任务吗？删除后的业务影响待确认。`, '删除元任务确认', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '返回检查' }) } catch { return }
  deleting.value = true
  await new Promise(resolve => window.setTimeout(resolve, 500))
  const ids = new Set(target.map(item => item.id))
  sourceRows.value = sourceRows.value.filter(item => !ids.has(item.id))
  selectedRows.value = []
  deleting.value = false
  ElMessage.success('元任务已删除')
}
</script>

<template>
  <section class="requirement-page meta-task-page">
    <PageHeader title="元任务集合" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="元任务数据" />
    <template v-else>
      <div class="filter-panel meta-task-filter-panel">
        <el-form class="filter-form meta-task-filter-form" label-position="left">
          <el-form-item label="任务需求号"><el-input v-model="filters.requirementNo" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="元任务号"><el-input v-model="filters.metaTaskNo" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="状态"><el-select v-model="filters.status" placeholder="请选择" clearable><el-option v-for="item in metaTaskStatuses" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item v-show="expanded" label="任务类型"><el-select v-model="filters.type" placeholder="请选择" clearable><el-option v-for="item in metaTaskTypes" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item v-show="expanded" label="关联计划"><el-input v-model="filters.plan" placeholder="请输入" clearable /></el-form-item>
          <el-form-item v-show="expanded" label="优先级"><el-select v-model="filters.priority" placeholder="请选择" clearable><el-option v-for="item in 16" :key="item" :label="String(item)" :value="String(item)" /></el-select></el-form-item>
          <el-form-item v-show="expanded" class="date-field" label="创建时间"><el-date-picker v-model="filters.createdRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
        </el-form>
        <div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查 询</el-button><el-button :icon="Refresh" @click="reset">重 置</el-button><el-button type="success" :icon="Download" @click="exportRows">导 出</el-button></div>
        <button class="expand-filter" type="button" :aria-expanded="expanded" :aria-label="expanded ? '收起筛选条件' : '展开筛选条件'" @click="expanded = !expanded"><component :is="expanded ? ArrowUp : ArrowDown" /></button>
      </div>

      <div class="batch-actions"><el-button type="danger" plain :icon="Delete" :loading="deleting" @click="removeRecords()">删除</el-button><span>时间：北京时间（UTC+8）</span></div>
      <div class="table-region"><el-table :data="rows" height="100%" class="requirement-table" empty-text="暂无元任务" @selection-change="selectionChange">
        <el-table-column type="selection" width="42" fixed="left" />
        <el-table-column prop="id" label="元任务编号" min-width="170" show-overflow-tooltip />
        <el-table-column prop="requirementNo" label="任务原需求号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" min-width="80" />
        <el-table-column prop="satellite" label="执行卫星" min-width="90" />
        <el-table-column prop="createdAt" label="创建时间" min-width="165" />
        <el-table-column prop="priority" label="优先级" min-width="76" align="center" />
        <el-table-column label="状态" min-width="90" align="center"><template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column prop="mark" label="元任务标记" min-width="112" />
        <el-table-column prop="planningNo" label="筹划编号" min-width="250" show-overflow-tooltip />
        <el-table-column prop="startedAt" label="开始时间" min-width="165" />
        <el-table-column prop="endedAt" label="结束时间" min-width="165" />
        <el-table-column prop="payload" label="载荷信息" min-width="86" />
        <el-table-column prop="rollRange" label="侧摆角" min-width="100" />
      </el-table></div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="454" :page-sizes="[10,30,50,100,200]" /></div>
    </template>
  </section>
</template>
