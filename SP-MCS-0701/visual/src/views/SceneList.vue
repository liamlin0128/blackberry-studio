<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download, Plus, Search } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import PageStatePanel from '../components/ops/PageStatePanel.vue'
import { initialModels } from '../mocks/models'
import { useSimulationStore } from '../stores/simulation'
import type { SimulationScene } from '../types/simulation'

type PageState = 'loading' | 'empty' | 'error' | 'forbidden'
type DialogMode = 'view' | 'edit'
interface SceneForm { name: string; shortName: string; type: string; scheduleMethod: string; startMode: '同启动时间' | '指定时间'; startTime: string; version: string; description: string }
interface Entity { type: string; name: string; parameter: string; tle: string }

const route = useRoute()
const store = useSimulationStore()
const sceneName = ref('')
const sceneType = ref('')
const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('view')
const selectedScene = ref<SimulationScene | null>(null)
const activeTab = ref('basic')
const modelPickerVisible = ref(false)
const entityDialogVisible = ref(false)
const selectedModelNames = ref(['MDSatellite1B', 'MDSatellite1A', 'MDGroundStation'])
const pickerModelNames = ref<string[]>([])
const pickerCategory = ref('')
const entityTarget = ref('MDSatellite1B')
const entityForm = reactive<Entity>({ type: '星池资源', name: '', parameter: '', tle: '' })
const form = reactive<SceneForm>({ name: '', shortName: '', type: '正式', scheduleMethod: '在线仿真', startMode: '同启动时间', startTime: '', version: '1.0', description: '' })
const entitySets = ref<Record<string, Entity[]>>({
  MDSatellite1B: [{ type: '星池资源', name: '木铎1B', parameter: '<Parameters id="MD1B" name="MD1B" nameEn="MD1B" zeroAngle="0.0" />', tle: '1 09999 …\n2 09999 …' }],
  MDSatellite1A: [{ type: '星池资源', name: '木铎1A', parameter: '<Parameters id="MD1A" name="MD1A" nameEn="MD1A" zeroAngle="0.0" />', tle: '1 08888 …\n2 08888 …' }],
  MDGroundStation: [{ type: '星池资源', name: 'SDBJ0451', parameter: '<Parameters id="SDBJ0451" name="BJ-0451" longitude="115.61535" latitude="40.25974" />', tle: '—' }],
})

