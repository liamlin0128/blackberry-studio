<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Calendar, Document, FolderOpened, InfoFilled, SetUp, Tickets } from '@element-plus/icons-vue'
import { ElButton, ElDialog, ElForm, ElFormItem, ElIcon, ElInput, ElMessage, ElOption, ElSelect } from 'element-plus'
import { satelliteOptions, uploadVolumeSamples } from '../../mocks/dataReception'
import type { UploadRegistration, UploadVolumeFile } from '../../types/dataReception'

const props = defineProps<{ visible: boolean; mode: 'create' | 'edit' | 'view'; record: UploadRegistration | null }>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; saved: [value: UploadRegistration, original: UploadRegistration | null] }>()

const form = reactive({
  softwareName: '', version: '', satellite: '木铎1B', sourcePath: '', md5: '', volumePath: '', sourceRemark: '', finalResult: '' as '' | '成功' | '失败', resultRemark: '',
})
const volumeFiles = ref<UploadVolumeFile[]>([])
const baseSaved = ref(false)
const volumesSaved = ref(false)
const editable = computed(() => props.mode !== 'view')
const title = computed(() => props.mode === 'create' ? '新增' : props.mode === 'edit' ? '编辑' : '查看')

function cloneVolumes(volumes: UploadVolumeFile[] = []) {
  return volumes.map((item) => ({ ...item }))
}

function resetForm() {
  const record = props.record
  Object.assign(form, {
    softwareName: record?.softwareName || '', version: record?.version || '', satellite: record?.satellite || '木铎1B',
    sourcePath: record?.sourcePath || '', md5: record?.md5 || '', volumePath: record?.volumePath || '',
    sourceRemark: record?.sourceRemark || '', finalResult: record?.finalResult || '', resultRemark: record?.resultRemark || '',
  })
  volumeFiles.value = cloneVolumes(record?.volumeFiles)
  baseSaved.value = Boolean(record)
  volumesSaved.value = Boolean(record?.volumeFiles?.length)
}

function choosePath(label: string) {
  ElMessage.info(`请直接填写${label}`)
}

function saveBase() {
  if (!form.softwareName.trim() || !form.version.trim() || !form.satellite || !form.sourcePath.trim() || !form.md5.trim() || !form.volumePath.trim()) {
    ElMessage.warning('请完整填写原文件基本信息中的必填项')
    return
  }
  baseSaved.value = true
  ElMessage.success('原文件基本信息已保存')
}

function identifyVolumes() {
  if (!baseSaved.value) {
    ElMessage.warning('请先保存原文件基本信息')
    return
  }
  volumeFiles.value = uploadVolumeSamples.map((item) => ({ ...item, path: item.path.replace('/MD1A/', `/${form.satellite === '木铎1B' ? 'MD1B' : 'MD1A'}/`) }))
  volumesSaved.value = false
  ElMessage.success('分卷配置识别完成')
}

function saveVolumes() {
  if (!volumeFiles.value.length) {
    ElMessage.warning('请先识别分卷配置')
    return
  }
  volumesSaved.value = true
  ElMessage.success('分卷文件信息已保存')
}

function buildRegistration(): UploadRegistration {
  const original = props.record
  return {
    softwareName: form.softwareName.trim(), version: form.version.trim(), satellite: form.satellite,
    volumeCount: volumeFiles.value.length, sourcePath: form.sourcePath.trim(), editor: original?.editor || 'hwy001',
    registeredAt: original?.registeredAt || '2026-09-16 09:00:00', editedAt: '2026-09-16 09:00:00',
    md5: form.md5.trim(), volumePath: form.volumePath.trim(), sourceRemark: form.sourceRemark.trim(),
    finalResult: form.finalResult || undefined, resultRemark: form.resultRemark.trim(), volumeFiles: cloneVolumes(volumeFiles.value),
  }
}

function saveResult() {
  if (!baseSaved.value || !volumesSaved.value) {
    ElMessage.warning('请先完成原文件信息与分卷文件保存')
    return
  }
  if (!form.finalResult) {
    ElMessage.warning('请选择最终执行结果')
    return
  }
  emit('saved', buildRegistration(), props.record)
  ElMessage.success('执行结果记录已保存')
}

