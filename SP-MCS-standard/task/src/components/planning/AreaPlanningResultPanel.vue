<script setup lang="ts">
import { computed, ref } from 'vue'
import { Aim, Minus, Plus, VideoPlay } from '@element-plus/icons-vue'
import { ElButton, ElCheckbox, ElMessage, ElTable, ElTableColumn } from 'element-plus'
import type { AreaObservationStrip, AreaPlanningResult } from '../../types/planning'

const props = defineProps<{ result: AreaPlanningResult }>()
const payloadEnabled = ref(true)
const viewMode = ref<'target' | 'global'>('target')
const activeStrip = ref(1)
const demoPlaying = ref(false)
const zoom = ref(1)
const timelineLabels = computed(() => props.result.strips.map(item => item.startedAt.slice(5, 10).replace('-', '/')))
const sceneScale = computed(() => (viewMode.value === 'global' ? .84 : 1) * zoom.value)

function selectStrip(value: unknown) { activeStrip.value = (value as AreaObservationStrip).no }
function rowClassName({ row }: { row: AreaObservationStrip }) { return row.no === activeStrip.value ? 'is-active-strip' : '' }
function changeZoom(delta: number) { zoom.value = Math.min(1.25, Math.max(.8, zoom.value + delta)) }
async function playDemo() {
  if (demoPlaying.value || !payloadEnabled.value) return
  demoPlaying.value = true
  for (const strip of props.result.strips) {
    activeStrip.value = strip.no
    await new Promise(resolve => window.setTimeout(resolve, 420))
  }
  demoPlaying.value = false
  ElMessage.success('筹划过程演示完成')
}
</script>

<template>
  <div class="area-results">
    <section class="result-panel">
      <header class="result-panel-heading">
        <div><span /><h2>结果可视化</h2></div>
        <label>载荷选择 <el-checkbox v-model="payloadEnabled">木铎1A</el-checkbox></label>
      </header>
      <div class="result-visual-grid">
        <div class="result-map-column">
          <div class="result-map" :class="`is-${viewMode}`">
            <div class="result-map-scene" :style="{ transform: `scale(${sceneScale})` }">
              <div class="result-orbit" />
              <div class="result-target" />
              <template v-if="payloadEnabled">
                <button v-for="strip in result.strips" :key="strip.no" type="button" class="result-strip" :class="{ 'is-active': activeStrip === strip.no }" :style="{ top: `${32 + strip.no * 8}%`, left: `${40 + strip.no * 1.6}%` }" :aria-pressed="activeStrip === strip.no" :aria-label="`选择观测条带 ${strip.no}`" @click="activeStrip = strip.no">
                  <span>{{ strip.no }}</span><small>{{ timelineLabels[strip.no - 1] }}</small>
                </button>
              </template>
            </div>
            <div class="result-view-toggle" role="group" aria-label="地图视图"><button :class="{ active: viewMode === 'target' }" :aria-pressed="viewMode === 'target'" @click="viewMode = 'target'">目标区域</button><button :class="{ active: viewMode === 'global' }" :aria-pressed="viewMode === 'global'" @click="viewMode = 'global'">全球</button></div>
            <div class="map-controls"><el-button :icon="Plus" aria-label="放大" @click="changeZoom(.1)" /><el-button :icon="Minus" aria-label="缩小" @click="changeZoom(-.1)" /><el-button :icon="Aim" aria-label="复位" @click="zoom = 1" /></div>
            <div class="result-map-legend"><span><i class="target" />目标区域</span><span><i class="strip" />观测条带</span><span><i class="orbit" />卫星轨道</span></div>
            <div class="result-scale">500 km</div>
            <el-button class="demo-button" :icon="VideoPlay" :loading="demoPlaying" :disabled="!payloadEnabled" @click="playDemo">筹划过程演示</el-button>
          </div>
          <p class="map-help">支持缩放与条带联动。</p>
        </div>

        <aside class="result-side">
          <section class="result-card">
            <h3>筹划统计</h3>
            <dl class="result-metrics">
              <div><dt>目标区域总面积</dt><dd>{{ result.areaKm2.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}<small>km²</small></dd><p>WGS-84 投影面积</p></div>
              <div><dt>观测条带（拍摄次数）</dt><dd>{{ result.stripCount }}<small>个条带</small></dd><p>木铎1A · PMS</p></div>
              <div><dt>目标区域覆盖率</dt><dd class="success">{{ result.coveragePercent }}<small>%</small></dd><p>含旁向重叠</p></div>
              <div><dt>任务完成用时</dt><dd>{{ result.durationDays }}<small>天</small></dd><p>早于截止 {{ result.daysBeforeDeadline }} 天</p></div>
            </dl>
          </section>
          <section class="result-card execution-window">
            <h3>执行窗口</h3>
            <div class="window-range">{{ result.windowStart }} <span>至</span> {{ result.windowEnd }} <small>北京时间（UTC+8）</small></div>
            <div class="window-track"><button v-for="strip in result.strips" :key="strip.no" type="button" :class="{ active: activeStrip === strip.no }" :aria-pressed="activeStrip === strip.no" :aria-label="`选择第 ${strip.no} 次拍摄`" @click="activeStrip = strip.no"><b>{{ strip.no }}</b><small>{{ timelineLabels[strip.no - 1] }}</small></button></div>
            <strong>{{ result.stripCount }} 次拍摄 · {{ result.durationDays }} 天完成</strong>
          </section>
        </aside>
      </div>
    </section>

    <section class="result-panel analysis-panel">
      <header class="result-panel-heading"><div><span /><h2>筹划结果分析</h2><small>北京时间（UTC+8）</small></div></header>
      <el-table :data="result.strips" table-layout="auto" class="result-table" :row-class-name="rowClassName" @row-click="selectStrip">
        <el-table-column prop="no" label="条带" width="74"><template #default="{ row }"><span class="strip-no">{{ row.no }}</span></template></el-table-column>
        <el-table-column label="执行卫星 / 载荷" min-width="170"><template #default="{ row }"><strong>{{ row.satellite }}</strong><small class="payload-name">{{ row.payload }}</small></template></el-table-column>
        <el-table-column label="幅宽" min-width="120"><template #default="{ row }">{{ row.widthKm.toFixed(2) }} km</template></el-table-column>
        <el-table-column prop="startedAt" label="开始时间" min-width="180" />
        <el-table-column prop="endedAt" label="结束时间" min-width="180" />
        <el-table-column label="侧摆角" min-width="150"><template #default="{ row }"><div class="roll-meter"><i :style="{ width: `${row.rollAngle / 45 * 100}%` }" /><span>{{ row.rollAngle.toFixed(2) }}°</span></div></template></el-table-column>
      </el-table>
    </section>
  </div>
</template>
