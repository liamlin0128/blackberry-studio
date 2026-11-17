import { useMemo, useState } from 'react'
import { PrototypePageStateView, type PrototypePageState } from '../components/ui/PrototypePageState'
import { CloseIcon, SettingsIcon } from '../components/ui/SystemIcons'
import { OrbitConfigDialog, OrbitHistoryDialog, OrbitResultDialog } from '../features/orbit-track/OrbitTrackDialogs'
import type { OrbitConfiguration, OrbitHistoryRecord, OrbitHistorySet, OrbitRecord } from '../mocks/orbitTrackManage'
import { defaultOrbitConfiguration, orbitHistoryBySatellite, orbitRecords } from '../mocks/orbitTrackManage'

type Dialog = 'config' | 'history' | 'result' | 'calculate' | null
type Props = { state: PrototypePageState }

export function OrbitTrackManagePage({ state }: Props) {
  const [satellite, setSatellite] = useState('全部')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [configuration, setConfiguration] = useState<OrbitConfiguration>(defaultOrbitConfiguration)
  const [historyBySatellite, setHistoryBySatellite] = useState<Record<string, OrbitHistorySet>>(orbitHistoryBySatellite)
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitRecord>(orbitRecords[0])
  const [selectedHistory, setSelectedHistory] = useState<OrbitHistoryRecord | null>(null)
  const [feedback, setFeedback] = useState('')
  const records = useMemo(() => state === 'empty' ? [] : satellite === '全部' ? orbitRecords : orbitRecords.filter((item) => item.satelliteId === satellite), [satellite, state])
  const openHistory = (record: OrbitRecord) => { setSelectedOrbit(record); setSelectedHistory(null); setDialog('history') }
  const openResult = (record: OrbitHistoryRecord) => { setSelectedHistory(record); setDialog('result') }
  const addManualHistory = (input: { dataType: OrbitHistoryRecord['dataType'], epoch?: string }) => {
    const createdAt = beijingNow()
    const createdRecord: OrbitHistoryRecord = { sequence: 1, id: `${Date.now()}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`, updatedAt: createdAt, epoch: input.epoch ? input.epoch.replace('T', ' ') : createdAt, dataType: input.dataType, mode: '手动' }
    setHistoryBySatellite((current) => {
      const existing = current[selectedOrbit.satelliteId] ?? { records: [], total: 0 }
      const nextRecords = [createdRecord, ...existing.records].map((record, index) => ({ ...record, sequence: index + 1 })).slice(0, 30)
      return { ...current, [selectedOrbit.satelliteId]: { records: nextRecords, total: (existing.total ?? existing.records.length) + 1 } }
    })
  }

  return <section className="workspace">
    <div className="page-tabs"><span className="active-tab">轨道管理 <small aria-hidden="true"><CloseIcon size={14} /></small></span><span className="settings" aria-label="页面设置"><SettingsIcon /></span></div>
    <main className="orbit-main track-manage-main">
      <section className="page-heading"><span className="heading-mark" /><h1>轨道管理</h1></section>
      {state === 'loading' || state === 'error' || state === 'forbidden' ? <PrototypePageStateView state={state} /> : <>
        <section className="filter-panel" aria-label="轨道管理筛选"><label>卫星<select value={satellite} onChange={(event) => setSatellite(event.target.value)}><option>全部</option><option>MD1A</option><option>MD1B</option></select></label><button className="secondary-button" type="button" onClick={() => setSatellite('全部')}>重置</button></section>
        <div className="table-toolbar"><button className="primary-button" type="button" onClick={() => setDialog('config')}>定轨计算配置</button><span>北京时间</span></div>
        <section className="table-card" aria-label="轨道管理数据表"><div className="table-scroll"><table className="data-table"><thead><tr><th>序号</th><th>卫星ID</th><th>卫星中文名称</th><th>卫星英文名称</th><th>TLE编号</th><th>定轨模式</th><th>更新时间</th><th>操作</th></tr></thead><tbody>
          {records.map((record) => <tr key={record.satelliteId}><td>{record.sequence}</td><td>{record.satelliteId}</td><td>{record.satelliteName}</td><td>{record.satelliteEnglishName}</td><td>{record.tleNumber}</td><td><span className="status-tag">{record.mode}</span></td><td>{record.updatedAt}</td><td><div className="table-actions"><button className="text-button" type="button" onClick={() => { setSelectedOrbit(record); setDialog('calculate') }}>开始计算</button><button className="text-button" type="button" onClick={() => openHistory(record)}>历史轨道</button></div></td></tr>)}
        </tbody></table></div>{records.length === 0 && <div className="empty-state">暂无数据（待确认）</div>}</section>
        {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      </>}
    </main>
    {dialog === 'config' && <OrbitConfigDialog configuration={configuration} onSave={setConfiguration} onClose={() => setDialog(null)} />}
    {dialog === 'history' && <OrbitHistoryDialog historySet={historyBySatellite[selectedOrbit.satelliteId]} onManualSave={addManualHistory} onViewResult={openResult} onClose={() => setDialog(null)} />}
    {dialog === 'result' && selectedHistory && <OrbitResultDialog satelliteId={selectedOrbit.satelliteId} history={selectedHistory} onClose={() => setDialog(null)} />}
    {dialog === 'calculate' && <div className="dialog-backdrop dialog-layer" role="presentation"><section className="dialog confirm-dialog" role="dialog" aria-modal="true" aria-label="开始计算确认"><header className="dialog-header"><h2>开始计算确认</h2><button className="close-button" type="button" aria-label="关闭" onClick={() => setDialog(null)}><CloseIcon /></button></header><div className="dialog-body"><p>确认开始 {selectedOrbit.satelliteId} 的定轨计算？</p></div><footer className="dialog-footer"><button className="secondary-button" type="button" onClick={() => setDialog(null)}>取消</button><button className="primary-button" type="button" onClick={() => { setDialog(null); setFeedback('定轨计算已确认，执行结果待确认。') }}>确认</button></footer></section></div>}
  </section>
}

function beijingNow() {
  const values = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {})
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`
}
