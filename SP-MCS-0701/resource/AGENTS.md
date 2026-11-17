# Vue 3 + Element Plus 原型规则

`prototype.config.json` 中的 `stack` 固定为 `vue-element-plus`。

- 只使用 Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus 和 `@element-plus/icons-vue`。
- 禁止引入 React、shadcn/ui、Radix UI、Tailwind、Ant Design 或另一套组件体系。
- 使用 `<script setup lang="ts">` 和 Composition API。
- 优先使用 Element Plus 的表格、表单、对话框、抽屉、标签、告警和反馈组件。
- 页面放入 `src/views/`，领域组件放入 `src/components/ops/`，Mock 数据放入 `src/mocks/`，类型放入 `src/types/`。
- `App.vue` 只负责应用壳和路由出口。
- 表格数据必须显示单位与时区；命令类动作必须展示确认和反馈。
- 完成后运行 `npm.cmd run lint` 和 `npm.cmd run build`，并检查 1440px、1280px、1024px。

## 集成边界

- 本仓库维护卫星管理、光学载荷管理、天线管理的页面、Mock、字段与业务文档，保持独立预览能力。
- 在任务规划系统集成展示时，菜单、任务规划路由和外层壳由 `../task-planning-prototype` 维护；本仓库通过 `embedded=1` 只展示业务内容，不重复展示头部、侧栏和页签。
- 共享视觉令牌沿用任务规划系统 `docs/ui-spec.md`；资源领域字段与交互以本仓库 `docs/` 和素材证据为准，不在任务规划仓库复制一套资源业务规则。
