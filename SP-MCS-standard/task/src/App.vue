<script setup lang="ts">
import { Calendar, DataAnalysis, Document, Download, Grid, InfoFilled, Setting, UploadFilled } from '@element-plus/icons-vue'
import {
  ElButton,
  ElConfigProvider,
  ElIcon,
  ElMenu,
  ElMenuItem,
  ElPopover,
  ElSubMenu,
} from 'element-plus'
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import UserAccountMenu from './components/shell/UserAccountMenu.vue'
import { is0701, ports, previewHost, productName, versionUrl } from './version'

const route = useRoute()
const sideGroupIcons = [Document, DataAnalysis, Calendar, Download, UploadFilled, Grid, Setting] as const
const sideGroups = [
  { label: '需求管理', items: [
    { label: '任务需求列表', path: '/app/mccs/tasksys/requirement/list' },
    { label: '筹划计算', path: '/app/mccs/tasksys/requirement/plan' },
    { label: '元任务集合', path: '/app/mccs/tasksys/requirement/meta-task' },
    { label: '大区域筹划', path: '/app/mccs/tasksys/requirement/area-project' },
  ] },
  { label: '规划计算管理', items: [
    { label: '规划计算', path: '/app/mccs/tasksys/schedule/compute' },
    { label: '规划配置', path: '/app/mccs/tasksys/schedule/config' },
    { label: '算法管理', path: '/app/mccs/tasksys/schedule/algorithm' },
    { label: '紧急任务处理', path: '/app/mccs/tasksys/schedule/emergency' },
    { label: '参数管理', path: '/app/mccs/tasksys/schedule/parameter' },
  ] },
  { label: '任务计划管理', items: [
    { label: '任务计划表', path: '/app/mccs/tasksys/task/schedule' },
    { label: '任务计划甘特图', path: '/app/mccs/tasksys/task/gant' },
    { label: '手动测控管理', path: '/app/mccs/tasksys/task/ttc' },
    { label: '发送记录', path: '/app/mccs/tasksys/task/transmission-record' },
  ] },
  { label: '数据接收解析', items: [
    { label: '北斗星上任务计划状态信息', path: '/app/mccs/tasksys/data/taskPlan' },
    { label: '北斗星上应急规划结果记录', path: '/app/mccs/tasksys/data/urgentRecord' },
    { label: '北斗IPU任务统计数据', path: '/app/mccs/tasksys/data/ipuRecord' },
    { label: '星上任务日志记录', path: '/app/mccs/tasksys/data/taskLog' },
    { label: '星上文件表', path: '/app/mccs/tasksys/data/fileTabel' },
  ] },
  { label: '上注文件登记', items: [
    { label: '上注文件登记表', path: '/app/mccs/tasksys/uploadFile/uploadFileTable' },
  ] },
  { label: '资源管理', items: [
    { label: '卫星管理', path: '/app/mccs/tasksys/resource/satellite/list' },
    { label: '光学载荷管理', path: '/app/mccs/tasksys/resource/payload/list' },
    { label: '天线管理', path: '/app/mccs/tasksys/resource/antenna/list' },
  ] },
  { label: '系统管理', items: [
    { label: '字典管理', path: '/app/mccs/tasksys/system/dict' },
    { label: '系统日志', path: '/app/mccs/tasksys/system/syslog' },
    { label: '操作日志', path: '/app/mccs/tasksys/system/sys-operation-log' },
  ] },
]
if (is0701) {
  const excludedPaths = new Set([
    '/app/mccs/tasksys/requirement/meta-task', '/app/mccs/tasksys/requirement/area-project',
    '/app/mccs/tasksys/task/gant', '/app/mccs/tasksys/data/taskPlan',
    '/app/mccs/tasksys/data/ipuRecord', '/app/mccs/tasksys/uploadFile/uploadFileTable',
  ])
  for (const group of sideGroups) group.items = group.items.filter((item) => !excludedPaths.has(item.path))
  sideGroups.splice(4, 1)
  sideGroups[0].items.unshift(
    { label: '需求提交（占位）', path: '/app/mccs/tasksys/project/requirement-submit' },
    { label: '需求列表（占位）', path: '/app/mccs/tasksys/project/requirement-submissions' },
  )
  sideGroups[1].items.push({ label: '半自动规划（占位）', path: '/app/mccs/tasksys/project/semi-automatic-planning' })
  sideGroups[1].items.push({ label: '数传规划（占位）', path: '/app/mccs/tasksys/project/data-transmission-planning' })
  sideGroups[5].items.push({ label: '平台系统管理（占位）', path: '/app/mccs/tasksys/project/platform-administration' })
  sideGroups[1].items[3].label = '星上规划任务处理（规则待补充）'
  sideGroups[3].items[0].label = '星上任务规划结果（规则待补充）'
}

