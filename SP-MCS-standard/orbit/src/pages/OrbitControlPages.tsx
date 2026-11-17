import { useState } from 'react'
import { PrototypePageStateView, type PrototypePageState } from '../components/ui/PrototypePageState'
import { CloseIcon, SettingsIcon } from '../components/ui/SystemIcons'
import { currentOrbitInputs, thrusterCalibrations } from '../mocks/orbitControlStrategy'
import './OrbitControlPages.css'

type Props = { type: 'strategy' | 'thruster'; state: PrototypePageState }
type StrategyInput = {
  satellite: string
  targetOrbit: 'nominal' | 'custom'
  correction: string
  residual: string
}

const initialStrategyInput: StrategyInput = {
  satellite: '木铎1A',
  targetOrbit: 'nominal',
  correction: '',
  residual: '',
}

export function OrbitControlPage({ type, state }: Props) {
  const isStrategy = type === 'strategy'
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [input, setInput] = useState<StrategyInput>(initialStrategyInput)
  const title = isStrategy ? '轨控策略计算' : '推力器标定管理'
  const primary = isStrategy ? '开始计算' : '保存'

  function updateInput(patch: Partial<StrategyInput>) {
    setInput(previous => ({ ...previous, ...patch }))
    setFeedback('')
  }

  function beginAction() {
    if (isStrategy) {
      if (!input.satellite) { setFeedback('请选择参与计算卫星。'); return }
      if (!thrusterCalibrations.some(item => item.satellite === input.satellite)) { setFeedback('未找到该卫星的推力器标定信息，请先确认标定数据。'); return }
      if (!input.correction.trim() || !Number.isFinite(Number(input.correction))) { setFeedback('请输入有效的修正高度，可填写正数或负数，单位为米。'); return }
      if (input.residual.trim() && (!Number.isFinite(Number(input.residual)) || Number(input.residual) < 0)) { setFeedback('高度残差须为非负数，单位为米。'); return }
    }
    setFeedback('')
    setConfirmOpen(true)
  }

  function reset() {
    if (!isStrategy) { window.location.reload(); return }
    setInput(initialStrategyInput)
    setFeedback('')
    setConfirmOpen(false)
  }

  return <section className="workspace">
    <div className="page-tabs"><span className="active-tab">{title} <small aria-hidden="true"><CloseIcon size={14} /></small></span><span className="settings" aria-label="页面设置"><SettingsIcon /></span></div>
    <main className="orbit-main control-main">
      <section className="page-heading"><span className="heading-mark" /><div><h1>{title}</h1>{isStrategy && <p>选择卫星并使用当前轨道，配置高度修正后发起计算。</p>}</div></section>
      {state === 'normal' ? <>
        {isStrategy ? <StrategyForm input={input} onChange={updateInput} /> : <ThrusterForm />}
        {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
        <div className="control-actions"><button className="secondary-button" type="button" onClick={reset}>重置</button><button className="primary-button" type="button" onClick={beginAction}>{primary}</button></div>
      </> : <PrototypePageStateView state={state} />}
    </main>
    {confirmOpen && <div className="dialog-backdrop dialog-layer" role="presentation"><section className="dialog confirm-dialog" role="dialog" aria-modal="true" aria-label={primary + '确认'}>
      <header className="dialog-header"><h2>{primary}确认</h2><button className="close-button" type="button" aria-label="关闭" onClick={() => setConfirmOpen(false)}><CloseIcon /></button></header>
      <div className="dialog-body"><p>{isStrategy ? '确认按当前条件发起轨控策略计算？' : '确认覆盖当前推力器能力参数？'}</p></div>
      <footer className="dialog-footer"><button className="secondary-button" type="button" onClick={() => setConfirmOpen(false)}>取消</button><button className="primary-button" type="button" onClick={() => { setConfirmOpen(false); setFeedback(isStrategy ? '轨控计算已确认，执行结果待确认。' : '能力参数覆盖已确认，保存结果待确认。') }}>确认</button></footer>
    </section></div>}
  </section>
}

function StrategyForm({ input, onChange }: {
  input: StrategyInput
  onChange: (patch: Partial<StrategyInput>) => void
}) {
  const selectedOrbit = currentOrbitInputs.find(item => item.satellite === input.satellite)
  const calibration = thrusterCalibrations.find(item => item.satellite === input.satellite)

  return <div className="control-layout">
    <section className="control-section"><h2>计算输入</h2>
      <div className="control-mode-row"><Field label="发起方式"><input readOnly className="control-readonly" value="直接使用当前轨道" /></Field></div>
      <div className="control-grid strategy-input-grid">
        <Field label="参与计算卫星"><select value={input.satellite} onChange={event => onChange({ satellite: event.target.value })}><option value="">请选择</option>{currentOrbitInputs.map(item => <option key={item.satellite} value={item.satellite}>{item.satellite}</option>)}</select></Field>
        <Field label="当前轨道"><input readOnly className="control-readonly" value={selectedOrbit?.orbitId ?? ''} placeholder="选择参与计算卫星后自动带入" /></Field>
        <Field label="轨道历元（北京时间）"><input readOnly className="control-readonly" value={selectedOrbit?.epoch ?? ''} placeholder="选择参与计算卫星后自动带入" /></Field>
        <Field label="当前轨道高度（km）"><input readOnly className="control-readonly" value={selectedOrbit?.altitudeKm ?? ''} placeholder="自动带入" /></Field>
        <Field label="当前双星距离（km）"><input readOnly className="control-readonly" value={selectedOrbit?.pairDistanceKm ?? ''} placeholder="自动带入" /></Field>
        <Field label="数据源"><input readOnly className="control-readonly" value={selectedOrbit?.source ?? ''} placeholder="自动带入" /></Field>
      </div>
    </section>
    <section className="control-section"><h2>轨控目标配置</h2><div className="control-grid strategy-target-grid">
      <Field label="目标轨道"><select value={input.targetOrbit} onChange={event => onChange({ targetOrbit: event.target.value as StrategyInput['targetOrbit'] })}><option value="nominal">标称轨道高度</option><option value="custom">自定义</option></select></Field>
      <Field label="轨控目标"><input readOnly className="control-readonly" value="高度修正" /></Field>
      <Field label="修正高度（m）"><input inputMode="decimal" value={input.correction} placeholder="可输入正数或负数" onChange={event => onChange({ correction: event.target.value })} /></Field>
      <Field label="高度残差（m）"><input inputMode="decimal" value={input.residual} placeholder="请输入" onChange={event => onChange({ residual: event.target.value })} /></Field>
    </div></section>
    <section className="control-section"><h2>轨控计算包</h2><p className="source-value">使用轨控计算包：K7F3A9C2_R260731.ocpkg</p></section>
    <section className="control-section"><h2>电推进器能力与计算约束</h2>{calibration ? <>
      <h3 className="control-calibration-title">{calibration.satellite}（{calibration.satelliteCode}）电推进器参数</h3>
      <div className="control-grid strategy-calibration-grid">
        <Field label="推进类型"><input readOnly className="control-readonly" value={calibration.propulsionType} /></Field>
        <Field label="标称推力（mN）"><input readOnly className="control-readonly" value={calibration.nominalThrustMn} /></Field>
        <Field label="推力标定系数"><input readOnly className="control-readonly" value={calibration.calibrationFactor} /></Field>
        <Field label="有效推力（mN）"><input readOnly className="control-readonly" value={calibration.effectiveThrustMn} /></Field>
        <Field label="比冲（s）"><input readOnly className="control-readonly" value={calibration.specificImpulseSeconds} /></Field>
        <Field label="单次推进最大时长（s）"><input readOnly className="control-readonly" value={calibration.maxSingleBurnSeconds} /></Field>
      </div>
    </> : <p className="source-value">{input.satellite ? '未找到该卫星的推力器标定信息，请人工确认。' : '选择参与计算卫星后自动带入。'}</p>}</section>
  </div>
}

function ThrusterForm() {
  const [satellite, setSatellite] = useState(thrusterCalibrations[0].satellite)
  const calibration = thrusterCalibrations.find(item => item.satellite === satellite) ?? thrusterCalibrations[0]
  return <div className="control-layout"><p className="source-intro">每颗卫星仅配置一台电推进器。系统保留当前卫星最后一次保存的能力参数，并从下一次轨控计算开始使用。</p><section className="control-section"><h2>电推进器能力配置</h2><div className="control-grid">
    <Field label="当前卫星"><select value={satellite} onChange={event => setSatellite(event.target.value)}>{thrusterCalibrations.map(item => <option key={item.satellite}>{item.satellite}</option>)}</select></Field><Field label="推进类型"><input value={calibration.propulsionType} readOnly /></Field><Field label="标称推力（mN）"><input key={satellite + '-thrust'} defaultValue={calibration.nominalThrustMn} /></Field><Field label="比冲（s）"><input key={satellite + '-impulse'} defaultValue={calibration.specificImpulseSeconds} /></Field><Field label="单次推进最大时长（s）"><input key={satellite + '-duration'} defaultValue={calibration.maxSingleBurnSeconds} /></Field><Field label="推力标定系数"><input key={satellite + '-factor'} defaultValue={calibration.calibrationFactor} /></Field><Field label="有效推力（mN）"><input key={satellite + '-effective'} defaultValue={calibration.effectiveThrustMn} /></Field><Field label="标定说明"><textarea placeholder="请输入" /></Field>
  </div></section></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="control-field"><span>{label}</span>{children}</label> }
