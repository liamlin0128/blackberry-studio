<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowUp, Download, Refresh, Search } from '@element-plus/icons-vue'
import {
  ElAlert, ElButton, ElDatePicker, ElForm, ElFormItem, ElIcon, ElInput, ElMessage,
  ElMessageBox, ElOption, ElPagination, ElResult, ElSelect, ElTable,
  ElTableColumn,
} from 'element-plus'
import RequirementDialog from '../components/ops/RequirementDialog.vue'
import PlanDetailDialog from '../components/task-plan/PlanDetailDialog.vue'
import PageHeader from '../components/shell/PageHeader.vue'
import { requirementRows, requirementStatuses, satellites, taskTypes } from '../mocks/requirements'
import { loadProjectRequirements, observationModes } from '../mocks/projectRequirements'
import { resolveTaskPlan } from '../mocks/taskPlans'
import type { PrototypeState } from '../types/prototype'
import type { RequirementRow } from '../types/requirements'
import type { TaskPlanRecord } from '../types/taskPlan'

const expanded = ref(false)
const router = useRouter()
const selectedRows = ref<RequirementRow[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'edit'>('detail')
const activeRow = ref<RequirementRow | null>(null)
const planDialogVisible = ref(false)
const activePlan = ref<TaskPlanRecord | null>(null)
const currentPage = ref(1)
const pageSize = ref(30)
const state = (new URLSearchParams(window.location.search).get('state') || 'normal') as PrototypeState
const filters = reactive({ sourceNo: '', taskNo: '', status: '', taskType: '', plan: '', created: [] as string[], priority: '', satellite: '' })
const appliedFilters = reactive({ ...filters, created: [] as string[] })
const projectDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
const projectRows = loadProjectRequirements().filter(row => row.taskNo).map(row => ({
  taskNo: row.taskNo, sourceNo: row.id, name: row.name, taskType: row.observationMode,
  satellites: row.satellite, priority: row.priority, status: (row.linkedTask?.status === '已取消' ? '已取消' : row.linkedTask?.status === '规划成功' ? '规划成功' : row.linkedTask?.status === '完成' ? '已完成' : '待规划') as RequirementRow['status'],
  createdAt: projectDate.format(new Date(row.createdAt)), earliestAt: projectDate.format(new Date(row.startAt)), latestAt: projectDate.format(new Date(row.endAt)),
  plans: (row.plans || []).map(plan => plan.no), coordinationResult: '待筹划',
}))
const workingRows = ref([...projectRows, ...requirementRows.map(row => ({ ...row }))])
const availableTaskTypes = [...taskTypes, ...observationModes.map(item => item.value)]
const filteredRows = computed(() => workingRows.value.filter(row =>
  (!appliedFilters.sourceNo || row.sourceNo.includes(appliedFilters.sourceNo)) && (!appliedFilters.taskNo || row.taskNo.includes(appliedFilters.taskNo)) &&
  (!appliedFilters.status || row.status === appliedFilters.status) && (!appliedFilters.taskType || row.taskType === appliedFilters.taskType) &&
  (!appliedFilters.plan || row.plans.some(plan => plan.includes(appliedFilters.plan))) && (!appliedFilters.priority || row.priority === Number(appliedFilters.priority)) &&
  (!appliedFilters.satellite || row.satellites === appliedFilters.satellite) &&
  (!appliedFilters.created.length || (row.createdAt >= `${appliedFilters.created[0]} 00:00:00` && row.createdAt <= `${appliedFilters.created[1]} 23:59:59`))))
const displayedRows = computed(() => state === 'empty' ? [] : filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))

