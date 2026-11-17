import type { OrbitConfiguration, OrbitHistoryRecord, OrbitHistorySet } from '../../mocks/orbitTrackManage'
import { orbitResult } from '../../mocks/orbitTrackManage'
import { CloseIcon } from '../../components/ui/SystemIcons'
import { useMemo, useState } from 'react'

type DialogProps = { onClose: () => void }

export function OrbitConfigDialog({ configuration, onSave, onClose }: DialogProps & { configuration: OrbitConfiguration, onSave: (configuration: OrbitConfiguration) => void }) {
  const [draft, setDraft] = useState(configuration)
  const save = () => {
    onSave(draft)
    onClose()
  }

  return <div className="dialog-backdrop" role="presentation"><section className="dialog config-dialog" role="dialog" aria-modal="true" aria-labelledby="config-title">
    <header className="dialog-header"><h2 id="config-title">定轨配置服务</h2><button className="close-button" type="button" onClick={onClose} aria-label="关闭"><CloseIcon /></button></header>
    <div className="dialog-body form-stack">
      <label className="form-row"><span>是否开启自动定轨</span><input checked={draft.autoOrbitEnabled} className="switch-input" type="checkbox" role="switch" aria-label="是否开启自动定轨" onChange={(event) => setDraft({ ...draft, autoOrbitEnabled: event.target.checked })} /></label>
      <label className="form-row"><span>每日计算时刻</span><select value={draft.calculationTime} aria-label="每日计算时刻" onChange={(event) => setDraft({ ...draft, calculationTime: event.target.value })}><option>19点</option></select></label>
    </div>
    <footer className="dialog-footer"><button className="secondary-button" type="button" onClick={onClose}>取消</button><button className="primary-button" type="button" onClick={save}>保存</button></footer>
  </section></div>
}

export function OrbitHistoryDialog({ historySet, onManualSave, onViewResult, onClose }: DialogProps & { historySet: OrbitHistorySet, onManualSave: (input: { dataType: OrbitHistoryRecord['dataType'], epoch?: string }) => void, onViewResult: (record: OrbitHistoryRecord) => void }) {
  const [manualVisible, setManualVisible] = useState(false)
  const [draftRange, setDraftRange] = useState({ start: '', end: '' })
  const [updatedAtRange, setUpdatedAtRange] = useState({ start: '', end: '' })
  const hasUpdatedAtQuery = Boolean(updatedAtRange.start || updatedAtRange.end)
  const filteredRecords = useMemo(() => historySet.records.filter((record) => {
    const recordDate = record.updatedAt.slice(0, 10)
    return (!updatedAtRange.start || recordDate >= updatedAtRange.start)
      && (!updatedAtRange.end || recordDate <= updatedAtRange.end)
  }), [historySet.records, updatedAtRange])
  const hasHistory = filteredRecords.length > 0
  const total = hasUpdatedAtQuery ? filteredRecords.length : (historySet.total ?? historySet.records.length)

  return <><div className="dialog-backdrop" role="presentation"><section className="dialog history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title">
    <header className="dialog-header"><h2 id="history-title">历史轨道</h2><button className="close-button" type="button" onClick={onClose} aria-label="关闭"><CloseIcon /></button></header>
    <form className="history-tools" onSubmit={(event) => { event.preventDefault(); setUpdatedAtRange(draftRange) }}><label>数据更新时间<span className="date-range-input"><input type="date" aria-label="数据更新时间开始" value={draftRange.start} onChange={(event) => setDraftRange({ ...draftRange, start: event.target.value })} /><span>至</span><input type="date" aria-label="数据更新时间结束" value={draftRange.end} onChange={(event) => setDraftRange({ ...draftRange, end: event.target.value })} /></span></label><button className="primary-button compact" type="submit">检索</button><button className="secondary-button compact" type="button" onClick={() => setManualVisible(true)}>手动输入</button></form>
    {hasHistory ? <><div className="table-scroll"><table className="data-table history-table"><thead><tr><th>序号</th><th>ID</th><th>数据更新时间</th><th>历元时间（北京时间 UTC+8）</th><th>定轨数据</th><th>定轨模式</th><th>操作</th></tr></thead><tbody>
      {filteredRecords.map((record) => <tr key={record.sequence}><td>{record.sequence}</td><td>{record.id}</td><td>{record.updatedAt}</td><td>{formatBeijingTime(record.epoch)}</td><td>{record.dataType}</td><td>{record.mode}</td><td><button className="text-button" type="button" onClick={() => onViewResult(record)}>查看</button></td></tr>)}
    </tbody></table></div>
    <footer className="dialog-footer dialog-pagination"><span>共 {total} 条</span><span>30条/页</span><button type="button" aria-label="上一页" disabled>‹</button><button className="page-current" type="button">1</button><button type="button" disabled>2</button><button type="button" disabled>3</button><button type="button" aria-label="下一页" disabled>›</button><span>前往 <input aria-label="前往页码" type="number" min="1" max="3" disabled /> 页</span></footer></> : <div className="empty-state">暂无数据（待确认）</div>}
  </section></div>
  {manualVisible && <ManualOrbitDialog onSave={onManualSave} onClose={() => setManualVisible(false)} />}
  </>
}

