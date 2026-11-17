<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, FolderAdd, Plus, Search, Upload } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import PageStatePanel from '../components/ops/PageStatePanel.vue'
import { initialModels, initialSimulationVersions } from '../mocks/models'
import type { ModelCategory, SimulationModel, SimulationVersion } from '../types/model'

type PageState = 'loading' | 'empty' | 'error' | 'forbidden'
type ModelForm = Pick<SimulationModel, 'name' | 'shortName' | 'category' | 'version' | 'description'>
type ModelCategoryFilter = '全部模型' | '卫星模型' | '相机模型' | '固存模型' | '地面站模型'

const modelTypeOptions: ModelCategory[] = ['卫星', '相机', '固存', '地面站']
const versionGroups: Array<{ label: string; categories: ModelCategory[]; level?: number }> = [
  { label: '卫星模型', categories: ['卫星'] },
  { label: '相机模型', categories: ['相机'], level: 2 },
  { label: '固存模型', categories: ['固存'], level: 2 },
  { label: '地面站模型', categories: ['地面站'] },
]

const route = useRoute()
const models = ref<SimulationModel[]>(initialModels.map((item) => ({ ...item })))
const versions = ref<SimulationVersion[]>(initialSimulationVersions.map((item) => ({ ...item, modelIds: [...item.modelIds] })))
const currentVersionId = ref('version-1.0')
const keyword = ref('')
const enabledFilter = ref<'all' | 'enabled' | 'disabled'>('all')
const category = ref<ModelCategoryFilter>('全部模型')
const versionDialogVisible = ref(false)
const versionFormVisible = ref(false)
const modelDialogVisible = ref(false)
const editedModelId = ref<string | null>(null)
const selectedModelFileName = ref('')
const modelCombinationIds = ref<string[]>([])
const versionForm = reactive({ name: 'V 1.1', engine: '', modelIds: [] as string[] })
const modelForm = reactive<ModelForm>({ name: '', shortName: '', category: '卫星', version: '1.0', description: '' })

const pageState = computed(() => ['loading', 'empty', 'error', 'forbidden'].includes(String(route.query.state)) ? String(route.query.state) as PageState : null)
const currentVersion = computed(() => versions.value.find((item) => item.id === currentVersionId.value) ?? versions.value[0])
const visibleModels = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  return models.value.filter((item) => {
    const matchedVersion = currentVersion.value?.modelIds.includes(item.id)
    const matchedCategory = category.value === '全部模型'
      || (category.value === '卫星模型' && ['卫星', '相机', '固存'].includes(item.category))
      || (category.value === '相机模型' && item.category === '相机')
      || (category.value === '固存模型' && item.category === '固存')
      || (category.value === '地面站模型' && item.category === '地面站')
    const matchedName = !value || `${item.name} ${item.shortName} ${item.id}`.toLowerCase().includes(value)
    const matchedEnabled = enabledFilter.value === 'all' || (enabledFilter.value === 'enabled' ? item.enabled : !item.enabled)
    return Boolean(matchedVersion) && matchedCategory && matchedName && matchedEnabled
  })
})
function resetFilters() { keyword.value = ''; enabledFilter.value = 'all'; category.value = '全部模型' }
function openModelForm(model?: SimulationModel) {
  editedModelId.value = model?.id ?? null
  selectedModelFileName.value = ''
  modelCombinationIds.value = []
  Object.assign(modelForm, model ? { name: model.name, shortName: model.shortName, category: model.category, version: model.version, description: model.description } : { name: '', shortName: '', category: '卫星', version: '1.0', description: '' })
  modelDialogVisible.value = true
}
async function requestToggleModel(model: SimulationModel, nextEnabled: boolean) {
  if (model.enabled === nextEnabled) return
  const action = nextEnabled ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(
      `确定${action}模型“${model.name}”吗？${nextEnabled ? '启用后可在当前仿真版本中使用。' : '停用后将不能在当前仿真版本中使用。'}`,
      `确认${action}模型`,
      { confirmButtonText: `确定${action}`, cancelButtonText: '取消', type: 'warning', closeOnClickModal: false },
    )
    model.enabled = nextEnabled
    ElMessage.success(`模型已${action}`)
  } catch { /* 取消后保留原状态 */ }
}
function rememberModelFile(file: { name: string }) { selectedModelFileName.value = file.name }
function saveModel() {
  if (!modelForm.name.trim() || !modelForm.shortName.trim()) return
  if (editedModelId.value) {
    const target = models.value.find((item) => item.id === editedModelId.value)
    if (target) Object.assign(target, modelForm)
  } else {
    const id = `S${String(models.value.length + 10).padStart(6, '0')}`
    const record: SimulationModel = { id, ...modelForm, name: modelForm.name.trim(), shortName: modelForm.shortName.trim(), updateTime: '2026-10-13 09:00:00', enabled: true }
    models.value.unshift(record)
    currentVersion.value?.modelIds.unshift(id)
  }
  modelDialogVisible.value = false
}
function openVersionForm() {
  const next = (versions.value.length + 1) / 10 + 1
  Object.assign(versionForm, { name: `V ${next.toFixed(1)}`, engine: '', modelIds: models.value.filter((item) => item.enabled).map((item) => item.id) })
  versionFormVisible.value = true
}
function saveVersion() {
  if (!versionForm.name.trim() || !versionForm.engine.trim() || versionForm.modelIds.length === 0) return
  const record: SimulationVersion = { id: `version-${versionForm.name}`, name: versionForm.name.trim(), engine: versionForm.engine.trim(), modelIds: [...versionForm.modelIds] }
  versions.value.unshift(record); currentVersionId.value = record.id; versionFormVisible.value = false
}
</script>

