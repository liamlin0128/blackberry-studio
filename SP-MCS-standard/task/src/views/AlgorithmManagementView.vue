<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { Delete, Edit, Plus, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { ElButton, ElMessage, ElMessageBox, ElTable, ElTableColumn, ElTag } from 'element-plus'
import AlgorithmDialog from '../components/schedule/AlgorithmDialog.vue'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { algorithms } from '../mocks/schedule'
import type { PrototypeState } from '../types/prototype'
import type { AlgorithmRecord } from '../types/schedule'

const params = new URLSearchParams(window.location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const rows = ref(state === 'empty' ? [] : algorithms.map(item => ({ ...item })))
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const activeRecord = ref<AlgorithmRecord | null>(null)
const updatingStatusId = ref<string | null>(null)

onMounted(async () => {
  if (params.get('dialog') === 'add') openCreate()
  if (params.get('confirm') === 'delete' && rows.value[0]) { await nextTick(); void remove(rows.value[0]) }
})
function openCreate() { dialogMode.value = 'create'; activeRecord.value = null; dialogVisible.value = true }
function edit(value: unknown) { const row = value as AlgorithmRecord; dialogMode.value = 'edit'; activeRecord.value = row; dialogVisible.value = true }
function handleSaved(value: Pick<AlgorithmRecord, 'id' | 'name' | 'enabled' | 'remark'>) {
  const row = rows.value.find(item => item.id === value.id)
  if (row) Object.assign(row, value)
}
async function toggleStatus(value: unknown) {
  const row = value as AlgorithmRecord
  const action = row.enabled ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}算法“${row.name}”吗？${row.enabled ? '停用后不会参与后续规划选择。' : '启用后可被后续规划选择。'}`, `${action}算法确认`, { type: 'warning', confirmButtonText: `确认${action}`, cancelButtonText: '取消' })
  } catch { return }
  updatingStatusId.value = row.id
  await new Promise(resolve => window.setTimeout(resolve, 350))
  row.enabled = !row.enabled
  updatingStatusId.value = null
  ElMessage.success(`算法已${action}`)
}
async function remove(value: unknown) {
  const row = value as AlgorithmRecord
  try { await ElMessageBox.confirm(`确认删除算法“${row.name}”吗？此操作会影响后续规划选择。`, '删除算法确认', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }) } catch { return }
  await new Promise(resolve => window.setTimeout(resolve, 450))
  rows.value = rows.value.filter(item => item.id !== row.id)
  ElMessage.success('算法已删除')
}
</script>

<template>
  <section class="stage-four-page algorithm-page">
    <PageHeader title="算法管理" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="算法记录" />
    <template v-else>
      <div class="algorithm-toolbar"><el-button type="primary" :icon="Plus" @click="openCreate">添加算法</el-button></div>
      <section class="algorithm-table-card"><el-table :data="rows" height="100%" table-layout="auto" empty-text="暂无算法记录">
        <el-table-column prop="id" label="序号" min-width="110" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="155" />
        <el-table-column prop="name" label="算法名称" min-width="250" show-overflow-tooltip />
        <el-table-column label="状态" width="88" align="center"><template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'" effect="light">{{ row.enabled ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="60" show-overflow-tooltip />
        <el-table-column label="操作" width="126" fixed="right" align="center"><template #default="{ row }"><div class="icon-actions"><el-button link type="primary" :icon="row.enabled ? VideoPause : VideoPlay" :loading="updatingStatusId === row.id" :aria-label="row.enabled ? '停用算法' : '启用算法'" :title="row.enabled ? '停用算法' : '启用算法'" @click="toggleStatus(row)" /><el-button link type="primary" :icon="Edit" aria-label="编辑算法" title="编辑" @click="edit(row)" /><el-button link type="danger" :icon="Delete" aria-label="删除算法" title="删除" @click="remove(row)" /></div></template></el-table-column>
      </el-table></section>
    </template>
    <AlgorithmDialog v-model:visible="dialogVisible" :mode="dialogMode" :record="activeRecord" @saved="handleSaved" />
  </section>
</template>
