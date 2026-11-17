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

## 菜单与仓库边界

- “系统管理”的字典管理、系统日志、操作日志是本仓库的页面，字段、流程和测试以本仓库 `docs/` 为准。
- “资源管理”是任务规划系统侧栏中的同级菜单组，但卫星管理、光学载荷管理、天线管理的业务页面由 `../resource-management-prototype` 独立仓库维护。本仓库只维护菜单、任务规划路由和内容区集成，不复制资源业务组件、Mock 或领域规则。
- 共用壳层和导航规则以本仓库 `docs/ui-spec.md` 为准；资源页面字段、弹层和业务交互以资源仓库的证据与文档为准。集成时不显示第二套头部、侧栏或页签。
