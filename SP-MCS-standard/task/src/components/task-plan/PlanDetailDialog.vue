<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Aim, ArrowLeft, Document, Minus, Plus } from '@element-plus/icons-vue'
import { ElButton, ElDialog, ElIcon, ElTabPane, ElTable, ElTableColumn, ElTabs, ElTag, ElTimeline, ElTimelineItem } from 'element-plus'
import { taskPlanDetails } from '../../mocks/taskPlanDetails'
import type { TaskPlanRecord } from '../../types/taskPlan'

const props = defineProps<{ visible: boolean; record: TaskPlanRecord | null }>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()
const evidence = computed(() => props.record ? taskPlanDetails[props.record.planNo] : undefined)
const status = computed(() => evidence.value?.status ?? props.record?.status ?? '待确认')
const statusType = computed(() => status.value === '待发送' ? 'warning' : status.value === '执行失败' ? 'danger' : status.value === '已完成' ? 'success' : 'primary')
const isImagingPlan = computed(() => props.record?.type === '单星' || props.record?.type === '协同')
const imagingFields = computed(() => evidence.value?.sections.find(item => item.title === '成像参数')?.fields ?? [])
const targetFields = computed(() => evidence.value?.sections.find(item => item.title === '目标点')?.fields ?? [])
const timeFields = computed(() => evidence.value?.sections.find(item => item.title === '时间信息')?.fields ?? [])
const transferBaseFields = computed(() => evidence.value?.sections.find(item => item.title === '基础参数')?.fields ?? [])
const transferFileFields = computed(() => evidence.value?.sections.find(item => item.title === '文件信息')?.fields ?? [])
const targetLongitude = computed(() => targetFields.value.find(item => item.label === '目标点经度')?.value ?? '待确认')
const targetLatitude = computed(() => targetFields.value.find(item => item.label === '目标点纬度')?.value ?? '待确认')
const mapZoom = ref(1)
const logVisible = ref(false)
watch(() => props.visible, visible => { if (visible) { logVisible.value = false; mapZoom.value = 1 } })

function changeMapZoom(delta: number) {
  mapZoom.value = Math.min(1.4, Math.max(.8, Number((mapZoom.value + delta).toFixed(1))))
}
</script>

