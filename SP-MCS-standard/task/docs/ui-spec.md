# 前端 UI 设计规范

| 项目 | 内容 |
| --- | --- |
| 产品 | 星枢任务控制系统（SP-MCS，Stellar Pivot Mission Control System） |
| 技术栈 | `vue-element-plus` |
| 版本/日期 | 阶段 4（弧段预报补充）/ 2026-09-14 |
| 依据 | 任务需求列表、筹划计算、大区域筹划定稿页面；弧段预报需求与设计稿；`docs/evidence-inventory.md`；`docs/reviews/phase-2-review-closure.md` |

本规范约束任务规划系统应用壳及本仓库实现的页面，包括“系统管理”。侧栏中的“资源管理”业务页面由 `../resource-management-prototype` 维护；本规范只约束其集成时的菜单层级、单一应用壳和共用视觉令牌，具体字段与弹层以资源仓库文档为准。

## 1. 设计原则与保真边界

- 必须保留：原系统已经确认的业务语义、字段名称与顺序、操作入口、导航关系、弹层归属和主要页面分区。
- 允许标准化：色彩语义、间距、字体层级、边框、圆角、阴影、组件外观、焦点及反馈方式。
- 已批准差异：通用 SP-MCS 品牌、统一头部系统入口、任务规划侧栏的“资源管理”入口、星轨锚点选中态、大区域 1360px 内容上限、脱机地图示意、无计算日志结果区；依据见 `docs/decisions.md`。
- 证据不足：真实地图、完整枚举、批量跳转、分页数据、后端错误码及权限规则继续标记为「待确认」，不得由 UI 规范推导业务规则。
- 升级原则：只有跨至少两类页面重复使用，或属于应用壳、Element Plus 基础组件的稳定值，才升级为全局令牌；地图几何、轨道色、条带宽度、时间数字卡和优先级映射保留为领域样式。

## 2. 设计令牌

令牌唯一来源为 `src/styles/theme.css`。页面和公共组件不得重复声明同名语义；Element Plus 变量只映射到这些令牌。

### 2.1 色彩

| 语义令牌 | 值 | 用途 | 代码变量 |
| --- | --- | --- | --- |
| Primary | `#165DFF` | 主操作、链接、焦点、当前页强调 | `--sp-color-primary` |
| Primary hover | `#3375D1` | 主色悬停或较弱强调 | `--sp-color-primary-hover` |
| Primary soft | `#E8EFFF` | 主色浅背景 | `--sp-color-primary-soft` |
| Success | `#18A15F` | 成功反馈和确认完成 | `--sp-color-success` |
| Warning | `#D48806` | 警告、待处理 | `--sp-color-warning` |
| Danger | `#E45656` | 错误、删除和高风险 | `--sp-color-danger` |
| Info | `#6F8198` | 中性状态和辅助信息 | `--sp-color-info` |
| Text primary | `#1E2B3D` | 页面标题、主要值 | `--sp-color-text-primary` |
| Text secondary | `#536071` | 正文、表格内容 | `--sp-color-text-secondary` |
| Text muted | `#8D9AAC` | 字段标签、说明、时间注释 | `--sp-color-text-muted` |
| Text inverse | `#F4F7FB` | 深色顶栏当前项和品牌文字 | `--sp-color-text-inverse` |
| Page background | `#EEF1F5` | 应用最外层背景 | `--sp-color-page` |
| Surface | `#FFFFFF` | 工作区、卡片、弹层 | `--sp-color-surface` |
| Surface subtle | `#F6F8FB` | 表头、次级区块、模拟标识 | `--sp-color-surface-subtle` |
| Surface hover | `#F4F8FF` | 表格和可点击区悬停 | `--sp-color-surface-hover` |
| Border | `#DFE5ED` | 卡片、控件外边界 | `--sp-color-border` |
| Divider | `#E8ECF1` | 表格横线、区块分隔 | `--sp-color-divider` |
| Header start/middle/end | `#061528 / #0A2139 / #102943` | 顶部深色渐变，仅用于应用壳 | `--sp-color-header-start/middle/end` |
| Header text | `#BEC8D7` | 顶栏非当前文字 | `--sp-color-header-text` |

