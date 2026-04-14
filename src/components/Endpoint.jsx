const methodColors = {
  GET:    { bg: 'rgba(0,212,106,0.12)',   color: '#00D46A' },
  POST:   { bg: 'rgba(121,192,255,0.12)', color: '#79C0FF' },
  PUT:    { bg: 'rgba(247,185,107,0.12)', color: '#F7B96B' },
  DELETE: { bg: 'rgba(255,90,90,0.12)',   color: '#FF5A5A' },
}

export default function Endpoint({ method, path }) {
  const s = methodColors[method] || methodColors.GET
  return (
    <div className="inline-flex items-center gap-2 bg-[#161D2E] border border-white/[0.06] rounded-md px-3.5 py-1.5 font-mono text-[13px] my-2">
      <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>
        {method}
      </span>
      <span className="text-[#A0ABBE]">{path}</span>
    </div>
  )
}
