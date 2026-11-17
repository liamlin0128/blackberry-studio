<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElButton, ElCheckbox, ElCheckboxGroup, ElDatePicker, ElDialog, ElInput, ElMessage, ElOption, ElPagination, ElRadio, ElRadioGroup, ElSelect, ElSteps, ElStep, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { groundStations, planningTasks, uploadArcs } from '../../mocks/semiAutomaticPlanning'
import { taskPlans } from '../../mocks/taskPlans'
import type { PlanningTask, UploadArc } from '../../mocks/semiAutomaticPlanning'

type Mode = 'task' | 'data'
const props = defineProps<{ visible: boolean; initialMode?: Mode; initialPlanNo?: string }>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; completed: [value: { mode: Mode; numbers: string[] }] }>()
const mode = ref<Mode>('task')
const step = ref(0)
const selectedTasks = ref<string[]>([])
const selectedPlan = ref('')
const contents = ref<string[]>(['遥感成像计划', '数传计划'])
const uploadMode = ref('auto')
const selectedArcs = ref<string[]>([])
const manualArcText = ref('')
const stationMode = ref('all')
const selectedStations = ref<string[]>([])
const windowRange = ref<string[]>([])
const arcSatellite = ref('')
const arcStation = ref('')
const arcRange = ref<string[]>([])
const arcPage = ref(1)
const arcPageSize = ref(10)

function format(date: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
}
function offset(days: number, hour = 0) { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return format(d) }
const tasks = computed<PlanningTask[]>(() => planningTasks.map((item, index) => ({ ...item, earliestAt: offset(index), latestAt: offset(index + 4, 23) })).filter(item => !windowRange.value.length || item.earliestAt <= windowRange.value[1] && item.latestAt >= windowRange.value[0]))
const plans = computed(() => taskPlans.filter(item => ['单星', '协同', '应急', '双星'].includes(item.type) && ['待发送', '已发送'].includes(item.status)))
const arcs = computed<UploadArc[]>(() => uploadArcs.map((item, index) => ({ ...item, startedAt: offset(index % 7, 8 + index % 9), endedAt: offset(index % 7, 9 + index % 9) })).filter(item => (!arcSatellite.value || item.satellite === arcSatellite.value) && (!arcStation.value || item.station === arcStation.value) && (!arcRange.value.length || item.startedAt <= arcRange.value[1] && item.endedAt >= arcRange.value[0])))
const arcPageRows = computed(() => arcs.value.slice((arcPage.value - 1) * arcPageSize.value, arcPage.value * arcPageSize.value))
const plan = computed(() => plans.value.find(item => item.planNo === selectedPlan.value))
const stepLabels = computed(() => mode.value === 'task' ? ['选择任务', '设置规划约束', '确认执行'] : ['选择计划', '设置数传约束', '确认执行'])
const manualIds = computed(() => manualArcText.value.split(/[,，\s]+/).map(x => x.trim()).filter(Boolean))

