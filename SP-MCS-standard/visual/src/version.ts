export const previewHost = window.location.hostname
export const is0701 = import.meta.env.VITE_SP_MCS_EDITION === '0701'
export const productName = is0701 ? 'SP-MCS-0701' : 'SP-MCS'
export const ports = { task: is0701 ? 5273 : 5173, orbit: is0701 ? 5273 : 5173, visual: is0701 ? 5273 : 5173, resource: is0701 ? 5273 : 5173 }
export const versionUrl = `http://${previewHost}:${is0701 ? 5173 : 5273}/app/mccs/visualsys/model/list`
