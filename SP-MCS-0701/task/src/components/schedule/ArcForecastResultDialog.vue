<script setup lang="ts">
import { ref, watch } from 'vue'
import { Connection, Download, Location, Timer } from '@element-plus/icons-vue'
import { ElButton, ElDialog, ElIcon, ElMessage, ElTabPane, ElTabs, ElTag } from 'element-plus'
import type { ArcForecastType, SatelliteArcForecast } from '../../types/schedule'

const props = defineProps<{
  visible: boolean
  forecasts: SatelliteArcForecast[]
  dates: string[]
}>()

const emit = defineEmits<{ 'update:visible': [value: boolean] }>()
const activeSatellite = ref(props.forecasts[0]?.key ?? '')

watch(() => props.visible, (visible) => {
  if (visible) activeSatellite.value = props.forecasts[0]?.key ?? ''
})

function arcId(satelliteKey: string, date: string, sequence: number) {
  return `ARC-${satelliteKey}-${date.replaceAll('-', '')}-${String(sequence).padStart(3, '0')}`
}

function typeClass(type: ArcForecastType) {
  if (type === '测控弧段') return 'telecontrol'
  if (type === '数传弧段') return 'downlink'
  return 'combined'
}

function exportForecast() {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  ElMessage({ type: 'success', duration: 3000, message: `已导出：弧段预报_${timestamp}.xlsx` })
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    class="arc-forecast-result-dialog"
    width="1080px"
    top="7vh"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <template #header>
      <div class="forecast-result-header">
        <div class="forecast-dialog-title">
          <strong>弧段预报结果</strong>
          <span>独立预报 · 不写入规划记录，不输出规划日志</span>
        </div>
        <el-button type="success" :icon="Download" @click="exportForecast">导出预报结果</el-button>
      </div>
    </template>

    <div class="forecast-range-note">
      <el-icon><Timer /></el-icon>
      <span>预报范围</span>
      <strong>{{ dates[0] }} 至 {{ dates[2] }}</strong>
      <small>北京时间（UTC+8），连续 3 天</small>
    </div>

    <el-tabs v-model="activeSatellite" class="forecast-satellite-tabs">
      <el-tab-pane v-for="satellite in forecasts" :key="satellite.key" :name="satellite.key">
        <template #label><el-icon><Connection /></el-icon>{{ satellite.name }}（{{ satellite.id }}）</template>

        <section class="satellite-forecast-summary">
          <div class="satellite-identity"><el-icon><Connection /></el-icon><div><strong>{{ satellite.name }}</strong><small>{{ satellite.id }}</small></div></div>
          <dl>
            <div><dd>{{ satellite.summary.totalArcs }}</dd><dt>总弧段数</dt></div>
            <div><dd>{{ satellite.summary.occupied }}</dd><dt>已占用</dt></div>
            <div><dd>{{ satellite.summary.unoccupied }}</dd><dt>未占用</dt></div>
            <div><dd>{{ satellite.summary.uploadPlans }}</dd><dt>上注计划数</dt></div>
            <div><dd>{{ satellite.summary.dataPlans }}</dd><dt>数传计划数</dt></div>
          </dl>
        </section>

        <section v-for="(day, dayIndex) in satellite.days" :key="dates[dayIndex]" class="forecast-day-section">
          <header>
            <strong>{{ dates[dayIndex] }}</strong>
            <el-tag size="small" effect="plain">T+{{ dayIndex + 1 }}</el-tag>
            <div><span>总计 <b>{{ day.total }}</b></span><span>已占用 <b>{{ day.occupied }}</b></span><span>未占用 <b>{{ day.unoccupied }}</b></span><span>上注 <b>{{ day.uploadPlans }}</b></span><span>数传 <b>{{ day.dataPlans }}</b></span></div>
          </header>
          <div class="arc-card-grid">
            <article v-for="arc in day.arcs" :key="arc.sequence" class="arc-forecast-card">
              <header><strong>{{ arcId(satellite.key, dates[dayIndex], arc.sequence) }}</strong><el-tag :type="arc.status === '已占用' ? 'primary' : 'info'" size="small" effect="light">{{ arc.status }}</el-tag></header>
              <div class="arc-metadata"><span :class="['arc-type', typeClass(arc.type)]">{{ arc.type }}</span><span><el-icon><Location /></el-icon>{{ arc.station }}</span></div>
              <p><el-icon><Timer /></el-icon>{{ dates[dayIndex] }} {{ arc.timeWindow }}</p>
              <footer><span>上注计划 <b>{{ arc.uploadPlans }}</b> 个</span><span>数传计划 <b>{{ arc.dataPlans }}</b> 个</span></footer>
            </article>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
