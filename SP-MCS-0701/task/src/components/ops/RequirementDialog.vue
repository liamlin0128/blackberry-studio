<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElButton, ElDialog, ElMessage, ElMessageBox, ElOption, ElSelect, ElTable,
  ElIcon, ElTableColumn, ElTag, ElTimeline, ElTimelineItem,
} from 'element-plus'
import { ArrowLeft, Document } from '@element-plus/icons-vue'
import type { RequirementRow } from '../../types/requirements'
import { loadProjectRequirements } from '../../mocks/projectRequirements'

const props = defineProps<{ visible: boolean; mode: 'detail' | 'edit'; row: RequirementRow | null }>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; saved: [priority: number] }>()
const priority = ref(12)
const logOpen = ref(false)
watch(() => props.row, (row) => { if (row) priority.value = row.priority }, { immediate: true })
watch(() => props.visible, visible => { if (visible) logOpen.value = false })
const title = computed(() => props.mode === 'detail' ? '任务需求详情' : '编辑')
const projectRecord = computed(() => props.row && loadProjectRequirements().find(item => item.id === props.row?.sourceNo && item.taskNo === props.row?.taskNo))

async function save() {
  try {
    await ElMessageBox.confirm(`确认将优先级保存为 ${priority.value}？`, '保存确认', { type: 'warning', confirmButtonText: '确认保存', cancelButtonText: '取消' })
  } catch { return }
  emit('saved', priority.value)
  emit('update:visible', false)
  ElMessage.success('保存成功')
}
</script>

