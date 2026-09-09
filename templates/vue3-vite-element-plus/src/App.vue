<script setup lang="ts">
import { Calendar, Connection, DataAnalysis, Monitor } from '@element-plus/icons-vue'
import { RouterView } from 'vue-router'

const navigation = [
  { index: 'overview', label: '运行总览', icon: DataAnalysis },
  { index: 'planning', label: '任务计划', icon: Calendar },
  { index: 'telemetry', label: '遥测监视', icon: Monitor },
]
</script>

<template>
  <el-container class="app-shell">
    <el-aside width="240px" class="app-sidebar">
      <div class="brand">
        <el-icon :size="22"><Connection /></el-icon>
        <div class="brand-copy"><strong>__PRODUCT_TITLE__</strong><span>测运控原型</span></div>
      </div>
      <el-menu default-active="overview" class="app-menu">
        <el-menu-item v-for="item in navigation" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="app-header">
        <div><h1>卫星运行控制台</h1><p>UTC+8 · 模拟数据</p></div>
        <el-tag effect="plain" type="info">原型环境</el-tag>
      </el-header>
      <el-main class="app-main"><RouterView /></el-main>
    </el-container>
  </el-container>
</template>
