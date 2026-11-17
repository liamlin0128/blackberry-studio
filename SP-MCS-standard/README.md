# SP-MCS 标准产品原型

本目录将任务规划、轨道控制、可视化仿真和资源管理整合为一个可克隆项目。四个分系统保留各自源码和技术栈，统一由一个本地入口提供页面。

## 打开原型

安装 Node.js 后，在本目录运行 `npm run preview`，打开 `http://127.0.0.1:5173/`。页面和资源文件已包含在各分系统的 `dist/` 中，浏览原型无需安装前端依赖。

四个入口分别为 `/app/mccs/tasksys/requirement/list`、`/app/mccs/orbitsys/orbit/track-manage`、`/app/mccs/visualsys/model/list`、`/app/mccs/resourcesys/satellite/list`。标准版可通过顶栏切换到 0701 版的 5273 端口。

## 更新页面

首次开发运行 `npm run setup`，修改对应的 `task/`、`orbit/`、`visual/` 或 `resource/` 源码后运行 `npm run build`，再提交源码和更新后的 `dist/`。各分系统原有的 `AGENTS.md`、`prototype.config.json` 和 `docs/` 保留在子目录中。
