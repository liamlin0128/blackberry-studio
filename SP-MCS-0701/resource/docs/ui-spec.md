# 前端 UI 设计规范

| 项目 | 内容 |
| --- | --- |
| 产品 | SP-MCS 资源管理原型 |
| 技术栈 | `vue-element-plus`（`prototype.config.json.stack`） |
| 版本/日期 | 阶段 3 / 2026-10-28 |
| 依据 | 卫星管理定稿试点、`docs/evidence-inventory.md`、`docs/reviews/task-list-review.md`、`docs/decisions.md`；通用规则复用任务规划系统 `docs/ui-spec.md` 与 `src/styles/theme.css`，并对照轨道计算、可视化仿真系统的壳层和列表规范 |

本文件按技能模板填写，记录资源管理已采用的共用规则和领域例外。SP-MCS 通用令牌以任务规划系统已定稿值为准；本仓库 `src/styles/theme.css` 是这些值在资源管理中的本地副本，供独立部署使用。改变共用令牌时需要跨产品核对，不在资源管理中另建视觉标准。

## 1. 设计原则与保真边界

- 必须保留：卫星管理筛选字段、表格列序、工具栏、行操作、五个编辑页签、工作时段与星上站点弹层；依据为 `docs/evidence-inventory.md`。
- 允许标准化：壳层、色彩语义、4px 间距栅格、字体层级、控件与表格外观、状态反馈。查询／重置／导出直接复用任务规划系统的筛选操作样式。
- 已批准差异：资源管理独立仓库，集成时在任务规划系统内容区展示，单独预览时保留本仓库应用壳；大屏表格填满可用宽度；时间区域只标一次“北京时间”；状态面板沿用前三个系统。见 `docs/decisions.md` 与阶段 2 评审汇总。
- 保真边界：批次、卫星编号、关联模型选项来源，数字范围，站点槽位冲突规则，以及服务端持久化、权限和错误触发仍为「待确认」。不从 UI 规范推导业务规则。页面不展示“模拟数据”“原型模拟”等开发性质提示。
- 提升为全局令牌的范围仅包括跨系统稳定的 SP-MCS 色彩、字体、间距、壳层尺寸和 Element Plus 基础组件映射。卫星字段列宽、日期筛选布局、站点槽位数、弹层宽度属于页面证据或内容需要，保留在领域页面。

## 2. 设计令牌

### 2.1 色彩

| 语义令牌 | 值 | 用途 | 代码变量 |
| --- | --- | --- | --- |
| Primary | `#165DFF` | 主操作、链接、选中态、焦点 | `--sp-color-primary` |
| Primary hover | `#3375D1` | 主操作悬停 | `--sp-color-primary-hover` |
| Primary soft | `#E8EFFF` | 当前导航浅底 | `--sp-color-primary-soft` |
| Success | `#18A15F` | 成功反馈、工作状态 | `--sp-color-success` |
| Warning | `#D48806` | 警告、待处理 | `--sp-color-warning` |
| Danger | `#E45656` | 错误、删除与高风险 | `--sp-color-danger` |
| Info | `#6F8198` | 中性状态 | `--sp-color-info` |
| Text primary | `#1E2B3D` | 标题、主值 | `--sp-color-text-primary` |
| Text secondary | `#536071` | 正文、表格 | `--sp-color-text-secondary` |
| Text muted | `#8D9AAC` | 说明、时间提示 | `--sp-color-text-muted` |
| Page background | `#EEF1F5` | 应用外层 | `--sp-color-page` |
| Surface | `#FFFFFF` | 工作区和弹层 | `--sp-color-surface` |
| Surface subtle | `#F6F8FB` | 表头、次级区块 | `--sp-color-surface-subtle` |
| Surface hover | `#F4F8FF` | 可点击区域悬停 | `--sp-color-surface-hover` |
| Border | `#DFE5ED` | 外框 | `--sp-color-border` |
| Divider | `#E8ECF1` | 行及模块分隔 | `--sp-color-divider` |
| Header start | `#061528` | 顶栏渐变起点 | `--sp-color-header-start` |
| Header middle | `#0A2139` | 顶栏渐变中点 | `--sp-color-header-middle` |
| Header end | `#102943` | 顶栏渐变终点 | `--sp-color-header-end` |

Element Plus 的 Primary、Success、Warning、Danger、Info、文字、边框、填充、字体、控件高度和圆角变量只在 `src/styles/theme.css` 映射一次。字段状态不能仅凭颜色表达。

### 2.2 间距与尺寸

基础栅格：`4px`；复用任务规划系统 `4/8/12/16/20/24px` 的 `--sp-space-1` 至 `--sp-space-6`。

