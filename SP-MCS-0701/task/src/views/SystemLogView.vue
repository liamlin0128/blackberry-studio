<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker, ElForm, ElFormItem, ElInput, ElMessage, ElPagination, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { useRoute } from 'vue-router'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { operationLogRecords, systemLogRecords } from '../mocks/systemManagement'
import type { PrototypeState } from '../types/prototype'

type LogKind = 'system' | 'operation'
const route = useRoute()
const kind = computed(() => String(route.meta.kind || 'system') as LogKind)
const pageTitle = computed(() => kind.value === 'system' ? '系统日志' : '操作日志')
const params = computed(() => new URLSearchParams(location.search))
const state = computed(() => (params.value.get('state') || 'normal') as PrototypeState)
const filters = reactive({ operator: '', moduleName: '', operationType: '', range: [] as string[] })
const applied = ref({ ...filters, range: [] as string[] })
const currentPage = ref(1)
const pageSize = ref(30)
const sourceRows = computed(() => kind.value === 'system' ? systemLogRecords : operationLogRecords)
const rows = computed(() => sourceRows.value.filter((row) => (!applied.value.operator || row.operator.includes(applied.value.operator)) && (!applied.value.moduleName || row.moduleName.includes(applied.value.moduleName)) && (!applied.value.operationType || row.operationType.includes(applied.value.operationType)) && (!applied.value.range.length || (row.startedAt >= applied.value.range[0] && row.startedAt <= applied.value.range[1]))))
function query() { applied.value = { ...filters, range: [...filters.range] }; ElMessage.success(`查询完成，共 ${rows.value.length} 条证据样例`) }
function reset() { Object.assign(filters, { operator: '', moduleName: '', operationType: '', range: [] }); applied.value = { operator: '', moduleName: '', operationType: '', range: [] }; ElMessage.success('筛选条件已重置') }
function exportRows() { ElMessage.success(`${pageTitle.value}导出任务已生成`) }
</script>

<template>
  <section class="stage-four-page system-log-page">
    <PageHeader :title="pageTitle" description="系统运行与用户操作审计记录" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" :subject="pageTitle" />
    <template v-else>
      <div class="filter-panel log-filter">
        <el-form class="filter-form" label-position="left">
          <el-form-item label="操作方"><el-input v-model="filters.operator" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="模块名称"><el-input v-model="filters.moduleName" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="操作类型"><el-input v-model="filters.operationType" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="操作时间" class="date-field"><el-date-picker v-model="filters.range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
        </el-form>
        <div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button><el-button type="success" plain :icon="Download" @click="exportRows">导出</el-button></div>
      </div>
      <div class="table-region log-table-region">
        <el-table :data="rows" height="100%" class="requirement-table" empty-text="暂无日志记录">
          <el-table-column prop="id" label="编号" width="72" align="center" fixed="left" />
          <template v-if="kind === 'system'">
            <el-table-column prop="operationType" label="操作类型" min-width="150" fixed="left" /><el-table-column prop="operator" label="操作方" min-width="100" /><el-table-column prop="startedAt" label="操作开始时间" min-width="165" /><el-table-column prop="endedAt" label="操作结束时间" min-width="165" /><el-table-column prop="moduleName" label="模块名称" min-width="120" /><el-table-column prop="action" label="操作动作" min-width="120" /><el-table-column prop="content" label="操作内容" min-width="300" show-overflow-tooltip /><el-table-column prop="resultContent" label="操作结果" min-width="180" show-overflow-tooltip /><el-table-column label="结果" min-width="90"><template #default="{ row }"><el-tag :type="row.result === '成功' ? 'success' : 'danger'" effect="light">{{ row.result }}</el-tag></template></el-table-column><el-table-column prop="exception" label="操作异常信息" min-width="260" show-overflow-tooltip />
          </template>
          <template v-else>
            <el-table-column prop="operator" label="操作方" min-width="100" fixed="left" /><el-table-column prop="system" label="系统" min-width="90" /><el-table-column prop="startedAt" label="操作开始时间" min-width="165" /><el-table-column prop="endedAt" label="操作结束时间" min-width="165" /><el-table-column prop="moduleName" label="模块名称" min-width="130" /><el-table-column prop="operationType" label="操作类型" min-width="260" show-overflow-tooltip /><el-table-column prop="content" label="操作内容" min-width="320" show-overflow-tooltip /><el-table-column prop="ipAddress" label="IP 地址" min-width="140" />
          </template>
        </el-table>
      </div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10,30,50,100,200]" :total="kind === 'system' ? 793 : 250" /></div>
    </template>
  </section>
</template>
