export default function DocTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-5">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3.5 py-2.5 bg-[#161D2E] text-[11px] font-semibold text-[#5A6478] tracking-wider uppercase border-b border-white/[0.06]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.06] last:border-0 hover:bg-[#161D2E] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3.5 py-2.5 text-[#A0ABBE] align-top" dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
