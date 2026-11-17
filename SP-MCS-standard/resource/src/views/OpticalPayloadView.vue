<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import ResourcePageStatePanel from '../components/ops/ResourcePageStatePanel.vue'
import { blankChannel, initialPayloads, type OpticalPayloadRecord } from '../mocks/catalogs'
import { beijingNow, copyRecord, exportCsv } from '../utils/catalog'

const route = useRoute()
const pageState = computed(() => ['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? String(route.query.state) as 'loading' | 'empty' | 'error' | 'forbidden' : null)
const records = ref<OpticalPayloadRecord[]>(structuredClone(initialPayloads))
const query = ref({ name: '', code: '', dates: [] as string[] })
const applied = ref({ name: '', code: '', dates: [] as string[] })
const selected = ref<OpticalPayloadRecord[]>([])
const page = ref(1)
const pageSize = ref(30)
const filtered = computed(() => records.value.filter((row) => row.name.includes(applied.value.name.trim()) && row.code.includes(applied.value.code.trim()) && (applied.value.dates.length !== 2 || (row.updatedAt >= applied.value.dates[0] && row.updatedAt.slice(0, 10) <= applied.value.dates[1]))))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
function search() { applied.value = { ...query.value, dates: [...query.value.dates] }; page.value = 1 }
function reset() { query.value = { name: '', code: '', dates: [] }; search() }
function download() {
  exportCsv('光学载荷管理.csv', ['名称', '编码', '所在卫星', '成像通道', '幅宽(km)', '创建时间', '更新时间', '创建人'], filtered.value.map((row) => [row.name, row.code, row.satellite, row.channels.map((channel) => channel.code).join('、'), row.swath, row.createdAt, row.updatedAt, row.createdBy]))
  ElMessage.success(`已导出当前查询结果 ${filtered.value.length} 条`)
}
async function removeSelected() {
  if (!selected.value.length) { ElMessage.warning('请先选择载荷'); return }
  try { await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条载荷记录吗？`, '删除确认', { type: 'warning' }) } catch { return }
  const codes = new Set(selected.value.map((row) => row.code))
  records.value = records.value.filter((row) => !codes.has(row.code))
  selected.value = []
  ElMessage.success('已删除')
}

type Mode = 'add' | 'edit' | 'view'
const dialogOpen = ref(false)
const mode = ref<Mode>('add')
const tab = ref('basic')
const channelIndex = ref(0)
const originalCode = ref('')
const blank = (): OpticalPayloadRecord => ({ name: '', code: '', satellite: '', swath: '', altitude: '', createdAt: '', updatedAt: '', createdBy: '', lifetime: '', rollMin: '', rollMax: '', pitchMin: '', pitchMax: '', channels: [blankChannel()] })
const form = ref<OpticalPayloadRecord>(blank())
const currentChannel = computed(() => form.value.channels[channelIndex.value])
function openDialog(nextMode: Mode, row?: OpticalPayloadRecord) {
  mode.value = nextMode
  form.value = row ? copyRecord(row) : blank()
  originalCode.value = row?.code ?? ''
  tab.value = 'basic'
  channelIndex.value = 0
  dialogOpen.value = true
}
function addChannel() { form.value.channels.push(blankChannel()); channelIndex.value = form.value.channels.length - 1 }
function save() {
  if (!form.value.code.trim() || !form.value.name.trim()) { tab.value = 'basic'; ElMessage.warning('请填写载荷编码和载荷名称'); return }
  if (form.value.channels.some((channel) => !channel.code.trim() || !channel.name.trim())) { tab.value = 'channel'; ElMessage.warning('请填写通道编码和通道名称'); return }
  if (mode.value === 'add' && records.value.some((row) => row.code === form.value.code)) { ElMessage.warning('载荷编码已存在'); return }
  const next = copyRecord(form.value)
  next.updatedAt = beijingNow()
  if (mode.value === 'add') { next.createdAt = next.updatedAt; next.createdBy = '演示用户'; records.value.unshift(next) }
  else records.value = records.value.map((row) => row.code === originalCode.value ? next : row)
  dialogOpen.value = false
  ElMessage.success('已保存')
}
</script>

<template>
  <section class="resource-page catalog-page">
    <div class="page-heading"><span class="heading-mark" aria-hidden="true" /><h1>光学载荷管理</h1></div>
    <template v-if="!pageState || pageState === 'empty'">
      <div class="catalog-filters">
        <el-form :model="query" label-width="82px" class="catalog-filter-form" @submit.prevent="search">
          <el-form-item label="名称"><el-input v-model="query.name" clearable placeholder="请输入" /></el-form-item>
          <el-form-item label="编码"><el-input v-model="query.code" clearable placeholder="请输入" /></el-form-item>
          <el-form-item label="更新时间" class="date-field"><el-date-picker v-model="query.dates" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="至" /></el-form-item>
        </el-form>
        <div class="catalog-filter-actions"><el-button type="primary" :icon="Search" @click="search">查 询</el-button><el-button :icon="Refresh" @click="reset">重 置</el-button><el-button :icon="Download" @click="download">导 出</el-button></div>
      </div>
      <div class="catalog-list-actions"><el-button type="primary" @click="openDialog('add')">新增</el-button><el-button type="danger" plain @click="removeSelected">删除</el-button><span class="time-note">时间：北京时间</span></div>
      <el-card class="catalog-card" shadow="never">
        <el-table :data="pageState === 'empty' ? [] : visible" row-key="code" class="catalog-table" width="100%" @selection-change="selected = $event">
          <el-table-column type="selection" width="46" /><el-table-column type="index" label="序号" width="66" :index="(index: number) => (page - 1) * pageSize + index + 1" />
          <el-table-column prop="name" label="名称" min-width="105" /><el-table-column prop="code" label="编码" min-width="100" /><el-table-column prop="satellite" label="所在卫星" min-width="110" />
          <el-table-column label="成像通道" min-width="150"><template #default="{ row }">{{ row.channels.map((channel: { code: string }) => channel.code).join('、') }}</template></el-table-column>
          <el-table-column label="幅宽" min-width="100"><template #default="{ row }">{{ row.swath ? `${row.swath} km` : '—' }}</template></el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="175" /><el-table-column prop="updatedAt" label="更新时间" min-width="175" /><el-table-column prop="createdBy" label="创建人" min-width="90" />
          <el-table-column label="操作" min-width="120" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button link type="primary" @click="openDialog('view', row)">查看</el-button></template></el-table-column>
        </el-table>
        <div class="catalog-footer"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 30, 50, 100]" :total="pageState === 'empty' ? 0 : filtered.length" layout="total, sizes, prev, pager, next, jumper" /></div>
      </el-card>
    </template>
    <ResourcePageStatePanel v-else :state="pageState" />

    <el-dialog v-model="dialogOpen" :title="mode === 'add' ? '新增载荷' : mode === 'edit' ? '编辑载荷' : '查看'" width="min(900px, 96vw)" top="5vh" class="catalog-dialog">
      <p v-if="mode !== 'add'" class="dialog-subtitle">{{ form.name }} · {{ form.code }}</p>
      <el-tabs v-model="tab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" label-width="128px" class="catalog-detail-form" :disabled="mode === 'view'">
            <el-form-item label="载荷编码" required><el-input v-model="form.code" :disabled="mode !== 'add'" placeholder="请输入" /></el-form-item>
            <el-form-item label="载荷名称" required><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
            <el-form-item label="寿命"><el-input v-model="form.lifetime" placeholder="请输入"><template #append>年</template></el-input></el-form-item>
            <el-form-item label="所在卫星"><el-input v-model="form.satellite" placeholder="请输入" /></el-form-item>
            <el-form-item label="幅宽@高度"><div class="catalog-inline-range"><el-input v-model="form.swath" placeholder="幅宽"><template #append>km</template></el-input><span>@</span><el-input v-model="form.altitude" placeholder="高度"><template #append>km</template></el-input></div></el-form-item>
            <el-form-item label="侧摆范围"><div class="catalog-inline-range"><el-input v-model="form.rollMin"><template #append>°</template></el-input><span>至</span><el-input v-model="form.rollMax"><template #append>°</template></el-input></div></el-form-item>
            <el-form-item label="俯仰范围"><div class="catalog-inline-range"><el-input v-model="form.pitchMin"><template #append>°</template></el-input><span>至</span><el-input v-model="form.pitchMax"><template #append>°</template></el-input></div></el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="`通道参数 (${form.channels.length})`" name="channel">
          <div class="channel-navigation"><el-button v-for="(channel, index) in form.channels" :key="index" :type="index === channelIndex ? 'primary' : 'default'" @click="channelIndex = index">{{ channel.code || `通道 ${index + 1}` }}</el-button><el-button v-if="mode !== 'view'" @click="addChannel">＋新增通道</el-button></div>
          <template v-if="currentChannel">
            <div class="catalog-section"><h3>通道标识</h3><el-form label-width="130px" class="catalog-detail-form" :disabled="mode === 'view'"><el-form-item label="通道编码" required><el-input v-model="currentChannel.code" /></el-form-item><el-form-item label="通道名称" required><el-input v-model="currentChannel.name" /></el-form-item><el-form-item label="传感类型"><el-input v-model="currentChannel.sensorType" /></el-form-item><el-form-item label="像元分辨率"><el-input v-model="currentChannel.resolution" /></el-form-item></el-form></div>
            <div class="catalog-section"><h3>成像方式</h3><el-form label-width="130px" class="catalog-detail-form" :disabled="mode === 'view'"><el-form-item label="成像类型"><el-input v-model="currentChannel.imagingType" /></el-form-item><el-form-item label="成像模式"><el-input v-model="currentChannel.imagingMode" /></el-form-item><el-form-item label="帧率参数类型"><el-input v-model="currentChannel.frameRateType" /></el-form-item><el-form-item label="帧率参数"><el-input v-model="currentChannel.frameRate"><template #append>fps</template></el-input></el-form-item></el-form></div>
            <div class="catalog-section"><h3>数据生产参数</h3><el-form label-width="130px" class="catalog-detail-form" :disabled="mode === 'view'"><el-form-item label="谱段"><el-input v-model="currentChannel.bands" /></el-form-item><el-form-item label="量化位数"><el-input v-model="currentChannel.quantization"><template #append>bit</template></el-input></el-form-item><el-form-item label="最大速率"><el-input v-model="currentChannel.maxRateFrom"><template #append>Mbps</template></el-input></el-form-item><el-form-item label="速率量化位数"><el-input v-model="currentChannel.maxRateTo"><template #append>bit</template></el-input></el-form-item></el-form></div>
            <div class="catalog-section"><h3>阵列与图片参数</h3><el-form label-width="130px" class="catalog-detail-form" :disabled="mode === 'view'"><el-form-item label="横向阵列数"><el-input v-model="currentChannel.arrayX" /></el-form-item><el-form-item label="纵向阵列数"><el-input v-model="currentChannel.arrayY" /></el-form-item><el-form-item label="图片尺寸（横向）"><el-input v-model="currentChannel.imageX" /></el-form-item><el-form-item label="图片尺寸（纵向）"><el-input v-model="currentChannel.imageY" /></el-form-item><el-form-item label="图片大小"><el-input v-model="currentChannel.imageSize"><template #append>Mbs/张</template></el-input></el-form-item></el-form></div>
          </template>
        </el-tab-pane>
      </el-tabs>
      <template #footer><el-button @click="dialogOpen = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="mode !== 'view'" type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.dialog-subtitle { margin:0 0 10px; color:var(--sp-color-text-muted); }
.channel-navigation { display:flex; gap:8px; flex-wrap:wrap; margin:0 0 14px; }
.channel-navigation :deep(.el-button + .el-button) { margin-left:0; }
</style>