业务状态可在上述 Success、Warning、Danger、Info 基础上使用浅色边框和背景。优先级 `6/8/12/13/14` 的现有颜色映射属于证据页面的可扫描性规则，在业务语义确认前不升级为全局状态色。

### 2.2 间距与尺寸

基础栅格：`4px`。标准间距令牌为 `4 / 8 / 12 / 16 / 20 / 24px`，对应 `--sp-space-1` 至 `--sp-space-6`。

| 场景 | 值 | 代码变量 |
| --- | --- | --- |
| 页面横向边距 | `20px`；≤1100px 为 `14px` | `--sp-page-padding-inline` |
| 页面顶部/底部边距 | `18px / 12px` | `--sp-page-padding-block-start/end` |
| 模块间距 | `16px` | `--sp-space-4` |
| 紧凑模块/表单项间距 | `12px` | `--sp-space-3` |
| 常规容器内边距 | `20px` | `--sp-space-5` |
| 标准控件高度 | `32px` | `--sp-control-height` |
| 控件/卡片圆角 | `6px / 8px` | `--sp-radius-control/card` |
| 弹窗与确认框外框圆角 | `3px` | `--sp-radius-dialog` |
| 胶囊圆角 | `999px` | `--sp-radius-pill` |
| 卡片/弹层阴影 | 低对比度层级阴影 | `--sp-shadow-card/dialog` |
| 键盘焦点 | `2px` 主色外环 | `--sp-focus-ring` |
| 快速/常规动效 | `180ms / 250ms` | `--sp-motion-fast/normal` |

局部布局可使用非令牌尺寸，例如地图高度、表格列宽、时间卡列宽；这些值由内容和证据决定，不应为追求令牌化而强行统一。

### 2.3 字体

字体族统一为 `Microsoft YaHei, PingFang SC, Arial, sans-serif`，代码变量 `--sp-font-family`。编号、时间和角度的等宽数字可在局部使用 `Consolas, monospace`，但不得用于正文。

| 层级 | 字号/行高 | 字重 | 用途 | 代码变量 |
| --- | --- | --- | --- | --- |
| Page title | `20/28px` | `600` | 页面唯一主标题 | `--sp-font-size-page-title`、`--sp-line-height-page-title`、`--sp-font-weight-semibold` |
| Section title | `16/24px` | `600` | 卡片、业务分区标题 | `--sp-font-size-section-title`、`--sp-line-height-section-title`、`--sp-font-weight-semibold` |
| Body | `14/22px` | `400` | 正文、表单、常规表格 | `--sp-font-size-body`、`--sp-line-height-body`、`--sp-font-weight-regular` |
| Caption | `12/20px` | `400/500` | 标签、说明、单位、时间备注 | `--sp-font-size-caption`、`--sp-line-height-caption`、`--sp-font-weight-medium` |

### 2.4 完整令牌清单

以下清单与 `src/styles/theme.css` 的 `:root` 一一对应；响应式只覆盖既有令牌值，不创建第二套令牌。

