import { useEffect, useMemo, useState } from 'react'
import { CloseIcon, SettingsIcon } from '../components/ui/SystemIcons'
import { PrototypePageStateView, type PrototypePageState } from '../components/ui/PrototypePageState'
import { observationWindow, validateObservationSelection } from '../features/post-precision/observation'
import { historicalTelemetryRows, precisionAuxiliaryFiles, precisionSatellites, rawObservationRows, type HistoricalTelemetry, type PrecisionSource } from '../mocks/postPrecision'
import './PostPrecisionPage.css'

type Props = { state: PrototypePageState }
type PendingAction = 'start' | 'stop' | null
type TelemetryStatus = 'idle' | 'loading' | 'found' | 'missing'

const steps = ['原始观测量数据选择', '历史遥测数据查询', '辅助数据上传', '定轨计算']
const beijing = '北京时间'

function SourceTable({ rows, selected, onToggle, empty }: {
  rows: PrecisionSource[]
  selected: string[]
  onToggle: (id: string) => void
  empty: boolean
}) {
  return <div className="table-scroll precision-table-wrap">
    <table className="data-table precision-table">
      <thead><tr><th>选择</th><th>编号</th><th>卫星</th><th>文件名称</th><th>数据开始时间（北京时间）</th><th>数据结束时间（北京时间）</th><th>数据接收时间（北京时间）</th><th>源文件</th></tr></thead>
      <tbody>{!empty && rows.map(row => <tr key={row.id} className={selected.includes(row.id) ? 'selected' : ''}>
        <td><input type="checkbox" aria-label={'选择 ' + row.file} checked={selected.includes(row.id)} onChange={() => onToggle(row.id)} /></td>
        <td>{row.id}</td><td>{row.satellite}</td><td>{row.file}</td><td>{row.start}</td><td>{row.end}</td><td>{row.received}</td><td className="file-name">{row.source}</td>
      </tr>)}</tbody>
    </table>
    {(empty || rows.length === 0) && <div className="precision-empty">暂无符合条件的数据</div>}
  </div>
}

function CalculationResultTable() {
  return <div className="table-scroll precision-table-wrap"><table className="data-table precision-table">
    <thead><tr><th>编号</th><th>卫星</th><th>历元时刻（北京时间）</th><th>X（m）</th><th>Y（m）</th><th>Z（m）</th><th>Vx（m/s）</th><th>Vy（m/s）</th><th>Vz（m/s）</th><th>数据更新时间（北京时间）</th></tr></thead><tbody />
  </table></div>
}

