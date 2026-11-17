# 资源管理原型

技术栈：Vue 3 + TypeScript + Vite + Element Plus。栈标识见 `prototype.config.json`。

本仓库独立维护卫星管理、光学载荷管理和天线管理页面，开发服务固定在 `http://127.0.0.1:5176/`，可单独预览。集成展示时，任务规划系统（5173）侧栏的“资源管理”与“系统管理”平级，点击三个子菜单只更换任务规划内容区；资源页面不重复显示本仓库头部和侧栏。页面证据、覆盖范围和待确认问题见 `docs/evidence-inventory.md`、`docs/phase-1-coverage.md`。

```powershell
npm.cmd install
npm.cmd run dev
```

检查：

```powershell
npm.cmd run lint
npm.cmd run build
```

交互控件只使用 Element Plus，不引入 React 或 shadcn/ui。