watch(() => props.visible, value => { if (value) reset(props.initialMode ?? 'task', props.initialPlanNo) })
function reset(nextMode: Mode, planNo?: string) {
  mode.value = nextMode; step.value = 0; selectedTasks.value = []; selectedPlan.value = planNo && plans.value.some(item => item.planNo === planNo) ? planNo : ''
  contents.value = ['遥感成像计划', '数传计划']; uploadMode.value = 'auto'; selectedArcs.value = []; manualArcText.value = ''
  stationMode.value = 'all'; selectedStations.value = []; windowRange.value = [offset(0), offset(7, 23)]
  arcSatellite.value = ''; arcStation.value = ''; arcRange.value = []; arcPage.value = 1; arcPageSize.value = 10
}
function setMode(next: Mode) { reset(next) }
function toggleTask(no: string) { selectedTasks.value = selectedTasks.value.includes(no) ? selectedTasks.value.filter(x => x !== no) : [...selectedTasks.value, no] }
function toggleArc(no: string) { selectedArcs.value = selectedArcs.value.includes(no) ? selectedArcs.value.filter(x => x !== no) : [...selectedArcs.value, no] }
function validWindow() { return windowRange.value.length === 2 && windowRange.value[0] < windowRange.value[1] }
function next() {
  if (step.value === 0) {
    if (mode.value === 'task' && !selectedTasks.value.length) return ElMessage.warning('请至少选择一个任务')
    if (mode.value === 'data' && !selectedPlan.value) return ElMessage.warning('请选择一个成像计划')
  }
  if (step.value === 1) {
    if (!validWindow()) return ElMessage.warning('开始时间必须早于结束时间')
    if (mode.value === 'task') {
      if (selectedTasks.value.some(no => !tasks.value.some(item => item.taskNo === no))) return ElMessage.warning('所选任务的时间窗与期望执行时间不相交，请重新选择')
      if (!contents.value.length) return ElMessage.warning('请至少选择一项规划内容')
      if (uploadMode.value === 'range' && !selectedArcs.value.length) return ElMessage.warning('请选择上注弧段')
      if (uploadMode.value === 'manual' && (!manualIds.value.length || manualIds.value.some(id => !/^MD1[AB]TY070[12]\d{5}$/.test(id) || !uploadArcs.some(arc => arc.id === id)))) return ElMessage.warning('请输入存在的上注弧段编号，多个编号用逗号分隔')
    }
    if ((mode.value === 'data' || contents.value.includes('数传计划')) && stationMode.value === 'pick' && !selectedStations.value.length) return ElMessage.warning('请至少选择一个数传地面站')
  }
  if (step.value < 2) { step.value += 1; return }
  emit('completed', { mode: mode.value, numbers: mode.value === 'task' ? selectedTasks.value : [selectedPlan.value] })
  emit('update:visible', false)
}
const uploadLabels: Record<string, string> = { auto: '同时规划上注弧段', range: '指定上注弧段范围', manual: '手动输入弧段编号', none: '不规划上注弧段' }
</script>

