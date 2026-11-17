import { useState } from 'react'
import { productSystems } from '../../mocks/systemFramework'
import { BellIcon, ChevronDownIcon, InfoIcon, UserIcon } from '../ui/SystemIcons'
import { is0701, productName, versionUrl } from '../../version'

export function SystemHeader() {
  const [aboutVisible, setAboutVisible] = useState(false)

  return <header className="system-header">
    <div className="system-brand">
      <span className="seal">SP</span>
      <div>
        <strong>{is0701 ? '测运控平台' : '星枢任务控制系统'}</strong>
        <small>{productName}</small>
      </div>
      <button className="info-button" type="button" aria-label="系统说明" title="系统说明" aria-expanded={aboutVisible} onClick={() => setAboutVisible((visible) => !visible)}>
        <InfoIcon />
      </button>
      {aboutVisible && <section className="about-popover" aria-label="系统说明">
        <strong>星枢任务控制系统（SP-MCS）</strong>
        <p>面向卫星星座的地面任务管控平台，提供多个业务系统的统一入口。</p>
      </section>}
    </div>
    <nav className="module-navigation" aria-label="产品系统导航">
      {productSystems.map((module) => module.href ? (
        <a className={`module-entry${module.active ? ' is-active' : ''}`} href={module.href} key={module.label}>{module.label}</a>
      ) : (
        <span className={`module-entry is-disabled${module.global ? ' is-global' : ''}`} aria-disabled="true" key={module.label}>{module.label}</span>
      ))}
    </nav>
    <a className="header-version-switch" href={versionUrl} title={`切换至 ${is0701 ? 'SP-MCS 标准版' : 'SP-MCS-0701 项目版'}`}>
      <span>{productName}</span><span>切换至 {is0701 ? '标准版' : '0701 项目版'} ↗</span>
    </a>
    <div className="user-area">
      <span className="notice" aria-label="通知"><BellIcon /></span>
      <span className="avatar" aria-hidden="true"><UserIcon /></span>
      <span>演示用户</span>
      <span className="arrow"><ChevronDownIcon size={14} /></span>
    </div>
  </header>
}
