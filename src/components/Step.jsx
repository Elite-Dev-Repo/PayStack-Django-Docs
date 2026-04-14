export function Steps({ children }) {
  return <div className="my-6">{children}</div>
}

export function Step({ num, title, children }) {
  return (
    <div className="flex gap-5 py-4 border-b border-white/[0.06] last:border-0">
      <div className="w-7 h-7 flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center text-[12px] font-semibold"
        style={{ background: 'rgba(0,212,106,0.12)', border: '1px solid rgba(0,212,106,0.25)', color: '#00D46A' }}>
        {num}
      </div>
      <div>
        <h4 className="text-[14px] font-semibold text-[#E8EDF5] mb-1">{title}</h4>
        <p className="text-[13px] text-[#A0ABBE] m-0">{children}</p>
      </div>
    </div>
  )
}
