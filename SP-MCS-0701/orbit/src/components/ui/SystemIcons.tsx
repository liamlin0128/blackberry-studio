type IconProps = { size?: number }

export function CloseIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export function SettingsIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05-2.1 2.1-.05-.05a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56v.08h-3v-.08A1.7 1.7 0 0 0 10.7 18.6a1.7 1.7 0 0 0-1.87.34l-.05.05-2.1-2.1.05-.05A1.7 1.7 0 0 0 7.07 15a1.7 1.7 0 0 0-1.56-1.03h-.08v-3h.08A1.7 1.7 0 0 0 7.07 9.94a1.7 1.7 0 0 0-.34-1.87l-.05-.05 2.1-2.1.05.05a1.7 1.7 0 0 0 1.87.34 1.7 1.7 0 0 0 1.03-1.56v-.08h3v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.05-.05 2.1 2.1-.05.05a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.56 1.03h.08v3h-.08A1.7 1.7 0 0 0 19.4 15Z" /></svg>
}

export function InfoIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="8" /><path d="M12 10v5M12 7h.01" /></svg>
}

export function BellIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
}

export function UserIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
}

export function ChevronDownIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m7 10 5 5 5-5" /></svg>
}

export function OrbitIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="8.5" ry="4.5" transform="rotate(-35 12 12)" /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /><path d="M17.8 5.2h.01" /></svg>
}

export function CalculatorIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></svg>
}

export function ControlIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M5 17h14M9 7a2 2 0 1 0 0 .01M15 17a2 2 0 1 0 0 .01" /></svg>
}

export function WarningIcon({ size = 16 }: IconProps) {
  return <svg aria-hidden="true" className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 3.7 19h16.6L12 4Z" /><path d="M12 9v4M12 16h.01" /></svg>
}
