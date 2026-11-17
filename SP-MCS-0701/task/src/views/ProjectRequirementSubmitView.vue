<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElButton, ElCard, ElDatePicker,
  ElDialog, ElInput, ElInputNumber, ElMessage, ElMessageBox,
  ElRadioButton, ElRadioGroup, ElResult, ElSlider, ElTag,
} from 'element-plus'
import { loadProjectRequirements, nextTaskNo, observationModes, projectPayloadOptions, projectSatellite, saveProjectRequirements } from '../mocks/projectRequirements'
import type { ObservationMode, ProjectRequirement, Target } from '../types/projectRequirement'
import type { PrototypeState } from '../types/prototype'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import ProjectObservationMap from '../components/planning/ProjectObservationMap.vue'
import { ensureOnboardProcessing } from '../mocks/onboardPlanning'

const router = useRouter()
const route = useRoute()
const demoState = computed(() => (['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? route.query.state : 'normal') as PrototypeState)
const payloads = ref<string[]>(['可见光', '红外'])
function togglePayload(value: string) {
  payloads.value = payloads.value.includes(value) ? payloads.value.filter(item => item !== value) : [...payloads.value, value]
}
const mode = ref<ObservationMode>('常规观测')
const priority = ref<5 | 6 | 9>(9)
const roll = ref(25)
const timeRange = ref<Date[]>([])
const name = ref('')
const target = ref<Target | null>(null)
const mapKey = ref(0)
const submitting = ref(false)
const submitted = ref(false)
const resultNo = ref('')
const resultVisible = ref(false)
const pointOnly = computed(() => mode.value === '星上规划任务' || mode.value === '点目标多条带观测')
const rollMax = computed(() => priority.value === 9 ? 25 : 45)
const now = () => new Date()
const nextDayEnd = () => { const value = now(); value.setDate(value.getDate() + 1); value.setHours(23, 59, 59, 999); return value }
const timeDisabled = (date: Date) => mode.value === '星上规划任务' && (date.getTime() < now().setHours(0, 0, 0, 0) || date.getTime() > nextDayEnd().getTime())
watch(mode, value => {
  priority.value = value === '星上规划任务' ? 5 : 9
  roll.value = value === '星上规划任务' ? Math.min(roll.value, 45) : 25
  if (value === '星上规划任务') timeRange.value = []
  if (pointOnly.value && target.value?.kind !== 'point') target.value = null
})
watch(priority, () => { if (roll.value > rollMax.value) roll.value = rollMax.value })

function resetForm() {
  payloads.value = ['可见光', '红外']; mode.value = '常规观测'; priority.value = 9; roll.value = 25
  timeRange.value = []; name.value = ''; target.value = null; mapKey.value++; submitted.value = false
}
function validationError() {
  if (!payloads.value.length) return '请至少选择一项载荷'
  if (!name.value.trim() || name.value.trim().length > 20) return '需求名称必填且不超过 20 字'
  if (!target.value) return '请选择目标区域'
  if (pointOnly.value && target.value.kind !== 'point') return '当前观测方式仅支持目标点'
  if (roll.value < 0 || roll.value > rollMax.value) return `侧摆角须在 0–${rollMax.value}° 内`
  if (timeRange.value.length !== 2 || !timeRange.value[0] || !timeRange.value[1]) return '请选择采集时间范围'
  if (timeRange.value[1].getTime() <= timeRange.value[0].getTime()) return '采集结束时间须晚于开始时间'
  if (mode.value === '星上规划任务' && (timeRange.value[0].getTime() < Date.now() || timeRange.value[1].getTime() > nextDayEnd().getTime())) return '星上规划任务须在当前时刻至次日 23:59 内采集'
  return ''
}
async function submit() {
  if (submitting.value || submitted.value) return
  const error = validationError()
  if (error) return ElMessage.warning(error)
  try { await ElMessageBox.confirm('确认提交当前单次观测需求并生成关联任务？', '提交确认', { type: 'warning' }) } catch { return }
  submitting.value = true
  try {
    const rows = loadProjectRequirements()
    const created = new Date()
    const taskNo = nextTaskNo(mode.value, rows, created)
    const record: ProjectRequirement = {
      id: `XQ${taskNo.slice(2)}`, taskNo, name: name.value.trim(), satellite: projectSatellite, payloads: [...payloads.value],
      businessType: '成像', businessMode: '单星成像', orderMode: '单次', observationMode: mode.value,
      priority: priority.value, rollAngle: roll.value, startAt: timeRange.value[0].toISOString(), endAt: timeRange.value[1].toISOString(),
      target: target.value!, status: '已创建', createdAt: created.toISOString(),
    }
    saveProjectRequirements([record, ...rows])
    if (mode.value === '星上规划任务') ensureOnboardProcessing()
    resultNo.value = taskNo; submitted.value = true; resultVisible.value = true
  } catch { ElMessage.error('需求未保存，请稍后重试') }
  finally { submitting.value = false }
}
function goList() { resultVisible.value = false; void router.push('/app/mccs/tasksys/project/requirement-submissions') }
</script>

<template>
  <section class="project-submit-page">
    <div class="project-heading"><span class="heading-mark" /><div><h1>需求新增</h1><p>SP-MCS-0701 · 单次观测需求</p></div></div>
    <PrototypeStatePanel v-if="demoState !== 'normal'" :state="demoState" subject="需求新增数据" />
    <div v-else class="submit-grid">
      <div class="submit-column">
        <el-card shadow="never"><template #header><strong>载荷与卫星</strong></template>
          <div class="field-label">载荷要求 <em>*</em><small>可多选</small></div>
          <div class="payload-choice-list" role="group" aria-label="载荷要求">
            <button v-for="item in projectPayloadOptions" :key="item.value" type="button" class="choice-card" :class="{ selected: payloads.includes(item.value) }" :aria-pressed="payloads.includes(item.value)" @click="togglePayload(item.value)">
              <span class="choice-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><template v-if="item.value === '可见光'"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3"/><path d="M7 7l2-3h6l2 3"/></template><template v-else-if="item.value === '红外'"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10v4m4-6v8m4-6v4M9 22h6"/></template><template v-else><rect x="2" y="8" width="20" height="8" rx="2"/><path d="M7 5v3m10-3v3M7 16v3m10-3v3"/></template></svg></span><span class="choice-card__info"><strong>{{ item.value }}</strong><small>{{ item.description }}</small></span><span class="choice-card__check" aria-hidden="true">{{ payloads.includes(item.value) ? '✓' : '' }}</span>
            </button>
          </div>
          <div class="field-label">执行卫星 <em>*</em></div>
          <button type="button" class="choice-card choice-card--locked selected" aria-pressed="true" disabled title="本期仅配置一颗卫星，不可取消">
            <span class="choice-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M2 10h7m6 0h7M2 14h7m6 0h7M12 3v6m0 6v6"/></svg></span><span class="choice-card__info"><strong>{{ projectSatellite }}</strong><small>光学遥感</small></span><span class="choice-card__badge">单星</span><span class="choice-card__check" aria-hidden="true">✓</span>
          </button>
          <p class="field-hint">本期仅配置一颗卫星；标准产品多星能力保留。</p>
        </el-card>
        <el-card shadow="never"><template #header><strong>基本信息</strong></template>
          <div class="field-label">业务模式 <small>只读</small></div>
          <button type="button" class="choice-card choice-card--locked selected" aria-pressed="true" disabled title="业务模式固定，默认选中且不可取消">
            <span class="choice-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="1.5"/><path d="M4 17l5-5 3 3 3-4 5 6"/></svg></span><span class="choice-card__info"><strong>单星成像</strong><small>业务模式固定 · 默认选中 · 不可取消</small></span><span class="choice-card__badge choice-card__badge--blue">默认</span><span class="choice-card__check" aria-hidden="true">✓</span>
          </button>
          <div class="field-label">观测方式 <em>*</em></div>
          <div class="mode-grid"><button v-for="item in observationModes" :key="item.value" type="button" class="mode-choice" :class="{ selected: mode === item.value, experimental: item.value === '星上规划任务' }" @click="mode = item.value"><strong>{{ item.value }}</strong><small>{{ item.hint }}</small><el-tag v-if="item.value === '星上规划任务'" size="small" type="warning">实验模式</el-tag></button></div>
          <div class="field-label">优先级 <em>*</em><small>数字越小优先级越高</small></div>
          <el-radio-group v-if="mode !== '星上规划任务'" v-model="priority"><el-radio-button :value="9">常规 9</el-radio-button><el-radio-button :value="6">应急 6</el-radio-button></el-radio-group>
          <el-tag v-else type="warning">星上规划任务 · 固定优先级 5</el-tag>
          <div class="field-label">侧摆角要求 <em>*</em><small>0–{{ rollMax }}°</small></div><div class="roll-row"><el-slider v-model="roll" :min="0" :max="rollMax" :show-tooltip="false" /><el-input-number v-model="roll" :min="0" :max="rollMax" :precision="0" /><span>°</span></div>
          <div class="field-label">采集时间范围 <em>*</em><small>北京时间（UTC+8）</small></div><el-date-picker v-model="timeRange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm" :disabled-date="timeDisabled" style="width:100%" />
          <p v-if="mode === '星上规划任务'" class="field-hint">星上规划任务限当前时刻至次日 23:59。</p>
        </el-card>
        <el-card shadow="never"><template #header><strong>需求名称</strong></template><el-input v-model="name" maxlength="20" show-word-limit placeholder="请输入观测需求名称" /></el-card>
      </div>
      <el-card class="target-card" shadow="never"><template #header><strong>目标区域 AOI <em>*</em></strong></template><ProjectObservationMap :key="mapKey" v-model:target="target" :payloads="payloads" :point-only="pointOnly" /></el-card>
    </div>
    <div v-if="demoState === 'normal'" class="submit-actions"><span>带 * 为必填</span><el-button @click="resetForm">重置</el-button><el-button type="primary" :loading="submitting" :disabled="submitted" @click="submit">{{ submitted ? '已提交' : '提交需求' }}</el-button></div>
    <el-dialog v-model="resultVisible" title="提交结果" width="420px" :close-on-click-modal="false"><el-result icon="success" title="需求已提交" :sub-title="`关联任务号：${resultNo}`" /><template #footer><el-button @click="resultVisible = false; resetForm()">继续新增</el-button><el-button type="primary" @click="goList">查看需求列表</el-button></template></el-dialog>
  </section>
</template>

<style scoped>
.project-submit-page { height: 100%; overflow-x: hidden; overflow-y: auto; padding: var(--sp-page-padding-block-start) var(--sp-page-padding-inline) 80px; background: var(--sp-color-surface); }
.project-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }.project-heading h1 { margin: 0; font-size: var(--sp-font-size-page-title); color: var(--sp-color-text-primary); }.project-heading p { margin: 2px 0 0; color: var(--sp-color-text-muted); font-size: 12px; }.heading-mark { width: 4px; height: 23px; border-radius: 3px; background: var(--sp-color-primary); }
.submit-grid { display: grid; grid-template-columns: clamp(270px, calc(32vw - 120px), 500px) minmax(0, 1fr); align-items: start; gap: 16px; }.submit-column { display: grid; gap: 16px; min-width: 0; }.submit-grid :deep(.el-card) { min-width: 0; border-color: var(--sp-color-border); border-radius: var(--sp-radius-card); }.submit-grid :deep(.el-card__header) { padding: 13px 18px; color: var(--sp-color-text-primary); background: var(--sp-color-surface-subtle); }.submit-grid :deep(.el-card__body) { padding: 18px; }
.field-label { display: flex; align-items: center; gap: 8px; margin: 16px 0 9px; color: var(--sp-color-text-secondary); font-weight: 600; }.field-label:first-child { margin-top: 0; }.field-label em,.target-card em { color: var(--sp-color-danger); font-style: normal; }.field-label small { color: var(--sp-color-text-muted); font-size: 12px; font-weight: 400; }.field-hint { margin: 7px 0 0; color: var(--sp-color-text-muted); font-size: 12px; }.choice-grid { display: flex; flex-wrap: wrap; gap: 8px; }.choice-grid :deep(.el-checkbox) { margin: 0; }.mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }.mode-choice { display: grid; position: relative; min-height: 62px; gap: 4px; padding: 10px 12px; text-align: left; border: 1px solid var(--sp-color-border); border-radius: 6px; background: white; cursor: pointer; }.mode-choice strong { color: var(--sp-color-text-primary); }.mode-choice small { color: var(--sp-color-text-muted); }.mode-choice.selected { border-color: var(--sp-color-primary); background: var(--sp-color-primary-soft); }.mode-choice.experimental { grid-column: 1/-1; border-left: 3px solid #9b72c5; }.mode-choice .el-tag { position: absolute; top: 10px; right: 10px; }.roll-row { display: flex; align-items: center; gap: 12px; }.roll-row .el-slider { flex: 1; }.roll-row .el-input-number { width: 105px; }.target-toolbar,.target-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }.target-toolbar { justify-content: space-between; margin-bottom: 12px; }.target-controls { margin: 12px 0; }.target-controls .el-input { max-width: 320px; }.map-schematic { position: relative; overflow: hidden; border: 1px solid var(--sp-color-border); border-radius: 6px; }.map-schematic svg { display: block; width: 100%; cursor: crosshair; }.map-watermark { position: absolute; left: 12px; bottom: 10px; padding: 4px 8px; color: #52677f; background: #ffffffe8; font-size: 12px; }.pass-reference { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--sp-color-divider); }.pass-reference strong { color: var(--sp-color-text-secondary); }.submit-actions { display: flex; position: sticky; bottom: -80px; align-items: center; justify-content: flex-end; gap: 10px; margin: 16px -20px -80px; padding: 12px 20px; border-top: 1px solid var(--sp-color-border); background: #fff; }.submit-actions span { margin-right: auto; color: var(--sp-color-text-muted); font-size: 12px; }
@media (max-width: 1100px) { .submit-grid { grid-template-columns: 1fr; } }
.submit-actions { margin-inline: calc(-1 * var(--sp-page-padding-inline)); padding-inline: var(--sp-page-padding-inline); }
.submit-actions { z-index: 12; }
.payload-choice-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; container-type: inline-size; }
.choice-card { display: grid; position: relative; width: 100%; max-width: 220px; min-height: 112px; grid-template-columns: 1fr auto; grid-template-rows: auto 1fr; gap: 9px 5px; padding: 11px; border: 1px solid #d9e3ee; border-radius: 8px; background: #fff; color: var(--sp-color-text-primary); text-align: left; cursor: pointer; transition: border-color .15s, background .15s, box-shadow .15s; }
.choice-card.selected { border-color: #a8c8ed; background: #f6faff; box-shadow: inset 0 2px 0 #4d91dd; }
.choice-card:hover:not(:disabled) { border-color: #76afea; box-shadow: 0 3px 12px #2b65a017; }
.choice-card:focus-visible { outline: 2px solid var(--sp-color-primary); outline-offset: 2px; }
.choice-card__icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 7px; background: #edf4fb; color: #3d79b9; }
.choice-card__icon svg { width: 19px; height: 19px; }
.choice-card__info { display: grid; min-width: 0; gap: 4px; align-content: start; grid-column: 1 / -1; }
.choice-card__info strong { font-size: 13px; line-height: 1.3; }
.choice-card__info small { color: #6a7e96; font-size: 10.5px; line-height: 1.45; overflow-wrap: anywhere; }
.choice-card__check { display: grid; width: 17px; height: 17px; place-items: center; border: 1px solid #b7c8d9; border-radius: 50%; color: transparent; font-size: 11px; }
.choice-card.selected .choice-card__check { border-color: #3a82d3; background: #3a82d3; color: #fff; }
.choice-card--locked { display: flex; max-width: 320px; min-height: 58px; align-items: center; gap: 9px; cursor: not-allowed; opacity: 1; }
.choice-card--locked .choice-card__info { flex: 1; }
.choice-card--locked .choice-card__badge { flex: 0 0 auto; }
.choice-card__badge { padding: 2px 6px; border-radius: 10px; background: #fff2df; color: #a66b16; font-size: 10px; white-space: nowrap; }
.choice-card__badge--blue { background: #e6f0fb; color: #386da8; }
@container (max-width: 280px) { .choice-card:not(.choice-card--locked) { display: flex; max-width: 250px; min-height: 68px; align-items: center; gap: 9px; } .choice-card:not(.choice-card--locked) .choice-card__info { flex: 1; } }
.mode-grid { grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); }
.mode-choice { width: 100%; max-width: 210px; min-height: 76px; border-radius: 8px; }
.mode-choice.experimental { grid-column: auto; }
.submit-column :deep(.el-card){background:var(--sp-color-surface);box-shadow:var(--sp-shadow-card)}
.submit-column :deep(.el-card__header){padding:12px 16px;border-bottom:1px solid var(--sp-color-divider);background:var(--sp-color-surface-subtle);font-size:14px;font-weight:600}
.submit-column :deep(.el-card__body){padding:16px}
.submit-column .field-label{color:var(--sp-color-text-primary);font-size:13px}
.choice-card,.mode-choice{border-color:var(--sp-color-border);border-radius:var(--sp-radius-control);background:var(--sp-color-surface);box-shadow:none}
.choice-card.selected,.mode-choice.selected{border-color:var(--sp-color-primary);background:var(--sp-color-primary-soft);box-shadow:none}
.choice-card:hover:not(:disabled),.mode-choice:hover{border-color:var(--sp-color-primary-light);background:var(--sp-color-surface-hover);box-shadow:none}
.choice-card.selected:hover:not(:disabled),.mode-choice.selected:hover{border-color:var(--sp-color-primary);background:var(--sp-color-primary-soft)}
.choice-card__icon{background:var(--sp-color-surface-subtle);color:var(--sp-color-primary)}
.choice-card.selected .choice-card__icon{background:var(--sp-color-surface);color:var(--sp-color-primary)}
.choice-card__info small,.mode-choice small{color:var(--sp-color-text-muted);font-size:11px;line-height:1.45}
.choice-card__check{border-color:var(--sp-color-border);background:var(--sp-color-surface);color:transparent}
.choice-card.selected .choice-card__check{border-color:var(--sp-color-primary);background:var(--sp-color-primary);color:#fff}
.choice-card__badge,.choice-card__badge--blue{background:var(--sp-color-surface-subtle);color:var(--sp-color-text-muted)}
.mode-choice.experimental{border-left:1px solid var(--sp-color-border)}
.mode-choice.experimental.selected{border-left-color:var(--sp-color-primary)}
.submit-column :deep(.el-input__wrapper){box-shadow:0 0 0 1px var(--sp-color-border) inset}
.submit-column :deep(.el-input__wrapper.is-focus){box-shadow:0 0 0 1px var(--sp-color-primary) inset}
</style>