<template>
  <section>
    <header class="page-heading"><div><div class="heading-title"><span class="heading-mark" /><h1>模型管理</h1></div><p>维护仿真版本及其关联模型实体</p></div></header>
    <PageStatePanel v-if="pageState" :state="pageState" />
    <template v-else>
      <div class="model-workbench">
        <aside class="model-category-panel"><div class="panel-label">模型分类</div><nav class="model-category-tree" aria-label="模型分类"><button type="button" :class="{ 'is-active': category === '全部模型' }" @click="category = '全部模型'">全部模型</button><div class="model-category-branch"><button type="button" :class="{ 'is-active': category === '卫星模型' }" @click="category = '卫星模型'">卫星模型</button><button type="button" class="category-level-two" :class="{ 'is-active': category === '相机模型' }" @click="category = '相机模型'">相机模型</button><button type="button" class="category-level-two" :class="{ 'is-active': category === '固存模型' }" @click="category = '固存模型'">固存模型</button></div><button type="button" :class="{ 'is-active': category === '地面站模型' }" @click="category = '地面站模型'">地面站模型</button></nav></aside>
        <div class="model-workspace">
          <div class="model-filter-bar"><el-form inline class="compact-query-form"><el-form-item label="仿真版本"><el-select v-model="currentVersionId" class="version-select"><el-option v-for="item in versions" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="名称"><el-input v-model="keyword" placeholder="请输入" clearable :prefix-icon="Search" /></el-form-item><el-form-item label="是否启用"><el-select v-model="enabledFilter" class="version-select"><el-option label="全部" value="all" /><el-option label="启用" value="enabled" /><el-option label="停用" value="disabled" /></el-select></el-form-item><el-button @click="resetFilters">重置</el-button><el-button type="primary" @click="versionDialogVisible = true">仿真版本管理</el-button></el-form></div>
          <div class="model-workspace-divider" /><div class="association-heading"><span>关联模型</span><span class="association-count">{{ visibleModels.length }} 个</span></div>
          <div class="model-card-grid"><button class="model-add-card" type="button" @click="openModelForm()"><el-icon><Plus /></el-icon><span>添加模型实体</span></button><article v-for="model in visibleModels" :key="model.id" class="model-entity-card"><div class="model-entity-header"><strong>{{ model.name }}</strong><div class="model-entity-actions"><el-switch :model-value="model.enabled" size="small" @change="requestToggleModel(model, Boolean($event))" /><el-button link type="primary" :icon="EditPen" aria-label="编辑模型" @click="openModelForm(model)" /></div></div><el-tag effect="plain" size="small" :class="`model-category-tag category-${model.category}`">{{ model.category }}</el-tag><dl><div><dt>模型ID</dt><dd>{{ model.id }}</dd></div><div><dt>创建时间（UTC+8）</dt><dd>{{ model.updateTime }}</dd></div><div><dt>模型版本</dt><dd>{{ model.version }}</dd></div></dl></article></div>
        </div>
      </div>
    </template>

    <el-dialog v-model="versionDialogVisible" title="仿真版本管理" width="780px" class="simulation-dialog" destroy-on-close><p class="dialog-help">仿真版本以 0.1 递增；一个版本需要选定该版本使用的模型，并供场景编辑使用。</p><div class="version-dialog-toolbar"><el-button type="primary" :icon="Plus" @click="openVersionForm">添加版本</el-button></div><section v-for="version in versions" :key="version.id" class="version-record"><div class="version-record-title"><strong>{{ version.name }}</strong><span>{{ version.engine || '未配置引擎' }}</span><el-button link type="primary" @click="currentVersionId = version.id; versionDialogVisible = false">使用此版本</el-button></div><div class="version-model-groups"><div v-for="group in versionGroups" :key="group.label" :class="{ 'version-model-subgroup': group.level === 2 }"><span>{{ group.label }}</span><p>{{ models.filter((item) => group.categories.includes(item.category) && version.modelIds.includes(item.id)).map((item) => `${item.name}(V${item.version})`).join('、') || '—' }}</p></div></div></section><template #footer><el-button @click="versionDialogVisible = false">关闭</el-button></template></el-dialog>

    <el-dialog v-model="versionFormVisible" title="添加版本" width="560px" class="simulation-dialog" destroy-on-close><p class="dialog-help">仿真版本以 0.1 递增；请确认所选模型之间的兼容性。</p><el-form label-width="88px"><el-form-item label="版本号" required><el-input v-model="versionForm.name" /></el-form-item><el-form-item label="使用引擎" required><el-input v-model="versionForm.engine" placeholder="请输入" /></el-form-item><el-form-item label="使用模型" required><el-checkbox-group v-model="versionForm.modelIds" class="model-choice-list"><el-checkbox v-for="model in models" :key="model.id" :value="model.id">{{ model.name }}（{{ model.category }}）</el-checkbox></el-checkbox-group></el-form-item><el-form-item label="上传"><el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".zip"><el-button :icon="Upload">上传</el-button><template #tip><div class="upload-tip">只能上传 zip 文件，且不能超过 50 MB</div></template></el-upload></el-form-item></el-form><template #footer><el-button @click="versionFormVisible = false">取消</el-button><el-button type="primary" :disabled="!versionForm.name || !versionForm.engine || versionForm.modelIds.length === 0" @click="saveVersion">保存</el-button></template></el-dialog>

    <el-dialog v-model="modelDialogVisible" :title="editedModelId ? '编辑模型实体' : '添加模型实体'" width="620px" class="simulation-dialog" destroy-on-close><el-form label-width="88px"><el-form-item label="模型文件"><el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".zip" @change="rememberModelFile"><el-button :icon="FolderAdd">上传</el-button><template #tip><div class="upload-tip">只能上传 zip 文件，且不能超过 50 MB</div><div v-if="selectedModelFileName" class="upload-file-name">已选择：{{ selectedModelFileName }}</div></template></el-upload></el-form-item><el-form-item label="模型名称" required><el-input v-model="modelForm.name" placeholder="请输入" /></el-form-item><el-form-item label="模型简称" required><el-input v-model="modelForm.shortName" placeholder="请输入" /></el-form-item><el-form-item label="模型版本"><el-input v-model="modelForm.version" placeholder="请输入" /></el-form-item><el-form-item label="类型"><el-select v-model="modelForm.category" class="form-full-width"><el-option v-for="item in modelTypeOptions" :key="item" :label="`${item}模型`" :value="item" /></el-select></el-form-item><el-form-item label="模型组合"><el-select v-model="modelCombinationIds" multiple placeholder="请选择" class="form-full-width"><el-option v-for="item in models" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="模型说明"><el-input v-model="modelForm.description" type="textarea" :rows="3" placeholder="请输入" /></el-form-item></el-form><template #footer><el-button @click="modelDialogVisible = false">取消</el-button><el-button type="primary" :disabled="!modelForm.name || !modelForm.shortName" @click="saveModel">保存</el-button></template></el-dialog>
  </section>
</template>