| 场景 | 值 | 代码变量 |
| --- | --- | --- |
| 页面横向边距 | `20px`，≤1100px 为 `14px` | `--sp-page-padding-inline` |
| 页面上下边距 | `18px / 12px` | `--sp-page-padding-block-start/end` |
| 常规模块间距 | `16px` | `--sp-space-4` |
| 紧凑表单与操作间距 | `12px` / `4px` | `--sp-space-3` / `--sp-space-1` |
| 常规容器内边距 | `20px` | `--sp-space-5` |
| 控件高度 | `32px` | `--sp-control-height` |
| 控件／卡片／弹层圆角 | `6px / 8px / 3px` | `--sp-radius-control/card/dialog` |
| 顶栏／导航／页签 | `64px / 250px / 40px` | `--sp-shell-header-height/nav-width`、`--sp-workspace-tab-height` |
| 最低桌面宽度 | `1024px` | `--sp-desktop-min-width` |

卫星表格列的 `min-width`、编辑弹窗 `900px`、工作时段弹窗 `760px`、新增时段 `520px`、站点弹窗 `960px` 均为当前页面局部尺寸，不升级成全局 Dialog 规格。

### 2.3 字体

字体族与任务规划系统相同：`Microsoft YaHei, PingFang SC, Arial, sans-serif`，代码变量 `--sp-font-family`。时间和编号可使用制表数字，不用等宽字体替换正文。

| 层级 | 字号/行高 | 字重 | 用途 | 代码变量 |
| --- | --- | --- | --- | --- |
| Page title | `20/28px` | `600` | 页面主标题 | `--sp-font-size-page-title`、`--sp-line-height-page-title`、`--sp-font-weight-semibold` |
| Section title | `16/24px` | `600` | 业务分区 | `--sp-font-size-section-title`、`--sp-line-height-section-title` |
| Body | `14/22px` | `400` | 正文、输入、列表 | `--sp-font-size-body`、`--sp-line-height-body` |
| Caption | `12/20px` | `400/500` | 时间说明、辅助文案 | `--sp-font-size-caption`、`--sp-line-height-caption`、`--sp-font-weight-medium` |

## 3. 页面布局

| 项目 | 规则 |
| --- | --- |
| 应用壳 | 独立预览使用固定 64px 顶栏、本系统侧栏和 40px 页签；集成在任务规划系统时隐藏本仓库壳层，仅展示资源页面内容。独立壳层导航宽度在 >1280px、≤1280px、≤1100px 分别为 250/240/230px；壳层用 `src/style.css` 和主题令牌。 |
| 查询区 | 卫星 ID、中文名、更新时间范围保留原顺序；查询／重置／导出在同一操作区，靠右对齐，按钮图标、颜色和间距沿用任务规划。输入值在点击“查询”后生效。 |
| 内容区 | 卫星列表为全宽数据页，填满工作区有效宽度；表格承担内部横向滚动，不能让整页横向溢出，也不能为窄屏隐藏已确认列。操作列固定在右。 |
| 详情区 | 已证实的新增、编辑、查看、工作时段和站点管理沿用 Dialog；正文超高时内部滚动，footer 为取消／保存。卫星编辑的五页签保留原分组。 |
| 响应宽度 | 1440px 筛选区按现有五列网格、日期占两列；≤1280px 为三列且操作独立靠右；≤1100px 为两列。最低检查 1024px；表格允许自身滚动。 |

## 4. 组件规则

| 组件 | 规则 | 禁止用法 |
| --- | --- | --- |
| 按钮 | 同组主操作一个 Primary；查询、重置、导出使用任务规划系统同款图标按钮；删除使用 Danger 并确认。执行中的加载锁定属于接入真实异步接口后的要求，当前本地即时操作不得伪装远端进度。 | 同级按钮各设计一套颜色和尺寸；未确认结果宣称服务端完成。 |
| 表格 | `el-table`；表头和行均为 42px；浅次级表头、横向分隔线、文字不换行；已知列顺序和固定操作列保留，内部滚动，分页在表外。 | 隐藏业务列、靠填充虚构列消除留白、让整页横向滚动。 |
| 表单 | `el-form` / `el-form-item`；必填空值阻止保存，载荷名称和编号成对验证且编号不超过 16 字符；日期范围精确到秒。未知枚举和数字范围不得补齐猜测值。 | 只画红星不校验；未点击查询即改变列表；虚构下拉选项。 |
| Dialog | 标题、内容、footer 分区；取消和关闭不写入，保存/确定在右；内容超高时内部滚动。已证实弹窗类型与页签不改成新导航路径。 | 关闭即保存；因统一样式改变字段分组或入口位置。 |
| 导航 | 使用 Element Plus `el-menu`，当前项浅主色；集成时资源管理作为任务规划侧栏展开菜单，子页面在任务规划内容区显示。独立预览时保留本仓库应用壳。 | 把资源管理放回顶部一级菜单；集成时重复显示资源管理应用壳；禁用项仍可触发。 |
| 状态标签 | 文字加语义色；“工作”使用成功色，错误和风险用危险色。状态全集待证据确认。 | 只用颜色、把单个示例状态当成完整枚举。 |
| 分页 | `el-pagination` 保留总数、页容量、页码及跳页；当前证据为 2 条、30 条/页。 | 用少量示例数据假装有更多真实页。 |

