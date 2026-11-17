import { ref } from 'vue'
import { defineStore } from 'pinia'
import { initialSimulationInstanceLogs, initialSimulationInstances, initialSimulationScenes } from '../mocks/simulations'
import type { CreateSimulationInstancePayload, InstanceStatus, SimulationInstance, SimulationInstanceLog, SimulationScene } from '../types/simulation'

export const useSimulationStore = defineStore('simulation', () => {
  const instances = ref(initialSimulationInstances.map((item) => ({ ...item })))
  const instanceLogs = ref(initialSimulationInstanceLogs.map((item) => ({ ...item })))
  const scenes = ref(initialSimulationScenes.map((item) => ({ ...item })))

  function setInstanceStatus(id: string, status: InstanceStatus) {
    const item = instances.value.find((instance) => instance.id === id)
    if (!item) return
    item.status = status
    if (status === 'stopped') item.runtime = '--'
    const action = status === 'running' ? '启动' : status === 'paused' ? '暂停' : '关闭'
    const log: SimulationInstanceLog = {
      id: `log-${item.recordNo}-${Date.now()}`,
      instanceId: id,
      time: '2026-10-13 10:00:00',
      level: 'operation',
      action,
      content: `实例已${action === '关闭' ? '关闭' : `${action}并更新为${status === 'running' ? '运行中' : '已暂停'}状态`}。`,
      source: 'prototype',
      operator: '演示用户',
    }
    instanceLogs.value.unshift(log)
  }

  function addInstanceLog(id: string, action: string, content: string) {
    const item = instances.value.find((instance) => instance.id === id)
    if (!item) return
    instanceLogs.value.unshift({ id: `log-${item.recordNo}-${Date.now()}`, instanceId: id, time: '2026-10-13 10:00:00', level: 'operation', action, content, source: 'prototype', operator: '演示用户' })
  }

  function createInstance(payload: CreateSimulationInstancePayload) {
    const prefix = payload.instanceType === '在线仿真' ? 'N' : payload.instanceType === '模拟仿真' ? 'S' : 'T'
    const currentNumbers = instances.value
      .map((item) => Number(item.recordNo.match(new RegExp(`^${prefix}(\\d+)$`))?.[1] ?? 0))
    const recordNo = `${prefix}${Math.max(0, ...currentNumbers) + 1}`
    const record: SimulationInstance = {
      id: `instance-${Date.now()}`,
      recordNo,
      name: payload.name,
      instanceType: payload.instanceType,
      type: '—',
      scene: payload.scene,
      status: 'initial',
      recordTime: '2026-10-21 09:00:00',
      runtime: '--',
      color: '#3b82f6',
    }
    instances.value.unshift(record)
    return record
  }

  function removeScene(id: string) {
    scenes.value = scenes.value.filter((scene) => scene.id !== id)
  }

  function updateScene(id: string, changes: Partial<SimulationScene>) {
    const target = scenes.value.find((scene) => scene.id === id)
    if (target) Object.assign(target, changes)
  }

  return { instances, instanceLogs, scenes, setInstanceStatus, addInstanceLog, createInstance, removeScene, updateScene }
})