```text
--sp-color-primary: #165dff
--sp-color-primary-hover: #3375d1
--sp-color-primary-soft: #e8efff
--sp-color-success: #18a15f
--sp-color-warning: #d48806
--sp-color-danger: #e45656
--sp-color-info: #6f8198
--sp-color-text-primary: #1e2b3d
--sp-color-text-secondary: #536071
--sp-color-text-muted: #8d9aac
--sp-color-text-inverse: #f4f7fb
--sp-color-page: #eef1f5
--sp-color-surface: #fff
--sp-color-surface-subtle: #f6f8fb
--sp-color-surface-hover: #f4f8ff
--sp-color-border: #dfe5ed
--sp-color-divider: #e8ecf1
--sp-color-header-start: #061528
--sp-color-header-middle: #0a2139
--sp-color-header-end: #102943
--sp-color-header-text: #bec8d7
--sp-space-1: 4px
--sp-space-2: 8px
--sp-space-3: 12px
--sp-space-4: 16px
--sp-space-5: 20px
--sp-space-6: 24px
--sp-page-padding-block-start: 18px
--sp-page-padding-block-end: 12px
--sp-page-padding-inline: 20px
--sp-font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif
--sp-font-size-page-title: 20px
--sp-line-height-page-title: 28px
--sp-font-size-section-title: 16px
--sp-line-height-section-title: 24px
--sp-font-size-body: 14px
--sp-line-height-body: 22px
--sp-font-size-caption: 12px
--sp-line-height-caption: 20px
--sp-font-weight-regular: 400
--sp-font-weight-medium: 500
--sp-font-weight-semibold: 600
--sp-control-height: 32px
--sp-radius-control: 6px
--sp-radius-card: 8px
--sp-radius-dialog: 3px
--sp-radius-pill: 999px
--sp-shadow-card: 0 3px 12px #17345e0a
--sp-shadow-dialog: 0 18px 48px #172b4d38
--sp-focus-ring: 0 0 0 2px #165dff33
--sp-motion-fast: 180ms
--sp-motion-normal: 250ms
--sp-shell-header-height: 64px
--sp-shell-nav-width: 250px
--sp-workspace-tab-height: 40px
--sp-content-max-width: 1360px
--sp-content-contained-width: 1200px
--sp-desktop-min-width: 1024px
```

## 3. 页面布局

| 项目 | 规则 |
| --- | --- |
| 应用壳 | 顶栏固定 `64px`（`--sp-shell-header-height`）；左侧导航 1440px 为 `250px`、≤1280px 为 `240px`、≤1100px 为 `230px`（`--sp-shell-nav-width`）；页签 `40px`（`--sp-workspace-tab-height`）；工作区独立滚动。 |
| 页面标题 | 页面需要说明、状态或跨卡片操作时使用共享 `PageHeader`。若页签已标识页面，且首个主面板使用完全相同标题、页面级标题没有额外信息，则省略 `PageHeader`，避免标题重复；规划计算采用此例外。 |
| 查询区 | 桌面端按内容构建网格；1440px 最多五列，1280px 三列，1024px 两列。编辑条件不立即改变结果，查询后提交；查询/重置靠右且不与字段争宽。 |
| 全宽自适应页 | 不设置内容最大宽度，使用工作区扣除页面边距后的全部宽度。适用于宽表格、横向控制台、甘特图、多列监视和需要随窗口增加有效信息量的页面；表格只在自身内部横向滚动。任务需求列表、规划计算、数据接收解析、上注文件登记、字典管理、系统日志、操作日志采用此规格。 |
| 全宽列表页画布 | 页面画布统一使用 `--sp-color-surface`，筛选区和表格区默认透明继承该画布，表头使用 `--sp-color-surface-subtle`。不得因页面样式声明顺序不同而切换为浅灰或透明底色。 |
| 规划计算管理画布 | 规划计算、规划配置和算法管理页面统一使用 `--sp-color-surface` 白色画布；卡片继续通过 Border、Divider 和 Shadow 建立层级，`--sp-color-surface-subtle` 仅用于表头、次级区块和状态提示。页面宽度规格保持不变。 |
| 限定宽度页 | 内容宽度不超过 `1200px`（`--sp-content-contained-width`）并水平居中。适用于配置表单、单对象详情、说明和字段阅读路径较强的页面；不得为填满宽屏而拉长标签和值的距离。规划配置采用此规格。 |
| 内容区例外 | 地图与大范围可视化可基于已确认业务需要使用 `1360px`（`--sp-content-max-width`）的宽型上限；这是领域例外，不形成第三种通用页面规格。 |
| 详情区 | 详情/编辑使用同页 Dialog；主内容独立滚动，日志侧栏按入口展开。通用信息卡使用稳定双列，字段不足时保持自然流，不制造空值。 |
| 规格选择 | 先判断“增加宽度是否能承载更多业务信息”：能，则选全宽自适应；不能且会拉散阅读路径，则选限定宽度。规格由页面主体信息结构决定，不按菜单层级或个人偏好切换。 |
| 响应宽度 | 最低验证目标为 `1024px`（`--sp-desktop-min-width`），不通过强制页面宽度制造整页横向滚动。全宽页允许内部弹性分栏和表格内部滚动；限定宽度页在可用空间小于上限时占满工作区。 |

