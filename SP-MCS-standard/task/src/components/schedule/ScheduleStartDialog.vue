<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElDatePicker, ElDialog, ElForm, ElFormItem, ElMessage, ElOption, ElSelect } from 'element-plus'
import { algorithmNames } from '../../mocks/schedule'

const visible = defineModel<boolean>('visible', { required: true })
const submitting = ref(false)
const form = reactive({ algorithm: algorithmNames[0], taskRange: ['2026-09-10 10:12:38', '2026-09-18 10:12:38'], executionRange: ['2026-09-10 10:12:38', '2026-09-17 10:12:38'] })

async function submit() {
  submitting.value = true
  await new Promise(resolve => window.setTimeout(resolve, 600))
  submitting.value = false
  visible.value = false
  ElMessage.success('规划任务已提交')
}
</script>

<template>
  <el-dialog v-model="visible" width="650" class="planning-dialog schedule-start-dialog" destroy-on-close>
    <template #header><div class="dialog-title"><strong>开始规划</strong><span>默认参数读取自规划配置，修改仅对本次生效</span></div></template>
    <el-form :model="form" label-position="top">
      <el-form-item label="执行算法" required>
        <el-select v-model="form.algorithm"><el-option v-for="item in algorithmNames" :key="item" :label="item" :value="item" /></el-select>
        <small class="field-note">默认为规划配置中的「默认执行算法」</small>
      </el-form-item>
      <el-form-item label="进入规划的任务开始时间" required>
        <el-date-picker v-model="form.taskRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
        <small class="field-note">默认当前时间至未来 8 天，来自规划配置「纳入规划的任务时间范围」</small>
      </el-form-item>
      <el-form-item label="期望执行时间" required>
        <el-date-picker v-model="form.executionRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
        <small class="field-note">该窗口内的结果将确认为计划；默认当前时间至未来 7 天</small>
      </el-form-item>
    </el-form>
    <template #footer><el-button type="primary" :loading="submitting" @click="submit">提交</el-button><el-button @click="visible = false">关闭</el-button></template>
  </el-dialog>
</template>
