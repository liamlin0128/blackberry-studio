<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Edit, Plus, Refresh, Search, View } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElForm, ElFormItem, ElInput, ElMessage, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import UploadRegistrationDialog from '../components/data/UploadRegistrationDialog.vue'
import ManualPlanDialog from '../components/task-plan/ManualPlanDialog.vue'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { uploadRegistrations } from '../mocks/dataReception'
import type { UploadRegistration } from '../types/dataReception'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const filters = reactive({ softwareName: '', version: '', range: [] as string[] })
const applied = ref({ ...filters, range: [] as string[] })
const registrations = ref<UploadRegistration[]>(uploadRegistrations.map((item) => ({ ...item, volumeFiles: item.volumeFiles?.map((file) => ({ ...file })) })))
const currentPage = ref(1)
const pageSize = ref(30)
const dialogVisible = ref(false)
const mode = ref<'create' | 'edit' | 'view'>('create')
const record = ref<UploadRegistration | null>(null)
const planDialogVisible = ref(false)
const planSource = ref<UploadRegistration | null>(null)

const rows = computed(() => registrations.value.filter((row) => (
  (!applied.value.softwareName || row.softwareName.includes(applied.value.softwareName))
  && (!applied.value.version || row.version.includes(applied.value.version))
  && (!applied.value.range.length || (row.registeredAt >= applied.value.range[0] && row.registeredAt <= applied.value.range[1]))
)))

function query() {
  applied.value = { ...filters, range: [...filters.range] }
  ElMessage.success(`查询完成，共 ${rows.value.length} 条`)
}

function reset() {
  Object.assign(filters, { softwareName: '', version: '', range: [] })
  applied.value = { softwareName: '', version: '', range: [] }
  ElMessage.success('筛选条件已重置')
}

function open(nextMode: 'create' | 'edit' | 'view', row: unknown = null) {
  mode.value = nextMode
  record.value = row as UploadRegistration | null
  dialogVisible.value = true
}

function saveRegistration(value: UploadRegistration, original: UploadRegistration | null) {
  const index = original ? registrations.value.findIndex((item) => item === original) : -1
  if (index >= 0) registrations.value.splice(index, 1, value)
  else registrations.value.unshift(value)
}

function createPlan(row: unknown) {
  planSource.value = row as UploadRegistration
  planDialogVisible.value = true
}

onMounted(() => {
  const dialog = params.get('dialog')
  if (dialog === 'create') open('create')
  if (dialog === 'view') open('view', registrations.value[0])
})
</script>

<template>
  <section class="stage-four-page upload-registration-page">
    <PageHeader title="上注文件登记表" description="软件原文件与分卷登记" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="上注文件登记" />
    <template v-else>
      <div class="filter-panel compact-upload-filter">
        <el-form class="filter-form" label-position="left">
          <el-form-item label="软件名称"><el-input v-model="filters.softwareName" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="软件版本"><el-input v-model="filters.version" placeholder="请输入" clearable /></el-form-item>
          <el-form-item class="date-field" label="登记时间"><el-date-picker v-model="filters.range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
        </el-form>
        <div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button></div>
      </div>
      <div class="batch-actions"><el-button type="primary" :icon="Plus" @click="open('create')">新增登记</el-button><span>时间：北京时间（UTC+8）</span></div>
      <div class="table-region">
        <el-table :data="rows" height="100%" class="requirement-table">
          <el-table-column prop="softwareName" label="软件名称" min-width="160" />
          <el-table-column prop="version" label="版本" min-width="100" />
          <el-table-column prop="satellite" label="卫星" min-width="100" />
          <el-table-column prop="volumeCount" label="分卷数" min-width="90" align="center" />
          <el-table-column prop="sourcePath" label="原文件路径" min-width="380" show-overflow-tooltip />
          <el-table-column prop="editor" label="编辑人" min-width="100" />
          <el-table-column prop="registeredAt" label="登记时间" min-width="165" />
          <el-table-column prop="editedAt" label="编辑时间" min-width="165" />
          <el-table-column label="操作" width="132" fixed="right"><template #default="{ row }"><div class="icon-actions"><el-button link type="primary" :icon="View" title="查看" aria-label="查看登记" @click="open('view', row)" /><el-button link type="primary" :icon="Edit" title="编辑" aria-label="编辑登记" @click="open('edit', row)" /><el-button link type="primary" :icon="Plus" title="创建计划" aria-label="创建计划" @click="createPlan(row)" /></div></template></el-table-column>
        </el-table>
      </div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="registrations.length" :page-sizes="[10, 30, 50, 100, 200]" /></div>
    </template>
    <UploadRegistrationDialog v-model:visible="dialogVisible" :mode="mode" :record="record" @saved="saveRegistration" />
    <ManualPlanDialog v-model:visible="planDialogVisible" default-type="上注" fixed-type="上注" :context="planSource ? { satellite: planSource.satellite } : null" />
  </section>
</template>
