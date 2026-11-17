# 星枢任务控制系统（SP-MCS）产品原型

技术栈：Vue 3 + TypeScript + Vite + Element Plus。栈标识见 `prototype.config.json`。

本仓库实现任务规划系统及其“系统管理”页面。侧栏“资源管理”与“系统管理”平级，但资源业务页面由独立的 `../resource-management-prototype` 仓库维护；集成预览需同时运行 5173 和 5176，点击资源子菜单后页面在任务规划框架内打开。字段与业务规则分别以各自仓库的 `docs/` 为准。

```powershell
npm.cmd install
npm.cmd run preview:start
```

`preview:start` 会将 Vite 启动为独立隐藏进程，并在服务已运行时直接复用，预览地址固定为 `http://127.0.0.1:5173/`。使用 `npm.cmd run preview:health` 可随时检查服务是否可用。

首次执行 `npm.cmd run preview:watchdog` 会注册当前用户登录时执行一次的 Windows 计划任务。它检查本机预览地址，服务不可用时启动任务规划预览；任务在交流电和电池模式下均可运行，不会修改业务数据，也不会在前台打开窗口。资源管理的 5176 服务由资源仓库独立启动。

检查：

```powershell
npm.cmd run lint
npm.cmd run build
```

交互控件只使用 Element Plus，不引入 React 或 shadcn/ui。