## 5. 状态与反馈

| 状态 | 呈现规则 | 文案/动作 |
| --- | --- | --- |
| 正常 | 列表、筛选、工具栏和分页完整显示。 | 查询后更新列表；重置恢复当前会话数据。 |
| 加载 | 统一状态面板替代业务内容；未来真实异步按钮需 loading 并锁定重复提交。 | 当前面板“正在加载”；真实触发条件待确认。 |
| 空 | 面板 `el-empty`；工作时段的空表使用 Element Plus 空态。 | “暂无数据”；真实空列表文案待核。 |
| 错误 | 统一错误状态替代业务内容，不同时展示可操作列表。 | “数据加载失败”；重试入口待真实流程证据。 |
| 无权限 | 隐藏筛选和操作区，显示统一无权限状态。 | “暂无访问权限”；权限申请路径待确认。 |
| 成功 | 本地短操作使用 `ElMessage.success`，并在当前会话回显。 | 不代表后端已持久化。 |
| 高风险确认 | 删除前用 `ElMessageBox` 说明对象或影响数量；取消保持原状。 | 批量删除、工作时段删除、站点删除先确认；真实异步结果和失败反馈待接口证据。 |

四类页面状态可由 `?state=loading|empty|error|forbidden` 供评审触发；这是状态展示机制，不是已确认的真实系统入口。页面不显示开发用途提示语。

## 6. 数据表达

- 时间：使用 `YYYY-MM-DD HH:mm:ss`，日期时间范围含所选秒。列表和各弹层所在区域只标注一次“北京时间”，不重复解释 UTC 偏移；独立导出的 CSV 在时间列名保留“北京时间”。时间值不在前端凭空换算。
- 单位：卫星质量 `kg`、预计寿命 `年`、轨道高度 `km`、角度 `°`、转速 `°/s`、链路速率 `Mbps`；缺证据时不增加精度或默认值。
- 实时／预测／历史／模拟：当前卫星列表为证据快照，不把它标为实时；后续资源页面出现此类值时按数据来源就近标识，不能把演示记录当成实时遥测。开发数据来源记录在 `src/mocks/` 与文档中。
- 缺失与异常：无记录使用标准空态；字段与规则缺口写入文档的「待确认」，不造业务值；验证失败用明确字段提示，不把异常伪装成保存成功。

## 7. 代码映射与例外

| 规范项 | 实现位置 | 例外及原因 |
| --- | --- | --- |
| 全局主题 | `src/styles/theme.css`，由 `src/main.ts` 引入 | 与任务规划系统的同名语义令牌和 Element Plus 映射一致；本仓库独立部署需持有本地副本。 |
| 公共布局 | `src/style.css`、`src/App.vue` | 仅应用壳和基础页面规则在全局；页面特殊几何不放这里。 |
| 卫星列表与弹层 | `src/views/SatelliteListView.vue` | 筛选网格、列宽、五页签和弹层宽度来自本页内容及证据，不上升为通用规则。 |
| 统一页面状态 | `src/components/ops/ResourcePageStatePanel.vue` | 复用前三个系统的状态类型；真实触发与文案待核。 |
| 光学载荷与天线列表 | `src/views/OpticalPayloadView.vue`、`src/views/AntennaListView.vue`、`src/styles/catalog.css` | 复用本规范的控件和列表外观；字段、列宽和弹层结构仅按各页面证据确定。 |
| 数据 | `src/mocks/resources.ts`、`src/mocks/catalogs.ts`、`src/mocks/antenna-evidence.ts` | 仅复现证据快照和会话交互，不宣称服务端结果。 |

规范变更须同步核对主题代码、受影响页面和 `docs/decisions.md`。本阶段只沉淀已定稿试点的视觉与交互规则，不新增业务字段、入口或流程。