const pageState = computed(() => ['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? String(route.query.state) as PageState : null)
const filteredScenes = computed(() => store.scenes.filter((item) => (!sceneName.value || item.name.includes(sceneName.value.trim())) && (!sceneType.value || item.type === sceneType.value)))
const modelCards = computed(() => initialModels.filter((item) => selectedModelNames.value.includes(item.name)).map((item) => ({ name: item.name, category: item.category, id: item.id, createTime: item.updateTime, version: item.version })))
const pickerModels = computed(() => initialModels.filter((item) => !pickerCategory.value || item.category === pickerCategory.value))
const xmlContent = computed(() => `<?xml version="1.0" encoding="UTF-8"?>\n<Scenario>\n  <Scheduler>1</Scheduler>\n  <Models>\n${modelCards.value.map((item) => `    <ModelFile>model/${item.name}.xml</ModelFile>`).join('\n')}\n  </Models>\n  <Entitys>\n${Object.entries(entitySets.value).filter(([name]) => selectedModelNames.value.includes(name)).flatMap(([modelName, entities]) => entities.map((entity) => `    <Entity Name="${entity.name}" Model="${modelName}">\n      ${entity.parameter}\n    </Entity>`)).join('\n')}\n  </Entitys>\n</Scenario>`)

function resetQuery() { sceneName.value = ''; sceneType.value = '' }
function openDialog(scene: SimulationScene, mode: DialogMode) {
  selectedScene.value = scene
  dialogMode.value = mode
  activeTab.value = 'basic'
  Object.assign(form, { name: scene.name, shortName: scene.shortName, type: scene.type, scheduleMethod: scene.scheduleMethod, startMode: scene.startTime === '同启动时间' ? '同启动时间' : '指定时间', startTime: scene.startTime === '同启动时间' ? '' : scene.startTime, version: scene.version, description: scene.description })
  dialogVisible.value = true
}
function saveScene() {
  if (!selectedScene.value || !form.name.trim() || !form.shortName.trim()) return
  store.updateScene(selectedScene.value.id, { name: form.name.trim(), shortName: form.shortName.trim(), type: form.type, scheduleMethod: form.scheduleMethod, startTime: form.startMode === '同启动时间' ? '同启动时间' : form.startTime, version: form.version, description: form.description, editor: '李林', editTime: '2026-10-14 09:00:00' })
  dialogVisible.value = false
}
function openEntityForm(modelName: string) { entityTarget.value = modelName; Object.assign(entityForm, { type: '星池资源', name: '', parameter: '', tle: '' }); entityDialogVisible.value = true }
function saveEntity() { if (!entityForm.name.trim()) return; const values = entitySets.value[entityTarget.value] ?? []; values.push({ ...entityForm, name: entityForm.name.trim() }); entitySets.value[entityTarget.value] = values; entityDialogVisible.value = false }
function openModelPicker() { pickerModelNames.value = [...selectedModelNames.value]; pickerCategory.value = ''; modelPickerVisible.value = true }
function confirmModelPicker() { selectedModelNames.value = [...pickerModelNames.value]; selectedModelNames.value.forEach((name) => { if (!entitySets.value[name]) entitySets.value[name] = [] }); modelPickerVisible.value = false }
function exportXml() { const blob = new Blob([xmlContent.value], { type: 'application/xml;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${form.shortName || 'scene'}.xml`; anchor.click(); URL.revokeObjectURL(url) }
</script>

<template>
  <section>
    <header class="page-heading"><div><div class="heading-title"><span class="heading-mark" /><h1>场景管理</h1></div><p>管理仿真场景、模型集与 XML 配置</p></div></header>
    <PageStatePanel v-if="pageState" :state="pageState" />
    <template v-else>
      <el-card class="scene-query-card" shadow="never"><el-form inline class="compact-query-form"><el-form-item label="场景名称："><el-input v-model="sceneName" placeholder="请输入" clearable /></el-form-item><el-form-item label="场景类型："><el-select v-model="sceneType" placeholder="请选择" clearable><el-option label="正式" value="正式" /></el-select></el-form-item><el-button type="primary" :icon="Search">查询</el-button><el-button @click="resetQuery">重置</el-button></el-form></el-card>
      <el-card class="model-table-card scene-table-card" shadow="never"><el-table :data="filteredScenes" class="model-table" table-layout="auto" empty-text="暂无场景数据"><el-table-column type="index" label="编号" width="70" /><el-table-column prop="name" label="场景名称" min-width="170" /><el-table-column prop="shortName" label="场景简称" min-width="120" /><el-table-column prop="type" label="类型" min-width="90" /><el-table-column prop="scheduleMethod" label="调度方式" min-width="110" /><el-table-column prop="editor" label="编辑人" min-width="90" /><el-table-column prop="editTime" label="编辑时间（UTC+8）" min-width="180" /><el-table-column prop="createTime" label="创建时间（UTC+8）" min-width="180" /><el-table-column label="操作" width="150" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openDialog(row, 'view')">查看</el-button><el-button link type="primary" @click="openDialog(row, 'edit')">编辑</el-button></template></el-table-column></el-table></el-card>
    </template>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'view' ? '场景详情' : '编辑'" width="1120px" class="simulation-dialog scene-detail-dialog" destroy-on-close>
      <el-tabs v-model="activeTab" class="scene-detail-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions v-if="dialogMode === 'view'" :column="2" border><el-descriptions-item label="场景名称">{{ form.name }}</el-descriptions-item><el-descriptions-item label="场景简称">{{ form.shortName }}</el-descriptions-item><el-descriptions-item label="场景类型">{{ form.type }}</el-descriptions-item><el-descriptions-item label="调度方式">{{ form.scheduleMethod }}</el-descriptions-item><el-descriptions-item label="起点时间">{{ form.startMode === '同启动时间' ? '同启动时间' : form.startTime }}</el-descriptions-item><el-descriptions-item label="模型库版本">{{ form.version }}</el-descriptions-item><el-descriptions-item label="场景说明">{{ form.description }}</el-descriptions-item></el-descriptions>
          <el-form v-else label-width="110px" class="scene-edit-form"><el-form-item label="场景名称" required><el-input v-model="form.name" /></el-form-item><el-form-item label="场景简称" required><el-input v-model="form.shortName" /></el-form-item><el-form-item label="类型"><el-select v-model="form.type" class="form-full-width"><el-option label="正式" value="正式" /></el-select></el-form-item><el-form-item label="调度方式"><el-select v-model="form.scheduleMethod" class="form-full-width"><el-option label="在线仿真" value="在线仿真" /></el-select></el-form-item><el-form-item label="起点时间"><el-radio-group v-model="form.startMode"><el-radio value="同启动时间">同启动时间</el-radio><el-radio value="指定时间">指定时间</el-radio></el-radio-group><el-date-picker v-if="form.startMode === '指定时间'" v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="scene-date-picker" /></el-form-item><el-form-item label="模型库版本"><el-input v-model="form.version" readonly /></el-form-item><el-form-item label="场景说明"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item></el-form>
        </el-tab-pane>
        <el-tab-pane label="模型集" name="models">
          <div v-if="dialogMode === 'edit'" class="dialog-tab-tools"><el-button type="primary" :icon="Plus" @click="openModelPicker">添加场景模型</el-button></div>
          <div class="scene-model-list">
            <article v-for="model in modelCards" :key="model.id" class="scene-model-row">
              <header class="scene-model-row-header"><div><strong>{{ model.name }}</strong><el-tag effect="plain" size="small">{{ model.category }}</el-tag></div><dl><div><dt>模型ID</dt><dd>{{ model.id }}</dd></div><div><dt>创建时间</dt><dd>{{ model.createTime }}</dd></div><div><dt>模型版本</dt><dd>{{ model.version }}</dd></div></dl><el-button v-if="dialogMode === 'edit'" link type="primary" :icon="Plus" @click="openEntityForm(model.name)">添加实体</el-button></header>
              <el-table :data="entitySets[model.name] ?? []" size="small" class="entity-table" empty-text="暂无实体"><el-table-column type="index" label="序号" width="58" /><el-table-column prop="type" label="type" min-width="120" /><el-table-column prop="name" label="Name" min-width="150" /><el-table-column prop="parameter" label="parameter" min-width="280" show-overflow-tooltip /><el-table-column prop="tle" label="tle" min-width="160" show-overflow-tooltip /></el-table>
            </article>
          </div>
        </el-tab-pane>
        <el-tab-pane label="XML文件" name="xml"><div class="xml-toolbar" v-if="dialogMode === 'edit'"><el-button @click="activeTab = 'models'">构建新的 XML</el-button><el-button type="primary" :icon="Download" @click="exportXml">导出 XML</el-button></div><pre class="xml-preview">{{ xmlContent }}</pre></el-tab-pane>
      </el-tabs>
      <template #footer><el-button @click="dialogVisible = false">{{ dialogMode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialogMode === 'edit'" type="primary" :disabled="!form.name || !form.shortName" @click="saveScene">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="modelPickerVisible" title="添加场景模型" width="min(1080px, calc(100vw - 64px))" class="simulation-dialog model-picker-dialog" destroy-on-close>
      <div class="model-picker-toolbar"><el-form-item label="类型"><el-select v-model="pickerCategory" clearable placeholder="全部"><el-option label="卫星" value="卫星" /><el-option label="相机" value="相机" /><el-option label="固存" value="固存" /><el-option label="地面站" value="地面站" /></el-select></el-form-item></div>
      <el-checkbox-group v-model="pickerModelNames" class="model-picker-card-grid"><el-checkbox v-for="item in pickerModels" :key="item.id" :value="item.name" class="model-picker-card"><strong>{{ item.name }}</strong><el-tag effect="plain" size="small" :class="`model-category-tag category-${item.category}`">{{ item.category }}</el-tag><dl><div><dt>模型ID</dt><dd>{{ item.id }}</dd></div><div><dt>创建时间</dt><dd>{{ item.updateTime }}</dd></div><div><dt>模型版本</dt><dd>{{ item.version }}</dd></div></dl></el-checkbox></el-checkbox-group>
      <template #footer><el-button @click="modelPickerVisible = false">取消</el-button><el-button type="primary" @click="confirmModelPicker">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="entityDialogVisible" title="添加实体" width="620px" class="simulation-dialog" destroy-on-close><el-form label-width="88px"><el-form-item label="模型"><el-input :model-value="entityTarget" readonly /></el-form-item><el-form-item label="type"><el-input v-model="entityForm.type" /></el-form-item><el-form-item label="Name" required><el-input v-model="entityForm.name" /></el-form-item><el-form-item label="parameter"><el-input v-model="entityForm.parameter" type="textarea" :rows="2" /></el-form-item><el-form-item label="tle"><el-input v-model="entityForm.tle" type="textarea" :rows="2" /></el-form-item></el-form><template #footer><el-button @click="entityDialogVisible = false">取消</el-button><el-button type="primary" :disabled="!entityForm.name" @click="saveEntity">保存</el-button></template></el-dialog>
  </section>
</template>
