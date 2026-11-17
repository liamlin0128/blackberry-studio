<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElInput, ElMessage, ElTable, ElTableColumn } from 'element-plus'
import PageHeader from '../components/shell/PageHeader.vue'
import PrototypeStatePanel from '../components/shell/PrototypeStatePanel.vue'
import { parameterSets, parametersByCategory } from '../mocks/parameterManagement'
import type { ManagedParameter, ParameterCategory, ParameterSet } from '../types/parameterManagement'
import type { PrototypeState } from '../types/prototype'

const params = new URLSearchParams(location.search)
const state = (params.get('state') || 'normal') as PrototypeState
const categories: ParameterCategory[] = ['基础配置参数', '卫星型号参数', '任务模板参数']
const activeCategory = ref<ParameterCategory>('基础配置参数')
const activeSetId = ref('base_defaults')
const selectedParameter = ref<ManagedParameter | null>(null)

const activeSet = computed<ParameterSet>(() => parameterSets.find((item) => item.id === activeSetId.value) || parameterSets[0])
const sets = computed(() => parameterSets.filter((item) => item.category === activeCategory.value))
const rows = computed<ManagedParameter[]>(() => parametersByCategory[activeCategory.value])
const groupedRows = computed(() => {
  const groups = new Map<string, ManagedParameter[]>()
  rows.value.forEach((row) => {
    const groupRows = groups.get(row.group) || []
    groupRows.push(row)
    groups.set(row.group, groupRows)
  })
  return Array.from(groups, ([title, items]) => ({ title, rows: items }))
})

function selectCategory(category: ParameterCategory) {
  activeCategory.value = category
  activeSetId.value = parameterSets.find((item) => item.category === category)?.id || ''
  selectedParameter.value = null
}

function selectSet(item: ParameterSet) {
  activeSetId.value = item.id
  selectedParameter.value = null
}

function selectParameter(row: unknown) {
  selectedParameter.value = row as ManagedParameter
}

function saveConfiguration() {
  ElMessage.success('配置已保存')
}
</script>

<template>
  <section class="stage-four-page parameter-management-page">
    <PageHeader title="参数管理" description="维护基础配置、卫星型号与任务模板参数" />
    <PrototypeStatePanel v-if="state !== 'normal'" :state="state" subject="参数管理" />
    <div v-else class="parameter-workbench">
      <aside class="parameter-categories">
        <header><strong>配置分类</strong></header>
        <button v-for="category in categories" :key="category" type="button" :class="{ active: activeCategory === category }" @click="selectCategory(category)">
          {{ category }}
        </button>
      </aside>
      <aside class="parameter-sets">
        <header><strong>{{ activeCategory }}</strong></header>
        <button v-for="item in sets" :key="item.id" type="button" :class="{ active: activeSetId === item.id }" @click="selectSet(item)">
          <span>{{ item.name }}</span><small>版本 {{ item.version }}</small>
        </button>
      </aside>
      <section class="parameter-editor">
        <header class="parameter-editor-header">
          <div>
            <strong>{{ activeSet.name }} - 可视化编辑</strong>
            <span>版本：{{ activeSet.version }} · 最后编辑：{{ activeSet.updatedBy }} · {{ activeSet.updatedAt }} · {{ rows.length }} 条参数</span>
          </div>
          <el-button type="primary" @click="saveConfiguration">保存配置</el-button>
        </header>
        <div class="parameter-group-scroll">
          <section v-for="group in groupedRows" :key="group.title" class="parameter-group">
            <header class="parameter-group-heading"><strong>{{ group.title }}</strong><span>{{ group.rows.length }} 项</span></header>
            <el-table :data="group.rows" class="parameter-group-table" size="small" border empty-text="当前分组暂无参数" @row-click="selectParameter">
              <el-table-column prop="code" label="参数编码" min-width="180" />
              <el-table-column prop="name" label="参数名称" min-width="150" />
              <el-table-column prop="description" label="描述说明" min-width="240" show-overflow-tooltip />
              <el-table-column prop="type" label="类型" width="82" align="center" />
              <el-table-column prop="length" label="长度" width="66" align="center" />
              <el-table-column prop="unitOrHandling" :label="activeCategory === '任务模板参数' ? '处理方式' : '单位'" min-width="90" align="center" />
              <el-table-column label="值" min-width="120">
                <template #default="{ row }"><el-input v-model="row.value" size="small" @click.stop="selectParameter(row)" /></template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </section>
      <aside class="parameter-inspector">
        <header><strong>参数查看</strong></header>
        <div v-if="selectedParameter" class="parameter-inspector-content">
          <span class="inspector-code">{{ selectedParameter.code }}</span>
          <strong>{{ selectedParameter.name }}</strong>
          <dl>
            <div><dt>所属分组</dt><dd>{{ selectedParameter.group }}</dd></div>
            <div><dt>类型 / 长度</dt><dd>{{ selectedParameter.type }} / {{ selectedParameter.length }}</dd></div>
            <div><dt>{{ activeCategory === '任务模板参数' ? '处理方式' : '单位' }}</dt><dd>{{ selectedParameter.unitOrHandling }}</dd></div>
            <div><dt>描述说明</dt><dd>{{ selectedParameter.description || '—' }}</dd></div>
          </dl>
        </div>
        <p v-else class="parameter-inspector-empty">点击选择参数查看</p>
      </aside>
    </div>
  </section>
</template>
