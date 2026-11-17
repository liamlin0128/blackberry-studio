<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import ResourcePageStatePanel from '../components/ops/ResourcePageStatePanel.vue'
import { blankLink, initialAntennas, type AntennaPeriod, type AntennaRecord } from '../mocks/catalogs'
import { beijingNow, copyRecord, exportCsv } from '../utils/catalog'

const route = useRoute()
const pageState = computed(() => ['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? String(route.query.state) as 'loading' | 'empty' | 'error' | 'forbidden' : null)
const records = ref<AntennaRecord[]>(structuredClone(initialAntennas))
const query = ref({ name: '', id: '', dates: [] as string[] })
const applied = ref({ name: '', id: '', dates: [] as string[] })
const selected = ref<AntennaRecord[]>([])
const page = ref(1)
const pageSize = ref(30)
const filtered = computed(() => records.value.filter((row) => row.name.includes(applied.value.name.trim()) && row.id.includes(applied.value.id.trim()) && (applied.value.dates.length !== 2 || (row.updatedAt >= applied.value.dates[0] && row.updatedAt.slice(0, 10) <= applied.value.dates[1]))))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
function search() { applied.value = { ...query.value, dates: [...query.value.dates] }; page.value = 1 }
function reset() { query.value = { name: '', id: '', dates: [] }; search() }
function download() {
  exportCsv('天线管理.csv', ['天线ID', '名称', '英文名', '归属', '类型', '状态', '创建时间', '更新时间', '更新人'], filtered.value.map((row) => [row.id, row.name, row.englishName, row.ownership, row.type, row.status, row.createdAt, row.updatedAt, row.updatedBy]))
  ElMessage.success(`已导出当前查询结果 ${filtered.value.length} 条`)
}
async function removeSelected() {
  if (!selected.value.length) { ElMessage.warning('请先选择天线'); return }
  try { await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条天线记录吗？`, '删除确认', { type: 'warning' }) } catch { return }
  const ids = new Set(selected.value.map((row) => row.id))
  records.value = records.value.filter((row) => !ids.has(row.id))
  selected.value = []
  ElMessage.success('已删除')
}

type Mode = 'add' | 'edit' | 'view'
const dialogOpen = ref(false)
const mode = ref<Mode>('add')
const tab = ref('basic')
const originalId = ref('')
const blank = (): AntennaRecord => ({ id: '', name: '', englishName: '', ownership: '', type: '', status: '工作', createdAt: '', updatedAt: '', updatedBy: '', maxElevation: '', minElevation: '', downlinkMinElevation: '', aperture: '', longitude: '', latitude: '', altitude: '', model: '', links: [], periods: [] })
const form = ref<AntennaRecord>(blank())
function openDialog(nextMode: Mode, row?: AntennaRecord) {
  mode.value = nextMode
  form.value = row ? copyRecord(row) : blank()
  form.value.links ||= []
  form.value.periods ||= []
  originalId.value = row?.id ?? ''
  tab.value = 'basic'
  dialogOpen.value = true
}
function save() {
  if (!form.value.name.trim() || !form.value.id.trim()) { tab.value = 'basic'; ElMessage.warning('请填写名称和ID'); return }
  if (mode.value === 'add' && records.value.some((row) => row.id === form.value.id)) { ElMessage.warning('天线ID已存在'); return }
  const next = copyRecord(form.value)
  next.updatedAt = beijingNow()
  next.updatedBy = '演示用户'
  if (mode.value === 'add') { next.createdAt = next.updatedAt; records.value.unshift(next) }
  else records.value = records.value.map((row) => row.id === originalId.value ? next : row)
  dialogOpen.value = false
  ElMessage.success('已保存')
}

const periodOpen = ref(false)
const periodIndex = ref(-1)
const periodForm = ref<AntennaPeriod>({ id: 0, status: '维护', startAt: '', endAt: '' })
function editPeriod(index = -1) {
  periodIndex.value = index
  periodForm.value = index < 0 ? { id: Date.now(), status: '维护', startAt: '', endAt: '' } : copyRecord(form.value.periods![index])
  periodOpen.value = true
}
function savePeriod() {
  if (!periodForm.value.startAt || !periodForm.value.endAt) { ElMessage.warning('请填写开始时间和结束时间'); return }
  if (periodForm.value.startAt >= periodForm.value.endAt) { ElMessage.warning('结束时间需晚于开始时间'); return }
  if (periodIndex.value < 0) form.value.periods!.push(copyRecord(periodForm.value))
  else form.value.periods![periodIndex.value] = copyRecord(periodForm.value)
  periodOpen.value = false
}
async function removePeriod(index: number) {
  try { await ElMessageBox.confirm('确定删除这个工作时段吗？', '删除确认', { type: 'warning' }) } catch { return }
  form.value.periods!.splice(index, 1)
}
</script>

<template>
  <section class="resource-page catalog-page">
    <div class="page-heading"><span class="heading-mark" aria-hidden="true" /><h1>天线管理</h1></div>
    <template v-if="!pageState || pageState === 'empty'">
      <div class="catalog-filters"><el-form :model="query" label-width="82px" class="catalog-filter-form" @submit.prevent="search">
        <el-form-item label="名称"><el-input v-model="query.name" clearable placeholder="请输入" /></el-form-item><el-form-item label="ID"><el-input v-model="query.id" clearable placeholder="请输入" /></el-form-item>
        <el-form-item label="更新时间" class="date-field"><el-date-picker v-model="query.dates" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="至" /></el-form-item>
      </el-form><div class="catalog-filter-actions"><el-button type="primary" :icon="Search" @click="search">查 询</el-button><el-button :icon="Refresh" @click="reset">重 置</el-button><el-button :icon="Download" @click="download">导 出</el-button></div></div>
      <div class="catalog-list-actions"><el-button type="primary" @click="openDialog('add')">新增</el-button><el-button type="danger" plain @click="removeSelected">删除</el-button><span class="time-note">时间：北京时间</span></div>
      <el-card class="catalog-card" shadow="never"><el-table :data="pageState === 'empty' ? [] : visible" row-key="id" class="catalog-table" @selection-change="selected = $event">
        <el-table-column type="selection" width="46" /><el-table-column type="index" label="序号" width="66" :index="(index: number) => (page - 1) * pageSize + index + 1" />
        <el-table-column prop="id" label="天线ID" min-width="100" /><el-table-column prop="name" label="名称" min-width="170" /><el-table-column prop="englishName" label="英文名" min-width="110" />
        <el-table-column prop="ownership" label="归属" min-width="85" /><el-table-column prop="type" label="类型" min-width="120" /><el-table-column prop="status" label="状态" min-width="90" />
        <el-table-column prop="createdAt" label="创建时间" min-width="175" /><el-table-column prop="updatedAt" label="更新时间" min-width="175" /><el-table-column prop="updatedBy" label="更新人" min-width="100" />
        <el-table-column label="操作" min-width="120" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button link type="primary" @click="openDialog('view', row)">查看</el-button></template></el-table-column>
      </el-table><div class="catalog-footer"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 30, 50, 100]" :total="pageState === 'empty' ? 0 : filtered.length" layout="total, sizes, prev, pager, next, jumper" /></div></el-card>
    </template>
    <ResourcePageStatePanel v-else :state="pageState" />

    <el-dialog v-model="dialogOpen" :title="mode === 'add' ? '新增' : mode === 'edit' ? '编辑' : '查看'" width="min(920px, 96vw)" top="5vh" class="catalog-dialog">
      <el-tabs v-model="tab">
        <el-tab-pane label="基本信息" name="basic"><el-form :model="form" label-width="132px" class="catalog-detail-form" :disabled="mode === 'view'">
          <el-form-item label="名称" required><el-input v-model="form.name" placeholder="请输入" /></el-form-item><el-form-item label="英文名"><el-input v-model="form.englishName" placeholder="请输入" /></el-form-item>
          <el-form-item label="ID" required><el-input v-model="form.id" :disabled="mode !== 'add'" placeholder="请输入" /></el-form-item>
          <el-form-item label="归属"><el-select v-model="form.ownership" class="catalog-full" placeholder="请选择"><el-option label="自有" value="自有" /><el-option label="外部" value="外部" /></el-select></el-form-item>
          <el-form-item label="类型"><el-select v-model="form.type" class="catalog-full" placeholder="请选择"><el-option label="测控数传站" value="测控数传站" /><el-option label="测控站" value="测控站" /></el-select></el-form-item>
          <el-form-item label="状态"><el-select v-model="form.status" class="catalog-full"><el-option label="工作" value="工作" /></el-select></el-form-item>
          <el-form-item label="最高仰角"><el-input v-model="form.maxElevation"><template #append>°</template></el-input></el-form-item><el-form-item label="最低仰角"><el-input v-model="form.minElevation"><template #append>°</template></el-input></el-form-item>
          <el-form-item label="数传最低仰角"><el-input v-model="form.downlinkMinElevation"><template #append>°</template></el-input></el-form-item><el-form-item label="天线口径"><el-input v-model="form.aperture"><template #append>m</template></el-input></el-form-item>
          <el-form-item label="经度"><el-input v-model="form.longitude"><template #append>°</template></el-input></el-form-item><el-form-item label="纬度"><el-input v-model="form.latitude"><template #append>°</template></el-input></el-form-item><el-form-item label="海拔"><el-input v-model="form.altitude"><template #append>米</template></el-input></el-form-item>
        </el-form></el-tab-pane>
        <el-tab-pane label="链路速率" name="links"><div v-for="(link, index) in form.links" :key="index" class="catalog-section"><h3>链路 {{ index + 1 }}</h3><el-form label-width="120px" class="catalog-detail-form" :disabled="mode === 'view'">
          <el-form-item label="启用状态"><el-switch v-model="link.enabled" /></el-form-item><el-form-item label="类型"><el-select v-model="link.type" class="catalog-full"><el-option label="测控" value="测控" /><el-option label="数传" value="数传" /></el-select></el-form-item>
          <el-form-item label="频段"><el-input v-model="link.band" /></el-form-item><el-form-item label="传输速率"><el-input v-model="link.rate"><template #append>Mbps</template></el-input></el-form-item>
          <el-form-item label="方向"><el-radio-group v-model="link.direction"><el-radio value="上行">上行</el-radio><el-radio value="下行">下行</el-radio></el-radio-group></el-form-item>
          <el-form-item label="通道"><el-radio-group v-model="link.channel"><el-radio value="单通道">单通道</el-radio><el-radio value="双通道">双通道</el-radio></el-radio-group></el-form-item>
        </el-form></div><el-button v-if="mode !== 'view'" @click="form.links!.push(blankLink())">增加新通道</el-button></el-tab-pane>
        <el-tab-pane label="工作时间" name="periods"><div class="period-actions"><span>时间：北京时间</span><el-button v-if="mode !== 'view'" type="primary" @click="editPeriod()">新增</el-button></div><el-table :data="form.periods" border><el-table-column type="index" label="序号" width="70" /><el-table-column prop="status" label="状态" /><el-table-column prop="startAt" label="开始时间" /><el-table-column prop="endAt" label="结束时间" /><el-table-column v-if="mode !== 'view'" label="操作" width="120"><template #default="{ $index }"><el-button link type="primary" @click="editPeriod($index)">编辑</el-button><el-button link type="danger" @click="removePeriod($index)">删除</el-button></template></el-table-column></el-table></el-tab-pane>
        <el-tab-pane label="仿真模型" name="model"><el-form label-width="120px" :disabled="mode === 'view'"><el-form-item label="仿真模型"><el-select v-model="form.model" class="catalog-full" placeholder="请选择"><el-option label="MDGroundStation" value="MDGroundStation" /></el-select></el-form-item></el-form></el-tab-pane>
      </el-tabs><template #footer><el-button @click="dialogOpen = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="mode !== 'view'" type="primary" @click="save">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="periodOpen" :title="periodIndex < 0 ? '新增工作时间' : '编辑工作时间'" width="540px" append-to-body><el-form :model="periodForm" label-width="110px"><el-form-item label="状态"><el-select v-model="periodForm.status" class="catalog-full"><el-option label="维护" value="维护" /></el-select></el-form-item><el-form-item label="开始时间"><el-date-picker v-model="periodForm.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="catalog-full" /></el-form-item><el-form-item label="结束时间"><el-date-picker v-model="periodForm.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="catalog-full" /></el-form-item></el-form><template #footer><el-button @click="periodOpen = false">取消</el-button><el-button type="primary" @click="savePeriod">确定</el-button></template></el-dialog>
  </section>
</template>

<style scoped>
.period-actions { display:flex; align-items:center; justify-content:space-between; margin:0 0 12px; color:var(--sp-color-text-muted); font-size:var(--sp-font-size-caption); }
</style>