function query() { Object.assign(appliedFilters, { ...filters, created: [...filters.created] }); currentPage.value = 1; ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条证据样例`) }
function reset() { const empty = { sourceNo: '', taskNo: '', status: '', taskType: '', plan: '', created: [], priority: '', satellite: '' }; Object.assign(filters, empty); Object.assign(appliedFilters, empty); currentPage.value = 1; ElMessage.success('筛选条件已重置') }
function openDialog(value: unknown, mode: 'detail' | 'edit') { activeRow.value = value as RequirementRow; dialogMode.value = mode; dialogVisible.value = true }
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const taskNo = params.get('taskNo')
  if (params.get('detail') === 'open' && taskNo) {
    const sourceNo = params.get('sourceNo')
    const row = workingRows.value.find(item => item.taskNo === taskNo && (!sourceNo || item.sourceNo === sourceNo))
    if (row) { filters.taskNo = taskNo; appliedFilters.taskNo = taskNo; openDialog(row, 'detail') }
    else ElMessage.warning(`未找到任务 ${taskNo}`)
  }
})
function openPlanDialog(planNo: string, requirementNo: string) { activePlan.value = resolveTaskPlan(planNo, requirementNo); planDialogVisible.value = true }
function savePriority(value: number) { if (activeRow.value) activeRow.value.priority = value }
function requireSelection(action: string) { if (!selectedRows.value.length) { ElMessage.warning(`请先选择需要${action}的任务需求`); return false } return true }
async function pendingAction(action: string) {
  if (!requireSelection(action)) return
  if (action === '区域筹划') {
    if (selectedRows.value.length !== 1) return ElMessage.warning('区域筹划需选择 1 条任务需求')
    const row = selectedRows.value[0]
    void router.push({ name: 'area-planning', query: { taskNo: row.taskNo, sourceNo: row.sourceNo, name: row.name, taskType: row.taskType, status: row.status, priority: String(row.priority), createdAt: row.createdAt, earliestAt: row.earliestAt, latestAt: row.latestAt, satellite: row.satellites } })
    return
  }
  try {
    await ElMessageBox.confirm(`将使用已选择的 ${selectedRows.value.length} 条任务需求进入规划计算，确认继续吗？`, '规划计算确认', { type: 'warning', confirmButtonText: '确认进入', cancelButtonText: '返回检查' })
  } catch { return }
  void router.push({ name: 'planning-compute', query: { taskNo: selectedRows.value.map(row => row.taskNo) } })
}
async function riskyAction(action: '删除' | '取消' | '完成') {
  if (!requireSelection(action)) return
  try {
    await ElMessageBox.confirm(`已选择 ${selectedRows.value.length} 条任务需求，确认执行“${action}”吗？`, `${action}确认`, { type: action === '删除' ? 'error' : 'warning', confirmButtonText: `确认${action}`, cancelButtonText: '返回检查' })
  } catch { return }
  ElMessage.success(`${action}成功`)
}
function exportRows() { ElMessage.success(`已生成 ${filteredRows.value.length} 条记录的导出任务`) }
</script>

<template>
  <section class="requirement-page">
    <PageHeader title="任务需求列表" />
    <el-result v-if="state === 'forbidden'" icon="warning" title="暂无访问权限" sub-title="请联系系统管理员申请任务需求查看权限。" />
    <el-alert v-else-if="state === 'error'" title="任务需求加载失败" description="请检查网络后重试。" type="error" show-icon :closable="false" />
    <template v-else>
    <div class="filter-panel">
      <el-form :model="filters" label-width="82px" class="filter-form">
        <el-form-item label="原需求号"><el-input v-model="filters.sourceNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="任务需求号"><el-input v-model="filters.taskNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="请选择" clearable><el-option v-for="item in requirementStatuses" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="任务类型"><el-select v-model="filters.taskType" placeholder="请选择" clearable><el-option v-for="item in availableTaskTypes" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="关联计划"><el-input v-model="filters.plan" placeholder="请输入" clearable /></el-form-item>
        <template v-if="expanded">
          <el-form-item label="创建时间" class="date-field"><el-date-picker v-model="filters.created" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="至" /></el-form-item>
          <el-form-item label="优先级"><el-select v-model="filters.priority" placeholder="请选择" clearable><el-option v-for="item in [6,8,12,13,14]" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="执行卫星"><el-select v-model="filters.satellite" placeholder="请选择" clearable><el-option v-for="item in satellites" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        </template>
      </el-form>
      <div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查 询</el-button><el-button :icon="Refresh" @click="reset">重 置</el-button><el-button :icon="Download" @click="exportRows">导 出</el-button></div>
      <button class="expand-filter" :aria-label="expanded ? '收起筛选条件' : '展开筛选条件'" @click="expanded = !expanded"><el-icon><component :is="expanded ? ArrowUp : ArrowDown" /></el-icon></button>
    </div>

    <div class="batch-actions"><el-button type="primary" @click="pendingAction('规划计算')">规划计算</el-button><el-button @click="pendingAction('区域筹划')">区域筹划</el-button><el-button type="danger" plain @click="riskyAction('删除')">删除</el-button><el-button @click="riskyAction('取消')">取消</el-button><el-button type="success" plain @click="riskyAction('完成')">完成</el-button><span>时间：北京时间（UTC+8）</span></div>

      <div class="table-region">
      <el-table v-loading="state === 'loading'" :data="displayedRows" table-layout="auto" size="small" height="100%" class="requirement-table" empty-text="暂无任务需求" @selection-change="selectedRows = $event">
        <el-table-column type="selection" width="42" fixed />
        <el-table-column prop="taskNo" label="任务编号" min-width="158" fixed show-overflow-tooltip />
        <el-table-column prop="sourceNo" label="原需求编号" min-width="142" show-overflow-tooltip />
        <el-table-column prop="name" label="任务名称" min-width="155" show-overflow-tooltip />
        <el-table-column prop="taskType" label="任务类型" min-width="98" show-overflow-tooltip />
        <el-table-column prop="satellites" label="执行卫星" min-width="118" show-overflow-tooltip />
        <el-table-column label="优先级" min-width="72" align="center"><template #default="{ row }"><span class="priority-chip" :data-level="row.priority">{{ row.priority }}</span></template></el-table-column>
        <el-table-column label="状态" min-width="92" align="center"><template #default="{ row }"><span class="status-badge" :data-status="row.status">{{ row.status }}</span></template></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="158" show-overflow-tooltip />
        <el-table-column prop="earliestAt" label="最早执行时间" min-width="158" show-overflow-tooltip />
        <el-table-column prop="latestAt" label="最晚执行时间" min-width="158" show-overflow-tooltip />
        <el-table-column label="关联计划" min-width="176"><template #default="{ row }"><div class="plan-links"><button v-for="plan in row.plans" :key="plan" class="link-button" :aria-label="`查看计划 ${plan}`" @click="openPlanDialog(plan, row.taskNo)">{{ plan }}</button><span v-if="!row.plans.length">—</span></div></template></el-table-column>
        <el-table-column prop="coordinationResult" label="统筹结果" min-width="112" show-overflow-tooltip />
        <el-table-column label="操作" width="108" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openDialog(row, 'detail')">查看</el-button><el-button link type="primary" @click="openDialog(row, 'edit')">编辑</el-button></template></el-table-column>
      </el-table>
      </div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="filteredRows.length" :page-sizes="[30]" /></div>
    </template>
    <RequirementDialog v-model:visible="dialogVisible" :mode="dialogMode" :row="activeRow" @saved="savePriority" />
    <PlanDetailDialog v-model:visible="planDialogVisible" :record="activePlan" />
  </section>
</template>