export function PostPrecisionPage({ state }: Props) {
  const [step, setStep] = useState(0)
  const [satellite, setSatellite] = useState(precisionSatellites[0])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [queried, setQueried] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [telemetryStatus, setTelemetryStatus] = useState<TelemetryStatus>('idle')
  const [telemetry, setTelemetry] = useState<HistoricalTelemetry | null>(null)
  const [files, setFiles] = useState<Record<string, string>>(() => Object.fromEntries(precisionAuxiliaryFiles.map(item => [item.key, item.file])))
  const [message, setMessage] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState('')

  const selectedRows = useMemo(() => rawObservationRows.filter(row => selectedIds.includes(row.id)), [selectedIds])
  const selectedWindow = useMemo(() => observationWindow(selectedRows), [selectedRows])
  const visibleRaw = useMemo(() => rawObservationRows.filter(row =>
    row.satellite === satellite && (!queried || ((!start || row.start >= start.replace('T', ' ')) && (!end || row.end <= end.replace('T', ' '))))
  ), [satellite, start, end, queried])

  useEffect(() => {
    if (step !== 1 || !selectedWindow) return
    const queryWindow = selectedWindow
    const timer = setTimeout(() => {
      const found = historicalTelemetryRows.find(item =>
        item.satellite === queryWindow.satellite && item.start <= queryWindow.start && item.end >= queryWindow.end
      )
      setTelemetry(found ?? null)
      setTelemetryStatus(found ? 'found' : 'missing')
    }, 1100)
    return () => clearTimeout(timer)
  }, [step, selectedWindow])

  function clearSelection() {
    setSelectedIds([])
    setTelemetry(null)
    setTelemetryStatus('idle')
  }

  function query() {
    if (start && end && (new Date(end).getTime() - new Date(start).getTime() > 48 * 60 * 60 * 1000 || end < start)) {
      setMessage('数据时间范围须按先后填写，且不得超过 48 小时。')
      return
    }
    clearSelection()
    setQueried(true)
    setMessage('查询已完成，请选择一条或多条原始观测量记录。')
  }

  function next() {
    if (step === 0) {
      const error = validateObservationSelection(selectedRows)
      if (error) { setMessage(error); return }
      setTelemetry(null)
      setTelemetryStatus('loading')
      setStep(1)
    } else if (step === 1) {
      if (telemetryStatus !== 'found') return
      setStep(2)
    } else if (step === 2) {
      const error = validateObservationSelection(selectedRows)
      if (error) { setStep(0); setMessage(error); return }
      if (!telemetry) { setStep(1); setMessage('未找到相应的历史遥测定位数据，无法定轨。'); return }
      setPendingAction('start')
    }
    setMessage('')
  }

  function confirm() {
    if (pendingAction === 'start') {
      const error = validateObservationSelection(selectedRows)
      if (error) { setStep(0); setMessage(error); setPendingAction(null); return }
      if (!telemetry) { setStep(1); setMessage('未找到相应的历史遥测定位数据，无法定轨。'); setPendingAction(null); return }
      setStep(3)
      setRunning(true)
      setStartedAt(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium' }).format(new Date()))
      setMessage('计算任务已发起。')
    }
    if (pendingAction === 'stop') { setRunning(false); setMessage('本次计算已终止。') }
    setPendingAction(null)
  }

  function resetSearch() {
    setStart('')
    setEnd('')
    setQueried(false)
    clearSelection()
    setMessage('')
  }

  function returnToFirstStep() {
    setStep(0)
    setTelemetry(null)
    setTelemetryStatus('idle')
    setMessage('')
  }

  return <section className="workspace">
    <div className="page-tabs"><span className="active-tab">事后精密定轨 <small aria-hidden="true"><CloseIcon size={14} /></small></span><span className="settings" aria-label="页面设置"><SettingsIcon /></span></div>
    <main className="orbit-main module-main post-precision-page">
      <section className="page-heading"><span className="heading-mark" /><div><h1>事后精密定轨</h1><p>依次选择观测数据、查询历史遥测并准备辅助文件，再发起定轨计算。</p></div></section>
      {state === 'loading' || state === 'error' || state === 'forbidden'
        ? <div className="precision-state"><PrototypePageStateView state={state} /></div>
        : <>
          <nav className="precision-steps" aria-label="事后精密定轨流程">{steps.map((label, index) =>
            <div key={label} className={'precision-step' + (index === step ? ' current' : '') + (index < step ? ' done' : '')} aria-current={index === step ? 'step' : undefined}><span className="step-index">{index + 1}</span><span>{label}</span></div>
          )}</nav>
          <div className="precision-stage">
            {step === 0 && <section className="precision-card">
              <header><div><h2>原始观测量数据选择</h2><p>筛选卫星与数据时间，可选择多条时间连续的记录。</p></div></header>
              <div className="filter-panel precision-query">
                <label>卫星 <select value={satellite} onChange={event => { setSatellite(event.target.value); clearSelection() }}>{precisionSatellites.map(item => <option key={item}>{item}</option>)}</select></label>
                <label>开始时间 <input type="datetime-local" value={start} onChange={event => { setStart(event.target.value); clearSelection() }} /></label>
                <label>结束时间 <input type="datetime-local" value={end} onChange={event => { setEnd(event.target.value); clearSelection() }} /></label>
                <span className="query-hint">{beijing} · 最长 48 小时</span>
                <button className="primary-button" type="button" onClick={query}>查询</button>
                <button className="secondary-button" type="button" onClick={resetSearch}>重置</button>
              </div>
              <h3>原始观测量记录 <small>已选 {selectedRows.length} 条</small></h3>
              <SourceTable rows={visibleRaw} selected={selectedIds} onToggle={id => { setSelectedIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]); setMessage('') }} empty={state === 'empty'} />
            </section>}
            {step === 1 && <section className="precision-card">
              <header><div><h2>历史遥测定位数据查询</h2><p>所选卫星：<strong>{selectedWindow?.satellite}</strong> · 观测时间（北京时间）：{selectedWindow?.start} 至 {selectedWindow?.end}</p></div></header>
              <div className="telemetry-query-state" aria-live="polite">
                {(telemetryStatus === 'loading' || telemetryStatus === 'idle') && <div className="telemetry-loading" role="status">
                  <span className="telemetry-spinner" aria-hidden="true" />
                  <strong>正在查询历史遥测定位数据</strong>
                  <p>根据所选卫星和观测时间范围检索，请稍候…</p>
                  <span className="telemetry-loading-bar" aria-hidden="true" />
                </div>}
                {telemetryStatus === 'found' && telemetry && <div className="telemetry-found" role="status">
                  <strong>已找到历史遥测定位数据</strong>
                  <dl><div><dt>数据开始时间（北京时间）</dt><dd>{telemetry.start}</dd></div><div><dt>数据结束时间（北京时间）</dt><dd>{telemetry.end}</dd></div><div><dt>数据条数</dt><dd>{telemetry.count.toLocaleString('zh-CN')} 条</dd></div></dl>
                  <p>可进入下一步准备辅助数据。</p>
                </div>}
                {telemetryStatus === 'missing' && <div className="telemetry-missing" role="alert">
                  <strong>未找到相应的历史遥测定位数据，无法定轨。</strong>
                  <p>请人工确认，或返回第一步重新选择原始观测量记录。</p>
                  <button className="secondary-button" type="button" onClick={returnToFirstStep}>返回第一步重新选择</button>
                </div>}
              </div>
            </section>}
            {step === 2 && <section className="precision-card">
              <header><div><h2>辅助数据上传</h2><p>查看已有文件，按需选择本地文件替换。</p></div></header>
              <div className="precision-file-list">{precisionAuxiliaryFiles.map(item => <div className="precision-file-row" key={item.key}>
                <div><strong>{item.label}</strong><small>辅助数据</small></div>
                <label className="secondary-button compact file-upload">选择文件<input type="file" aria-label={'上传' + item.label} onChange={event => { const file = event.target.files?.[0]; if (file) setFiles(previous => ({ ...previous, [item.key]: file.name })) }} /></label>
                <span className="file-name">{files[item.key] || '未选择文件'}</span>
                <span className={files[item.key] ? 'file-ready' : 'file-missing'}>{files[item.key] ? '已选择' : '待选择'}</span>
              </div>)}</div>
            </section>}
            {step === 3 && <section className="precision-card calculation-card">
              <header><div><h2>定轨计算</h2></div></header>
              <div className="precision-progress"><div><strong>精密定轨计算进度</strong><span>{running ? '计算中' : '已终止'}</span></div><div className="progress-track"><span style={{ width: '0%' }} /></div><small>0% · 等待计算结果</small></div>
              <dl className="precision-summary">
                <div><dt>记录编号</dt><dd>待生成</dd></div>
                <div><dt>发起人</dt><dd>演示用户</dd></div>
                <div><dt>计算时间（北京时间）</dt><dd>{startedAt || '—'}</dd></div>
                <div><dt>原始观测量数据条数</dt><dd>{selectedRows.length} 条</dd></div>
                <div><dt>卫星</dt><dd>{selectedWindow?.satellite}</dd></div>
                <div><dt>原始观测量数据</dt><dd title={selectedRows.map(row => row.source).join('、')}>{selectedRows.map(row => row.source).join('、')}</dd></div>
                <div><dt>结果</dt><dd>{running ? '计算中' : '已终止'}</dd></div>
              </dl>
              <h3>计算结果</h3><CalculationResultTable /><div className="precision-empty">暂无计算结果</div>
            </section>}
          </div>
          {message && <p className="inline-feedback" role="status">{message}</p>}
          <div className="precision-footer">
            {step > 0 && step < 3 && <button className="secondary-button" type="button" onClick={() => { if (step === 1) returnToFirstStep(); else { setTelemetryStatus('loading'); setTelemetry(null); setStep(value => value - 1); setMessage('') } }}>上一步</button>}
            {step < 3 && <button className="primary-button" type="button" disabled={step === 1 && telemetryStatus !== 'found'} onClick={next}>{step === 2 ? '发起定轨计算' : '下一步'}</button>}
            {step === 3 && <><button className="secondary-button" type="button" disabled={!running} onClick={() => setPendingAction('stop')}>终止</button><button className="secondary-button" type="button" onClick={() => { setStep(0); setRunning(false); setMessage('') }}>退出</button></>}
          </div>
        </>}
    </main>
    {pendingAction && <div className="dialog-backdrop dialog-layer" role="presentation"><section className="dialog confirm-dialog" role="dialog" aria-modal="true" aria-label={pendingAction === 'start' ? '发起定轨计算确认' : '终止定轨计算确认'}>
      <header className="dialog-header"><h2>{pendingAction === 'start' ? '发起定轨计算' : '终止定轨计算'}</h2></header>
      <div className="dialog-body"><p>{pendingAction === 'start' ? '确认使用所选数据发起事后精密定轨？' : '确认终止本次定轨计算？'}</p></div>
      <footer className="dialog-footer"><button className="secondary-button" type="button" onClick={() => setPendingAction(null)}>返回</button><button className="primary-button" type="button" onClick={confirm}>确认</button></footer>
    </section></div>}
  </section>
}