<template>
  <el-dialog :model-value="visible" title="定制规划" width="min(960px, 94vw)" class="semi-planning-dialog" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div class="semi-mode-tabs" role="tablist" aria-label="规划类型"><button type="button" :class="{ active: mode === 'task' }" @click="setMode('task')">任务定制规划</button><button type="button" :class="{ active: mode === 'data' }" @click="setMode('data')">数传规划</button></div>
    <el-steps :active="step" align-center class="semi-steps"><el-step v-for="label in stepLabels" :key="label" :title="label" /></el-steps>
    <div class="semi-content">
      <template v-if="step === 0 && mode === 'task'">
        <div class="semi-section-head"><strong>可规划任务</strong><span>已选 {{ selectedTasks.length }} 个</span></div>
        <div class="semi-field"><label>期望执行时间（北京时间）</label><el-date-picker v-model="windowRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"/></div>
        <div class="semi-selection-tools"><el-button size="small" @click="selectedTasks = tasks.map(item => item.taskNo)">全选</el-button><el-button size="small" @click="selectedTasks = []">清空</el-button><span>仅显示状态符合要求、时间窗与本次规划相交的任务</span></div>
        <el-table :data="tasks" height="360" row-key="taskNo" @row-click="(row) => toggleTask(row.taskNo)"><el-table-column label="选择" width="60"><template #default="{ row }"><el-checkbox :model-value="selectedTasks.includes(row.taskNo)" @click.stop="toggleTask(row.taskNo)" /></template></el-table-column><el-table-column prop="taskNo" label="任务号" width="135"/><el-table-column prop="name" label="任务名称" min-width="150"/><el-table-column prop="type" label="类型" width="95"/><el-table-column prop="status" label="状态" width="90"/><el-table-column prop="priority" label="优先级" width="80"/><el-table-column label="执行时间范围" min-width="250"><template #default="{ row }">{{ row.earliestAt }} 至 {{ row.latestAt }}</template></el-table-column></el-table>
      </template>
      <template v-else-if="step === 0">
        <div class="semi-section-head"><strong>选择成像计划</strong><span>单选</span></div>
        <el-table :data="plans" height="360" row-key="planNo" @row-click="(row) => selectedPlan = row.planNo"><el-table-column label="选择" width="60"><template #default="{ row }"><el-radio :model-value="selectedPlan" :value="row.planNo" @click.stop="selectedPlan = row.planNo"><span /></el-radio></template></el-table-column><el-table-column prop="planNo" label="计划编号" min-width="130"/><el-table-column prop="satellite" label="执行卫星" min-width="110"/><el-table-column prop="arcId" label="弧段 ID" min-width="190"/><el-table-column prop="type" label="计划类型" width="100"/><el-table-column prop="status" label="状态" width="100"/></el-table>
      </template>
      <template v-else-if="step === 1">
        <template v-if="mode === 'task'">
          <div class="semi-field"><label>规划内容 <em>*</em></label><el-checkbox-group v-model="contents"><el-checkbox value="遥感成像计划">遥感成像计划</el-checkbox><el-checkbox value="数传计划">数传计划</el-checkbox></el-checkbox-group></div>
          <div class="semi-field"><label>上注弧段处理 <em>*</em></label><el-radio-group v-model="uploadMode" class="semi-radio-grid"><el-radio value="auto">同时规划上注弧段</el-radio><el-radio value="range">指定上注弧段范围</el-radio><el-radio value="manual">手动输入弧段编号</el-radio><el-radio value="none">不规划上注弧段</el-radio></el-radio-group></div>
          <div v-if="uploadMode === 'range'" class="semi-arc-box"><div class="semi-arc-filters"><el-select v-model="arcSatellite" placeholder="全部卫星" clearable @change="arcPage = 1"><el-option label="木铎1A" value="木铎1A"/><el-option label="木铎1B" value="木铎1B"/></el-select><el-select v-model="arcStation" placeholder="全部地面站" clearable @change="arcPage = 1"><el-option v-for="station in groundStations" :key="station" :label="station" :value="station"/></el-select><el-date-picker v-model="arcRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" @change="arcPage = 1"/></div><el-table :data="arcPageRows" height="220" row-key="id" @row-click="(row) => toggleArc(row.id)"><el-table-column label="选择" width="60"><template #default="{ row }"><el-checkbox :model-value="selectedArcs.includes(row.id)" @click.stop="toggleArc(row.id)"/></template></el-table-column><el-table-column prop="id" label="弧段 ID" min-width="175"/><el-table-column prop="startedAt" label="开始时间" min-width="155"/><el-table-column prop="endedAt" label="结束时间" min-width="155"/><el-table-column prop="satellite" label="卫星" width="90"/><el-table-column prop="station" label="地面站" min-width="130"/><el-table-column label="状态" width="85"><template #default="{ row }"><el-tag :type="row.status === '未占用' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag></template></el-table-column></el-table><div class="semi-arc-footer"><span>已选 {{ selectedArcs.length }} 个弧段 <el-button link type="primary" @click="selectedArcs = []">清空</el-button></span><el-pagination v-model:current-page="arcPage" v-model:page-size="arcPageSize" small layout="total, sizes, prev, pager, next" :page-sizes="[10,20,50]" :total="arcs.length"/></div></div>
          <div v-if="uploadMode === 'manual'" class="semi-field"><el-input v-model="manualArcText" placeholder="输入弧段编号，多个用逗号分隔"/></div>
        </template>
        <div v-if="mode === 'data' || contents.includes('数传计划')" class="semi-field"><label>数传地面站</label><el-radio-group v-model="stationMode"><el-radio value="all">不指定（全部可用地面站）</el-radio><el-radio value="pick">指定地面站</el-radio></el-radio-group><el-checkbox-group v-if="stationMode === 'pick'" v-model="selectedStations" class="semi-station-list"><el-checkbox v-for="station in groundStations" :key="station" :value="station">{{ station }}</el-checkbox></el-checkbox-group></div>
        <div class="semi-field"><label>{{ mode === 'task' ? '期望执行时间' : '数传时间窗口' }} <em>*</em></label><el-date-picker v-model="windowRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"/></div>
      </template>
      <template v-else><div class="semi-section-head"><strong>规划摘要</strong></div><dl class="semi-summary"><template v-if="mode === 'task'"><dt>已选任务号</dt><dd>{{ selectedTasks.join('；') }}</dd><dt>规划内容</dt><dd>{{ contents.join('、') }}</dd><dt>上注弧段处理</dt><dd>{{ uploadLabels[uploadMode] }}<span v-if="uploadMode === 'range'">：{{ selectedArcs.join('、') }}</span><span v-if="uploadMode === 'manual'">：{{ manualIds.join('、') }}</span></dd></template><template v-else><dt>目标计划</dt><dd>{{ plan?.planNo }}（{{ plan?.satellite }} · {{ plan?.type }} · {{ plan?.status }}）</dd><dt>弧段 ID</dt><dd>{{ plan?.arcId }}</dd></template><dt>数传地面站</dt><dd>{{ stationMode === 'all' ? '全部可用地面站' : selectedStations.join('、') }}</dd><dt>{{ mode === 'task' ? '期望执行时间' : '数传时间窗口' }}</dt><dd>{{ windowRange[0] }} 至 {{ windowRange[1] }}（北京时间）</dd></dl></template>
    </div>
    <template #footer><div class="semi-footer"><span>时间均为北京时间</span><div><el-button v-if="step > 0" @click="step -= 1">上一步</el-button><el-button type="primary" @click="next">{{ step === 2 ? '确认执行' : '下一步' }}</el-button></div></div></template>
  </el-dialog>
