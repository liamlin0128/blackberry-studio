# 阶段 4 页面验收清单

## 统一验收方式

所有页面均保留正常访问路径，并支持以下原型验收状态：

| 状态 | 访问方式 | 页面表现 |
| --- | --- | --- |
| 正常 | 默认路由 | 展示已取证的字段、入口和列表结构；未取得业务结果时明确标注“待确认”。 |
| 加载 | `?state=loading` | 展示数据加载中状态。 |
| 空 | `?state=empty` | 展示“暂无数据（待确认）”，不虚构空态操作结果。 |
| 错误 | `?state=error` | 展示错误状态和“重试”入口；服务端错误文案标注待确认。 |
| 无权限 | `?state=forbidden` | 展示访问边界待确认状态，不假定真实角色或权限规则。 |
| 确认 | 见下表 | 仅对会触发计算、监测、导入、删除或参数覆盖的动作提供确认弹层。 |

## 路由逐页清单

| 路由 | 页面 | 正常 | 加载 | 空 | 错误 | 无权限 | 确认状态 / 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/app/mccs/orbitsys/orbit/track-manage` | 轨道管理 | ✓ | ✓ | ✓ | ✓ | ✓ | 开始计算需确认；手动输入保存后新增当前卫星历史轨道。 |
| `/app/mccs/orbitsys/orbit/orbital-mechanics` | 轨道计算 | ✓ | ✓ | ✓ | ✓ | ✓ | 计算业务入口及结果口径待确认。 |
| `/app/mccs/orbitsys/orbit/list` | GNSS数据 | 待确认页 | ✓ | ✓ | ✓ | ✓ | 原始业务字段未取证，不虚构处理流程。 |
| `/app/mccs/orbitsys/orbit/precise-record` | 精密定轨记录 | ✓ | ✓ | ✓ | ✓ | ✓ | 详情入口保留；详情字段待确认。 |
| `/app/mccs/orbitsys/orbit/determination` | 事后精密定轨 | ✓ | ✓ | ✓ | ✓ | ✓ | 定轨计算入口和执行结果待确认。 |
| `/app/mccs/orbitsys/aid/ephemeris` | 星历预报 | ✓ | ✓ | ✓ | ✓ | ✓ | 手动触发需确认。 |
| `/app/mccs/orbitsys/aid/remote-orbit` | 对端星轨道计算 | 待确认页 | ✓ | ✓ | ✓ | ✓ | 业务字段和执行规则待确认。 |
| `/app/mccs/orbitsys/aid/bds` | 北斗亚太过境预报 | ✓ | ✓ | ✓ | ✓ | ✓ | 手动触发需确认。 |
| `/app/mccs/orbitsys/aid/device` | 设备跟踪预报 | ✓ | ✓ | ✓ | ✓ | ✓ | 手动触发需确认。 |
| `/app/mccs/orbitsys/aid/ems` | 地月影预报 | ✓ | ✓ | ✓ | ✓ | ✓ | 手动触发需确认。 |
| `/app/mccs/orbitsys/aid/coordinate` | 坐标转换 | 待确认页 | ✓ | ✓ | ✓ | ✓ | 转换字段、格式与结果口径待确认。 |
| `/app/mccs/orbitsys/aid/time` | 时间转换 | ✓ | ✓ | ✓ | ✓ | ✓ | 转换结果口径待确认；不作为高风险操作。 |
| `/app/mccs/orbitsys/control/orbit-strategy` | 轨控策略计算 | ✓ | ✓ | ✓ | ✓ | ✓ | 开始计算需确认；执行结果待确认。 |
| `/app/mccs/orbitsys/control/orbit-warning` | 轨道保持监测 | ✓ | ✓ | ✓ | ✓ | ✓ | 开始监测需确认。 |
| `/app/mccs/orbitsys/control/thruster` | 推力器标定管理 | ✓ | ✓ | ✓ | ✓ | ✓ | 保存能力参数覆盖前需确认。 |
| `/app/mccs/orbitsys/control/orbit-result` | 轨控计算结果 | ✓ | ✓ | ✓ | ✓ | ✓ | 详情字段及结果来源待确认。 |
| `/app/mccs/orbitsys/collision/warning` | 碰撞预警 | ✓ | ✓ | ✓ | ✓ | ✓ | 配置字段与告警处置流程待确认。 |
| `/app/mccs/orbitsys/collision/celestial` | 天体数据 | ✓ | ✓ | ✓ | ✓ | ✓ | 批量删除、数据导入需确认。 |

## 已知覆盖边界

- 全量菜单页面由路由表和共用页面状态壳层驱动，避免各页面自行实现状态文案造成偏差。
- “待确认”只用于证据未覆盖的字段、服务端结果、权限边界和业务流程；不作为用户可见的模拟提示条。
- 高风险操作只确认用户的提交意图，确认后的业务执行结论不作虚构，统一标注为待确认。
