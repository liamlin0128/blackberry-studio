<script setup lang="ts">
import { ArrowDown, Connection, Grid, InfoFilled, Monitor, Setting, UserFilled } from '@element-plus/icons-vue'
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import { is0701, ports, previewHost, productName, versionUrl } from './version'

const route = useRoute()
const embedded = computed(() => route.query.embedded === '1')
const systems = [
  { label: '任务规划系统', href: '/app/mccs/tasksys/requirement/list' },
  { label: '轨道计算系统', href: '/app/mccs/orbitsys/orbit/track-manage' },
  { label: '可视化仿真系统', href: '/app/mccs/visualsys/model/list' },
  { label: '遥控管理系统' },
  { label: '遥测监视系统' },
  { label: '接入与权限系统' },
]
systems[0].href = `http://${previewHost}:${ports.task}/app/mccs/tasksys/requirement/list`
systems[1].href = `http://${previewHost}:${ports.orbit}/app/mccs/orbitsys/orbit/track-manage`
systems[2].href = `http://${previewHost}:${ports.visual}/app/mccs/visualsys/model/list`
const pageTitle: Record<string, string> = {
  'satellite-management': '卫星管理',
  'optical-payload-management': '光学载荷管理',
  'antenna-management': '天线管理',
}
</script>

<template>
  <el-container class="app-shell" :class="{ 'is-embedded': embedded }">
    <header v-if="!embedded" class="system-header">
      <div class="system-brand">
        <span class="seal">SP</span>
        <div><strong>{{ is0701 ? '测运控平台' : '星枢任务控制系统' }}</strong><small>{{ productName }}</small></div>
        <el-tooltip content="星枢任务控制系统说明" placement="bottom"><el-icon class="system-about"><InfoFilled /></el-icon></el-tooltip>
      </div>
      <nav class="module-navigation" aria-label="产品系统导航">
        <template v-for="system in systems" :key="system.label">
          <a v-if="system.href" class="module-entry" :href="system.href">{{ system.label }}</a>
          <span v-else class="module-entry is-disabled" :class="{ 'is-global': system.label === '接入与权限系统' }" aria-disabled="true">{{ system.label }}</span>
        </template>
      </nav>
      <a class="header-version-switch" :href="versionUrl" :title="`切换至 ${is0701 ? 'SP-MCS 标准版' : 'SP-MCS-0701 项目版'}`">
        <span>{{ productName }}</span><span>切换至 {{ is0701 ? '标准版' : '0701 项目版' }} ↗</span>
      </a>
      <div class="user-area"><el-icon><UserFilled /></el-icon><span>演示用户</span><el-icon :size="12"><ArrowDown /></el-icon></div>
    </header>
    <aside v-if="!embedded" class="side-nav">
      <div class="system-title"><el-icon><Setting /></el-icon><span>资源管理</span></div>
      <el-menu :default-active="route.path" router>
        <el-menu-item index="/app/mccs/resourcesys/satellite/list"><el-icon><Monitor /></el-icon><span>卫星管理</span></el-menu-item>
        <el-menu-item index="/app/mccs/resourcesys/payload/list"><el-icon><Grid /></el-icon><span>光学载荷管理</span></el-menu-item>
        <el-menu-item index="/app/mccs/resourcesys/antenna/list"><el-icon><Connection /></el-icon><span>天线管理</span></el-menu-item>
      </el-menu>
    </aside>
    <section class="workspace">
      <div v-if="!embedded" class="page-tabs"><span class="active-tab">{{ pageTitle[String(route.name)] || '资源管理' }}</span><el-icon class="page-settings"><Setting /></el-icon></div>
      <main><RouterView /></main>
    </section>
  </el-container>
</template>
