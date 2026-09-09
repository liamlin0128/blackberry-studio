import { ActivityIcon, CalendarClockIcon, RadioTowerIcon, SatelliteIcon } from 'lucide-react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OperationsOverview } from '@/pages/OperationsOverview'
import './App.css'

const navigation = [
  { label: '运行总览', icon: ActivityIcon },
  { label: '任务计划', icon: CalendarClockIcon },
  { label: '遥测监视', icon: RadioTowerIcon },
]

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh bg-muted/40 text-foreground">
        <aside className="hidden w-60 shrink-0 border-r bg-background lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b px-5">
            <SatelliteIcon aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">__PRODUCT_TITLE__</p>
              <p className="text-xs text-muted-foreground">测运控原型</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 p-3" aria-label="主导航">
            {navigation.map(({ label, icon: Icon }, index) => (
              <Button asChild className="justify-start" key={label} variant={index === 0 ? 'secondary' : 'ghost'}>
                <NavLink to="/">
                  <Icon data-icon="inline-start" />
                  {label}
                </NavLink>
              </Button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
            <div>
              <h1 className="font-heading text-lg font-semibold">卫星运行控制台</h1>
              <p className="text-xs text-muted-foreground">UTC+8 · 模拟数据</p>
            </div>
            <Badge variant="outline">原型环境</Badge>
          </header>
          <main className="p-4 md:p-6">
            <Routes>
              <Route path="*" element={<OperationsOverview />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
