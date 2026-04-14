import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CodeBlock({ lang, filename, children }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="my-5 rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161D2E] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-[#00D46A] tracking-wider uppercase">{lang}</span>
          {filename && <span className="text-[12px] text-[#5A6478] font-mono">{filename}</span>}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-[#5A6478] hover:text-[#A0ABBE] transition-colors cursor-pointer bg-transparent border-none px-2 py-1 rounded hover:bg-white/5"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-[#111622] overflow-x-auto">
        <pre className="p-5 m-0 text-[13px] leading-[1.8]">
          <code dangerouslySetInnerHTML={{ __html: children }} />
        </pre>
      </div>
    </div>
  )
}
