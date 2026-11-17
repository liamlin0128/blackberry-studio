<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElCheckbox, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElSelect } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const visible = defineModel<boolean>('visible', { required: true })
const saving = ref(false)
const form = reactive({ scheduled: true, frequency: '4小时1次', timeout: 12 })
const formRef = ref<FormInstance>()
const frequencyOptions = ['10分钟1次', '30分钟1次', '1小时1次', '2小时1次', '4小时1次', '8小时1次', '12小时1次', '24小时1次', '自定义时间']
const rules: FormRules<typeof form> = {
  frequency: [{ validator: (_rule, value, callback) => form.scheduled && !value ? callback(new Error('请选择执行周期')) : callback(), trigger: 'change' }],
  timeout: [{ validator: (_rule, value, callback) => Number(value) < 3 || Number(value) > 24 ? callback(new Error('请输入 3–24 分钟')) : callback(), trigger: 'blur' }],
}

async function save() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  await new Promise(resolve => window.setTimeout(resolve, 450))
  saving.value = false
  visible.value = false
  ElMessage.success('筹划设置已保存')
}
</script>

<template>
  <el-dialog v-model="visible" title="筹划设置" width="600px" class="planning-dialog" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="settings-form">
      <el-form-item label="触发条件"><el-checkbox v-model="form.scheduled">定时触发</el-checkbox></el-form-item>
      <el-form-item label="执行周期" prop="frequency" required>
        <el-select v-model="form.frequency" :disabled="!form.scheduled"><el-option v-for="item in frequencyOptions" :key="item" :label="item" :value="item" /></el-select>
      </el-form-item>
      <el-form-item label="超时时间" prop="timeout" required>
        <el-input v-model.number="form.timeout" type="number" min="3" max="24"><template #append>分钟</template></el-input>
        <small class="field-note">证据可见范围：3–24 分钟</small>
      </el-form-item>
    </el-form>
    <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
  </el-dialog>
</template>
