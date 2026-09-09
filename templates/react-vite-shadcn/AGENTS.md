# React + shadcn/ui 原型规则

`prototype.config.json` 中的 `stack` 固定为 `react-shadcn`。

- 只使用 React、TypeScript、Vite、React Router、Tailwind CSS、shadcn/ui、Radix UI 和模板已配置的 Lucide 图标。
- 禁止引入 Vue、Element Plus、Ant Design、MUI 或另一套组件体系。
- 使用 shadcn CLI 搜索、读取文档和添加组件；不要手工仿制 shadcn 组件。
- 优先使用 `src/components/ui/` 中已安装组件及语义颜色。
- 页面放入 `src/pages/`，领域组件放入 `src/components/ops/`，Mock 数据放入 `src/mocks/`，类型放入 `src/types/`。
- `App.tsx` 只负责应用壳、导航和路由。
- 表格数据必须显示单位与时区；命令类动作必须展示确认和反馈。
- 完成后运行 `npm.cmd run lint` 和 `npm.cmd run build`，并检查 1440px、1280px、1024px。
