<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import ResourcePageStatePanel from '../components/ops/ResourcePageStatePanel.vue'
import {
  initialOnboardStations, initialSatellites, initialWorkPeriods,
  type OnboardStation, type SatelliteRecord, type WorkPeriod,
} from '../mocks/resources'

const records = ref<SatelliteRecord[]>(structuredClone(initialSatellites))
const route = useRoute()
type PageState = 'loading' | 'empty' | 'error' | 'forbidden'
const pageState = computed(() => ['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? String(route.query.state) as PageState : null)
const workPeriods = ref<Record<string, WorkPeriod[]>>(structuredClone(initialWorkPeriods))
const onboardStations = ref<Record<string, OnboardStation[]>>(structuredClone(initialOnboardStations))
const query = ref({ id: '', name: '', dates: [] as string[] })
const applied = ref({ id: '', name: '', dates: [] as string[] })
const selected = ref<SatelliteRecord[]>([])
const page = ref(1)
const pageSize = ref(30)
const filtered = computed(() => records.value.filter((row) => {
  const byId = row.id.toLowerCase().includes(applied.value.id.trim().toLowerCase())
  const byName = row.chineseName.includes(applied.value.name.trim())
  const byDate = applied.value.dates.length !== 2 || (row.updatedAt >= applied.value.dates[0] && row.updatedAt <= applied.value.dates[1])
  return byId && byName && byDate
}))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

function search() { applied.value = { ...query.value, dates: [...query.value.dates] }; page.value = 1 }
function reset() { query.value = { id: '', name: '', dates: [] }; search() }
function beijingNow() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date())
  const get = (key: string) => parts.find((part) => part.type === key)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}