const pageTitle = computed(() => ({
  'requirement-list': '任务需求列表',
  'planning-compute': '筹划计算',
  'area-planning': '大区域筹划',
  'meta-task-list': '元任务集合',
  'schedule-compute': '规划计算',
  'schedule-config': '规划配置',
  'algorithm-management': '算法管理',
  'emergency-task-handling': '应急任务需求处理',
  'parameter-management': '参数管理',
  'task-plan-list': '任务计划表',
  'task-plan-gantt': '任务计划甘特图',
  'manual-pass-management': '手动测控管理',
  'transmission-records': '发送记录',
  'space-task-status': '北斗星上任务计划状态信息',
  'emergency-planning-records': '北斗星上应急规划结果记录',
  'ipu-statistics': '北斗IPU任务统计数据',
  'space-task-logs': '星上任务日志记录',
  'space-file-list': '星上文件表',
  'upload-registration': '上注文件登记表',
  'resource-satellite-management': '卫星管理',
  'resource-payload-management': '光学载荷管理',
  'resource-antenna-management': '天线管理',
  'dictionary-management': '字典管理',
  'system-logs': '系统日志',
  'operation-logs': '操作日志',
}[String(route.name)] || '任务规划系统'))

const productSystems = [
  { label: '任务规划系统', enabled: true, global: false, hint: '' },
  { label: '轨道计算系统', enabled: false, global: false, hint: '轨道计算系统', href: '/app/mccs/orbitsys/orbit/track-manage' },
  { label: '可视化仿真系统', enabled: false, global: false, hint: '', href: '/app/mccs/visualsys/model/list' },
  { label: '遥控管理系统', enabled: false, global: false, hint: '阶段 1 暂未开放' },
  { label: '遥测监视系统', enabled: false, global: false, hint: '阶段 1 暂未开放' },
  { label: '接入与权限系统', enabled: false, global: true, hint: '暂未开放' },
]
productSystems[1].href = `http://${previewHost}:${ports.orbit}/app/mccs/orbitsys/orbit/track-manage`
productSystems[2].href = `http://${previewHost}:${ports.visual}/app/mccs/visualsys/model/list`
</script>

<template>
  <el-config-provider :locale="zhCn">
  <div class="app-shell">
    <header class="system-header">
      <div class="system-brand">
        <span class="seal">SP</span>
        <div><strong>{{ is0701 ? '测运控平台' : '星枢任务控制系统' }}</strong><small>{{ productName }}</small></div>
        <el-popover placement="bottom-start" :width="430" trigger="click" popper-class="system-about-popover">
          <template #reference>
            <el-button class="system-about" link aria-label="查看星枢任务控制系统说明" title="系统说明">
              <el-icon><InfoFilled /></el-icon>
            </el-button>
          </template>
          <section class="about-content" aria-label="系统说明">
            <strong>星枢任务控制系统（SP-MCS，Stellar Pivot Mission Control System）</strong>
            <p>面向卫星星座的地面任务管控平台，作为星座任务调度中枢，统一实现任务规划、指令生成下发、遥测接收解析、多星资源协同与在轨状态监控。</p>
            <dl>
              <div><dt>Stellar</dt><dd>星辰、星群，代表卫星星座</dd></div>
              <div><dt>Pivot</dt><dd>枢轴、调度支点，代表任务调度中枢</dd></div>
              <div><dt>MCS</dt><dd>Mission Control System，航天行业通用术语</dd></div>
            </dl>
          </section>
        </el-popover>
      </div>
      <nav class="module-navigation" aria-label="产品系统导航">
        <template v-for="system in productSystems" :key="system.label">
          <RouterLink
            v-if="system.enabled"
            class="module-entry is-active"
            to="/app/mccs/tasksys/requirement/list"
            aria-current="page"
          >{{ system.label }}</RouterLink>
          <a
            v-else-if="system.href"
            class="module-entry"
            :href="system.href"
          >{{ system.label }}</a>
          <span
            v-else
            class="module-entry is-disabled"
            :class="{ 'is-global': system.global }"
            aria-disabled="true"
            :title="system.hint"
          >{{ system.label }}</span>
        </template>
      </nav>
      <a class="header-version-switch" :href="versionUrl" :title="`切换至 ${is0701 ? 'SP-MCS 标准版' : 'SP-MCS-0701 项目版'}`">
        <span class="header-version-switch__eyebrow">{{ productName }}</span>
        <strong>切换至 {{ is0701 ? '标准版' : '0701 项目版' }} <span aria-hidden="true">↗</span></strong>
      </a>
      <UserAccountMenu />
    </header>
    <aside class="side-nav">
      <div class="system-title"><el-icon><Setting /></el-icon><span>任务规划系统</span></div>
      <el-menu :default-openeds="['需求管理', '规划计算管理', '任务计划管理', '数据接收解析', '上注文件登记', '资源管理', '系统管理']" :default-active="route.path" router>
        <el-sub-menu v-for="(group, index) in sideGroups" :key="group.label" :index="group.label">
          <template #title><el-icon><component :is="sideGroupIcons[index]" /></el-icon><span>{{ group.label }}</span></template>
          <el-menu-item
            v-for="item in group.items"
            :key="item.label"
            :index="item.path || `pending-${item.label}`"
            :disabled="!item.path"
            :title="'hint' in item ? item.hint : undefined"
          >{{ item.label }}</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>
    <section class="workspace">
      <div class="page-tabs"><span class="active">{{ pageTitle }} <small>×</small></span><el-icon><Setting /></el-icon></div>
      <main><RouterView /></main>
    </section>
  </div>
  </el-config-provider>
</template>
