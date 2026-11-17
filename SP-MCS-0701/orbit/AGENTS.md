# 当前产品的 Codex 工作规则

## 开始任务前

- 阅读 `docs/product-brief.md`、`requirements.md`、`user-flows.md` 和 `test-scenarios.md`。
- 用一句话复述本轮要验证的产品假设。
- 识别正常、加载、空、错误和权限状态中与本轮相关的部分。

## 实现规则

- 使用 React、TypeScript、Vite 和 Tailwind CSS。
- 默认使用 `src/mocks/` 中的 Mock 数据，不接真实生产服务。
- 页面放在 `src/pages/`，领域组件放在 `src/features/`，通用组件放在 `src/components/`。
- 不把完整页面堆在 `App.tsx` 中。
- 保持可访问性、键盘操作和移动端布局。
- 如果 shadcn/ui 已初始化，优先使用已安装组件和语义颜色。

## 完成任务前

- 运行 lint 和 build。
- 在桌面端与移动端检查页面。
- 实际走通核心用户路径。
- 同步更新受影响的需求、流程、决策和测试文档。

