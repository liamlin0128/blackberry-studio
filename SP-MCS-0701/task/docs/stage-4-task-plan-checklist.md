# 阶段 4 · 任务计划管理验收清单

日期：2026-09-11  
证据来源：用户提供的真实系统 HTML；本轮无法连接用户指定的正式系统标签，因此不将未在 HTML 中出现的行为视为已确认。

| 页面 | 字段/入口 | 正常 | 加载 | 空 | 错误 | 无权限 | 确认/弹层 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 任务计划表 | 8 筛选、17 列、批量与行操作已对应；数传/成像详情已按保存页补齐 | 完成 | `?state=loading` | `?state=empty` | `?state=error` | `?state=forbidden` | `?detail=open`；`?confirm=send|delete|cancel|complete` |
| 任务计划甘特图 | 日期、粒度、阶段、类型、缩放、轨道与统计已对应 | 完成 | `?state=loading` | `?state=empty` | `?state=error` | `?state=forbidden` | 无高风险写入入口 |
| 手动测控管理 | 4 筛选、7 列、创建/删除/编辑/添加计划已对应 | 完成 | `?state=loading` | `?state=empty` | `?state=error` | `?state=forbidden` | `?dialog=create`；冲突检测与保存反馈 |
| 发送记录 | 3 筛选、7 列、导出与设置已对应 | 完成 | `?state=loading` | `?state=empty` | `?state=error` | `?state=forbidden` | `?dialog=settings`；保存模拟反馈 |

## 待确认

1. 发送、取消、完成、删除的真实状态迁移、影响范围与失败恢复规则。
2. 手动测控时段的真实冲突算法、记录“添加计划”的目标表单与编辑校验。
3. 发送设置的后端联动、权限与生效范围。
4. 甘特图中计划条的点击后续、拖拽权限及真实时间轴缩放算法。

## 代码与规范闭环

- Mock 数据集中于 `src/mocks/taskPlans.ts`，领域类型集中于 `src/types/taskPlan.ts`。
- 详情、手动测控创建、发送设置分别拆为领域组件，未复制 HTML 打包脚本或内联样式。
- 使用 `docs/ui-spec.md` 与 `src/styles/theme.css` 的语义令牌，未增加跨栈组件。
- `npm run lint` 通过；`npm run build` 通过。
