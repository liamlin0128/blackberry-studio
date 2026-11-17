<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElButton, ElCheckbox, ElCheckboxGroup, ElForm, ElFormItem, ElInput, ElMessage, ElMessageBox, ElOption, ElRadio, ElRadioGroup, ElSelect, ElTag } from 'element-plus'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { algorithmNames } from '../mocks/schedule'
import { loadScheduleConfig, nextPlanningTime, saveScheduleConfig } from '../mocks/scheduleConfig'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(window.location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const editing = ref(params.get('edit') === 'open')
const saving = ref(false)
const form = reactive(loadScheduleConfig())
const nextTime = computed(() => nextPlanningTime(form))
const cycles = ['10分钟1次', '30分钟1次', '1小时1次', '2小时1次', '4小时1次', '8小时1次', '12小时1次', '24小时1次', '自定义时间']

async function save() {
  try { await ElMessageBox.confirm('保存后配置将全局生效，确认保存吗？', '保存规划配置', { type: 'warning', confirmButtonText: '确认保存', cancelButtonText: '返回检查' }) } catch { return }
  saving.value = true
  await new Promise(resolve => window.setTimeout(resolve, 600))
  saving.value = false
  editing.value = false
  saveScheduleConfig(form)
  ElMessage.success('规划配置已保存')
}
</script>

<template>
  <section class="stage-four-page schedule-config-page">
    <PageHeader title="规划配置" description="配置规划任务的触发、路径与执行参数，保存后全局生效" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="规划配置" />
    <template v-else-if="!editing">
      <section class="config-card">
        <header class="card-heading"><div><h2>当前配置</h2><span>参数取自原系统页面证据</span></div><el-tag type="success" effect="plain">已启用</el-tag></header>
        <dl class="config-summary">
          <div><dt>触发条件</dt><dd>{{ form.trigger }}</dd></div>
          <div><dt>规划可用路径</dt><dd>{{ form.paths.join('、') }}</dd></div>
          <div><dt>执行周期</dt><dd>{{ form.cycle }}</dd></div>
          <div><dt>规划计算超时时间</dt><dd>{{ form.timeout }} 分钟</dd></div>
          <div class="wide"><dt>默认执行算法</dt><dd>{{ form.algorithm }} <el-tag size="small" type="success">启用</el-tag></dd></div>
          <div><dt>纳入规划的任务时间范围</dt><dd>8 天内的任务</dd></div>
          <div><dt>结果覆盖时间（未来）</dt><dd>7 天内的计划</dd></div>
          <div><dt>确认任务时间（未来）</dt><dd>7 天内的计划</dd></div>
        </dl>
      </section>
      <section class="config-card execution-preview">
        <header class="card-heading"><div><h2>执行计划预览</h2><span>由当前配置推导</span></div></header>
        <dl><div><dt>触发方式</dt><dd>{{ form.trigger }}</dd></div><div><dt>执行频率</dt><dd>{{ form.cycle }}</dd></div><div><dt>下次执行</dt><dd>{{ nextTime }} <small>北京时间（UTC+8）</small></dd></div></dl>
      </section>
      <div class="config-actions"><el-button type="primary" @click="editing = true">编辑配置</el-button></div>
    </template>
    <section v-else class="config-edit-card">
      <header class="card-heading"><div><h2>编辑规划配置</h2><span>带 * 为必填项</span></div></header>
      <el-form :model="form" label-width="210px" label-position="left" class="config-form">
        <h3>规划设置</h3>
        <el-form-item label="触发条件" required><el-radio-group v-model="form.trigger"><el-radio value="自动定时触发">自动定时触发</el-radio><el-radio value="不自动触发">不自动触发</el-radio></el-radio-group><small class="field-note">自动模式按执行周期发起规划；关闭后仅支持手动发起规划</small></el-form-item>
        <el-form-item label="规划可用路径" required><el-checkbox-group v-model="form.paths"><el-checkbox value="遥控路径">遥控路径</el-checkbox><el-checkbox value="北斗路径">北斗路径</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="执行周期" required><el-select v-model="form.cycle"><el-option v-for="item in cycles" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="规划计算超时时间" required><el-input v-model="form.timeout"><template #append>分钟</template></el-input></el-form-item>
        <el-form-item label="默认执行算法" required><el-select v-model="form.algorithm"><el-option v-for="item in algorithmNames" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <h3>规划约束</h3>
        <el-form-item label="纳入规划的任务时间范围" required><el-input v-model="form.taskDays"><template #append>天内的任务</template></el-input></el-form-item>
        <el-form-item label="结果覆盖时间（未来）" required><el-input v-model="form.coverageDays"><template #append>天内的计划</template></el-input></el-form-item>
        <el-form-item label="确认任务时间（未来）" required><el-input v-model="form.confirmDays"><template #append>天内的计划</template></el-input><small class="field-note">不能超过结果覆盖时间</small></el-form-item>
      </el-form>
      <footer class="config-edit-actions"><el-button @click="editing = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></footer>
    </section>
  </section>
</template>
