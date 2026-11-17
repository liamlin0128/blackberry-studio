<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElMessageBox, ElSwitch, ElTable, ElTableColumn, ElTag } from 'element-plus'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { dictionaryCategories, dictionaryEntries } from '../mocks/systemManagement'
import type { DictionaryEntry, DictionaryStatus } from '../types/systemManagement'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const activeCategory = ref('1003')
const entries = ref(dictionaryEntries.map((item) => ({ ...item })))
const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ name: '', value: '', remark: '', status: '生效' as DictionaryStatus })
const activeName = computed(() => dictionaryCategories.find((item) => item.id === activeCategory.value)?.name || '待确认')
const rows = computed(() => entries.value.filter((item) => item.categoryId === activeCategory.value))

function openDialog(row?: DictionaryEntry) {
  editingId.value = row?.id || null
  Object.assign(form, row ? { name: row.name, value: row.value, remark: row.remark, status: row.status } : { name: '', value: '', remark: '', status: '生效' })
  dialogVisible.value = true
}
function editRow(row: unknown) { openDialog(row as DictionaryEntry) }
function save() {
  if (!form.name.trim() || !form.value.trim()) return ElMessage.warning('请填写名称和字典值')
  if (editingId.value) {
    const target = entries.value.find((item) => item.id === editingId.value)
    if (target) Object.assign(target, form)
  } else {
    entries.value.unshift({ id: `SIM-${Date.now()}`, categoryId: activeCategory.value, ...form })
  }
  dialogVisible.value = false
  ElMessage.success(editingId.value ? '字典项已更新' : '字典项已新增')
}
async function remove(row: DictionaryEntry) {
  try {
    await ElMessageBox.confirm(`确认删除字典项“${row.name}”吗？`, '删除确认', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' })
  } catch {
    return
  }
  entries.value = entries.value.filter((item) => item.id !== row.id)
  ElMessage.success('字典项已删除')
}
function removeRow(row: unknown) { void remove(row as DictionaryEntry) }
onMounted(() => { if (params.get('dialog') === 'create') openDialog() })
</script>

<template>
  <section class="stage-four-page dictionary-page">
    <PageHeader title="字典管理" description="维护系统公共字典分类与字典项" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="字典管理" />
    <div v-else class="dictionary-workbench">
      <aside class="dictionary-categories">
        <header><strong>字典分类</strong><span>{{ dictionaryCategories.length }} 类</span></header>
        <button v-for="item in dictionaryCategories" :key="item.id" type="button" :class="{ active: activeCategory === item.id }" @click="activeCategory = item.id">
          <span>{{ item.name }}</span><small>{{ item.id }}</small>
        </button>
      </aside>
      <section class="dictionary-content">
        <header class="dictionary-toolbar"><div><strong>{{ activeName }}</strong><span>字典项</span></div><el-button type="primary" :icon="Plus" @click="openDialog()">新增</el-button></header>
        <el-table :data="rows" height="100%" class="requirement-table" empty-text="当前分类暂无字典项">
          <el-table-column prop="id" label="编号" min-width="130" />
          <el-table-column prop="name" label="名称" min-width="180" />
          <el-table-column prop="value" label="字典值" min-width="130" />
          <el-table-column label="状态" min-width="110"><template #default="{ row }"><el-tag :type="row.status === '生效' ? 'success' : 'info'" effect="light">{{ row.status }}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="112" fixed="right" align="center"><template #default="{ row }"><div class="icon-actions"><el-button link type="primary" :icon="Edit" title="编辑" aria-label="编辑字典项" @click="editRow(row)" /><el-button link type="danger" :icon="Delete" title="删除" aria-label="删除字典项" @click="removeRow(row)" /></div></template></el-table-column>
        </el-table>
      </section>
    </div>
    <el-dialog v-model="dialogVisible" :title="editingId ? '修改字典' : '新增字典项'" width="480px" destroy-on-close>
      <el-form label-width="88px">
        <el-form-item label="所属分类"><el-input :model-value="activeName" disabled /></el-form-item>
        <el-form-item label="名称" required><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="字典值" required><el-input v-model="form.value" placeholder="请输入" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="5" maxlength="200" show-word-limit placeholder="请输入内容" /></el-form-item>
        <el-form-item label="生效状态"><el-switch v-model="form.status" active-value="生效" inactive-value="停用" active-text="是" inactive-text="否" inline-prompt /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="save">{{ editingId ? '修改' : '确定' }}</el-button></template>
    </el-dialog>
  </section>
</template>
