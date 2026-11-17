<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElSwitch, ElUpload } from 'element-plus'
import type { AlgorithmRecord } from '../../types/schedule'

const visible = defineModel<boolean>('visible', { required: true })
const props = withDefaults(defineProps<{ mode?: 'create' | 'edit'; record?: AlgorithmRecord | null }>(), { mode: 'create', record: null })
const emit = defineEmits<{ saved: [value: Pick<AlgorithmRecord, 'id' | 'name' | 'enabled' | 'remark'>] }>()
const saving = ref(false)
const form = reactive({ name: '', code: '', enabled: false, remark: '', fileName: '' })
const editing = computed(() => props.mode === 'edit')
const title = computed(() => editing.value ? '编辑算法' : '新增算法')

function resetForm() {
  Object.assign(form, props.record
    ? { name: props.record.name, code: '', enabled: props.record.enabled, remark: props.record.remark === '—' ? '' : props.record.remark, fileName: '' }
    : { name: '', code: '', enabled: false, remark: '', fileName: '' })
}
watch([visible, () => props.mode, () => props.record], ([isOpen]) => { if (isOpen) resetForm() }, { immediate: true })

function selectFile(file: { name: string }) { form.fileName = file.name }
async function save() {
  if (!form.name || (!editing.value && !form.code)) return ElMessage.warning(editing.value ? '请填写算法名称' : '请填写算法名称和编码')
  saving.value = true
  await new Promise(resolve => window.setTimeout(resolve, 500))
  saving.value = false
  visible.value = false
  if (props.record) emit('saved', { id: props.record.id, name: form.name, enabled: form.enabled, remark: form.remark || '—' })
  ElMessage.success(editing.value ? '算法已更新' : '算法已保存')
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="560" class="planning-dialog" destroy-on-close>
    <el-form :model="form" label-width="92px">
      <el-form-item label="算法名称" required><el-input v-model="form.name" placeholder="请输入算法名称" /></el-form-item>
      <el-form-item v-if="editing" label="算法序号"><el-input :model-value="record?.id" disabled /></el-form-item>
      <el-form-item v-else label="编码" required><el-input v-model="form.code" placeholder="请输入编码" /></el-form-item>
      <el-form-item label="算法文件">
        <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="selectFile"><el-button>上传</el-button></el-upload>
        <span class="upload-note">{{ form.fileName || (editing ? '替换规则待确认，未选择文件时保持原文件' : '文件类型与大小限制待确认') }}</span>
      </el-form-item>
      <el-form-item label="是否启用"><el-switch v-model="form.enabled" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" /></el-form-item>
    </el-form>
    <template #footer><el-button type="primary" :loading="saving" @click="save">保存</el-button><el-button @click="visible = false">取消</el-button></template>
  </el-dialog>
</template>