</template>

<style scoped>
.semi-mode-tabs{display:flex;gap:4px;border-bottom:1px solid #e5eaf1;margin-bottom:22px}.semi-mode-tabs button{border:0;background:none;padding:0 20px 13px;color:#687789;cursor:pointer;font:inherit}.semi-mode-tabs button.active{color:var(--el-color-primary);font-weight:600;border-bottom:2px solid var(--el-color-primary)}.semi-steps{margin-bottom:18px}.semi-content{min-height:390px;max-height:min(57vh,570px);overflow:auto;padding:4px 2px}.semi-section-head{display:flex;justify-content:space-between;align-items:center;margin:0 0 12px;color:#23364d}.semi-section-head span,.semi-selection-tools span{color:#8290a1;font-size:12px}.semi-selection-tools{display:flex;align-items:center;gap:8px;margin-bottom:10px}.semi-selection-tools span{margin-left:auto}.semi-field{margin-bottom:20px}.semi-field>label{display:block;font-weight:600;color:#34475e;margin-bottom:10px}.semi-field em{color:#e65b59;font-style:normal}.semi-radio-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.semi-radio-grid :deep(.el-radio){margin-right:0}.semi-station-list{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:10px}.semi-arc-box{border:1px solid #dce4ef;border-radius:6px;padding:12px;margin:-4px 0 20px}.semi-arc-filters{display:flex;gap:8px;margin-bottom:12px}.semi-arc-filters :deep(.el-select){width:150px}.semi-arc-filters :deep(.el-date-editor){max-width:365px}.semi-arc-footer{display:flex;justify-content:space-between;align-items:center;padding-top:10px;color:#62758b;font-size:12px}.semi-summary{display:grid;grid-template-columns:150px 1fr;gap:0;margin:0;border:1px solid #e3e9f1;border-radius:6px}.semi-summary dt,.semi-summary dd{margin:0;padding:13px 16px;border-bottom:1px solid #e8edf4}.semi-summary dt{background:#f7f9fc;color:#62758b}.semi-summary dd{overflow-wrap:anywhere;color:#25364b}.semi-summary dt:nth-last-of-type(1),.semi-summary dd:last-child{border-bottom:0}.semi-footer{display:flex;justify-content:space-between;align-items:center}.semi-footer span{font-size:12px;color:#8a98a9}@media(max-width:700px){.semi-radio-grid{grid-template-columns:1fr}.semi-arc-filters{flex-wrap:wrap}.semi-summary{grid-template-columns:110px 1fr}}
</style>