<template>
  <el-dialog :model-value="visible" width="920px" top="5vh" :class="['requirement-dialog', { 'is-log-expanded': mode === 'detail' && logOpen }]" @close="emit('update:visible', false)">
    <template #header>
      <div class="dialog-heading"><div><strong>{{ title }}</strong><small v-if="row">{{ row.taskNo }}</small></div><el-button v-if="mode === 'detail' && !projectRecord" class="detail-log-toggle" :type="logOpen ? 'primary' : 'default'" :plain="logOpen" @click="logOpen = !logOpen"><el-icon><component :is="logOpen ? ArrowLeft : Document" /></el-icon>{{ logOpen ? '收起日志' : '日志' }}<span class="log-count">5</span></el-button></div>
    </template>
    <template v-if="row">
      <div v-if="projectRecord" class="detail-main">
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div><label>任务编号</label><span>{{ row.taskNo }}</span></div><div><label>来源需求</label><span>{{ projectRecord.id }}</span></div>
          <div><label>任务名称</label><span>{{ projectRecord.name }}</span></div><div><label>任务状态</label><el-tag size="small">{{ projectRecord.linkedTask?.status || row.status }}</el-tag></div>
          <div><label>观测方式</label><span>{{ projectRecord.observationMode }}</span></div><div><label>执行卫星</label><span>{{ projectRecord.satellite }}</span></div>
          <div><label>载荷要求</label><span>{{ projectRecord.payloads.join('、') }}</span></div><div><label>优先级</label><span>{{ projectRecord.priority }}</span></div>
          <div><label>侧摆角</label><span>{{ projectRecord.rollAngle }}°</span></div><div><label>创建时间</label><span>{{ row.createdAt }}（UTC+8）</span></div>
          <div><label>最早执行时间</label><span>{{ row.earliestAt }}（UTC+8）</span></div><div><label>最晚执行时间</label><span>{{ row.latestAt }}（UTC+8）</span></div>
        </div>
        <div class="section-title">关联计划</div>
        <div v-if="projectRecord.plans?.some(plan => plan.type !== '数传计划')" class="info-grid"><div v-for="plan in projectRecord.plans.filter(item => item.type !== '数传计划')" :key="plan.no"><label>{{ plan.type }}</label><span>{{ plan.no }} · {{ plan.status }}</span></div></div>
        <p v-else>暂无关联计划</p>
      </div>
      <template v-else>
      <div class="detail-layout" :class="{ 'has-log': mode === 'detail' && logOpen }"><div class="detail-main">
      <div class="section-title">基本信息</div>
      <div class="info-grid">
        <div><label>任务编号</label><span>{{ row.taskNo }}</span></div><div><label>原需求编号</label><span>{{ row.sourceNo }}</span></div>
        <div><label>原需求名称</label><span>{{ row.name }}</span></div><div><label>任务类型</label><el-tag size="small" type="info">{{ row.taskType }}</el-tag></div>
        <div><label>执行模式</label><el-tag size="small">提取</el-tag></div><div><label>任务状态</label><el-tag size="small">{{ row.status }}</el-tag></div>
        <div><label>优先级</label><el-select v-if="mode === 'edit'" v-model="priority" size="small"><el-option v-for="n in [6,8,12,13,14]" :key="n" :label="n" :value="n" /></el-select><span v-else>{{ row.priority }}</span></div>
        <div><label>筹划结果</label><span>{{ row.coordinationResult.split('(')[0] }}</span></div>
        <div><label>最早执行时间</label><span>{{ row.earliestAt }}</span></div><div><label>最晚执行时间</label><span>{{ row.latestAt }}</span></div>
        <div><label>创建时间</label><span>{{ row.createdAt }}</span></div><div><label>更新时间</label><span>2026-09-09 12:02:07</span></div>
      </div>

      <div class="section-title">需求内容</div>
      <div class="requirement-content">
        <div class="parameter-list"><strong>任务参数</strong><p><label>业务类型</label><span>成像</span></p><p><label>业务模式</label><span>单星</span></p><p><label>执行卫星</label><span>MD1B</span></p><p><label>执行载荷</label><span>HSI</span></p><p><label>是否重点区域</label><span>是</span></p><p><label>最大侧摆角</label><span>30°</span></p><p><label>产品级别</label><span>23</span></p><p><label>算法模型</label><span>00</span></p></div>
        <div class="map-evidence" aria-label="成像区域地图示意"><div class="map-grid"></div><div class="region region-a"></div><div class="region region-b"></div><span>成像区域 · 证据示意</span><small>200 km</small></div>
      </div>

      <template v-if="mode === 'detail'">
        <div class="subheading">关联计划</div>
        <el-table :data="row.plans.slice(0, 3).map((plan, index) => ({ plan, arc: `MD1BSDZH045123${94-index*8}`, type: index ? '单星' : '数传', priority: 9, status: '待发送', satellite: '木铎1B' }))" size="small">
          <el-table-column prop="plan" label="计划编号" width="110"/><el-table-column prop="arc" label="弧段ID" min-width="180"/><el-table-column prop="type" label="计划类型"/><el-table-column label="时效类型"><template #default>常规</template></el-table-column><el-table-column prop="priority" label="优先级"/><el-table-column prop="status" label="状态"/><el-table-column prop="satellite" label="执行卫星"/>
        </el-table>
        <div class="subheading">关联元任务</div>
        <el-table :data="[{ id: '1302325033435593', taskNo: row.taskNo, type: '单星', satellite: '木铎1B', status: '已规划', angle: '-4.1035°' }]" size="small">
          <el-table-column prop="id" label="元任务编号" width="165"/><el-table-column prop="taskNo" label="任务原需求号" width="175"/><el-table-column prop="type" label="类型"/><el-table-column prop="satellite" label="执行卫星"/><el-table-column prop="status" label="状态"/><el-table-column prop="angle" label="侧摆角"/>
        </el-table>
        <div class="section-title">其他信息</div>
        <div class="info-grid compact"><div><label>来源系统</label><span>数据存储管理系统</span></div><div><label>更新时间</label><span>2026-09-09 12:02:07</span></div></div>
      </template>
      </div>
      <aside v-if="mode === 'detail' && logOpen" class="plan-detail-log requirement-detail-log">
        <header><strong>日志</strong><span>5 条</span></header>
        <el-timeline>
          <el-timeline-item timestamp="2026-09-09 10:38:36" color="#722ed1"><strong>待规划</strong><p>任务创建</p></el-timeline-item>
          <el-timeline-item timestamp="2026-09-09 10:41:27" type="warning"><strong>规划中</strong><p>任务进行规划</p></el-timeline-item>
          <el-timeline-item timestamp="2026-09-09 10:41:33" type="primary"><strong>规划成功</strong><p>规划计算成功</p></el-timeline-item>
          <el-timeline-item timestamp="2026-09-09 12:00:00" type="warning"><strong>规划中</strong><p>任务进行规划</p></el-timeline-item>
          <el-timeline-item timestamp="2026-09-09 12:00:11" type="primary"><strong>规划成功</strong><p>规划计算成功</p></el-timeline-item>
        </el-timeline>
      </aside></div>
      </template>
    </template>
    <template v-if="mode === 'edit'" #footer><el-button @click="emit('update:visible', false)">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
  </el-dialog>
</template>
