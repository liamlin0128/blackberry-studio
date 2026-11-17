<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElAlert, ElButton, ElDatePicker, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElMessageBox, ElOption, ElRadio, ElRadioButton, ElRadioGroup, ElSelect, ElTable, ElTableColumn } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { manualPlanArcs, manualPlanPriorities, manualPlanSatellites, manualPlanTypes, transferContentRows, uploadFileRows } from '../../mocks/manualPlans'
import type { ManualPlanContext, ManualPlanType } from '../../types/taskPlan'

const props = withDefaults(defineProps<{ visible: boolean; defaultType?: ManualPlanType; fixedType?: ManualPlanType | null; context?: ManualPlanContext | null }>(), { defaultType: '数传', fixedType: null, context: null })
const emit = defineEmits<{ 'update:visible': [value: boolean]; saved: [type: ManualPlanType] }>()
const formRef = ref<FormInstance>()
const saving = ref(false)
const transferRows = ref(transferContentRows.map(item => ({ ...item })))
const form = reactive({
  planType: '数传' as ManualPlanType, satellite: '', priority: undefined as number | undefined, timeliness: '常规',
  executeAt: '', endAt: '', latestUploadAt: '', uploadArcId: '', uploadStation: '', executeArcId: '', executeStation: '',
  linkRequirement: '测控', fileSource: '手动输入', upgradeFile: '', version: '', remark: '',
  thrustStartAt: '', thrustEndAt: '', thrustDirection: '', thruster: '电推进器', thrustDuration: undefined as number | undefined,
})
const contextHasInvalidTime = computed(() => Boolean(props.context?.startedAt && props.context?.endedAt && props.context.startedAt > props.context.endedAt))
const rules: FormRules = {
  satellite: [{ required: true, message: '请选择执行卫星', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  executeAt: [{ required: true, message: '请选择计划执行时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择计划结束时间', trigger: 'change' }],
  latestUploadAt: [{ required: true, message: '请选择最晚上注时间', trigger: 'change' }],
  uploadArcId: [{ required: true, message: '请选择上注弧段', trigger: 'change' }],
}

watch(() => props.visible, visible => {
  if (!visible) return
  Object.assign(form, {
    planType: props.fixedType ?? props.defaultType, satellite: props.context?.satellite ?? '', priority: undefined, timeliness: '常规',
    executeAt: contextHasInvalidTime.value ? '' : props.context?.startedAt ?? '', endAt: contextHasInvalidTime.value ? '' : props.context?.endedAt ?? '',
    latestUploadAt: '', uploadArcId: '', uploadStation: '', executeArcId: '', executeStation: '', linkRequirement: '测控',
    fileSource: '手动输入', upgradeFile: '', version: '', remark: '', thrustStartAt: '', thrustEndAt: '', thrustDirection: '',
    thruster: '电推进器', thrustDuration: undefined,
  })
  transferRows.value = transferContentRows.map(item => ({ ...item }))
  formRef.value?.clearValidate()
})

function selectArc(kind: 'upload' | 'execute', arcId: string) {
  const arc = manualPlanArcs.find(item => item.id === arcId)
  if (kind === 'upload') form.uploadStation = arc?.station ?? ''
  else form.executeStation = arc?.station ?? ''
}

function timestamp(value: string) { return new Date(value.replace(' ', 'T')).getTime() }

async function save() {
  if (!await formRef.value?.validate().catch(() => false)) return
  const executeAt = timestamp(form.executeAt); const endAt = timestamp(form.endAt); const latestUploadAt = timestamp(form.latestUploadAt)
  if (endAt <= executeAt) return ElMessage.error('计划结束时间必须晚于计划执行时间')
  if (latestUploadAt >= executeAt) return ElMessage.error('最晚上注时间必须早于计划执行时间')
  if (form.planType === '数传' && (!form.executeArcId || !form.executeStation)) return ElMessage.error('请选择执行弧段并确认执行地面站')
  if (form.planType === '上注' && (!form.upgradeFile || !form.version)) return ElMessage.error('请填写升级包原文件和版本')
  if (form.planType === '轨控') {
    const thrustStart = timestamp(form.thrustStartAt); const thrustEnd = timestamp(form.thrustEndAt)
    if (!form.thrustStartAt || !form.thrustEndAt || !form.thrustDirection || !form.thrustDuration) return ElMessage.error('请完整填写轨控内容')
    if (thrustStart < executeAt || thrustEnd > endAt || thrustEnd <= thrustStart) return ElMessage.error('推进时间必须位于计划执行窗口内')
    if (form.thrustDuration !== (thrustEnd - thrustStart) / 1000) return ElMessage.error('推进时长必须与推进起止时间差一致')
  }
  try { await ElMessageBox.confirm(`确认保存该${form.planType}计划吗？计划编号生成及后端影响待确认。`, '保存计划确认', { type: 'warning', confirmButtonText: '确认保存', cancelButtonText: '返回检查' }) } catch { return }
  saving.value = true
  window.setTimeout(() => { saving.value = false; emit('saved', form.planType); emit('update:visible', false); ElMessage.success(`${form.planType}计划已保存`) }, 450)
}
</script>

<template>
  <el-dialog :model-value="visible" width="920px" top="4vh" class="manual-plan-dialog" destroy-on-close @update:model-value="emit('update:visible', $event)">
    <template #header><div class="manual-plan-title"><strong>{{ fixedType ? `创建${fixedType}计划` : '创建计划' }}</strong><span v-if="context?.passId">来源时段 {{ context.passId }}</span></div></template>
    <div class="manual-plan-body">
      <el-alert v-if="contextHasInvalidTime" title="来源测控时段的开始时间晚于结束时间，未自动带入计划窗口" type="warning" :closable="false" show-icon />
      <el-alert v-if="form.planType === '轨控'" title="轨控计划由测控运营人员人工填写，不引用轨控计算结果；保存前请复核推进时间、方向和时长。" type="info" :closable="false" show-icon />
      <el-form ref="formRef" :model="form" :rules="rules" label-width="112px" class="manual-plan-form">
        <section class="manual-plan-section"><header><strong>基本信息</strong><span>北京时间（UTC+8）</span></header><div class="manual-plan-grid">
          <el-form-item label="计划类型" prop="planType" class="span-2"><el-input v-if="fixedType" :model-value="form.planType" disabled /><el-radio-group v-else v-model="form.planType"><el-radio-button v-for="item in manualPlanTypes" :key="item" :value="item">{{ item }}</el-radio-button></el-radio-group></el-form-item>
          <el-form-item label="执行卫星" prop="satellite"><el-select v-model="form.satellite" placeholder="请选择"><el-option v-for="item in manualPlanSatellites" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="优先级" prop="priority"><el-select v-model="form.priority" placeholder="请选择优先级"><el-option v-for="item in manualPlanPriorities" :key="item" :label="`${item}级`" :value="item" /></el-select></el-form-item>
          <el-form-item label="时效类型"><el-input v-model="form.timeliness" disabled /></el-form-item>
          <el-form-item label="上注链路要求"><el-radio-group v-model="form.linkRequirement"><el-radio value="测控">测控</el-radio><el-radio v-if="form.planType !== '轨控'" value="数传">数传</el-radio></el-radio-group></el-form-item>
          <el-form-item label="计划执行时间" prop="executeAt"><el-date-picker v-model="form.executeAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" /></el-form-item>
          <el-form-item label="计划结束时间" prop="endAt"><el-date-picker v-model="form.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" /></el-form-item>
          <el-form-item label="最晚上注时间" prop="latestUploadAt" class="span-2"><el-date-picker v-model="form.latestUploadAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="须早于计划执行时间" /></el-form-item>
          <el-form-item label="上注弧段ID" prop="uploadArcId"><el-select v-model="form.uploadArcId" placeholder="请选择上注弧段ID" @change="selectArc('upload', $event)"><el-option v-for="arc in manualPlanArcs" :key="arc.id" :label="`${arc.id}（${arc.startedAt}~${arc.endedAt}）`" :value="arc.id" /></el-select></el-form-item>
          <el-form-item label="上注地面站"><el-input v-model="form.uploadStation" placeholder="选择弧段后自动带入" readonly /></el-form-item>
          <template v-if="form.planType === '数传'"><el-form-item label="执行弧段ID"><el-select v-model="form.executeArcId" placeholder="请选择执行弧段ID" @change="selectArc('execute', $event)"><el-option v-for="arc in manualPlanArcs" :key="arc.id" :label="arc.id" :value="arc.id" /></el-select></el-form-item><el-form-item label="执行地面站"><el-input v-model="form.executeStation" placeholder="选择弧段后自动带入" readonly /></el-form-item></template>
        </div></section>

        <section v-if="form.planType === '数传'" class="manual-plan-section"><header><strong>数传内容</strong><span>10 条证据行</span></header><el-table :data="transferRows" size="small"><el-table-column prop="sequence" label="编号" width="70" align="center"/><el-table-column prop="column" label="栏目" width="120"/><el-table-column label="内容" min-width="240"><template #default="{ row }"><el-input v-model="row.content" placeholder="请输入任务号" /></template></el-table-column><el-table-column prop="mode" label="压缩下传/原样下传" min-width="170"/></el-table></section>

        <section v-else-if="form.planType === '上注'" class="manual-plan-section"><header><strong>上注文件</strong><span>来源：手动输入</span></header><div class="manual-plan-grid"><el-form-item label="上注文件来源"><el-input v-model="form.fileSource" disabled /></el-form-item><el-form-item label="版本"><el-input v-model="form.version" placeholder="例如 V1.0.0" /></el-form-item><el-form-item label="升级包原文件" class="span-2"><el-input v-model="form.upgradeFile" placeholder="请输入升级包原文件路径" /></el-form-item></div><el-table :data="uploadFileRows" size="small"><el-table-column prop="sequence" label="序号" width="70"/><el-table-column prop="path" label="文件路径" min-width="460" show-overflow-tooltip/><el-table-column prop="md5" label="MD5" min-width="250"/></el-table></section>

        <section v-else class="manual-plan-section"><header><strong>轨控内容</strong><span>推进时长单位：秒</span></header><div class="manual-plan-grid"><el-form-item label="推进开始时间"><el-date-picker v-model="form.thrustStartAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" /></el-form-item><el-form-item label="推进结束时间"><el-date-picker v-model="form.thrustEndAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" /></el-form-item><el-form-item label="推进方向"><el-select v-model="form.thrustDirection" placeholder="请选择"><el-option label="速度正方向" value="速度正方向"/><el-option label="速度反方向" value="速度反方向"/></el-select></el-form-item><el-form-item label="推进器"><el-input v-model="form.thruster" disabled /></el-form-item><el-form-item label="推进时长" class="span-2"><el-input-number v-model="form.thrustDuration" :min="1" :max="21600" controls-position="right"/><span class="field-unit">秒</span></el-form-item></div></section>

        <section class="manual-plan-section"><header><strong>备注信息</strong><span>{{ form.remark.length }}/500</span></header><el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" placeholder="请输入备注信息" /></section>
      </el-form>
    </div>
    <template #footer><el-button @click="emit('update:visible', false)">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
  </el-dialog>
</template>

<style scoped>
.manual-plan-body{max-height:70vh;overflow:auto;padding:0 2px 4px;scrollbar-width:thin}.manual-plan-title{display:flex;align-items:baseline;gap:var(--sp-space-3)}.manual-plan-title strong{font-size:var(--sp-font-size-section-title)}.manual-plan-title span{color:var(--sp-color-text-muted);font-size:var(--sp-font-size-caption)}.manual-plan-body>.el-alert{margin-bottom:var(--sp-space-4)}.manual-plan-form{min-width:0}.manual-plan-section{margin-bottom:var(--sp-space-5);overflow:hidden;border:1px solid var(--sp-color-border);border-radius:var(--sp-radius-control)}.manual-plan-section>header{display:flex;min-height:42px;align-items:center;justify-content:space-between;padding:0 var(--sp-space-4);border-bottom:1px solid var(--sp-color-divider);background:var(--sp-color-surface-subtle)}.manual-plan-section>header strong{font-size:var(--sp-font-size-body);font-weight:var(--sp-font-weight-semibold)}.manual-plan-section>header span{color:var(--sp-color-text-muted);font-size:var(--sp-font-size-caption)}.manual-plan-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 var(--sp-space-5);padding:var(--sp-space-4) var(--sp-space-5) 0}.manual-plan-grid .span-2{grid-column:1/-1}.manual-plan-grid :deep(.el-select),.manual-plan-grid :deep(.el-date-editor),.manual-plan-grid :deep(.el-input-number){width:100%}.field-unit{margin-left:8px;color:var(--sp-color-text-muted)}.manual-plan-section>.el-textarea{padding:var(--sp-space-4);box-sizing:border-box}.manual-plan-section :deep(.el-table__cell){border-right:0}.manual-plan-section :deep(.el-table th.el-table__cell){background:var(--sp-color-surface-subtle)}
@media(max-width:1100px){.manual-plan-grid{grid-template-columns:1fr}.manual-plan-grid .span-2{grid-column:auto}}
</style>
