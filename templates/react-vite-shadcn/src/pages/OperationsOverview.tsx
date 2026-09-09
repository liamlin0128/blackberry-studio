import { AlertTriangleIcon, PlusIcon } from 'lucide-react'

import { TelemetryTable } from '@/components/ops/TelemetryTable'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { satelliteSnapshots } from '@/mocks/satellites'

const metrics = [
  { title: '在管卫星', value: '12', detail: '11 正常 · 1 告警' },
  { title: '当前测控任务', value: '3', detail: '2 执行中 · 1 待执行' },
  { title: '今日可见弧段', value: '26', detail: '下一弧段 14:48 UTC+8' },
]

export function OperationsOverview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-heading text-2xl font-semibold">运行总览</h2><p className="mt-1 text-sm text-muted-foreground">监视星座状态、测控任务和实时遥测摘要。</p></div>
        <Dialog>
          <DialogTrigger asChild><Button><PlusIcon data-icon="inline-start" />新建测控任务</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>创建模拟测控任务</DialogTitle><DialogDescription>该操作只写入原型本地状态，不会下发真实指令。</DialogDescription></DialogHeader>
            <Alert><AlertTriangleIcon /><AlertTitle>命令确认示例</AlertTitle><AlertDescription>正式原型应在这里展示目标卫星、地面站、时间窗和指令摘要。</AlertDescription></Alert>
            <DialogFooter><DialogClose asChild><Button variant="outline">取消</Button></DialogClose><DialogClose asChild><Button>确认创建</Button></DialogClose></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => <Card key={metric.title} size="sm"><CardHeader><CardDescription>{metric.title}</CardDescription><CardTitle className="text-2xl tabular-nums">{metric.value}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">{metric.detail}</CardContent></Card>)}
      </div>

      <Tabs defaultValue="telemetry">
        <TabsList variant="line"><TabsTrigger value="telemetry">遥测快照</TabsTrigger><TabsTrigger value="tasks">任务状态</TabsTrigger><TabsTrigger value="alerts">告警</TabsTrigger></TabsList>
        <TabsContent value="telemetry"><Card><CardHeader><CardTitle>卫星遥测快照</CardTitle><CardDescription>示例数据用于验证表格密度、单位和状态表达。</CardDescription></CardHeader><CardContent><TelemetryTable rows={satelliteSnapshots} /></CardContent></Card></TabsContent>
        <TabsContent value="tasks"><Card><CardHeader><CardTitle>任务状态</CardTitle><CardDescription>在真实产品中放置测控计划、执行进度和时间窗。</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground">当前没有需要人工介入的任务。</CardContent></Card></TabsContent>
        <TabsContent value="alerts"><Alert variant="destructive"><AlertTriangleIcon /><AlertTitle>试验十三号链路质量下降</AlertTitle><AlertDescription>下行信噪比连续 3 个采样周期低于模拟阈值。</AlertDescription></Alert></TabsContent>
      </Tabs>
    </div>
  )
}
