import { useEffect, useState } from 'react'
import './App.css'
import { SystemHeader } from './components/shell/SystemHeader'
import { SystemSidebar } from './components/shell/SystemSidebar'
import { OrbitTrackManagePage } from './pages/OrbitTrackManagePage'
import { OrbitModulePage } from './pages/OrbitModulePage'
import { OrbitControlPage } from './pages/OrbitControlPages'
import { CoordinateConverterPage, TimeConverterPage } from './pages/ConversionPages'
import { moduleForRoute, specialRoutes } from './mocks/orbitModules'
import type { PrototypePageState } from './components/ui/PrototypePageState'
import { is0701 } from './version'

function App() {
  const [route, setRoute] = useState(() => window.location.pathname === '/' ? '/app/mccs/orbitsys/orbit/track-manage' : window.location.pathname)
  useEffect(() => { const update = () => setRoute(window.location.pathname); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update) }, [])
  const navigate = (next: string) => { window.history.pushState({}, '', next); setRoute(next) }
  const state = new URLSearchParams(window.location.search).get('state') as PrototypePageState | null
  const module = moduleForRoute(route)
  const excluded = is0701 && (route.includes('/control/') || route.includes('/collision/') || ['precise-record', 'determination', 'remote-orbit', 'bds'].some((segment) => route.endsWith(`/${segment}`)))
  return <div className="orbit-shell">
    <SystemHeader />
    <SystemSidebar currentRoute={route} onNavigate={navigate} />
    {excluded ? <main style={{ padding: 32 }}><h1>SP-MCS-0701 不提供此功能</h1><p>该功能在标准版保留。</p></main> : route === '/app/mccs/orbitsys/orbit/track-manage' ? <OrbitTrackManagePage state={state ?? 'normal'} /> : route === '/app/mccs/orbitsys/aid/coordinate' ? <CoordinateConverterPage state={state ?? 'normal'} /> : route === '/app/mccs/orbitsys/aid/time' ? <TimeConverterPage state={state ?? 'normal'} /> : module ? <OrbitModulePage module={module} state={state ?? 'normal'} /> : route === specialRoutes.strategy.route ? <OrbitControlPage type="strategy" state={state ?? 'normal'} /> : route === specialRoutes.thruster.route ? <OrbitControlPage type="thruster" state={state ?? 'normal'} /> : <OrbitModulePage module={{ key: 'not-found', route, label: '页面待确认', section: '辅助计算', filters: [], actions: [], columns: [], rows: [], pending: '未找到可确认的页面证据。' }} state="normal" />}
  </div>
}

export default App