watch(() => props.visible, (visible) => { if (visible) resetForm() })
</script>

<template>
  <el-dialog :model-value="visible" :title="title" width="calc(100vw - 32px)" top="16px" class="upload-dialog" @update:model-value="emit('update:visible', $event)">
    <div class="upload-editor-grid">
      <section class="upload-pane upload-base-pane">
        <header>
          <h3><el-icon><InfoFilled /></el-icon>原文件基本信息</h3>
          <el-button v-if="editable" type="primary" size="small" @click="saveBase">保存生效</el-button>
        </header>
        <el-form label-position="top" :disabled="!editable">
          <el-form-item label="软件名称" required><el-input v-model="form.softwareName" placeholder="请输入软件名称" /></el-form-item>
          <el-form-item label="软件版本" required><el-input v-model="form.version" placeholder="请输入软件版本" /></el-form-item>
          <el-form-item label="卫星" required><el-select v-model="form.satellite"><el-option v-for="option in satelliteOptions" :key="option" :label="option" :value="option" /></el-select></el-form-item>
          <el-form-item label="原文件路径" required><el-input v-model="form.sourcePath" placeholder="请输入原文件路径"><template #append><el-button :icon="FolderOpened" aria-label="选择原文件路径" title="选择原文件路径" @click="choosePath('原文件路径')" /></template></el-input></el-form-item>
          <el-form-item label="MD5" required><el-input v-model="form.md5" placeholder="请输入 MD5" /></el-form-item>
          <el-form-item label="分卷文件夹路径" required><el-input v-model="form.volumePath" placeholder="请输入分卷文件夹路径"><template #append><el-button :icon="FolderOpened" aria-label="选择分卷文件夹路径" title="选择分卷文件夹路径" @click="choosePath('分卷文件夹路径')" /></template></el-input></el-form-item>
          <el-form-item label="原文件备注信息"><el-input v-model="form.sourceRemark" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请输入原文件备注信息" /></el-form-item>
        </el-form>
      </section>

      <section class="upload-pane upload-volume-pane">
        <header>
          <h3><el-icon><SetUp /></el-icon>分卷文件管理</h3>
          <div v-if="editable" class="upload-pane-actions"><el-button type="primary" size="small" @click="identifyVolumes">识别分卷配置</el-button><el-button type="primary" size="small" :disabled="!volumeFiles.length" @click="saveVolumes">保存生效</el-button></div>
        </header>
        <div v-if="volumeFiles.length" class="volume-file-list">
          <article v-for="file in volumeFiles" :key="file.id" class="volume-file-item">
            <el-icon class="volume-file-icon"><Document /></el-icon>
            <div class="volume-file-main"><strong>{{ file.fileName }}</strong><span :title="file.path">{{ file.path }}</span></div>
            <div class="volume-file-checksum"><span>{{ file.md5 }}</span><small>上注时间：{{ file.uploadedAt || '—' }}</small></div>
            <el-icon class="volume-file-calendar"><Calendar /></el-icon>
          </article>
        </div>
        <div v-else class="volume-placeholder"><strong>暂无分卷文件</strong><p>保存基本信息后，点击“识别分卷配置”生成分卷清单。</p></div>
      </section>
    </div>

    <section class="upload-result upload-pane">
      <header><h3><el-icon><Tickets /></el-icon>执行结果记录</h3><el-button v-if="editable" type="primary" size="small" @click="saveResult">保存生效</el-button></header>
      <el-form label-position="top" :disabled="!editable" class="upload-result-form">
        <el-form-item label="最终执行结果" required><el-select v-model="form.finalResult" placeholder="请选择"><el-option label="成功" value="成功" /><el-option label="失败" value="失败" /></el-select></el-form-item>
        <el-form-item label="结果备注"><el-input v-model="form.resultRemark" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请输入" /></el-form-item>
      </el-form>
    </section>
  </el-dialog>
</template>