function exportRows() {
  const columns = ['卫星ID', '卫星中文名称', '卫星英文名称', '卫星国际编码', '类型', '组网', '预计寿命(年)', '光学载荷', '状态', '创建时间(北京时间)', '更新时间(北京时间)', '更新人']
  const csv = [columns, ...filtered.value.map((row) => [row.id, row.chineseName, row.englishName, row.internationalCode, row.type, row.network, row.lifetime, String(row.payloadCount), row.status, row.createdAt, row.updatedAt, row.updatedBy])].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = '卫星管理.csv'; link.click(); URL.revokeObjectURL(url)
  ElMessage.success(`已导出当前查询结果 ${filtered.value.length} 条`)
}
async function removeSelected() {
  if (!selected.value.length) { ElMessage.warning('请先选择卫星'); return }
  try { await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条卫星记录吗？`, '删除确认', { type: 'warning' }) } catch { return }
  const ids = new Set(selected.value.map((row) => row.id))
  records.value = records.value.filter((row) => !ids.has(row.id))
  selected.value = []
  ElMessage.success(`已删除 ${ids.size} 条卫星记录`)
}

const editorOpen = ref(false)
const editorMode = ref<'add' | 'edit' | 'view'>('add')
const activeTab = ref('basic')
const currentId = ref('')
const blank = (): SatelliteRecord => ({ id: '', chineseName: '', englishName: '', internationalCode: '', type: '', network: '', lifetime: '', payloadCount: 0, status: '工作', createdAt: '', updatedAt: '', updatedBy: '' })
const form = ref<SatelliteRecord>(blank())
const payloads = ref([{ name: '', number: '', compression: '', matrix: '' }])
const links = ref([{ enabled: true, type: '测控', band: 'X', rate: '', direction: '上行', channel: '单通道' }])
const payloadBySatellite = ref<Record<string, typeof payloads.value>>({})
const originalPayloads = ref<typeof payloads.value>([])
const linksBySatellite = ref<Record<string, typeof links.value>>({})
const requiredBasicFields: Array<[keyof SatelliteRecord, string]> = [
  ['chineseName', '卫星中文名称'], ['englishName', '卫星英文名称'], ['id', '卫星ID'],
  ['internationalCode', '卫星国际编码'], ['type', '卫星类型'], ['network', '组网'],
  ['lifetime', '预计寿命'], ['orbitHeight', '轨道高度'], ['rollSpeed', '侧摆轴转速'],
  ['yawSpeed', '偏航轴转速'], ['batchNo', '批次号'], ['satelliteNo', '卫星编号'],
]
function openEditor(mode: 'add' | 'edit' | 'view', row?: SatelliteRecord) {
  editorMode.value = mode; currentId.value = row?.id || ''; form.value = row ? { ...row } : blank()
  payloads.value = row && payloadBySatellite.value[row.id] ? payloadBySatellite.value[row.id].map((item) => ({ ...item })) : row?.id === 'MD1A' ? [{ name: 'PMS', number: '', compression: '', matrix: '' }] : [{ name: '', number: '', compression: '', matrix: '' }]
  originalPayloads.value = payloads.value.map((item) => ({ ...item }))
  links.value = row && linksBySatellite.value[row.id] ? linksBySatellite.value[row.id].map((item) => ({ ...item })) : [{ enabled: true, type: '测控', band: 'X', rate: '', direction: '上行', channel: '单通道' }]
  activeTab.value = 'basic'; editorOpen.value = true
}
function saveEditor() {
  const missing = requiredBasicFields.find(([key]) => !String(form.value[key] ?? '').trim())
  if (missing) { activeTab.value = 'basic'; ElMessage.warning(`请填写${missing[1]}`); return }
  if (editorMode.value === 'add' && records.value.some((row) => row.id === form.value.id)) { ElMessage.warning('卫星ID已存在'); return }
  const incompletePayload = payloads.value.find((item, index) => {
    const original = originalPayloads.value[index]
    const changed = !original || Object.keys(item).some((key) => item[key as keyof typeof item] !== original[key as keyof typeof original])
    const entered = Object.values(item).some((value) => String(value).trim())
    return changed && entered && (!item.name.trim() || !item.number.trim())
  })
  if (incompletePayload) { activeTab.value = 'payload'; ElMessage.warning('请填写光学载荷名称和编号'); return }
  const next = { ...form.value }
  const configuredPayloads = payloads.value.filter((item) => item.name).length
  next.payloadCount = configuredPayloads || (editorMode.value === 'add' ? 0 : form.value.payloadCount)
  next.updatedAt = beijingNow(); next.updatedBy = '演示用户'
  payloadBySatellite.value[next.id] = payloads.value.filter((item) => Object.values(item).some((value) => String(value).trim())).map((item) => ({ ...item }))
  linksBySatellite.value[next.id] = links.value.map((item) => ({ ...item }))
  if (editorMode.value === 'add') { next.createdAt = next.updatedAt; records.value.unshift(next) }
  else { records.value = records.value.map((row) => row.id === currentId.value ? next : row) }
  editorOpen.value = false
  ElMessage.success(editorMode.value === 'add' ? '已新增卫星' : '已保存卫星信息')
}

const periodsOpen = ref(false)
const periodEditorOpen = ref(false)
const periodForm = ref({ status: '维护', startAt: '', endAt: '', remark: '' })
function openPeriods(row: SatelliteRecord) { currentId.value = row.id; periodsOpen.value = true }
function savePeriod() {
  if (!periodForm.value.startAt || !periodForm.value.endAt) { ElMessage.warning('请填写开始时间和结束时间'); return }
  if (periodForm.value.startAt >= periodForm.value.endAt) { ElMessage.warning('结束时间需晚于开始时间'); return }
  const rows = workPeriods.value[currentId.value] || []
  workPeriods.value[currentId.value] = [...rows, { ...periodForm.value, id: Date.now() }]
  periodEditorOpen.value = false
  ElMessage.success('已新增工作时段')
}
async function removePeriod(row: WorkPeriod) {
  try { await ElMessageBox.confirm('确定删除这条工作时段吗？', '删除确认', { type: 'warning' }) } catch { return }
  workPeriods.value[currentId.value] = (workPeriods.value[currentId.value] || []).filter((item) => item.id !== row.id)
  ElMessage.success('已删除工作时段')
}
const stationsOpen = ref(false)
const stationRows = ref<OnboardStation[]>([])
const editingStationId = ref<number | null>(null)
const confirmedStationIds = ref<Set<number>>(new Set())
function openStations(row: SatelliteRecord) { currentId.value = row.id; stationRows.value = (onboardStations.value[row.id] || []).map((item) => ({ ...item })); confirmedStationIds.value = new Set(stationRows.value.map((item) => item.id)); editingStationId.value = null; stationsOpen.value = true }
function addStation() {
  if (editingStationId.value !== null) { ElMessage.warning('请先确定正在编辑的站点'); return }
  const id = Date.now(); stationRows.value.push({ id, slot: '', stationId: '', stationName: '', remark: '' }); editingStationId.value = id
}
function toggleStationEdit(row: OnboardStation) {
  if (editingStationId.value !== null && editingStationId.value !== row.id) { ElMessage.warning('请先确定正在编辑的站点'); return }
  if (editingStationId.value !== row.id) { editingStationId.value = row.id; confirmedStationIds.value.delete(row.id); return }
  if (!row.slot.trim() || !row.stationId.trim() || !row.stationName.trim()) { ElMessage.warning('请填写星上存储号码、地面站设备ID和地面站名称'); return }
  confirmedStationIds.value.add(row.id)
  editingStationId.value = null
}
function saveStations() {
  const incomplete = stationRows.value.find((item) => !item.slot.trim() || !item.stationId.trim() || !item.stationName.trim())
  if (incomplete) { editingStationId.value = incomplete.id; ElMessage.warning('请先补全站点信息'); return }
  if (editingStationId.value !== null || stationRows.value.some((item) => !confirmedStationIds.value.has(item.id))) { ElMessage.warning('请先确定正在编辑的站点'); return }
  onboardStations.value[currentId.value] = stationRows.value.map((item) => ({ ...item })); stationsOpen.value = false; editingStationId.value = null
  ElMessage.success('已保存星上站点')
}
async function removeStation(row: OnboardStation) {
  try { await ElMessageBox.confirm(`确定删除地面站设备 ${row.stationId || row.id} 吗？`, '删除确认', { type: 'warning' }) } catch { return }
  stationRows.value = stationRows.value.filter((item) => item.id !== row.id)
  confirmedStationIds.value.delete(row.id)
}
</script>

<template>
  <section class="satellite-page">
    <div class="page-heading"><span class="heading-mark" aria-hidden="true" /><h1>卫星管理</h1></div>
    <ResourcePageStatePanel v-if="pageState" :state="pageState" />
    <template v-else>
    <div class="filter-panel">
      <el-form :model="query" label-width="82px" class="filter-form" @submit.prevent="search">
        <el-form-item label="卫星ID"><el-input v-model="query.id" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="卫星中文名"><el-input v-model="query.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="更新时间" class="date-field"><el-date-picker v-model="query.dates" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="至" /></el-form-item>
      </el-form>
      <div class="filter-actions"><el-button type="primary" :icon="Search" @click="search">查 询</el-button><el-button :icon="Refresh" @click="reset">重 置</el-button><el-button :icon="Download" @click="exportRows">导 出</el-button></div>
    </div>
    <div class="list-actions"><el-button type="primary" @click="openEditor('add')">新增</el-button><el-button type="danger" plain @click="removeSelected">删除</el-button><span>时间：北京时间</span></div>
    <el-card class="resource-table-card" shadow="never">
      <el-table :data="visible" class="resource-table" row-key="id" @selection-change="selected = $event">
        <el-table-column type="selection" width="48" fixed="left" />
        <el-table-column type="index" label="序号" width="70" :index="(index: number) => (page - 1) * pageSize + index + 1" />
        <el-table-column prop="id" label="卫星ID" min-width="110" />
        <el-table-column prop="chineseName" label="卫星中文名称" min-width="130" />
        <el-table-column prop="englishName" label="卫星英文名称" min-width="130" />
        <el-table-column prop="internationalCode" label="卫星国际编码" min-width="130" />
        <el-table-column prop="type" label="类型" min-width="110" />
        <el-table-column prop="network" label="组网" min-width="90" />
        <el-table-column prop="lifetime" label="预计寿命(年)" min-width="110" />
        <el-table-column prop="payloadCount" label="光学载荷" min-width="90" />
        <el-table-column prop="status" label="状态" min-width="80"><template #default="{ row }"><el-tag size="small" type="success" effect="light">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="200" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="200" />
        <el-table-column prop="updatedBy" label="更新人" min-width="110" />
        <el-table-column label="操作" min-width="310" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openStations(row)">星上站点管理</el-button><el-button link type="primary" @click="openPeriods(row)">工作时段</el-button><el-button link type="primary" @click="openEditor('edit', row)">编辑</el-button><el-button link type="primary" @click="openEditor('view', row)">查看</el-button></template></el-table-column>
      </el-table>
      <div class="table-footer"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 30, 50, 100, 200]" :total="filtered.length" layout="total, sizes, prev, pager, next, jumper" /></div>
    </el-card>

    <el-dialog v-model="editorOpen" :title="editorMode === 'add' ? '新增' : editorMode === 'edit' ? '编辑' : '查看'" width="900px" top="5vh" class="resource-dialog">
      <el-tabs v-model="activeTab" class="editor-tabs">
        <el-tab-pane label="基本信息" name="basic"><el-form :model="form" label-width="140px" class="detail-form" :disabled="editorMode === 'view'">
          <el-form-item label="卫星中文名称" required><el-input v-model="form.chineseName" /></el-form-item><el-form-item label="卫星英文名称" required><el-input v-model="form.englishName" /></el-form-item>
          <el-form-item label="卫星ID" required><el-input v-model="form.id" :disabled="editorMode === 'edit'" /></el-form-item><el-form-item label="卫星国际编码" required><el-input v-model="form.internationalCode" /></el-form-item>
          <el-form-item label="卫星发射时间（北京时间）"><el-date-picker v-model="form.launchAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="full-width" /></el-form-item>
          <el-form-item label="卫星类型" required><el-select v-model="form.type" class="full-width"><el-option label="遥感卫星" value="遥感卫星" /></el-select></el-form-item>
          <el-form-item label="卫星质量"><el-input v-model="form.mass"><template #append>kg</template></el-input></el-form-item><el-form-item label="组网" required><el-input v-model="form.network" /></el-form-item>
          <el-form-item label="预计寿命" required><el-input v-model="form.lifetime"><template #append>年</template></el-input></el-form-item><el-form-item label="轨道高度" required><el-input v-model="form.orbitHeight"><template #append>km</template></el-input></el-form-item>
          <el-form-item label="轨道交点地方时"><el-input v-model="form.localTime" /></el-form-item><el-form-item label="轨道相位角"><el-input v-model="form.phaseAngle"><template #append>°</template></el-input></el-form-item>
          <el-form-item label="简称"><el-input v-model="form.shortName" /></el-form-item><el-form-item label="侧摆轴转速" required><el-input v-model="form.rollSpeed"><template #append>°/s</template></el-input></el-form-item>
          <el-form-item label="偏航轴转速" required><el-input v-model="form.yawSpeed"><template #append>°/s</template></el-input></el-form-item><el-form-item label="归零位角度"><el-input v-model="form.homeAngle"><template #append>°</template></el-input></el-form-item>
          <el-form-item label="批次号" required><el-input v-model="form.batchNo" /></el-form-item><el-form-item label="批次名"><el-input v-model="form.batchName" /></el-form-item>
          <el-form-item label="卫星编号" required><el-input v-model="form.satelliteNo" /></el-form-item><el-form-item label="解析标识"><el-input v-model="form.parseFlag" /></el-form-item>
          <el-form-item label="状态"><el-select v-model="form.status" class="full-width"><el-option label="工作" value="工作" /></el-select></el-form-item>
        </el-form></el-tab-pane>
        <el-tab-pane label="光学载荷" name="payload"><p class="payload-guidance">每增加一个载荷，需手动填写该载荷在本卫星上的编号，编号不大于16个字符。</p><div v-for="(payload, index) in payloads" :key="index" class="subsection"><h3>光学载荷 {{ index + 1 }}</h3><el-form label-width="110px" :disabled="editorMode === 'view'"><el-form-item label="载荷名称"><el-select v-model="payload.name" class="full-width"><el-option label="PMS" value="PMS" /><el-option label="HSI" value="HSI" /></el-select></el-form-item><el-form-item label="编号"><el-input v-model="payload.number" maxlength="16" show-word-limit /></el-form-item><el-form-item label="压缩比"><el-input v-model="payload.compression" /></el-form-item><el-form-item label="偏置矩阵"><el-input v-model="payload.matrix" /></el-form-item></el-form></div><el-button v-if="editorMode !== 'view'" @click="payloads.push({ name: '', number: '', compression: '', matrix: '' })">增加新相机</el-button></el-tab-pane>
        <el-tab-pane label="传输速率" name="links"><div v-for="(link, index) in links" :key="index" class="subsection"><h3>链路 {{ index + 1 }}</h3><el-form label-width="110px" :disabled="editorMode === 'view'"><el-form-item label="启用状态"><el-switch v-model="link.enabled" /></el-form-item><el-form-item label="类型"><el-select v-model="link.type" class="full-width"><el-option label="测控" value="测控" /><el-option label="数传" value="数传" /></el-select></el-form-item><el-form-item label="频段"><el-input v-model="link.band" /></el-form-item><el-form-item label="传输速率 1"><el-input v-model="link.rate"><template #append>Mbps</template></el-input></el-form-item><el-form-item label="方向"><el-radio-group v-model="link.direction"><el-radio value="上行">上行</el-radio><el-radio value="下行">下行</el-radio></el-radio-group></el-form-item><el-form-item label="通道"><el-radio-group v-model="link.channel"><el-radio value="单通道">单通道</el-radio><el-radio value="双通道">双通道</el-radio></el-radio-group></el-form-item></el-form></div><el-button v-if="editorMode !== 'view'" @click="links.push({ enabled: true, type: '测控', band: 'X', rate: '', direction: '上行', channel: '单通道' })">增加新链路</el-button></el-tab-pane>
        <el-tab-pane label="工作时段" name="periods"><p class="time-context">时间：北京时间</p><el-table :data="workPeriods[currentId] || []"><el-table-column type="index" label="序号" width="80" /><el-table-column prop="status" label="状态" /><el-table-column prop="startAt" label="开始时间" /><el-table-column prop="endAt" label="结束时间" /></el-table></el-tab-pane>
        <el-tab-pane label="仿真模型" name="model"><el-form label-width="110px" :disabled="editorMode === 'view'"><el-form-item label="关联模型"><el-input v-model="form.model" /></el-form-item></el-form></el-tab-pane>
      </el-tabs>
      <template #footer><el-button @click="editorOpen = false">{{ editorMode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="editorMode !== 'view'" type="primary" @click="saveEditor">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="periodsOpen" title="工作时段" width="760px"><div class="dialog-toolbar period-toolbar"><span class="time-context">时间：北京时间</span><el-button type="primary" @click="periodForm = { status: '维护', startAt: '', endAt: '', remark: '' }; periodEditorOpen = true">新增</el-button></div><el-table :data="workPeriods[currentId] || []"><el-table-column type="index" label="序号" width="70" /><el-table-column prop="status" label="状态" /><el-table-column prop="startAt" label="开始时间" /><el-table-column prop="endAt" label="结束时间" /><el-table-column label="操作" width="90"><template #default="{ row }"><el-button link type="danger" @click="removePeriod(row)">删除</el-button></template></el-table-column></el-table></el-dialog>
    <el-dialog v-model="periodEditorOpen" title="新增时段" width="520px" append-to-body><p class="time-context">时间：北京时间</p><el-form :model="periodForm" label-width="100px"><el-form-item label="状态"><el-select v-model="periodForm.status" class="full-width"><el-option label="维护" value="维护" /></el-select></el-form-item><el-form-item label="开始时间"><el-date-picker v-model="periodForm.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="full-width" /></el-form-item><el-form-item label="结束时间"><el-date-picker v-model="periodForm.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="full-width" /></el-form-item><el-form-item label="备注"><el-input v-model="periodForm.remark" type="textarea" /></el-form-item></el-form><template #footer><el-button @click="periodEditorOpen = false">取消</el-button><el-button type="primary" @click="savePeriod">确定</el-button></template></el-dialog>

    <el-dialog v-model="stationsOpen" title="星上站点管理" width="960px"><p class="dialog-context">卫星：{{ currentId }}　总槽位数：100</p><el-table :data="stationRows" max-height="480"><el-table-column type="index" label="序号" width="70" /><el-table-column label="星上存储号码" width="130"><template #default="{ row }"><el-input v-if="editingStationId === row.id" v-model="row.slot" /><span v-else>{{ row.slot }}</span></template></el-table-column><el-table-column label="地面站设备ID" width="170"><template #default="{ row }"><el-input v-if="editingStationId === row.id" v-model="row.stationId" /><span v-else>{{ row.stationId }}</span></template></el-table-column><el-table-column label="地面站名称"><template #default="{ row }"><el-input v-if="editingStationId === row.id" v-model="row.stationName" /><span v-else>{{ row.stationName }}</span></template></el-table-column><el-table-column label="备注"><template #default="{ row }"><el-input v-if="editingStationId === row.id" v-model="row.remark" /><span v-else>{{ row.remark }}</span></template></el-table-column><el-table-column label="操作" width="150"><template #default="{ row }"><el-button link type="primary" @click="toggleStationEdit(row)">{{ editingStationId === row.id ? '确定' : '编辑' }}</el-button><el-button link type="danger" @click="removeStation(row)">删除</el-button></template></el-table-column></el-table><div class="dialog-toolbar bottom"><el-button @click="addStation">添加</el-button></div><template #footer><el-button @click="stationsOpen = false">取消</el-button><el-button type="primary" @click="saveStations">保存全部</el-button></template></el-dialog>
    </template>
  </section>
</template>

<style scoped>
.satellite-page > .page-heading { justify-content: flex-start; align-items: center; gap: 10px; min-height: 36px; }
.satellite-page > .page-heading h1 { margin: 0; color: var(--sp-color-text-primary); font-size: var(--sp-font-size-page-title); font-weight: var(--sp-font-weight-semibold); }
.filter-panel { display: flex; align-items: flex-start; gap: var(--sp-space-3); padding-bottom: 14px; border-bottom: 1px solid var(--sp-color-divider); }
.filter-form { display: grid; flex: 1; grid-template-columns: repeat(5, minmax(155px, 1fr)); gap: 12px; }
.filter-form :deep(.el-form-item) { min-width: 0; margin: 0; }
.filter-form :deep(.el-form-item__label) { padding-right: 6px; }
.filter-form :deep(.el-form-item__content), .filter-form :deep(.el-input), .filter-form :deep(.el-date-editor) { min-width: 0; width: 100%; }
.filter-form .date-field { grid-column: span 2; }
.filter-actions { display: flex; flex: none; gap: 4px; }
.filter-actions :deep(.el-button + .el-button) { margin-left: 0; }
.list-actions { display: flex; align-items: center; gap: 4px; padding: 20px 0 12px; }
.list-actions :deep(.el-button + .el-button) { margin-left: 0; }
.list-actions > span { margin-left: auto; color: var(--sp-color-text-muted); font-size: var(--sp-font-size-caption); }
.resource-table-card { border: 1px solid var(--sp-color-border); border-radius: var(--sp-radius-dialog); }
.resource-table-card :deep(.el-card__body) { padding: 0; }
.resource-table :deep(th.el-table__cell) { height: 42px; background: var(--sp-color-surface-subtle); color: var(--sp-color-text-primary); font-weight: var(--sp-font-weight-semibold); }
.resource-table :deep(td.el-table__cell) { height: 42px; color: var(--sp-color-text-secondary); }
.resource-table :deep(.el-button.is-link) { margin: 0 3px; padding: 0; }
.table-footer { display: flex; justify-content: flex-end; padding: 12px 16px; }
.detail-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; padding-right: 12px; }
.full-width { width: 100%; }
.detail-form :deep(.el-date-editor.el-input), .detail-form :deep(.el-date-editor.el-input__wrapper) { width: 100%; }
.editor-tabs :deep(.el-tabs__content) { padding: 0 16px 12px; }
.subsection { margin-bottom: 14px; padding: 12px 16px; border: 1px solid #e3eaf3; }
.payload-guidance { margin: 0 0 12px; color: #536b81; font-size: 13px; }
.subsection h3 { margin: 0 0 14px; color: #29445e; font-size: 14px; }
.dialog-toolbar { display: flex; align-items: center; justify-content: flex-end; margin-bottom: 12px; }
.period-toolbar { justify-content: space-between; }
.time-context { margin: 0 0 12px; color: var(--sp-color-text-muted); font-size: var(--sp-font-size-caption); }
.dialog-toolbar .time-context { margin: 0; }
.dialog-toolbar.bottom { margin: 12px 0 0; }
.dialog-context { display: flex; gap: var(--sp-space-6); align-items: center; margin: 0 0 var(--sp-space-3); padding: 10px var(--sp-space-3); color: var(--sp-color-text-primary); background: var(--sp-color-surface-subtle); border: 1px solid var(--sp-color-border); font-size: 13px; font-weight: var(--sp-font-weight-semibold); }
:deep(.resource-dialog .el-dialog__body) { max-height: 70vh; overflow: auto; }
@media (max-width: 1280px) { .filter-panel { display: grid; grid-template-columns: 1fr; } .filter-form { grid-template-columns: repeat(3, minmax(155px, 1fr)); } .filter-actions { justify-content: flex-end; } }
@media (max-width: 1100px) { .filter-form { grid-template-columns: repeat(2, minmax(155px, 1fr)); } }
@media (max-width: 1100px) { .detail-form { grid-template-columns: 1fr; } }
</style>
