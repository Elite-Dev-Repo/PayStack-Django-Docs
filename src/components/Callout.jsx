const styles = {
  info:    { border: '#79C0FF', bg: 'rgba(121,192,255,0.07)', titleColor: '#79C0FF', icon: 'ℹ' },
  warn:    { border: '#F7B96B', bg: 'rgba(247,185,107,0.07)', titleColor: '#F7B96B', icon: '⚠' },
  success: { border: '#00D46A', bg: 'rgba(0,212,106,0.07)',   titleColor: '#00D46A', icon: '✓' },
  danger:  { border: '#FF5A5A', bg: 'rgba(255,90,90,0.07)',   titleColor: '#FF5A5A', icon: '⛔' },
}

export default function Callout({ type = 'info', title, children }) {
  const s = styles[type]
  return (
    <div className="my-5 rounded-lg p-4 border-l-[3px]" style={{ background: s.bg, borderColor: s.border }}>
      {title && (
        <div className="text-[11px] font-semibold tracking-wider uppercase mb-1.5" style={{ color: s.titleColor }}>
          {s.icon} {title}
        </div>
      )}
      <div className="text-[13px] text-[#A0ABBE] leading-relaxed">{children}</div>
    </div>
  )
}