## 4. 组件规则

| 组件 | 规则 | 禁止用法 |
| --- | --- | --- |
| 按钮 | 每个操作组最多一个 Primary；危险动作使用 Danger 且先确认；可逆次操作使用默认/Plain；执行中显示 loading 并锁定重复提交。并列的同级文字按钮统一配置语义图标；纯图标按钮必须有可访问名称。 | 同组使用多种非必要语义色；有的同级操作带图标、有的不带；可用外观但没有行为或反馈；只用颜色表达风险。 |
| 表格 | 使用 `el-table`；表头使用 Surface subtle，行间仅 Divider 横线，无竖线；文本不换行并提供内部横向滚动；操作列可固定；空态使用标准空组件。 | 为适配窄屏隐藏已知业务字段；页面整体产生横向溢出；用空格模拟列。 |
| 表单 | 使用 `el-form` 与 `el-form-item`；必填、范围和联动通过 rules 表达；提交式筛选区分编辑值与已提交值；禁用项仍保留上下文。 | 只显示红星但无校验；输入即隐式提交；把未知枚举补全为猜测。 |
| Dialog/Drawer | 已有详情、编辑、设置和日志使用 Dialog；标题、正文、footer 分区明确，取消在确认前关闭，保存/确认在右侧；内容超高时正文独立滚动。Drawer 仅在后续证据明确侧滑详情时使用。 | 用 Drawer 重写已确认的 Dialog 流程；关闭即保存；取消 Promise 产生未处理异常。 |
| 导航 | 顶部系统入口使用星轨锚点选中态；“接入与权限系统”占位禁用。任务规划侧栏在上注文件登记与系统管理之间显示资源管理展开菜单，三个子页在任务规划内容区打开。当前项使用浅主色背景。 | 把顶级导航做成业务主按钮；资源子页跳出任务规划框架；禁用项仍可导航。 |
| 标签与状态 | 使用 `el-tag` 或领域状态标签；标签宽度由内容决定，在信息网格内保持原始组件高度与横向内边距，不随父容器拉伸；文案必须明确，颜色遵循成功/警告/危险/信息语义；业务证据不足时就近展示“待确认”。页面不展示通用“模拟数据”标志，模拟属性由原型环境和文档统一说明。 | 标签被拉伸为整行；仅用颜色无文字；把待确认结果显示成已确认生产状态。 |
| 分页 | 使用 `el-pagination`；总数、页容量、页码、上一页/下一页和跳页按证据保留；表格滚动不带走分页。 | 用少量 Mock 冒充所有页真实数据；未经确认改变证据总数。 |
| 进度 | 进度条必须同时显示数值；进行中、完成、超时分别使用明确文案；静态证据进度不得冒充本次执行结果。 | 只显示色条；执行提交成功后立即伪造完成。 |
| 地图控制 | 脱机示意必须显式标识；缩放、复位、视图和条带入口均有实际状态变化与键盘焦点。 | 承诺未实现的拖拽/真实地理精度；把单页地图配色升级为通用品牌色。 |

## 5. 状态与反馈