<template>
  <el-dialog :model-value="visible" width="920px" top="4vh" :class="['plan-detail-dialog', { 'is-log-expanded': logVisible }]" destroy-on-close @update:model-value="emit('update:visible', $event)">
    <template #header><div class="plan-detail-dialog-header"><div class="dialog-title"><strong>任务计划详情</strong><span>{{ record?.planNo }}</span></div><el-button class="detail-log-toggle" :type="logVisible ? 'primary' : 'default'" :plain="logVisible" @click="logVisible = !logVisible"><el-icon><component :is="logVisible ? ArrowLeft : Document" /></el-icon>{{ logVisible ? '收起日志' : '日志' }}<span class="log-count">{{ evidence?.logs.length ?? 1 }}</span></el-button></div></template>
    <div v-if="record" :class="['plan-detail-layout', { 'is-log-open': logVisible }]">
      <main class="plan-detail-main">
        <section class="plan-detail-section"><h3>基本信息</h3><dl class="plan-detail-grid">
          <div><dt>计划编号</dt><dd>{{ record.planNo }}</dd></div><div><dt>关联任务编号</dt><dd>{{ record.requirementNo }}</dd></div>
          <div><dt>执行卫星</dt><dd>{{ record.satellite }}</dd></div><div><dt>执行测站</dt><dd>{{ evidence?.station ?? record.station }}</dd></div>
          <div><dt>时效类型</dt><dd>常规</dd></div><div><dt>计划类型</dt><dd><el-tag effect="light">{{ record.type }}</el-tag></dd></div>
          <div><dt>计划状态</dt><dd><el-tag :type="statusType" effect="light">{{ status }}</el-tag></dd></div><div><dt>优先级</dt><dd>{{ record.priority }}</dd></div>
          <div><dt>创建时间</dt><dd>{{ record.createdAt }}</dd></div><div><dt>发送时间</dt><dd>{{ evidence?.sentAt ?? record.sentAt }}</dd></div>
          <div><dt>计划开始执行时间</dt><dd>{{ evidence?.executeStartAt ?? record.executeStartAt }}</dd></div><div><dt>计划结束执行时间</dt><dd>{{ evidence?.executeEndAt ?? record.executeEndAt }}</dd></div>
          <div><dt>最晚上注时间</dt><dd>{{ evidence?.latestUploadAt ?? record.latestUploadAt }}</dd></div><div><dt>计划执行时间</dt><dd>{{ evidence?.executeAt ?? record.executeStartAt }}</dd></div>
          <div><dt>上注弧段</dt><dd>{{ evidence?.uploadArc ?? record.arcId }}</dd></div><div><dt>执行弧段</dt><dd>{{ evidence?.executeArc ?? '待确认' }}</dd></div>
        </dl></section>

        <section class="plan-detail-section plan-content-section"><el-tabs class="plan-detail-tabs">
          <el-tab-pane label="计划内容"><div class="plan-content-card"><header><strong><i />{{ evidence?.category ?? record.type }}</strong></header>
            <template v-if="evidence?.category === '成像'">
              <div class="imaging-plan-layout">
                <div class="imaging-parameter-sheet">
                  <h4>成像参数</h4>
                  <div v-for="field in imagingFields" :key="field.label" class="parameter-row"><span>{{ field.label }}</span><b>{{ field.value }}<small v-if="field.unit"> {{ field.unit }}</small></b></div>
                  <h4>目标点</h4>
                  <div v-for="field in targetFields" :key="field.label" class="parameter-row"><span>{{ field.label }}</span><b>{{ field.value }}<small v-if="field.unit"> {{ field.unit }}</small></b></div>
                </div>
                <div class="map-evidence plan-detail-map" aria-label="目标点脱机地图示意">
                  <div class="map-grid" :style="{ transform: `scale(${mapZoom})` }"></div><div class="region region-a"></div>
                  <div class="plan-map-controls" aria-label="地图缩放控制"><el-button text aria-label="放大地图" @click="changeMapZoom(.1)"><el-icon><Plus /></el-icon></el-button><el-button text aria-label="缩小地图" @click="changeMapZoom(-.1)"><el-icon><Minus /></el-icon></el-button><el-button text aria-label="复位地图" @click="mapZoom = 1"><el-icon><Aim /></el-icon></el-button></div>
                  <span>目标区域 · 脱机示意</span><small>{{ targetLongitude }}° E · {{ targetLatitude }}° N</small>
                </div>
              </div>
              <div class="detail-param-section imaging-time-section"><h4>时间信息</h4><div class="plan-time-grid"><div v-for="field in timeFields" :key="field.label"><span>{{ field.label }}</span><b>{{ field.value }}<small v-if="field.unit"> {{ field.unit }}</small></b></div></div></div>
            </template>
            <template v-else-if="evidence?.category === '数传'">
              <div class="detail-param-section transfer-detail-section">
                <h4>基础参数</h4>
                <div class="transfer-field-grid"><div v-for="field in transferBaseFields" :key="field.label"><span>{{ field.label }}</span><b>{{ field.value }}<small v-if="field.unit"> {{ field.unit }}</small></b></div></div>
                <h4>时间信息</h4>
                <div class="transfer-field-grid"><div v-for="field in timeFields" :key="field.label"><span>{{ field.label }}</span><b>{{ field.value }}<small v-if="field.unit"> {{ field.unit }}</small></b></div></div>
                <template v-for="field in transferFileFields" :key="field.label">
                  <h4>{{ field.label }}</h4>
                  <div class="transfer-reference-row"><span :class="{ 'is-linked': field.label === '前置遥感计划号' }">{{ field.value }}</span></div>
                </template>
              </div>
            </template>
            <template v-else-if="evidence"><div v-for="section in evidence.sections" :key="section.title" class="detail-param-section"><h4>{{ section.title }}</h4><div class="plan-param-grid"><div v-for="field in section.fields" :key="field.label"><span>{{ field.label }}</span><b>{{ field.value }}<small v-if="field.unit"> {{ field.unit }}</small></b></div></div></div></template>
            <div v-else-if="isImagingPlan" class="plan-target-layout pending-map-layout"><div class="detail-pending">{{ record.type }}计划参数与坐标待确认</div><div class="map-evidence plan-detail-map is-pending" aria-label="成像区域地图示意，范围待确认"><div class="map-grid"></div><span>成像区域 · 待确认</span><small>比例尺待确认</small></div></div>
            <p v-else class="detail-pending">该计划类型的专用参数待确认</p>
          </div></el-tab-pane>
          <el-tab-pane label="计划模板参数"><pre class="template-json">{{ evidence ? JSON.stringify(evidence.template, null, 2) : '待确认' }}</pre></el-tab-pane>
        </el-tabs></section>

        <section v-if="evidence?.relatedTask" class="plan-detail-section"><h3>关联任务</h3><el-table :data="evidence.relatedTask" class="detail-wide-table">
          <el-table-column prop="taskNo" label="任务编号" min-width="180"/><el-table-column prop="sourceNo" label="原需求编号" min-width="155"/><el-table-column prop="name" label="任务名称" min-width="140"/><el-table-column prop="taskType" label="任务类型" min-width="100"/><el-table-column prop="businessType" label="业务类型" width="90"/><el-table-column prop="mode" label="执行模式" width="90"/><el-table-column prop="satellite" label="执行卫星" width="90"/><el-table-column prop="priority" label="优先级" width="75"/><el-table-column prop="status" label="状态" width="100"/><el-table-column prop="createdAt" label="创建时间" min-width="165"/><el-table-column prop="earliestAt" label="最早执行时间" min-width="165"/><el-table-column prop="latestAt" label="最晚执行时间" min-width="165"/><el-table-column prop="result" label="统筹结果" width="90"/>
        </el-table></section>
        <section v-if="evidence?.relatedMetaTask" class="plan-detail-section"><h3>关联元任务</h3><el-table :data="evidence.relatedMetaTask" class="detail-wide-table">
          <el-table-column prop="metaNo" label="元任务编号" min-width="170"/><el-table-column prop="requirementNo" label="任务原需求号" min-width="180"/><el-table-column prop="type" label="类型" width="80"/><el-table-column prop="satellite" label="执行卫星" width="90"/><el-table-column prop="createdAt" label="创建时间" min-width="165"/><el-table-column prop="priority" label="优先级" width="75"/><el-table-column prop="status" label="状态" width="100"/><el-table-column prop="planNo" label="关联计划" width="110"/><el-table-column prop="startedAt" label="开始时间" min-width="165"/><el-table-column prop="endedAt" label="结束时间" min-width="165"/><el-table-column prop="payload" label="载荷信息" width="90"/><el-table-column prop="rollAngle" label="侧摆角" width="90"/>
        </el-table></section>
        <section v-if="evidence?.category === '成像'" class="plan-detail-section"><h3>IPU任务统计</h3><el-table :data="[]" empty-text="暂无数据"><el-table-column label="计划ID"/><el-table-column label="成像时长(秒)"/><el-table-column label="数据量(MB)"/><el-table-column label="是否处理成功"/></el-table></section>
        <section v-else class="plan-detail-section"><h3>数据包</h3><el-table :data="[]" empty-text="暂无数据"><el-table-column label="编号" width="90"/><el-table-column label="数据包"/><el-table-column label="位置"/><el-table-column label="文件名"/><el-table-column label="前置计划号"/></el-table></section>
        <section class="plan-detail-section"><h3>异常信息</h3><el-table :data="record.abnormal ? [{id:1,time:record.sentAt,reason:record.abnormalReason,state:record.status,resolved:'待确认'}] : []" empty-text="暂无数据"><el-table-column prop="id" label="编号" width="70"/><el-table-column prop="time" label="异常时间" width="170"/><el-table-column prop="reason" label="异常原因" min-width="260"/><el-table-column prop="state" label="异常时状态" width="110"/><el-table-column prop="resolved" label="是否已解决" width="110"/></el-table></section>
        <section class="plan-detail-section"><h3>其他信息</h3><dl class="plan-detail-grid compact"><div><dt>创建人</dt><dd>system</dd></div><div><dt>创建时间</dt><dd>{{ record.createdAt }}</dd></div></dl></section>
      </main>
      <aside v-if="logVisible" class="plan-detail-log"><header><strong>日志</strong><span>{{ evidence?.logs.length ?? 1 }} 条</span></header><el-timeline>
        <el-timeline-item v-for="item in evidence?.logs ?? [{status:record.status,action:'新增计划',time:record.createdAt,type:'warning' as const}]" :key="item.time + item.status" :timestamp="item.time" :type="item.type"><strong>{{ item.status }}</strong><p>{{ item.action }}</p></el-timeline-item>
      </el-timeline></aside>
    </div>
  </el-dialog>
</template>
