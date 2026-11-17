# Git 双栈产品原型工作台

## SP-MCS 双版本交付

当前可分享的完整原型位于 [SP-MCS-standard](SP-MCS-standard/README.md) 与 [SP-MCS-0701](SP-MCS-0701/README.md)。它们共用本工作台 Git 仓库，各整合任务规划、轨道控制、可视化仿真、资源管理四个分系统。安装 Node.js 后，在两个目录分别运行 `npm run preview`，只需 5173 和 5273 两个端口。已提交构建产物，克隆后预览无需安装前端依赖。根目录 `scripts/Start-SpMcsVersions.ps1` 可一次启动两版。原八个工作目录保留作迁移来源，不属于本次分享入口。

这是一个面向 B 端卫星测运控场景的 Codex 原型工作台。工作台维护两套独立模板，每个生成的产品都是独立 Git 仓库。

## 技术栈

| 代号 | 技术栈 | 组件体系 | 使用场景 |
| --- | --- | --- | --- |
| `vue`（默认） | Vue 3 + TypeScript + Vite | Element Plus | 默认选择、国内 B 端系统、快速业务原型 |
| `react` | React + TypeScript + Vite | shadcn/ui + Radix | 需要更高视觉自由度或 React 代码复用 |

一旦创建产品，栈会写入 `prototype.config.json`。Codex 必须遵循该配置，不能跨栈混用组件。

## 当前产品

| 产品 | 目录 | 当前状态 |
| --- | --- | --- |
| 任务规划系统 | `任务规划系统` | 既有 React/Vite 原型，未自动迁移 |
| 轨道控制系统 | `轨道控制系统` | 既有 React/Vite 原型，未自动迁移 |

## 创建新产品

默认使用 Vue 3 + Element Plus：

```powershell
.\scripts\New-Prototype.ps1 -Name "mission-planner" -Title "任务规划系统"
```

明确选择 React + shadcn/ui：

```powershell
.\scripts\New-Prototype.ps1 -Name "telemetry-console" -Title "遥测监视台" -Stack react
```

`Name` 用作目录名和 npm 包名，只能包含小写字母、数字和短横线；`Title` 可以使用中文。

## 日常工作方式

1. 在 Codex 中打开具体产品目录。
2. 让 Codex 阅读 `prototype.config.json`、`AGENTS.md` 和 `docs/`。
3. 描述本轮产品假设、用户角色、核心流程和验收条件。
4. 要求 Codex 只使用当前栈组件实现，并补齐异常和权限状态。
5. 浏览器评审通过后提交 Git，重要节点打标签。

推荐提示词：

```text
请先读取 prototype.config.json、AGENTS.md 和 docs。
严格使用项目已选技术栈，不引入另一套组件体系。
本轮需要验证【产品假设】，用户角色是【角色】，核心路径是【路径】。
请使用集中 Mock 数据实现可交互原型，补齐加载、空、错误、无权限和命令确认状态。
完成后运行 lint、build，并在 1440px、1280px 和 1024px 检查核心流程。
```

## 工作台结构

```text
D:\27原型
├─ templates\vue3-vite-element-plus\
├─ templates\react-vite-shadcn\
├─ templates\product-docs\
├─ scripts\New-Prototype.ps1
├─ 任务规划系统\
└─ 轨道控制系统\
```