| 状态 | 呈现规则 | 文案/动作 |
| --- | --- | --- |
| 加载 | 页面首次加载使用 Skeleton；按钮操作使用自身 loading；加载时阻止重复提交。 | 描述正在载入/计算的对象，完成后给出结果。 |
| 空 | 使用 `el-empty` 占据业务工作区，不保留无意义空表格。 | 说明当前条件下无数据；可提供重置筛选等已确认恢复动作。 |
| 错误 | 使用 `el-result` 或 `el-alert`，危险语义但避免大面积高饱和红色。 | 显示可理解错误；仅在有证据时提供重试或返回。 |
| 无权限 | 权限结果替换整个业务工作区，不暴露筛选、批量操作或执行按钮。 | 权限申请路径待确认时直接标为「待确认」。 |
| 成功 | 短操作使用 `ElMessage.success`；有持续结果区域时同步更新页面状态。 | 明确对象和结果；脱机行为注明“模拟”。 |
| 警告 | 使用 Warning，说明限制或证据缺口。 | 不将警告写成成功，也不暗示真实后端已执行。 |
| 高风险确认 | 使用 `ElMessageBox`，必须说明动作、对象或影响数量；确认按钮使用动作动词。 | 取消/返回为正常分支；确认后呈现执行中、成功或失败反馈。 |
| 禁用 | 保留必要上下文、降低对比度、禁止交互。 | 说明未开放或触发条件，不以禁用替代权限结果。 |
| 焦点/悬停 | 可点击元素有轻量悬停；键盘焦点使用主色可见外环。 | 不移除焦点轮廓且不给替代；悬停不得改变布局尺寸。 |

## 6. 数据表达

- 时间格式与时区：业务时间采用 `YYYY-MM-DD HH:mm:ss`；空间有限时可按证据缩短到分钟，但所在区块必须标注“北京时间（UTC+8）”。日期可用 `YYYY/MM/DD`，同一区块保持一致。
- 数值精度与单位：面积 `km²`、距离/幅宽 `km`、角度 `°`、时长 `秒/分钟/小时/天`；经纬度保留证据精度并附 `E/N`。数值列使用制表数字，精度不得高于证据。
- 实时/预测/历史标识：在所属业务区块就近说明；数据实现方式仅保留在开发文档和 Mock 分层，页面标题、结果区和操作反馈不展示内部属性。高风险动作使用确认和业务结果反馈。
- 缺失数据：使用 `—`；证据未知使用“待确认”；无对应数据使用空态或“未找到对应数据”，不得生成占位业务值。
- 过期数据：日志明确“仅保存 7 天”；其他过期判断规则待确认。
- 异常数据：使用状态文字、语义色与恢复提示共同表达，不仅依靠颜色。

## 7. 代码映射与例外

| 规范项 | 实现位置 | 例外及原因 |
| --- | --- | --- |
| 全局主题 | `src/styles/theme.css` | 唯一语义令牌与 Element Plus 变量映射；亮色模式。 |
| 全局基础与响应布局 | `src/style.css` | 页面/领域几何值可保留局部常量，但跨页色彩、字体和间距优先引用主题令牌。 |
| 公共页面标题 | `src/components/shell/PageHeader.vue` | 无。 |
| 应用壳与导航 | `src/App.vue`、`src/components/shell/UserAccountMenu.vue` | 顶栏渐变与星轨选中线是已批准品牌例外，见 `docs/decisions.md`。 |
| 任务详情与编辑 | `src/components/ops/RequirementDialog.vue` | 日志时间线节点颜色承载证据状态顺序，业务映射尚未全局化。 |
| 筹划设置与日志 | `src/components/planning/PlanningSettingsDialog.vue`、`PlanningLogDialog.vue` | 日志序号和时间卡局部尺寸由内容决定。 |
| 大区域结果 | `src/components/planning/AreaPlanningResultPanel.vue`、`src/style.css` | 地图、目标区、轨道和条带色属于领域示意，不作为通用组件颜色。 |
| 弧段预报 | `src/components/schedule/ArcForecastProgressDialog.vue`、`ArcForecastResultDialog.vue`、`src/style.css` | 进度步骤、卫星汇总和弧段类型配色只服务于规划计算领域，复用全局语义色但不新增全局令牌。 |

所有例外关联 `docs/decisions.md`。规范变更时必须同步更新 `src/styles/theme.css`、本文件和受影响页面；禁止在页面内重定义 `--sp-*` 令牌。
