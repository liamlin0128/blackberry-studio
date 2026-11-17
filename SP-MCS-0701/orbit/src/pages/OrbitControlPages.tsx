import { useState } from 'react'
import { PrototypePageStateView, type PrototypePageState } from '../components/ui/PrototypePageState'
import { CloseIcon, SettingsIcon } from '../components/ui/SystemIcons'

type Props = { type: 'strategy' | 'thruster'; state: PrototypePageState }

export function OrbitControlPage({ type, state }: Props) {
  const isStrategy = type === 'strategy'
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const title = isStrategy ? '轨控策略计算' : '推力器标定管理'
  const primary = isStrategy ? '开始计算' : '保存'

  return <section className="workspace">
    <div className="page-tabs"><span className="active-tab">{title} <small aria-hidden="true"><CloseIcon size={14} /></small></span><span className="settings" aria-label="页面设置"><SettingsIcon /></span></div>
    <main className="orbit-main control-main">
      <section className="page-heading"><span className="heading-mark" /><div><h1>{title}</h1>{isStrategy && <p>可引用轨道保持监测结果，也可选择一颗或两颗参与计算卫星，并自动使用对应最新轨道发起计算。</p>}</div></section>
      {state === 'normal' ? <>
        {isStrategy ? <StrategyForm onReferenceQuery={() => setFeedback('可引用的监测记录范围待确认。')} /> : <ThrusterForm />}
        {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
        <div className="control-actions"><button className="secondary-button" type="button" onClick={() => window.location.reload()}>重置</button><button className="primary-button" type="button" onClick={() => setConfirmOpen(true)}>{primary}</button></div>
      </> : <PrototypePageStateView state={state} />}
    </main>
    {confirmOpen && <div className="dialog-backdrop dialog-layer" role="presentation"><section className="dialog confirm-dialog" role="dialog" aria-modal="true" aria-label={`${primary}确认`}><header className="dialog-header"><h2>{primary}确认</h2><button className="close-button" type="button" aria-label="关闭" onClick={() => setConfirmOpen(false)}><CloseIcon /></button></header><div className="dialog-body"><p>{isStrategy ? '确认按当前条件发起轨控策略计算？' : '确认覆盖当前推力器能力参数？'}</p></div><footer className="dialog-footer"><button className="secondary-button" type="button" onClick={() => setConfirmOpen(false)}>取消</button><button className="primary-button" type="button" onClick={() => { setConfirmOpen(false); setFeedback(isStrategy ? '轨控计算已确认，执行结果待确认。' : '能力参数覆盖已确认，保存结果待确认。') }}>确认</button></footer></section></div>}
  </section>
}

function StrategyForm({ onReferenceQuery }: { onReferenceQuery: () => void }) {
  return <div className="control-layout">
    <section className="control-section"><h2>计算输入</h2><div className="control-grid">
      <Field label="发起方式"><select defaultValue="引用轨道保持监测结果"><option>引用轨道保持监测结果</option></select></Field>
      <Field label="引用记录"><button className="secondary-button compact" type="button" onClick={onReferenceQuery}>查询</button></Field>
      <Field label="参与计算卫星"><select><option>请选择</option><option>木铎1A</option><option>木铎1B</option></select></Field>
      <Field label="触发类型"><input value="待确认" readOnly /></Field><Field label="触发值"><input placeholder="请输入" /></Field><Field label="触发窗口"><input placeholder="请输入" /></Field><Field label="数据源"><input placeholder="请输入" /></Field>
    </div></section>
    <section className="control-section"><h2>轨控目标配置</h2><div className="control-grid">
      <Field label="目标轨道"><select defaultValue="标称轨道"><option>标称轨道</option></select></Field><Field label="轨控目标"><select defaultValue="组合修正"><option>组合修正</option></select></Field>
      <Field label="目标高度（km）"><input placeholder="请输入" /></Field><Field label="目标双星距离（km）"><input placeholder="请输入" /></Field><Field label="高度残余偏差（km）"><input placeholder="请输入" /></Field><Field label="距离残余偏差（km）"><input placeholder="请输入" /></Field>
    </div></section>
    <section className="control-section"><h2>轨控计算包</h2><p className="source-value">使用轨控计算包：K7F3A9C2_R260731.ocpkg</p><h3>电推进器能力与计算约束</h3><p className="pending-note">计算约束的细化字段未在导出材料中确认，待确认。</p></section>
  </div>
}

function ThrusterForm() {
  return <div className="control-layout"><p className="source-intro">每颗卫星仅配置一台电推进器。系统保留当前卫星最后一次保存的能力参数，并从下一次轨控计算开始使用。</p><section className="control-section"><h2>电推进器能力配置</h2><div className="control-grid">
    <Field label="当前卫星"><select defaultValue="木铎1A"><option>木铎1A</option><option>木铎1B</option></select></Field><Field label="推进类型"><input value="电推进" readOnly /></Field><Field label="标称推力（mN）"><input defaultValue="4" /></Field><Field label="比冲（s）"><input defaultValue="500" /></Field><Field label="单次推进最大时长（s）"><input placeholder="请输入" /></Field><Field label="推力标定系数"><input placeholder="请输入" /></Field><Field label="有效推力（mN）"><input placeholder="请输入" /></Field><Field label="标定说明"><textarea placeholder="请输入" /></Field>
  </div></section></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="control-field"><span>{label}</span>{children}</label> }
