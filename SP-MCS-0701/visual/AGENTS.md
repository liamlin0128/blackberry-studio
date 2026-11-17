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
