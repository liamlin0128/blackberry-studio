import { useRef, useState } from 'react'
import { CloseIcon, SettingsIcon } from '../components/ui/SystemIcons'
import { PrototypePageStateView, type PrototypePageState } from '../components/ui/PrototypePageState'
import { CART_FIELDS, convertOrbit, KEPLER_FIELDS, SYSTEM_LABELS, type System, type TargetSystem, type Values } from '../features/conversion/orbit'
import { clockInput, convertTime, parseClock, type InputScale } from '../features/conversion/time'
import './ConversionPages.css'

type Props = { state: PrototypePageState }

function Frame({ title, state, children }: Props & { title: string; children: React.ReactNode }) {
  return <section className="workspace"><div className="page-tabs"><span className="active-tab">{title} <small aria-hidden="true"><CloseIcon size={14} /></small></span><span className="settings" aria-label="页面设置"><SettingsIcon /></span></div><main className="orbit-main module-main conversion-main"><section className="page-heading"><span className="heading-mark" /><h1>{title}</h1></section>{state === 'loading' || state === 'error' || state === 'forbidden' ? <PrototypePageStateView state={state} /> : children}</main></section>
}

async function copyText(value: string, done: (message: string) => void) {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value)
    else {
      const field = document.createElement('textarea')
      field.value = value
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      const copied = document.execCommand('copy')
      field.remove()
      if (!copied) throw new Error('复制失败')
    }
    done('已复制到剪贴板。')
  } catch { done('复制失败，请检查浏览器剪贴板权限。') }
}

export function CoordinateConverterPage({ state }: Props) {
  const [source, setSource] = useState<System>('kepler')
  const [target, setTarget] = useState<TargetSystem>('j2000')
  const [epoch, setEpoch] = useState(clockInput())
  const [values, setValues] = useState<Values>({})
  const [result, setResult] = useState<number[] | null>(null)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const sourceFields = source === 'kepler' ? KEPLER_FIELDS : CART_FIELDS
  const targetFields = target === 'kepler' || target === 'orbit-elements' ? KEPLER_FIELDS : CART_FIELDS
  const updateSource = (next: System) => { setSource(next); setValues({}); setResult(null); setMessage('') }
  const updateTarget = (next: TargetSystem) => { setTarget(next); setResult(null); setMessage('') }
  const run = () => { try { setResult(convertOrbit(source, target, values, epoch)); setMessage('') } catch (error) { setResult(null); setMessage(error instanceof Error ? error.message : '转换失败。') } }
  const importFile = async (file?: File) => {
    if (!file) return
    try {
      const data: unknown = JSON.parse(await file.text())
      if (!data || typeof data !== 'object') throw new Error('文件内容不是坐标数据。')
      const record = data as { system?: string; epoch?: string; values?: Record<string, unknown> }
      if (!record.system || !['kepler', 'j2000', 'wgs84'].includes(record.system) || !record.values || typeof record.values !== 'object') throw new Error('需要 system、epoch 和 values 字段。')
      updateSource(record.system as System)
      setEpoch(record.epoch ?? '')
      setValues(Object.fromEntries(Object.entries(record.values).map(([key, value]) => [key, String(value)])))
      setMessage('数据已导入，请核对后转换。')
    } catch (error) { setMessage(error instanceof Error ? `导入失败：${error.message}` : '导入失败。') }
    if (fileRef.current) fileRef.current.value = ''
  }
  const resultText = result ? Object.fromEntries(targetFields.map(([key], index) => [key, +result[index].toFixed(key === 'e' ? 9 : 6)])) : null
  return <Frame title="坐标转换" state={state}>
    <p className="conversion-intro">输入轨道根数或位置与速度，在指定历元进行坐标转换。</p>
    <section className="conversion-card" aria-label="源坐标输入"><header><h2>源坐标</h2><div className="conversion-tools"><input ref={fileRef} type="file" accept=".json,application/json" hidden aria-label="导入坐标 JSON" onChange={(event) => void importFile(event.target.files?.[0])} /><button className="secondary-button compact" type="button" onClick={() => fileRef.current?.click()}>导入</button><button className="secondary-button compact" type="button" onClick={() => void copyText(JSON.stringify({ system: source, epoch, values }, null, 2), setMessage)}>复制</button></div></header>
      <div className="conversion-grid"><label className="conversion-field">源系统 <span className="required">*</span><select value={source} onChange={(event) => updateSource(event.target.value as System)}>{(['kepler', 'j2000', 'wgs84'] as const).map((key) => <option key={key} value={key}>{SYSTEM_LABELS[key]}</option>)}</select></label>
      {sourceFields.map(([key, label, unit]) => <label className="conversion-field" key={key}>{label}{unit && <span className="field-unit">（{unit}）</span>} <span className="required">*</span><input type="number" step="any" value={values[key] ?? ''} placeholder="请输入" onChange={(event) => { setValues({ ...values, [key]: event.target.value }); setResult(null) }} /></label>)}
      <label className="conversion-field">历元时刻（北京时间 UTC+8） <span className="required">*</span><input type="datetime-local" step="1" value={epoch} onChange={(event) => { setEpoch(event.target.value); setResult(null) }} /></label></div>
      <p className="conversion-note">WGS84 输入与输出为地固直角坐标（km、km/s）。导入文件使用 JSON：system、epoch、values。</p>
    </section>
    <div className="conversion-action"><button className="primary-button" type="button" onClick={run}>转换</button></div>
    <section className="conversion-card" aria-label="目标坐标输出"><header><h2>转换结果</h2><button className="secondary-button compact" type="button" disabled={!resultText} onClick={() => resultText && void copyText(JSON.stringify({ system: target, epoch, values: resultText }, null, 2), setMessage)}>复制</button></header>
      <div className="conversion-grid"><label className="conversion-field">目标系统<select value={target} onChange={(event) => updateTarget(event.target.value as TargetSystem)}>{(['kepler', 'j2000', 'wgs84', 'orbit-elements'] as const).map((key) => <option key={key} value={key}>{SYSTEM_LABELS[key]}</option>)}</select></label>
      {targetFields.map(([key, label, unit], index) => <label className="conversion-field" key={key}>{label}{unit && <span className="field-unit">（{unit}）</span>}<output className="conversion-output">{result ? result[index].toFixed(key === 'e' ? 9 : 6) : '—'}</output></label>)}</div>
      {target === 'orbit-elements' && <p className="conversion-note">当前输出为六个经典轨道根数；专用轨道根数记录格式待确认。</p>}
    </section>
    <p className="conversion-caveat">计算说明：采用两体椭圆轨道模型；J2000 与 WGS84 地固系间使用近似恒星时旋转，未计入岁差、章动、极移及 UT1−UTC。结果仅供原型流程验证，不用于精密定轨或指令计算。</p>
    {message && <p className="inline-feedback" role={result ? 'status' : 'alert'}>{message}</p>}
  </Frame>
}

