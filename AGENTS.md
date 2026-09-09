# 双栈产品原型工作台规则

本目录用于维护多个 Git 化产品原型，以及两套互相隔离的前端模板。

## 栈选择

- 新建原型前必须确定技术栈；用户没有明确说明时，默认选择 `vue-element-plus`。
- 进入产品目录后，第一步读取 `prototype.config.json`，其中 `stack` 是唯一有效的栈标识。
- `vue-element-plus` 只能使用 Vue 3、TypeScript、Vite、Element Plus、Vue Router 和 Pinia。
- `react-shadcn` 只能使用 React、TypeScript、Vite、shadcn/ui、Radix UI、Tailwind CSS 和 React Router。
- 不在同一产品中混用 Element Plus、shadcn/ui、Ant Design、MUI 或其他 UI 组件体系。
- 不因某个组件实现方便而切换技术栈；切换栈属于产品级决策，必须由用户明确提出。

## 产品边界

- 每个产品目录是独立 Git 仓库，拥有自己的依赖、文档和版本历史。
- 总工作台只维护规则、文档模板、前端模板和创建脚本。
- 修改一个产品时，不同步修改其他产品，除非用户明确要求。
- 旧产品不会因为默认栈变化而自动迁移。

## 卫星测运控原型约束

- 默认面向桌面端 B 端场景，优先验证 1440px、1280px 和最低 1024px 宽度。
- 页面结构优先使用侧边导航、任务区、状态区、数据表、时间轴、告警和详情面板。
- 时间必须标明时区；角度、距离、频率、速率等数据必须显示单位。
- 清楚区分实时值、预测值、历史值和模拟值。
- 命令下发、任务中止、参数覆盖等高风险动作必须有确认和结果反馈。
- Mock 数据集中放入 `src/mocks/`，不得散落在页面组件中。
- 页面、领域组件、类型和数据分层，避免把完整界面写进根组件。

## 文档和验证

- 开工前阅读产品目录中的 `AGENTS.md`、`prototype.config.json` 和 `docs/`。
- 需求变化同步更新 `requirements.md`，流程变化更新 `user-flows.md`，关键判断更新 `decisions.md`。
- 原型覆盖正常、加载、空、错误、无权限和关键命令确认状态。
- 完成后运行 lint、build，并在浏览器走通核心用户路径。

