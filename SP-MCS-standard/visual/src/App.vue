<script setup lang="ts">
import { ArrowDown, Grid, InfoFilled, MapLocation, Monitor, Setting, UserFilled } from '@element-plus/icons-vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { is0701, ports, previewHost, productName, versionUrl } from './version'

const route = useRoute()
const systems = [
  { label: '任务规划系统', href: '/app/mccs/tasksys/requirement/list' },
  { label: '轨道计算系统', href: '/app/mccs/orbitsys/orbit/track-manage' },
  { label: '可视化仿真系统', href: '/', active: true },
  { label: '遥控管理系统', disabled: true },
  { label: '遥测监视系统', disabled: true },
  { label: '接入与权限系统', disabled: true, global: true },
]
systems[0].href = `http://${previewHost}:${ports.task}/app/mccs/tasksys/requirement/list`
systems[1].href = `http://${previewHost}:${ports.orbit}/app/mccs/orbitsys/orbit/track-manage`
const pageTitle = ({ 'instance-list': '实例管理', 'scene-list': '场景列表', 'model-list': '模型列表' } as Record<string, string>)[String(route.name)] || '可视化仿真系统'
</script>

<template>
  <el-container class="app-shell">
    <header class="system-header">
      <div class="system-brand">
        <span class="seal">SP</span>
        <div><strong>{{ is0701 ? '测运控平台' : '星枢任务控制系统' }}</strong><small>{{ productName }}</small></div>
        <el-tooltip content="星枢任务控制系统说明" placement="bottom"><el-icon class="system-about"><InfoFilled /></el-icon></el-tooltip>
      </div>
      <nav class="module-navigation" aria-label="产品系统导航">
        <template v-for="system in systems" :key="system.label">
          <RouterLink v-if="system.active" class="module-entry is-active" to="/" aria-current="page">{{ system.label }}</RouterLink>
          <a v-else-if="system.href" class="module-entry" :class="{ 'is-global': system.global }" :href="system.href">{{ system.label }}</a>
          <span v-else class="module-entry is-disabled" :class="{ 'is-global': system.global }" aria-disabled="true">{{ system.label }}</span>
        </template>
      </nav>
      <a class="header-version-switch" :href="versionUrl" :title="`切换至 ${is0701 ? 'SP-MCS 标准版' : 'SP-MCS-0701 项目版'}`">
        <span>{{ productName }}</span><span>切换至 {{ is0701 ? '标准版' : '0701 项目版' }} ↗</span>
      </a>
      <div class="user-area"><el-icon><UserFilled /></el-icon><span>演示用户</span><el-icon :size="12"><ArrowDown /></el-icon></div>
    </header>

    <aside class="side-nav">
      <div class="system-title"><el-icon><Setting /></el-icon><span>可视化仿真系统</span></div>
      <el-menu :default-active="route.path" :default-openeds="['instance-management', 'scene-management', 'model-management']" router>
        <el-sub-menu index="instance-management">
          <template #title><el-icon><Monitor /></el-icon><span>实例管理</span></template>
          <el-menu-item index="/app/mccs/visualsys/instance/list">实例管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="scene-management">
          <template #title><el-icon><MapLocation /></el-icon><span>场景管理</span></template>
          <el-menu-item index="/app/mccs/visualsys/scene/list">场景列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="model-management">
          <template #title><el-icon><Grid /></el-icon><span>模型管理</span></template>
          <el-menu-item index="/app/mccs/visualsys/model/list">模型列表</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <section class="workspace">
      <div class="page-tabs"><span class="active-tab">{{ pageTitle }} <small>×</small></span><el-icon class="page-settings"><Setting /></el-icon></div>
      <main><RouterView /></main>
    </section>
  </el-container>
</template>
