<script setup lang="ts">
import type { TagProps } from 'element-plus'
import type { SatelliteSnapshot, SatelliteStatus } from '../../types/operations'

defineProps<{ rows: SatelliteSnapshot[] }>()

const tagType: Record<SatelliteStatus, TagProps['type']> = {
  正常: 'success',
  跟踪中: 'primary',
  告警: 'danger',
}
</script>

<template>
  <el-table :data="rows" stripe>
    <el-table-column label="卫星" min-width="150">
      <template #default="{ row }"><div class="table-primary">{{ row.name }}</div><div class="table-secondary">{{ row.id }}</div></template>
    </el-table-column>
    <el-table-column prop="orbit" label="轨道" width="80" />
    <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="tagType[row.status as SatelliteStatus]" effect="light">{{ row.status }}</el-tag></template></el-table-column>
    <el-table-column label="仰角" align="right" width="100"><template #default="{ row }"><span class="number-cell">{{ row.elevationDeg.toFixed(1) }}°</span></template></el-table-column>
    <el-table-column label="距离" align="right" width="130"><template #default="{ row }"><span class="number-cell">{{ row.rangeKm.toLocaleString() }} km</span></template></el-table-column>
    <el-table-column label="下行频率" align="right" width="140"><template #default="{ row }"><span class="number-cell">{{ row.downlinkMHz.toFixed(1) }} MHz</span></template></el-table-column>
    <el-table-column prop="updatedAt" label="更新时间" min-width="210" />
  </el-table>
</template>
