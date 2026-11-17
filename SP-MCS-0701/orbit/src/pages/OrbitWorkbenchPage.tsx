import { frameworkAreas, taskPlanningUrl } from '../mocks/systemFramework'

export function OrbitWorkbenchPage() {
  return <section className="workspace">
    <div className="page-tabs"><span className="active-tab">轨道计算工作台 <small>×</small></span><span className="settings" aria-label="页面设置">⚙</span></div>
    <main className="orbit-main">
      <section className="page-heading"><span className="heading-mark" /><div><h1>轨道计算系统</h1><p>面向卫星轨道计算业务的统一工作台。</p></div></section>
      <section className="framework-panel" aria-labelledby="framework-title">
        <div className="panel-heading"><div><h2 id="framework-title">系统框架</h2><p>沿用 SP-MCS 的统一导航、账号入口和任务区布局。</p></div><span>北京时间（UTC+8）</span></div>
        <div className="framework-grid">{frameworkAreas.map((area) => <article className="framework-card" key={area.title}><span className="card-dot" /><h3>{area.title}</h3><p>{area.description}</p></article>)}</div>
      </section>
      <section className="integration-panel" aria-labelledby="integration-title"><div><span className="section-label">跨系统联动</span><h2 id="integration-title">任务规划系统</h2><p>轨道计算系统与任务规划系统分别独立运行，通过顶部系统导航直接切换展示。</p></div><a className="primary-action" href={taskPlanningUrl}>进入任务规划系统 <span>→</span></a></section>
    </main>
  </section>
}