export function TimeConverterPage({ state }: Props) {
  const [scale, setScale] = useState<InputScale>('BJT')
  const [time, setTime] = useState(clockInput())
  const [result, setResult] = useState<readonly (readonly [string, string])[] | null>(null)
  const [message, setMessage] = useState('')
  const run = () => { try { setResult(convertTime(parseClock(time, scale))); setMessage('') } catch (error) { setResult(null); setMessage(error instanceof Error ? error.message : '转换失败。') } }
  return <Frame title="时间转换" state={state}>
    <p className="conversion-intro">选择输入时间尺度，转换为常用授时与天文时间表示。</p>
    <section className="conversion-card time-source" aria-label="时间输入"><div className="conversion-grid"><label className="conversion-field">时间格式<select value={scale} onChange={(event) => { setScale(event.target.value as InputScale); setResult(null) }}><option value="BJT">BJT（北京时间 UTC+8）</option><option value="UTC">UTC</option></select></label><label className="conversion-field">时间点<input type="datetime-local" step="1" value={time} onChange={(event) => { setTime(event.target.value); setResult(null) }} /></label><button className="primary-button time-convert-button" type="button" onClick={run}>转换</button></div></section>
    {message && <p className="inline-feedback" role="alert">{message}</p>}
    <section className="conversion-card" aria-label="时间转换结果"><header><h2>输出结果</h2></header>{result ? <dl className="time-result-grid">{result.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl> : <div className="conversion-empty">输入时间后点击“转换”查看结果。</div>}</section>
    <p className="conversion-caveat">计算说明：BJT 固定为 UTC+8；闰秒采用 2017—2026 年 TAI−UTC = 37 s。JD/MJD 以 UTC 计算；TDB、TCB 为近似值，未接入实时天文星历。超出闰秒有效范围会阻止计算。</p>
  </Frame>
}
