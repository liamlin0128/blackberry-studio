import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SatelliteSnapshot } from '@/types/operations'

const statusVariant = {
  正常: 'secondary',
  跟踪中: 'default',
  告警: 'destructive',
} as const

export function TelemetryTable({ rows }: { rows: SatelliteSnapshot[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>卫星</TableHead><TableHead>轨道</TableHead><TableHead>状态</TableHead>
          <TableHead className="text-right">仰角</TableHead><TableHead className="text-right">距离</TableHead>
          <TableHead className="text-right">下行频率</TableHead><TableHead>更新时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell><div className="font-medium">{row.name}</div><div className="text-xs text-muted-foreground">{row.id}</div></TableCell>
            <TableCell>{row.orbit}</TableCell>
            <TableCell><Badge variant={statusVariant[row.status]}>{row.status}</Badge></TableCell>
            <TableCell className="text-right tabular-nums">{row.elevationDeg.toFixed(1)}°</TableCell>
            <TableCell className="text-right tabular-nums">{row.rangeKm.toLocaleString()} km</TableCell>
            <TableCell className="text-right tabular-nums">{row.downlinkMHz.toFixed(1)} MHz</TableCell>
            <TableCell className="text-muted-foreground">{row.updatedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
