export type PrototypePageState = 'normal' | 'loading' | 'empty' | 'error' | 'forbidden'

type Props = {
  state: Exclude<PrototypePageState, 'normal'>
}

const copy = {
  loading: '数据加载中',
  empty: '暂无数据（待确认）',
  error: '服务端错误反馈待确认',
  forbidden: '当前账号的访问权限边界待确认',
} as const

export function PrototypePageStateView({ state }: Props) {
  return <section className={`page-state ${state}`} role={state === 'error' || state === 'forbidden' ? 'alert' : 'status'}>
    <strong>{copy[state]}</strong>
    {state === 'error' && <button className="secondary-button" type="button" onClick={() => window.location.assign(window.location.pathname)}>重试</button>}
  </section>
}
