<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElButton, ElDatePicker, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElSelect, ElTag } from 'element-plus'
import { satellites } from '../../mocks/taskPlans'
import type { ManualPassRecord } from '../../types/taskPlan'

const props = defineProps<{ visible: boolean; record?: ManualPassRecord | null }>()
const emit = defineEmits<{ 'update:visible':[value:boolean]; saved: [value: ManualPassRecord] }>()
const form = reactive({ range: [] as string[], satellite:'', remark:'' })
const checked = ref(false)
const saving = ref(false)
const validRange = computed(() => form.range.length === 2 && form.range[0] < form.range[1])
watch(() => props.visible, value => { if (value) { Object.assign(form,{ range: props.record ? [props.record.startedAt, props.record.endedAt] : [], satellite: props.record?.satellite ?? '', remark: props.record?.remark ?? '' }); checked.value=false } })
function detectConflict() { if (!validRange.value || !form.satellite) return ElMessage.warning('请先填写有效时间范围和卫星'); checked.value=true; ElMessage.success('冲突检测完成') }
async function save() { if (!validRange.value || !form.satellite) return ElMessage.warning('请完整填写开始时间、结束时间和卫星'); if(!checked.value) return ElMessage.warning('请先执行计划冲突检测'); saving.value=true; await new Promise(r=>window.setTimeout(r,450)); saving.value=false; emit('saved', { id: props.record?.id ?? `TTC-${Date.now()}`, startedAt: form.range[0], endedAt: form.range[1], satellite: form.satellite, creator: props.record?.creator ?? 'system', remark: form.remark }); ElMessage.success(props.record ? '手动测控时段已更新' : '手动测控时段已保存'); emit('update:visible',false) }
</script>
<template><el-dialog :model-value="visible" :title="record ? '编辑手动测控时段' : '创建手动测控时段'" width="660px" @update:model-value="emit('update:visible',$event)"><el-form label-width="112px">
  <el-form-item label="开始/结束时间" required><el-date-picker v-model="form.range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
  <el-form-item label="卫星" required><el-select v-model="form.satellite" placeholder="请选择卫星"><el-option v-for="item in satellites" :key="item" :label="item" :value="item" /></el-select></el-form-item>
  <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit /></el-form-item>
  <el-form-item label="计划冲突检测"><div class="conflict-check"><el-tag :type="checked ? 'success' : 'info'">{{ checked ? '无冲突' : '未检测' }}</el-tag><el-button @click="detectConflict">冲突检测</el-button></div></el-form-item>
</el-form><template #footer><el-button @click="emit('update:visible',false)">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template></el-dialog></template>
