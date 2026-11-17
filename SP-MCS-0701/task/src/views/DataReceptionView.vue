<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import { ElAlert, ElButton, ElDatePicker, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { useRoute } from 'vue-router'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { satelliteOptions, taskStatusRecords } from '../mocks/dataReception'
import type { ParsedDataRecord } from '../types/dataReception'
import type { PrototypeState } from '../types/prototype'

type PageKind = 'status' | 'urgent' | 'ipu' | 'logs'
const route = useRoute()
const kind = computed<PageKind>(() => String(route.meta.kind || 'status') as PageKind)
const page = computed(() => ({
  status: { title:'北斗星上任务计划状态信息', total:69, hasTime:true, evidence:'HTML 证据样例' },
  urgent: { title:'北斗星上应急规划结果记录', total:0, hasTime:true, evidence:'实时静态资源证据' },
  ipu: { title:'北斗 IPU 任务统计数据', total:0, hasTime:false, evidence:'实时静态资源证据' },
  logs: { title:'星上任务日志记录', total:0, hasTime:true, evidence:'HTML 证据为空状态' },
}[kind.value]))
const params = computed(() => new URLSearchParams(location.search))
const state = computed(() => (params.value.get('state') || 'normal') as PrototypeState)
const filters = reactive({ planId:'', satellite:'', range:[] as string[] })
const applied = ref({ ...filters, range:[] as string[] })
const currentPage = ref(1); const pageSize = ref(30)
const records = computed<ParsedDataRecord[]>(() => kind.value === 'status' ? taskStatusRecords : [])
const rows = computed(() => records.value.filter(row => (!applied.value.planId || row.planId.includes(applied.value.planId)) && (!applied.value.satellite || row.satellite === applied.value.satellite) && (!applied.value.range.length || row.receivedAt >= applied.value.range[0] && row.receivedAt <= applied.value.range[1])))
function query(){ applied.value={...filters,range:[...filters.range]}; ElMessage.success(`查询完成，当前显示 ${rows.value.length} 条证据样例`) }
function reset(){ Object.assign(filters,{planId:'',satellite:'',range:[]}); applied.value={planId:'',satellite:'',range:[]}; ElMessage.success('筛选条件已重置') }
function exportRows(){ ElMessage.success('导出任务已生成') }
function statusTone(value?:string){ return value?.includes('完成') ? 'success' : value?.includes('中止') || value?.includes('打断') ? 'danger' : 'warning' }
</script>

<template>
  <section class="stage-four-page reception-page">
    <PageHeader :title="page.title" :description="page.evidence" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" :subject="page.title" />
    <template v-else>
      <el-alert v-if="kind === 'urgent' || kind === 'ipu'" class="evidence-alert" type="info" :closable="false" show-icon title="服务端动态解析字段与数据样例待确认；下表仅保留页面资源已明确的通用列。" />
      <div class="filter-panel compact-reception-filter">
        <el-form class="filter-form" label-position="left">
          <el-form-item label="计划号"><el-input v-model="filters.planId" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="卫星"><el-select v-model="filters.satellite" placeholder="请选择" clearable><el-option v-for="item in satelliteOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item v-if="page.hasTime" :label="kind === 'logs' ? '接收时间' : '数据时间'" class="date-field"><el-date-picker v-model="filters.range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item>
        </el-form>
        <div class="filter-actions"><el-button type="primary" :icon="Search" @click="query">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button><el-button type="success" plain :icon="Download" @click="exportRows">导出</el-button></div>
      </div>
      <div class="table-region">
        <el-table :data="rows" height="100%" class="requirement-table" empty-text="暂无可确认数据">
          <el-table-column type="index" label="序号" width="64" align="center" fixed="left" />
          <template v-if="kind === 'logs'">
            <el-table-column label="任务日志类型" min-width="145" /><el-table-column label="计划ID" min-width="120" /><el-table-column label="卫星ID" min-width="100" /><el-table-column label="任务状态" min-width="110" /><el-table-column label="开始时间" min-width="165" /><el-table-column label="结束时间" min-width="165" /><el-table-column label="指令序列标识" min-width="145" /><el-table-column label="时间戳" min-width="165" /><el-table-column label="地面站接收时间" min-width="180" /><el-table-column label="原始文件" min-width="200" />
          </template>
          <template v-else>
            <el-table-column prop="planId" label="计划ID" min-width="120" fixed="left" />
            <el-table-column v-if="kind === 'status'" label="状态" min-width="150"><template #default="{row}"><el-tag :type="statusTone(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column v-if="kind === 'status' || kind === 'urgent'" prop="timestamp" :label="kind === 'urgent' ? '时间' : '时间戳'" min-width="165" />
            <el-table-column prop="type" label="类型" min-width="180" /><el-table-column prop="satellite" label="卫星ID" min-width="110" /><el-table-column prop="receivedAt" label="接收时间" min-width="165" />
            <el-table-column label="原始数据内容" min-width="330"><template #default="{row}"><code class="raw-data">{{ row.raw }}</code></template></el-table-column>
          </template>
        </el-table>
      </div>
      <div class="pagination-bar"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10,30,50,100,200]" :total="page.total" /></div>
    </template>
  </section>
</template>
