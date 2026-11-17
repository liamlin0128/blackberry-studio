<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElButton, ElCheckbox, ElDatePicker, ElDialog, ElEmpty, ElInput, ElMessage, ElOption, ElPagination, ElSelect, ElTag } from 'element-plus'
import { loadProjectRequirements, observationModes, saveProjectRequirements } from '../mocks/projectRequirements'
import type { ProjectRequirement, ProjectRequirementStatus } from '../types/projectRequirement'
import type { PrototypeState } from '../types/prototype'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'

const route = useRoute()
const router = useRouter()
const demoState = computed(() => (['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? route.query.state : 'normal') as PrototypeState)
const rows = ref<ProjectRequirement[]>(loadProjectRequirements())
const status = ref<ProjectRequirementStatus | 'all'>('all')
const keyword = ref('')
const mode = ref('')
const earliestTimeRange = ref<[string, string] | null>(null)
const latestTimeRange = ref<[string, string] | null>(null)
const page = ref(1)
const pageSize = 5
const selected = ref<ProjectRequirement | null>(null)
const detailVisible = ref(false)
const cancelTarget = ref<ProjectRequirement | null>(null)
const cancelVisible = ref(false)
const acknowledged = ref(false)
const completeTarget = ref<ProjectRequirement | null>(null)
const completeVisible = ref(false)
const statuses: { value: ProjectRequirementStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' }, { value: '已创建', label: '已创建' }, { value: '执行中', label: '执行中' }, { value: '已完成', label: '已完成' },
  { value: '取消中', label: '取消中' }, { value: '已取消', label: '已取消' },
]
const formatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
const dateText = (value: string) => formatter.format(new Date(value)).replaceAll('/', '-')
const taskOf = (row: ProjectRequirement) => row.linkedTask === null ? null : row.linkedTask || (row.taskNo ? { no: row.taskNo, status: '模拟生成', type: observationModes.find(item => item.value === row.observationMode)?.code || '' } : null)
const plansOf = (row: ProjectRequirement) => (row.plans || []).filter(plan => plan.type !== '数传计划')
const targetType = (row: ProjectRequirement) => row.target.kind === 'point' ? '目标点' : row.target.kind === 'polygon' ? '绘制区域' : '行政区'
const targetText = (row: ProjectRequirement) => row.target.kind === 'point' ? `${row.target.coordinates[0].toFixed(4)}°E，${row.target.coordinates[1].toFixed(4)}°N` : row.target.kind === 'polygon' ? `${row.target.coordinates.length} 个顶点` : row.target.name
const timeState = (row: ProjectRequirement) => Date.now() < new Date(row.startAt).getTime() ? 'soon' : Date.now() <= new Date(row.endAt).getTime() ? 'ongoing' : 'over'
const timeLabel = (row: ProjectRequirement) => ({ soon: '即将开始', ongoing: '进行中', over: '已过期' })[timeState(row)]
const beijingTime = (value: string) => new Date(`${value.replace(' ', 'T')}+08:00`).getTime()
const inRange = (value: string, range: [string, string] | null) => !range || (new Date(value).getTime() >= beijingTime(range[0]) && new Date(value).getTime() <= beijingTime(range[1]))
const count = (value: ProjectRequirementStatus | 'all') => value === 'all' ? rows.value.length : rows.value.filter(row => row.status === value).length
const filtered = computed(() => rows.value.filter(row => {
  const query = keyword.value.trim().toLowerCase()
  return (status.value === 'all' || row.status === status.value)
    && (!query || `${row.name} ${row.id} ${taskOf(row)?.no || ''}`.toLowerCase().includes(query))
    && (!mode.value || row.observationMode === mode.value)
    && inRange(row.startAt, earliestTimeRange.value)
    && inRange(row.endAt, latestTimeRange.value)
}))
const visibleRows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch([status, keyword, mode, earliestTimeRange, latestTimeRange], () => { page.value = 1 })
function reset() { status.value = 'all'; keyword.value = ''; mode.value = ''; earliestTimeRange.value = null; latestTimeRange.value = null }
function openDetail(row: ProjectRequirement) { selected.value = row; detailVisible.value = true }
function openComplete(row: ProjectRequirement) { if (row.status !== '执行中') return; completeTarget.value = row; completeVisible.value = true }
function confirmComplete() {
  const row = completeTarget.value
  if (!row || row.status !== '执行中') return
  row.status = '已完成'
  row.logs = [...(row.logs || []), { time: dateText(new Date().toISOString()), text: '人工完结需求，状态 → 已完成；关联任务和计划状态未变更' }]
  saveProjectRequirements(rows.value)
  completeVisible.value = false
  completeTarget.value = null
  ElMessage.success('需求已完结')
}
function openCancel(row: ProjectRequirement) { if (row.status !== '执行中' && row.status !== '已创建') return; cancelTarget.value = row; acknowledged.value = false; cancelVisible.value = true }
function confirmCancel() {
  if (!acknowledged.value || !cancelTarget.value || !['执行中', '已创建'].includes(cancelTarget.value.status)) return
  const row = cancelTarget.value
  const task = taskOf(row)
  const blockedTask = task && ['已取消', '取消', '已完成', '完成'].includes(task.status)
  if (task && !blockedTask) row.linkedTask = { ...task, status: '已取消' }
  const blockedPlans = (row.plans || []).filter(plan => ['已上星', '执行中', '已完成', '完成'].includes(plan.status))
  row.plans = (row.plans || []).map(plan => blockedPlans.includes(plan) || ['已取消', '取消'].includes(plan.status) ? plan : { ...plan, status: '已取消' })
  row.status = blockedPlans.length ? '取消中' : '已取消'
  row.logs = [...(row.logs || []), { time: dateText(new Date().toISOString()), text: `需求取消已触发；任务${blockedTask ? '保持原状态' : task ? '已取消' : '无关联'}；计划${blockedPlans.length ? `${blockedPlans.length}条已上星或已执行，无法取消` : '可取消项已取消'}；需求状态 → ${row.status}` }]
  saveProjectRequirements(rows.value)
  cancelVisible.value = false
  if (blockedPlans.length) ElMessage.warning(`任务及可取消计划已处理；${blockedPlans.length} 条计划已上星或已执行，无法取消`)
  else ElMessage.success('需求、关联任务及可取消计划已取消')
}
async function copyId(id: string) { try { await navigator.clipboard.writeText(id); ElMessage.success('需求编号已复制') } catch { ElMessage.warning('复制失败，请手动选择编号') } }
function openTask(no: string) { detailVisible.value = false; void router.push({ name: 'requirement-list', query: { taskNo: no, sourceNo: selected.value?.id, detail: 'open' } }) }
function openPlan(no: string) { detailVisible.value = false; void router.push({ name: 'task-plan-list', query: { planNo: no, detail: 'open' } }) }
</script>

<template>
  <section class="project-list-page">
    <div class="page-heading"><span class="heading-mark" /><div><h1>需求列表</h1><p>统一管理观测需求，跟踪「需求 → 任务 → 计划」执行链路</p></div></div>
    <PrototypeStatePanel v-if="demoState !== 'normal'" :state="demoState" subject="需求" />
    <template v-else>
      <div class="status-tabs" role="tablist" aria-label="需求状态"><button v-for="item in statuses" :key="item.value" class="status-tab" :class="{ active: status === item.value }" role="tab" :aria-selected="status === item.value" @click="status = item.value">{{ item.label }}<span class="tab-count">{{ count(item.value) }}</span></button></div>
      <div class="filter-card">
        <el-input v-model="keyword" class="search-input" clearable placeholder="搜索需求名称 / 需求编号 / 任务号" />
        <el-select v-model="status" aria-label="需求状态" placeholder="全部状态"><el-option v-for="item in statuses" :key="item.value" :label="item.value === 'all' ? '全部状态' : item.label" :value="item.value" /></el-select>
        <el-select v-model="mode" placeholder="全部观测方式"><el-option label="全部观测方式" value="" /><el-option v-for="item in observationModes" :key="item.value" :label="item.value" :value="item.value" /></el-select>
        <label class="time-field"><span>最早执行时间 <small>北京时间</small></span><el-date-picker v-model="earliestTimeRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm" start-placeholder="起始时间" end-placeholder="结束时间" range-separator="至" clearable /></label>
        <label class="time-field"><span>最晚执行时间 <small>北京时间</small></span><el-date-picker v-model="latestTimeRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm" start-placeholder="起始时间" end-placeholder="结束时间" range-separator="至" clearable /></label>
        <el-button class="filter-reset" @click="reset">重置</el-button>
      </div>
      <div class="list-stat"><div>共 {{ filtered.length }} 条需求</div><el-button type="primary" @click="router.push('/app/mccs/tasksys/project/requirement-submit')">＋ 新增需求</el-button></div>
      <div v-if="visibleRows.length" class="req-list"><article v-for="row in visibleRows" :key="row.id" class="req-card" :class="`status-${row.status}`">
        <div class="req-main"><div class="req-primary"><span class="req-id">{{ row.id }}</span><strong class="req-name">{{ row.name }}</strong><el-tag size="small" :type="row.status === '已完成' ? 'success' : row.status === '取消中' ? 'warning' : row.status === '已取消' || row.status === '已创建' ? 'info' : 'primary'">{{ row.status }}</el-tag><el-tag size="small" :type="row.priority === 6 ? 'danger' : 'info'" effect="plain">优先级 {{ row.priority }}</el-tag></div>
          <div class="req-meta"><span>{{ row.observationMode }}</span><i>·</i><span>{{ row.payloads.join('、') }}</span><i>·</i><span>{{ targetType(row) }}</span><i>·</i><span>{{ dateText(row.startAt) }} ~ {{ dateText(row.endAt) }}</span><el-tag size="small" effect="plain" type="info">{{ timeLabel(row) }}</el-tag></div>
          <div class="association-info"><span>关联任务：<b>{{ taskOf(row)?.no || '暂无关联' }}</b></span><span>关联计划：<b>{{ plansOf(row).length ? `${plansOf(row).length} 条` : '暂无关联' }}</b></span></div>
        </div><div class="req-actions"><el-button link type="primary" @click="openDetail(row)">查看</el-button><el-button v-if="row.status === '执行中'" link type="primary" @click="openComplete(row)">完结</el-button><el-button v-if="row.status === '执行中' || row.status === '已创建'" link type="danger" @click="openCancel(row)">取消</el-button></div>
      </article></div><el-empty v-else description="暂无符合条件的需求，请调整筛选条件" />
      <div class="pagination"><span>共 {{ filtered.length }} 条 · 每页 {{ pageSize }} 条</span><el-pagination v-model:current-page="page" :page-size="pageSize" layout="prev, pager, next" :total="filtered.length" /></div>
    </template>
    <el-dialog v-model="detailVisible" class="requirement-detail-dialog" width="min(1040px, 94vw)" top="5vh" :append-to-body="true"><template #header><div class="detail-title">需求详情 <el-tag v-if="selected" size="small">{{ selected.status }}</el-tag></div></template>
      <div v-if="selected" class="detail-scroll">
        <section class="detail-sec"><h3><span>①</span> 下单信息</h3><div class="info-grid">
          <div><label>需求名称</label><strong>{{ selected.name }}</strong></div><div><label>需求编号</label><strong class="mono">{{ selected.id }} <el-button link type="primary" @click="copyId(selected.id)">复制</el-button></strong></div>
          <div><label>执行卫星</label><strong>{{ selected.satellite }}</strong></div><div><label>载荷</label><strong><el-tag v-for="payload in selected.payloads" :key="payload" size="small" class="inline-tag">{{ payload }}</el-tag><el-tag v-if="selected.payloads.length > 1" size="small" type="success" effect="plain">融合成像</el-tag></strong></div>
          <div><label>业务模式</label><strong>{{ selected.businessMode }}</strong></div><div><label>观测方式</label><strong>{{ selected.observationMode }} <span class="muted">({{ taskOf(selected)?.type || observationModes.find(item => item.value === selected?.observationMode)?.code }})</span></strong></div>
          <div><label>优先级</label><strong>{{ selected.priority }}</strong></div><div><label>侧摆角</label><strong>{{ selected.rollAngle }}°</strong></div>
          <div class="wide"><label>采集时间范围</label><strong class="mono">{{ dateText(selected.startAt) }} ~ {{ dateText(selected.endAt) }}</strong></div><div><label>目标区域类型</label><strong>{{ targetType(selected) }}</strong></div>
        </div></section>
        <section class="detail-sec"><h3><span>②</span> 目标区域 AOI</h3><div class="aoi-box"><template v-if="selected.target.kind === 'point'"><div><label>经纬度（小数度）</label><strong>{{ targetText(selected) }}</strong></div><div><label>经纬度（度分秒）</label><strong>坐标格式转换待接入</strong></div></template><template v-else-if="selected.target.kind === 'polygon'"><div><label>顶点数</label><strong>{{ selected.target.coordinates.length }}</strong></div><div><label>中心点 / 面积</label><strong>地理计算待接入</strong></div><div class="wide"><label>顶点坐标（经度°，纬度°）</label><strong>{{ selected.target.coordinates.map(point => `(${point.join(', ')})`).join('，') }}</strong></div></template><div v-else><label>行政区</label><strong>{{ selected.target.name }}</strong></div></div></section>
        <section class="detail-sec"><h3><span>③</span> 关联任务与计划</h3><div class="relation-panel"><div class="relation-group"><div class="relation-heading">关联任务</div><div v-if="taskOf(selected)" class="relation-row"><el-button link type="primary" class="relation-number" @click="openTask(taskOf(selected)!.no)">{{ taskOf(selected)?.no }}</el-button><el-tag size="small" type="info" effect="plain">{{ taskOf(selected)?.status }}</el-tag></div><div v-else class="relation-empty">暂无关联任务</div></div><div class="relation-group"><div class="relation-heading">关联计划</div><template v-if="plansOf(selected).length"><div v-for="plan in plansOf(selected)" :key="plan.no" class="relation-row"><el-button link type="primary" class="relation-number" @click="openPlan(plan.no)">{{ plan.no }}</el-button><span>{{ plan.type }}</span><el-tag size="small" type="info" effect="plain">{{ plan.status }}</el-tag></div></template><div v-else class="relation-empty">暂无关联计划</div></div></div></section>
        <section class="detail-sec"><h3><span>④</span> 需求日志</h3><div class="log-list"><div class="log-entry"><time>{{ dateText(selected.createdAt) }}</time><span>需求已提交</span></div><div v-for="(log, index) in selected.logs || []" :key="index" class="log-entry"><time>{{ log.time }}</time><span>{{ log.text }}</span></div></div></section>
      </div><template #footer><el-button v-if="selected?.status === '执行中'" type="primary" plain @click="openComplete(selected)">完结需求</el-button><el-button v-if="selected?.status === '执行中' || selected?.status === '已创建'" type="danger" plain @click="openCancel(selected)">取消需求</el-button><el-button @click="detailVisible = false">关闭</el-button></template>
    </el-dialog>
    <el-dialog v-model="cancelVisible" title="取消需求" width="min(440px, 92vw)" :append-to-body="true"><template v-if="cancelTarget"><p class="cancel-name">{{ cancelTarget.name }} · {{ cancelTarget.id }}</p><p>取消需求将触发关联任务和计划取消。已取消或已完成的任务保持原状态；已上星或已执行的计划无法取消，需求将保持“取消中”。</p><el-checkbox v-model="acknowledged">我已知晓取消后果</el-checkbox></template><template #footer><el-button @click="cancelVisible = false">暂不取消</el-button><el-button type="danger" :disabled="!acknowledged" @click="confirmCancel">确定取消</el-button></template></el-dialog>
    <el-dialog v-model="completeVisible" title="完结需求" width="min(440px, 92vw)" :append-to-body="true"><template v-if="completeTarget"><p class="cancel-name">{{ completeTarget.name }} · {{ completeTarget.id }}</p><p>确认需求业务流程已结束后，将需求状态改为“已完成”。关联任务和计划状态保持原样。</p></template><template #footer><el-button @click="completeVisible = false">返回</el-button><el-button type="primary" @click="confirmComplete">确认完结</el-button></template></el-dialog>
  </section>
</template>

<style scoped>
.project-list-page{height:100%;overflow:auto;padding:var(--sp-page-padding-block-start) var(--sp-page-padding-inline);background:var(--sp-color-surface);color:var(--sp-color-text-primary)}.page-heading{display:flex;align-items:center;gap:12px;margin-bottom:20px}.heading-mark{width:4px;height:24px;border-radius:3px;background:var(--sp-color-primary)}.page-heading h1{margin:0;font-size:var(--sp-font-size-page-title)}.page-heading p{margin:3px 0 0;color:var(--sp-color-text-muted);font-size:12px}.status-tabs{display:flex;gap:4px;border-bottom:1px solid var(--sp-color-border);margin-bottom:16px;overflow-x:auto}.status-tab{border:0;border-bottom:2px solid transparent;background:none;color:var(--sp-color-text-muted);padding:10px 16px;white-space:nowrap;cursor:pointer;font:inherit}.status-tab.active{color:var(--sp-color-primary);border-bottom-color:var(--sp-color-primary);font-weight:600}.tab-count{margin-left:7px;padding:1px 7px;border-radius:10px;background:#eef2f7;font-size:11px}.active .tab-count{background:#e8f0ff}.filter-card{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:13px;border:1px solid var(--sp-color-border);border-radius:7px;background:var(--sp-color-surface-subtle)}.filter-card .search-input{width:270px}.filter-card .el-select{width:150px}.filter-spacer{flex:1}.list-stat{display:flex;gap:16px;align-items:center;margin:18px 0 12px;font-weight:600}.list-stat span{font-size:12px;font-weight:400;color:var(--sp-color-text-muted)}.req-list{display:grid;gap:10px}.req-card{display:flex;position:relative;align-items:center;gap:20px;min-height:112px;padding:16px 18px 14px 22px;border:1px solid var(--sp-color-border);border-radius:7px;background:#fff;box-shadow:0 1px 3px #152b4d0a}.req-card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:#377cf5;border-radius:7px 0 0 7px}.req-card.status-已完成:before{background:#38a770}.req-card.status-取消中:before{background:#eaa23f}.req-card.status-已取消:before{background:#aab4c2}.req-main{min-width:0;flex:1}.req-primary,.req-meta,.link-mini{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.req-primary{margin-bottom:9px}.req-id,.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.req-id{font-size:12px;color:var(--sp-color-text-muted)}.req-name{font-size:15px}.req-meta{gap:8px;color:var(--sp-color-text-muted);font-size:12px}.req-meta i{font-style:normal;color:#bdc6d1}.link-mini{gap:8px;margin-top:11px;color:#5b6e88;font-size:12px}.link-node{white-space:nowrap}.link-node:before{content:'';display:inline-block;width:7px;height:7px;margin-right:5px;border-radius:50%;background:#5a90ec}.link-node.done:before{background:#38a770}.link-node.pending{color:#9ba8b8}.link-node.pending:before{background:#c1cad5}.link-line{width:30px;height:1px;background:#d2dae5}.link-line.on{background:#80a9eb}.req-actions{display:flex;gap:4px;flex-shrink:0}.pagination{display:flex;justify-content:flex-end;align-items:center;gap:15px;margin:16px 0;color:var(--sp-color-text-muted);font-size:12px}
.detail-title{display:flex;align-items:center;gap:12px;font-size:17px;font-weight:600}.detail-scroll{max-height:68vh;overflow:auto;padding-right:5px}.detail-sec{padding:0 0 20px;margin-bottom:18px;border-bottom:1px solid #e5eaf1}.detail-sec:last-child{border:0;margin-bottom:0}.detail-sec h3{margin:0 0 14px;font-size:14px}.detail-sec h3 span{color:var(--sp-color-primary);margin-right:5px}.info-grid,.aoi-box{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px 24px}.info-grid>div,.aoi-box>div{min-width:0}.info-grid label,.aoi-box label{display:block;margin-bottom:5px;color:var(--sp-color-text-muted);font-size:12px}.info-grid strong,.aoi-box strong{font-weight:500;font-size:13px;overflow-wrap:anywhere}.wide{grid-column:1/-1}.inline-tag{margin-right:5px}.muted,.mock-note{color:var(--sp-color-text-muted);font-size:12px}.mock-note{margin:-5px 0 12px}.aoi-box{padding:14px;background:#f7f9fc;border-radius:6px}.chain{display:grid;grid-template-columns:minmax(0,1fr) 24px minmax(0,1.3fr);align-items:center;gap:10px}.chain-card{display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-height:105px;padding:13px;border:1px solid #e0e7f1;border-radius:6px}.chain-label{font-weight:600}.chain-number{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.chain-arrow{color:#9aabc0;text-align:center}.plan-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap}.chain-card small{color:var(--sp-color-text-muted)}.log-list{border-left:2px solid #d5e3fb;margin-left:5px;padding-left:17px}.log-entry{display:flex;gap:12px;margin:0 0 13px;position:relative;font-size:12px}.log-entry:before{content:'';position:absolute;left:-23px;top:4px;width:8px;height:8px;border-radius:50%;background:#4b8af0}.log-entry time{color:var(--sp-color-text-muted);white-space:nowrap}.cancel-name{font-weight:600}.detail-scroll :deep(.el-button){vertical-align:baseline}@media(max-width:1100px){.filter-card .search-input{width:100%}.filter-card .el-select{width:calc(33.33% - 8px)}}@media(max-width:680px){.req-card{align-items:flex-start;flex-direction:column}.req-actions{align-self:flex-end}.filter-card .el-select{width:calc(50% - 5px)}.info-grid,.aoi-box{grid-template-columns:1fr}.chain{grid-template-columns:1fr}.chain-arrow{transform:rotate(90deg)}.log-entry{flex-direction:column;gap:2px}}
.time-field{display:flex;flex-direction:column;align-items:flex-start;gap:5px;width:320px;max-width:100%;min-width:0;font-size:12px;color:var(--sp-color-text-secondary)}
.time-field small{margin-left:4px;font-size:11px;font-weight:400;color:var(--sp-color-text-muted)}
.time-field :deep(.el-date-editor.el-range-editor){width:100% !important;min-width:0 !important}
.filter-reset{align-self:flex-end}
@media (max-width:1250px) and (min-width:1101px){.filter-card .search-input{width:230px}.filter-card .el-select{width:130px}}
.list-stat{justify-content:space-between;flex-wrap:wrap}.list-stat .el-button{margin-left:auto}.association-info{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;color:var(--sp-color-text-muted);font-size:12px}.association-info b{font-weight:500;color:var(--sp-color-text-secondary)}
.relation-panel{width:100%;overflow:hidden;border:1px solid var(--sp-color-border);border-radius:var(--sp-radius-card);background:var(--sp-color-surface-subtle)}.relation-group+.relation-group{border-top:1px solid var(--sp-color-border)}.relation-heading{padding:11px 15px 4px;color:var(--sp-color-text-muted);font-size:12px;font-weight:600}.relation-row{display:flex;min-height:42px;align-items:center;justify-content:space-between;gap:12px;margin:0 15px;border-top:1px solid var(--sp-color-divider);color:var(--sp-color-text-secondary);font-size:13px}.relation-heading+.relation-row{border-top:0}.relation-row .el-tag{flex:none}.relation-number{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.relation-empty{padding:7px 15px 13px;color:var(--sp-color-text-muted);font-size:12px}
</style>
