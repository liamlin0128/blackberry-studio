import { useMemo, useState } from 'react'
import { CloseIcon, SettingsIcon } from '../components/ui/SystemIcons'
import { PrototypePageStateView, type PrototypePageState } from '../components/ui/PrototypePageState'
import type { OrbitModule } from '../mocks/orbitModules'

type Props = { module: OrbitModule; state: PrototypePageState }

const highRiskActions = new Set(['手动触发', '开始监测', '批量删除', '数据导入'])

export function OrbitModulePage({ module, state }: Props) {
  const [keyword, setKeyword] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const visibleRows = useMemo(() => keyword ? module.rows.filter((row) => Object.values(row).some((value) => value.includes(keyword))) : module.rows, [keyword, module.rows])
  const noData = state === 'empty' || visibleRows.length === 0

  const runAction = (action: string) => {
    if (highRiskActions.has(action)) return setConfirmAction(action)
    if (action === '查询') return undefined
    if (action === '重置') { setKeyword(''); return undefined }
    if (action === '导出' || action === '下载') { setFeedback('导出文件格式与服务端反馈待确认。'); return undefined }
    if (action === '预报配置' || action === '监控设置' || action === '碰撞预警配置') { setFeedback(`${action}的详细配置字段待确认。`); return undefined }
    if (action === '新增') { setFeedback('新增表单字段与校验规则待确认。'); return undefined }
    if (action === '转换') { setFeedback('转换结果口径与服务端反馈待确认。'); return undefined }
  }

  return <section className="workspace">
    <div className="page-tabs"><span className="active-tab">{module.label} <small aria-hidden="true"><CloseIcon size={14} /></small></span><span className="settings" aria-label="页面设置"><SettingsIcon /></span></div>
    <main className="orbit-main module-main">
      <section className="page-heading"><span className="heading-mark" /><div><h1>{module.label}</h1>{module.pending && <p className="pending-note">{module.pending}</p>}</div></section>
      {state === 'loading' || state === 'error' || state === 'forbidden' ? <PrototypePageStateView state={state} /> : <>
        {module.filters.length > 0 && <section className="filter-panel module-filter" aria-label={`${module.label}查询条件`}>
          {module.filters.map((label) => <label key={label}>{label}<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={label.includes('时间') ? '开始时间 至 结束时间' : '请输入'} /></label>)}
          <div className="filter-actions"><button className="primary-button" type="button" onClick={() => runAction('查询')}>查询</button><button className="secondary-button" type="button" onClick={() => runAction('重置')}>重置</button></div>
        </section>}
        {module.key === 'post-precision' && <div className="workflow-steps" aria-label="事后精密定轨流程"><span className="is-current">1 原始观测测量数据选择</span><span>2 定轨数据选择</span><span>3 辅助数据上传</span><span>4 定轨计算</span></div>}
        {module.key === 'time' && <section className="converter-form"><label>时间格式<select><option>BJT</option></select></label><label>时间点<input placeholder="请选择" type="datetime-local" /></label><button className="primary-button" type="button" onClick={() => runAction('转换')}>转换</button></section>}
        <div className="table-toolbar"><div>{module.actions?.filter((action) => !['查询', '重置'].includes(action)).map((action) => <button className={highRiskActions.has(action) ? 'primary-button compact' : 'secondary-button compact'} type="button" key={action} onClick={() => runAction(action)}>{action}</button>)}</div><span>时间：北京时间（UTC+8）</span></div>
        {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
        {module.columns.length > 0 && <section className="table-card" aria-label={`${module.label}数据表`}>
          <div className="table-scroll"><table className="data-table"><thead><tr>{module.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>操作</th></tr></thead><tbody>
            {!noData && visibleRows.map((row, index) => <tr key={`${row.id ?? row.sequence ?? index}`}>
              {module.columns.map((column) => <td key={column.key}>{row[column.key] ?? '—'}</td>)}
              <td><button className="text-button" type="button" onClick={() => setDetailOpen(true)}>查看</button></td>
            </tr>)}
          </tbody></table></div>
          {noData && <div className="empty-state">暂无数据（待确认）</div>}
        </section>}
      </>}
    </main>
    {detailOpen && <DetailDialog module={module} onClose={() => setDetailOpen(false)} />}
    {confirmAction && <ConfirmDialog action={confirmAction} onClose={() => setConfirmAction(null)} onConfirm={() => { setConfirmAction(null); setFeedback(`${confirmAction}已确认，执行结果待确认。`) }} />}
  </section>
}

function DetailDialog({ module, onClose }: { module: OrbitModule; onClose: () => void }) {
  const fields = module.detailFields ?? [['记录信息', '待确认']]
  return <div className="dialog-backdrop dialog-layer" role="presentation"><section className="dialog module-detail-dialog" role="dialog" aria-modal="true" aria-label={module.detailTitle ?? `${module.label}详情`}><header className="dialog-header"><h2>{module.detailTitle ?? `${module.label}详情`}</h2><button className="close-button" aria-label="关闭" type="button" onClick={onClose}><CloseIcon /></button></header><div className="dialog-body"><dl className="result-grid">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><footer className="dialog-footer"><button className="primary-button" type="button" onClick={onClose}>关闭</button></footer></section></div>
}

function ConfirmDialog({ action, onClose, onConfirm }: { action: string; onClose: () => void; onConfirm: () => void }) {
  return <div className="dialog-backdrop dialog-layer" role="presentation"><section className="dialog confirm-dialog" role="dialog" aria-modal="true" aria-label={`${action}确认`}><header className="dialog-header"><h2>{action}确认</h2><button className="close-button" aria-label="关闭" type="button" onClick={onClose}><CloseIcon /></button></header><div className="dialog-body"><p>该操作将发起业务处理，请确认后继续。</p></div><footer className="dialog-footer"><button className="secondary-button" type="button" onClick={onClose}>取消</button><button className="primary-button" type="button" onClick={onConfirm}>确认</button></footer></section></div>
}
