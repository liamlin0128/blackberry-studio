export const previewHost = window.location.hostname
export const is0701 = import.meta.env.VITE_SP_MCS_EDITION === '0701'
export const productName = is0701 ? 'SP-MCS-0701' : 'SP-MCS'
export const ports = { task: is0701 ? 5273 : 5173, orbit: is0701 ? 5273 : 5173, visual: is0701 ? 5273 : 5173, resource: is0701 ? 5273 : 5173 }
export const versionUrl = `http://${previewHost}:${is0701 ? 5173 : 5273}/app/mccs/tasksys/requirement/list`

// Stable IDs are independent of display text and legacy URL paths.
export const excluded0701 = new Set([
  'meta-task-list', 'area-planning', 'task-plan-gantt', 'space-task-status',
  'ipu-statistics', 'upload-registration',
])