export function OrbitResultDialog({ satelliteId, history, onClose }: DialogProps & { satelliteId: string, history: OrbitHistoryRecord }) {
  const showEvidencePayload = satelliteId === 'MD1A' && history.sequence === 1
  return <div className="dialog-backdrop" role="presentation"><section className="dialog result-dialog" role="dialog" aria-modal="true" aria-labelledby="result-title">
    <header className="dialog-header"><h2 id="result-title">定轨结果</h2><button className="close-button" type="button" onClick={onClose} aria-label="关闭"><CloseIcon /></button></header>
    <div className="dialog-body result-body">
      <h3>基本信息</h3><dl className="result-grid"><div><dt>卫星ID</dt><dd>{satelliteId}</dd></div><div><dt>定轨模式</dt><dd>{history.mode}</dd></div><div><dt>定轨数据</dt><dd>{history.dataType}</dd></div><div><dt>创建时间</dt><dd>{history.updatedAt}</dd></div></dl>
      <ResultBlock title="kepler：" value={showEvidencePayload ? orbitResult.kepler : ''} /><ResultBlock title="J2000：" value="" /><ResultBlock title="tle：" value={showEvidencePayload ? orbitResult.tle : ''} />
    </div>
    <footer className="dialog-footer"><button className="primary-button" type="button" onClick={onClose}>确定</button></footer>
  </section></div>
}

function ResultBlock({ title, value }: { title: string, value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
  }

  return <section className="result-block"><header><h3>{title}</h3><button className="text-button" type="button" disabled={!value} onClick={copy}>{copied ? '已复制' : '复制'}</button></header>{value && <pre>{value}</pre>}</section>
}

function ManualOrbitDialog({ onSave, onClose }: DialogProps & { onSave: (input: { dataType: OrbitHistoryRecord['dataType'], epoch?: string }) => void }) {
  const [mode, setMode] = useState<'tle' | 'osculating'>('tle')

  return <div className="dialog-backdrop dialog-layer" role="presentation"><section className="dialog manual-orbit-dialog" role="dialog" aria-modal="true" aria-labelledby="manual-title">
    <header className="dialog-header"><h2 id="manual-title">手动输入</h2><button className="close-button" type="button" onClick={onClose} aria-label="关闭"><CloseIcon /></button></header>
    <form className="dialog-body manual-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ dataType: mode === 'tle' ? '两行数' : '瞬根', epoch: String(form.get('epoch') || '') || undefined }); onClose() }}>
      <div className="radio-row" role="radiogroup" aria-label="定轨数据类型"><label><input checked={mode === 'tle'} name="manual-mode" type="radio" onChange={() => setMode('tle')} />TLE</label><label><input checked={mode === 'osculating'} name="manual-mode" type="radio" onChange={() => setMode('osculating')} />瞬根</label></div>
      {mode === 'tle' ? <div className="manual-fields"><InputRow label="tle1" name="tle1" required /><InputRow label="tle2" name="tle2" required /></div> : <div className="manual-fields"><InputRow label="历元时刻" name="epoch" type="datetime-local" /><InputRow label="半长轴" name="semiMajorAxis" required unit="m" /><InputRow label="偏心率" name="eccentricity" required /><InputRow label="轨道倾角" name="inclination" required unit="°" /><InputRow label="升交点赤经" name="rightAscension" required unit="°" /><InputRow label="近地点幅角" name="argumentOfPerigee" required unit="°" /><InputRow label="平近点角" name="meanAnomaly" required unit="°" /></div>}
      <footer className="dialog-footer"><button className="primary-button" type="submit">保存</button><button className="secondary-button" type="button" onClick={onClose}>取消</button></footer>
    </form>
  </section></div>
}

function InputRow({ label, name, required = false, type = 'text', unit }: { label: string, name: string, required?: boolean, type?: string, unit?: string }) {
  return <label className="form-row"><span className={required ? 'is-required' : ''}>{label}</span><span className="unit-input"><input name={name} required={required} type={type} placeholder="请输入" />{unit && <em>{unit}</em>}</span></label>
}

function formatBeijingTime(value: string) {
  return value.replace('T', ' ')
}
