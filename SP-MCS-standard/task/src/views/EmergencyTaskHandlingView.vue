<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download, Refresh, Search, Setting } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn, ElTag } from 'element-plus'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { emergencyHandlingConfig, emergencyHandlingRecords } from '../mocks/emergency'
import type { EmergencyHandlingConfig } from '../types/emergency'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const filters = reactive({ planNo: '', taskNo: '', sourceNo: '', taskType: '', processedRange: [] as string[] })
const submitted = ref({ ...filters, processedRange: [] as string[] })
const config = reactive<EmergencyHandlingConfig>({ ...emergencyHandlingConfig })
const configVisible = ref(params.get('dialog') === 'config')
const currentPage = ref(1)
const pageSize = ref(30)
const rows = computed(() => emergencyHandlingRecords.filter((row) =>
  (!submitted.value.planNo || row.planNo.includes(submitted.value.planNo)) &&
  (!submitted.value.taskNo || row.taskNo.includes(submitted.value.taskNo)) &&
  (!submitted.value.sourceNo || row.sourceNo.includes(submitted.value.sourceNo)) &&
  (!submitted.value.taskType || row.taskType === submitted.value.taskType) &&
  (!submitted.value.processedRange.length || (row.processedAt >= submitted.value.processedRange[0] && row.processedAt <= submitted.value.processedRange[1])),
))
function query() { submitted.value = { ...filters, processedRange: [...filters.processedRange] }; ElMessage.success(`查询完成，当前显示 ${rows.value.length} 条处理记录`) }
function reset() { Object.assign(filters, { planNo: '', taskNo: '', sourceNo: '', taskType: '', processedRange: [] }); submitted.value = { ...filters, processedRange: [] }; ElMessage.success('筛选条件已重置') }
function exportRows() { ElMessage.success('导出任务已生成') }
function saveConfig() { configVisible.value = false; ElMessage.success('应急计划处理配置已保存') }
</script>

<template>
  <section class="stage-four-page emergency-handling-page">
    <PageHeader title="应急任务需求处理" description="根据紧急任务需求生成计划并记录处理结果" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="应急任务处理" />
    <template v-else>
      <div class="filter-panel emergency-filter">
        <el-form class="filter-form" label-position="left">
          <el-form-item label="计划号"><el-input v-model="filters.planNo" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="任务需求号"><el-input v-model="filters.taskNo" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="原始需求号"><el-input v-model="filters.sourceNo" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="任务类型"><el-select v-model="filters.taskType" placeholder="请选择" clearable><el-option label="应急提取" value="应急提取" /><el-option label="应急观测" value="应急观测" /></el-select></el-form-item>
          <el-form-item label="处理时间" class="date-field"><el-date-picker v-model="filters.processedRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
        </el-form>
        <div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button><el-button :icon="Download" @click="exportRows">导出</el-button></div>
      </div>
      <div class="list-toolbar"><el-button :icon="Setting" @click="configVisible = true">应急计划处理配置</el-button><span>时间：北京时间（UTC+8）</span></div>
      <div class="table-region">
        <el-table :data="rows" height="100%" class="requirement-table" empty-text="暂无应急任务处理记录">
          <el-table-column prop="id" label="处理记录号" min-width="180" show-overflow-tooltip fixed="left" />
          <el-table-column prop="sourceNo" label="原需求编号" min-width="150" />
          <el-table-column prop="taskNo" label="任务需求号" min-width="170" />
          <el-table-column prop="planNo" label="生成计划编号" min-width="140" />
          <el-table-column prop="processedAt" label="需求处理时间" min-width="165" />
          <el-table-column prop="satellite" label="执行卫星" min-width="105" />
          <el-table-column prop="taskType" label="类型" min-width="105" />
          <el-table-column label="上星状态" min-width="100"><template #default="{ row }"><el-tag type="info" effect="plain">{{ row.uplinkStatus }}</el-tag></template></el-table-column>
          <el-table-column label="结果" min-width="85"><template #default="{ row }"><el-tag :type="row.result === '成功' ? 'success' : 'danger'" effect="light">{{ row.result }}</el-tag></template></el-table-column>
          <el-table-column prop="message" label="处理信息" min-width="260" show-overflow-tooltip />
        </el-table>
      </div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10,30,50,100]" :total="emergencyHandlingRecords.length" /></div>
    </template>
    <el-dialog v-model="configVisible" title="应急计划处理设置" width="620px" destroy-on-close>
      <el-form :model="config" label-width="184px">
        <el-form-item label="北斗上注时间"><span class="config-help">当前不在弧段中：系统判定的北斗弧段开始时间 +</span><el-input-number v-model="config.outsideArcDelaySeconds" :min="0" /><span class="unit-suffix">秒</span></el-form-item>
        <el-form-item label="弧段内剩余时间"><span class="config-help">当前位于北斗弧段中，距离结束时间大于</span><el-input-number v-model="config.insideArcRemainingSeconds" :min="0" /><span class="unit-suffix">秒时可选本圈，否则选下一圈</span></el-form-item>
        <el-form-item label="最晚上注时间（应急成像）"><span class="config-help">任务结束时间 -</span><el-input-number v-model="config.imagingLatestUplinkMinutes" :min="0" /><span class="unit-suffix">分钟</span></el-form-item>
        <el-form-item label="最晚上注时间（应急数传）"><span class="config-help">任务结束时间 -</span><el-input-number v-model="config.transferLatestUplinkMinutes" :min="0" /><span class="unit-suffix">分钟</span></el-form-item>
        <p class="form-hint">最晚上注时间需要小于任务执行时间。</p>
      </el-form>
      <template #footer><el-button @click="configVisible = false">关闭</el-button><el-button type="primary" @click="saveConfig">提交</el-button></template>
    </el-dialog>
  </section>
</template>
