import { orbitNavigation } from '../../mocks/orbitTrackManage'
import { CalculatorIcon, ControlIcon, OrbitIcon, SettingsIcon, WarningIcon } from '../ui/SystemIcons'
import { is0701 } from '../../version'

type Props = { currentRoute: string; onNavigate: (route: string) => void }
const groupIcons = [OrbitIcon, CalculatorIcon, ControlIcon, WarningIcon] as const

export function SystemSidebar({ currentRoute, onNavigate }: Props) {
  return <aside className="side-nav" aria-label="轨道计算分系统导航">
    <div className="system-title"><span className="system-mark" aria-hidden="true"><SettingsIcon size={15} /></span><span>轨道计算分系统</span></div>
    <nav className="side-menu">
      {orbitNavigation.filter((group) => !is0701 || (group.label !== '轨道控制' && group.label !== '碰撞预警')).map((group, index) => {
        const GroupIcon = groupIcons[index] ?? SettingsIcon
        return <section className="side-menu-group" key={group.label}>
          <span className="side-group"><span className="side-group-icon" aria-hidden="true"><GroupIcon size={16} /></span>{group.label}</span>
          {group.items.filter((item) => !is0701 || !['精密定轨记录', '事后精密定轨', '对端星轨道计算', '北斗亚太过境预报'].includes(item.label)).map((item) => <button className={`side-entry${item.route === currentRoute ? ' is-active' : ''}`} aria-current={item.route === currentRoute ? 'page' : undefined} type="button" key={item.label} onClick={() => onNavigate(item.route)}>{item.label}</button>)}
        </section>
      })}
    </nav>
  </aside>
}
