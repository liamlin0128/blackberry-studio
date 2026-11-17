<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, ArrowUp, Close, Document, Download, Plus, RefreshRight, Search, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import InstanceOrbitPreview from '../components/ops/InstanceOrbitPreview.vue'
import PageStatePanel from '../components/ops/PageStatePanel.vue'
import { initialModels } from '../mocks/models'
import { useSimulationStore } from '../stores/simulation'
import type { InstanceStatus, SimulationInstance } from '../types/simulation'

const route = useRoute()
const store = useSimulationStore()
const viewMode = ref<'list' | 'card'>('list')
type InstanceStatusFilter = InstanceStatus | 'offline' | 'initial' | 'closed' | 'failed'
const filterForm = reactive<{ instanceType: '' | SimulationInstance['instanceType']; statuses: InstanceStatusFilter[]; timeRange: string[] }>({ instanceType: '', statuses: [], timeRange: [] })
const appliedFilter = reactive<{ instanceType: '' | SimulationInstance['instanceType']; statuses: InstanceStatusFilter[]; timeRange: string[] }>({ instanceType: '', statuses: [], timeRange: [] })
const instanceTypeOptions: SimulationInstance['instanceType'][] = ['在线仿真', '模拟仿真', '推演仿真']
const instanceStatusOptions: Array<{ label: string; value: InstanceStatusFilter }> = [
  { label: '离线', value: 'offline' }, { label: '初始', value: 'initial' }, { label: '运行', value: 'running' }, { label: '暂停', value: 'paused' }, { label: '停止', value: 'stopped' }, { label: '关闭', value: 'closed' }, { label: '失败', value: 'failed' },
]
const logDialogVisible = ref(false)
const selectedInstance = ref<SimulationInstance | null>(null)
const logCategory = ref<'all' | 'operation' | 'error'>('all')
const logAction = ref('all')
const logTableRef = ref<HTMLElement | null>(null)
const createDialogVisible = ref(false)
const createStep = ref(0)
const createForm = reactive({
  name: '',
  remark: '',
  sceneId: '',
  modelNames: [] as string[],
  instanceType: '在线仿真' as SimulationInstance['instanceType'],
})
const pageState = computed(() => ['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? String(route.query.state) as 'loading' | 'empty' | 'error' | 'forbidden' : null)
const filteredInstances = computed(() => {
  return store.instances.filter((item) => {
    const matchesType = !appliedFilter.instanceType || item.instanceType === appliedFilter.instanceType
    const matchesStatus = !appliedFilter.statuses.length || appliedFilter.statuses.includes(item.status)
    const [start, end] = appliedFilter.timeRange
    const matchesTime = !start || !end || (item.recordTime >= start && item.recordTime <= end)
    return matchesType && matchesStatus && matchesTime
  })
})
const selectedLogs = computed(() => selectedInstance.value ? store.instanceLogs.filter((item) => item.instanceId === selectedInstance.value?.id) : [])
const filteredLogs = computed(() => selectedLogs.value.filter((item) => (logCategory.value === 'all' || item.level === logCategory.value) && (logAction.value === 'all' || item.action === logAction.value)))
const logActions = computed(() => [...new Set(selectedLogs.value.map((item) => item.action))])
const statusLabel: Record<InstanceStatus, string> = { initial: '初始', running: '运行中', paused: '已暂停', stopped: '已停止' }
function statusText(status: InstanceStatus) { return statusLabel[status] }
const selectedSceneName = computed(() => store.scenes.find((item) => item.id === createForm.sceneId)?.name ?? '—')

function queryInstances() {
  appliedFilter.instanceType = filterForm.instanceType
  appliedFilter.statuses = [...filterForm.statuses]
  appliedFilter.timeRange = [...filterForm.timeRange]
}
function resetInstanceQuery() {
  filterForm.instanceType = ''
  filterForm.statuses = []
  filterForm.timeRange = []
  queryInstances()
}

function openCreateDialog() {
  createStep.value = 0
  Object.assign(createForm, { name: '', remark: '', sceneId: '', modelNames: [], instanceType: '在线仿真' })
  createDialogVisible.value = true
}
function nextCreateStep() {
  if (createStep.value === 0 && !createForm.name.trim()) {
    ElMessage.warning('请填写实例名称')
    return
  }
  if (createStep.value === 1 && (!createForm.sceneId || createForm.modelNames.length === 0)) {
    ElMessage.warning('请选择场景和实体模型')
    return
  }
  createStep.value += 1
}
function saveCreatedInstance() {
  const record = store.createInstance({
    name: createForm.name.trim(),
    instanceType: createForm.instanceType,
    scene: selectedSceneName.value,
    modelNames: [...createForm.modelNames],
  })
  createDialogVisible.value = false
  ElMessage.success(`已创建实例：${record.recordNo}`)
}
function openLogs(instance: SimulationInstance) {
  selectedInstance.value = instance
  logCategory.value = 'all'
  logAction.value = 'all'
  logDialogVisible.value = true
}
function updateStatus(instance: SimulationInstance, status: InstanceStatus) {
  store.setInstanceStatus(instance.id, status)
  ElMessage.success(`实例状态已更新为：${statusLabel[status]}`)
}
async function stopInstance(instance: SimulationInstance) {
  try {
    await ElMessageBox.confirm(`确定关闭“${instance.name}”吗？`, '关闭确认', { confirmButtonText: '确定关闭', cancelButtonText: '取消', type: 'warning', closeOnClickModal: false })
    updateStatus(instance, 'stopped')
  } catch { /* 用户取消 */ }
}
function restartInstance(instance: SimulationInstance) {
  store.addInstanceLog(instance.id, '重启', '实例已执行重启操作。')
  ElMessage.success('已重启')
}
function scrollLogs(position: 'top' | 'bottom') {
  if (!logTableRef.value) return
  logTableRef.value.scrollTo({ top: position === 'top' ? 0 : logTableRef.value.scrollHeight, behavior: 'smooth' })
}
function exportLogs() {
  const columns = ['序号', '时间', '类型', '操作类型', '描述', '来源', '操作者']
  const rows = filteredLogs.value.map((item, index) => [index + 1, item.time, item.level === 'operation' ? '操作' : '错误', item.action, item.content, item.source, item.operator])
  const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  link.download = `${selectedInstance.value?.recordNo ?? '实例'}-日志.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <section>
    <header class="page-heading"><div><div class="heading-title"><span class="heading-mark" /><h1>实例管理</h1></div><p>管理所有仿真实例</p></div><div class="instance-view-switch" aria-label="实例视图切换"><el-button-group><el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode = 'list'">列表视图</el-button><el-button :type="viewMode === 'card' ? 'primary' : 'default'" @click="viewMode = 'card'">卡片视图</el-button></el-button-group></div></header>
    <PageStatePanel v-if="pageState" :state="pageState" />
    <template v-else>
      <el-form class="instance-query-form" :model="filterForm" @submit.prevent="queryInstances"><el-select v-model="filterForm.instanceType" class="instance-query-type" placeholder="类型" clearable><el-option v-for="item in instanceTypeOptions" :key="item" :label="item" :value="item" /></el-select><el-select v-model="filterForm.statuses" class="instance-query-status" placeholder="状态" multiple collapse-tags collapse-tags-tooltip><el-option v-for="item in instanceStatusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select><el-date-picker v-model="filterForm.timeRange" class="instance-query-range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /><el-button type="primary" :icon="Search" @click="queryInstances">查询</el-button><el-button @click="resetInstanceQuery">重置</el-button></el-form>
      <div class="model-toolbar"><el-button type="primary" :icon="Plus" @click="openCreateDialog">创建实例</el-button></div>
      <el-card v-if="viewMode === 'list'" class="model-table-card" shadow="never"><el-table :data="filteredInstances" class="model-table" table-layout="auto" empty-text="暂无实例数据">
        <el-table-column prop="recordNo" label="编号" min-width="112" /><el-table-column prop="name" label="实例名称" min-width="160" /><el-table-column prop="instanceType" label="实例类型" min-width="104" /><el-table-column prop="type" label="仿真类型" min-width="100" /><el-table-column prop="scene" label="场景" min-width="120" />
        <el-table-column label="状态" min-width="80"><template #default="{ row }"><span class="simulation-status" :class="`is-${row.status}`">{{ statusText(row.status) }}</span></template></el-table-column>
        <el-table-column prop="runtime" label="运行时长" min-width="100" />
        <el-table-column label="操作" min-width="255" fixed="right"><template #default="{ row }"><el-button v-if="row.status !== 'running'" link type="primary" @click="updateStatus(row, 'running')">启动</el-button><el-button v-if="row.status === 'running'" link type="primary" @click="updateStatus(row, 'paused')">暂停</el-button><el-button v-if="row.status !== 'stopped'" link type="danger" @click="stopInstance(row)">关闭</el-button><el-button link type="primary" @click="restartInstance(row)">重启</el-button><el-button link type="primary" @click="openLogs(row)">日志</el-button></template></el-table-column>
      </el-table></el-card>
      <div v-else class="instance-card-grid">
        <el-card v-for="instance in filteredInstances" :key="instance.id" class="instance-card" shadow="never">
          <template #header><div class="instance-card-head"><span>{{ instance.recordNo }}</span><span class="simulation-status" :class="`is-${instance.status}`">{{ statusText(instance.status) }}</span></div></template>
          <InstanceOrbitPreview :instance="instance" />
          <h2>{{ instance.name }}</h2>
          <dl class="instance-meta"><div><dt>实例类型</dt><dd>{{ instance.instanceType }}</dd></div><div><dt>仿真类型</dt><dd>{{ instance.type }}</dd></div><div><dt>场景</dt><dd>{{ instance.scene }}</dd></div><div><dt>运行</dt><dd>{{ instance.runtime }}</dd></div></dl>
          <div class="instance-actions" aria-label="实例操作">
            <el-tooltip v-if="instance.status !== 'running'" content="启动" placement="top"><el-button class="instance-action-button" size="small" type="primary" plain circle :icon="VideoPlay" aria-label="启动实例" @click="updateStatus(instance, 'running')" /></el-tooltip>
            <el-tooltip v-if="instance.status === 'running'" content="暂停" placement="top"><el-button class="instance-action-button" size="small" type="primary" plain circle :icon="VideoPause" aria-label="暂停实例" @click="updateStatus(instance, 'paused')" /></el-tooltip>
            <el-tooltip v-if="instance.status !== 'stopped'" content="关闭" placement="top"><el-button class="instance-action-button" size="small" type="danger" plain circle :icon="Close" aria-label="关闭实例" @click="stopInstance(instance)" /></el-tooltip>
            <el-tooltip content="重启" placement="top"><el-button class="instance-action-button" size="small" type="primary" plain circle :icon="RefreshRight" aria-label="重启实例" @click="restartInstance(instance)" /></el-tooltip>
            <el-tooltip content="日志" placement="top"><el-button class="instance-action-button" size="small" type="primary" plain circle :icon="Document" aria-label="查看实例日志" @click="openLogs(instance)" /></el-tooltip>
          </div>
        </el-card>
      </div>
    </template>
    <el-dialog v-model="createDialogVisible" title="创建实例" width="760px" class="simulation-dialog instance-create-dialog" :close-on-click-modal="false" destroy-on-close>
      <el-steps :active="createStep" finish-status="success" simple class="instance-create-steps"><el-step title="基本信息" /><el-step title="模型、场景设置" /><el-step title="确认" /></el-steps>
      <el-form v-if="createStep === 0" label-width="100px" class="instance-create-form"><el-form-item label="实例名称" required><el-input v-model="createForm.name" placeholder="请输入" /></el-form-item><el-form-item label="备注说明"><el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入" /></el-form-item></el-form>
      <el-form v-else-if="createStep === 1" label-width="100px" class="instance-create-form"><el-form-item label="场景选择" required><el-select v-model="createForm.sceneId" class="form-full-width" placeholder="请选择"><el-option v-for="scene in store.scenes" :key="scene.id" :label="scene.name" :value="scene.id" /></el-select></el-form-item><el-form-item label="实体模型" required><el-checkbox-group v-model="createForm.modelNames" class="instance-model-choice"><el-checkbox v-for="model in initialModels" :key="model.id" :value="model.name">{{ model.name }}</el-checkbox></el-checkbox-group></el-form-item></el-form>
      <el-descriptions v-else :column="1" border class="instance-create-summary"><el-descriptions-item label="实例名称">{{ createForm.name }}</el-descriptions-item><el-descriptions-item label="备注说明">{{ createForm.remark || '—' }}</el-descriptions-item><el-descriptions-item label="场景选择">{{ selectedSceneName }}</el-descriptions-item><el-descriptions-item label="实体模型">{{ createForm.modelNames.join('、') }}</el-descriptions-item></el-descriptions>
      <template #footer><el-button v-if="createStep > 0" @click="createStep -= 1">上一步</el-button><el-button v-if="createStep < 2" type="primary" @click="nextCreateStep">下一步</el-button><el-button v-else type="primary" @click="saveCreatedInstance">保存</el-button><el-button @click="createDialogVisible = false">取消</el-button></template>
    </el-dialog>
    <el-dialog v-model="logDialogVisible" class="instance-log-dialog" width="calc(100vw - 64px)" top="32px" destroy-on-close>
      <template #header><div class="instance-log-header"><div class="instance-log-title"><h2>仿真实例日志</h2><span class="instance-log-id">{{ selectedInstance?.recordNo }}</span><span class="simulation-status" :class="`is-${selectedInstance?.status}`">{{ selectedInstance ? statusText(selectedInstance.status) : '' }}</span></div><el-button text :icon="Close" aria-label="关闭日志" @click="logDialogVisible = false" /></div></template>
      <div class="instance-log-tools"><div class="instance-log-filters"><span>类型</span><el-select v-model="logCategory" size="small" class="instance-log-select"><el-option label="全部" value="all" /><el-option label="操作" value="operation" /><el-option label="错误" value="error" /></el-select><span>操作</span><el-select v-model="logAction" size="small" class="instance-log-select"><el-option label="全部" value="all" /><el-option v-for="action in logActions" :key="action" :label="action" :value="action" /></el-select></div><div class="instance-log-tools-right"><span>共 {{ filteredLogs.length }} 条</span><el-button size="small" :icon="ArrowDown" @click="scrollLogs('bottom')">底部</el-button><el-button size="small" :icon="ArrowUp" @click="scrollLogs('top')">顶部</el-button></div></div>
      <div ref="logTableRef" class="instance-log-table-wrap"><el-table :data="filteredLogs" class="model-table instance-log-table" empty-text="暂无日志记录"><el-table-column label="序号" width="76"><template #default="{ $index }">{{ $index + 1 }}</template></el-table-column><el-table-column prop="time" label="时间" min-width="168" /><el-table-column label="类型" min-width="88"><template #default="{ row }"><span class="instance-log-kind" :class="`is-${row.level}`">{{ row.level === 'operation' ? '操作' : '错误' }}</span></template></el-table-column><el-table-column prop="action" label="操作类型" min-width="104" /><el-table-column prop="content" label="描述" min-width="280" /><el-table-column prop="source" label="来源" min-width="150" /><el-table-column prop="operator" label="操作者" min-width="120" /></el-table></div>
      <template #footer><div class="instance-log-footer"><span>日志时间：北京时间（UTC+8）</span><div><el-button :icon="Download" @click="exportLogs">导出日志</el-button><el-button type="primary" @click="logDialogVisible = false">关闭</el-button></div></div></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.instance-query-form{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px}.instance-query-type{width:132px}.instance-query-status{width:220px}.instance-query-range{width:420px;max-width:100%}.instance-log-header,.instance-log-title,.instance-log-tools,.instance-log-filters,.instance-log-tools-right,.instance-log-footer{display:flex;align-items:center}.instance-log-header,.instance-log-tools,.instance-log-footer{justify-content:space-between}.instance-log-title,.instance-log-filters,.instance-log-tools-right{gap:12px}.instance-log-title h2{margin:0;color:var(--sp-text-primary);font-size:18px;line-height:28px}.instance-log-id{padding:2px 10px;border-radius:12px;background:var(--sp-surface-muted);color:var(--sp-text-secondary);font-size:12px}.instance-log-tools{min-height:52px;padding:0 16px;border-bottom:1px solid var(--sp-border);color:var(--sp-text-secondary);font-size:13px}.instance-log-select{width:100px}.instance-log-table-wrap{max-height:calc(100vh - 260px);overflow:auto}.instance-log-kind{font-weight:500}.instance-log-kind.is-operation{color:var(--el-color-primary)}.instance-log-kind.is-error{color:var(--el-color-danger)}.instance-log-footer{padding:0 4px;color:var(--sp-text-tertiary);font-size:12px}.instance-log-footer>div{display:flex;gap:8px}.instance-create-steps{margin:0 0 24px}.instance-create-form{max-width:620px;padding:4px 18px 0 0}.instance-model-choice{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.instance-model-choice .el-checkbox{margin-right:0}.instance-create-summary{margin:0 0 10px}
</style>
