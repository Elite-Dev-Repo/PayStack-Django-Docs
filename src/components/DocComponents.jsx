import React, { useState } from 'react'

/* ── Code Block ── */
export function CodeBlock({ lang = 'python', filename, children }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-white/[0.06]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161D2E] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-[#00D46A] uppercase tracking-wide">{lang}</span>
          {filename && <span className="text-[12px] text-[#5A6478] font-mono">{filename}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="text-[11px] text-[#5A6478] hover:text-[#A0ABBE] hover:bg-[#1C2438] px-2 py-1 rounded transition-all"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bg-[#111622] px-5 py-5 overflow-x-auto text-[13px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlight(children, lang) }} />
      </pre>
    </div>
  )
}

/* very lightweight syntax highlighter */
function highlight(code, lang) {
  const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  if (lang === 'bash' || lang === 'ini' || lang === 'env' || lang === 'http') return escaped

  return escaped
    .replace(/(#[^\n]*)/g, '<span style="color:#5A6478">$1</span>')
    .replace(/\b(import|from|class|def|return|if|else|elif|try|except|raise|with|as|not|and|or|in|is|True|False|None|for|while|pass|break|continue|async|await|yield|lambda|self)\b/g,
      '<span style="color:#CF8DFB">$1</span>')
    .replace(/\b(APIView|Response|APIException|BasePermission|ModelSerializer|Serializer|ViewSet|Router|CharField|EmailField|IntegerField|BooleanField|DateTimeField|JSONField|ForeignKey|models|status|settings|timezone|serializers)\b/g,
      '<span style="color:#79C0FF">$1</span>')
    .replace(/(["'`])((?:(?!\1).)*)\1/g, '<span style="color:#F7B96B">$1$2$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#F7B96B">$1</span>')
    .replace(/\b(def |class )(\w+)/g, '$1<span style="color:#00D46A">$2</span>')
}

/* ── Callout ── */
const CALLOUT_STYLES = {
  info:    { bg: 'rgba(121,192,255,0.07)', border: '#79C0FF', titleColor: '#79C0FF', icon: 'ℹ' },
  warn:    { bg: 'rgba(247,185,107,0.07)', border: '#F7B96B', titleColor: '#F7B96B', icon: '⚠' },
  success: { bg: 'rgba(0,212,106,0.07)',   border: '#00D46A', titleColor: '#00D46A', icon: '✓' },
  danger:  { bg: 'rgba(255,90,90,0.07)',   border: '#FF5A5A', titleColor: '#FF5A5A', icon: '⛔' },
}

export function Callout({ type = 'info', title, children }) {
  const s = CALLOUT_STYLES[type]
  return (
    <div className="rounded-lg px-5 py-4 my-5 border-l-[3px]" style={{ background: s.bg, borderColor: s.border }}>
      {title && (
        <p className="text-[12px] font-semibold tracking-wide uppercase mb-1.5" style={{ color: s.titleColor }}>
          {s.icon} {title}
        </p>
      )}
      <div className="text-[13px] text-[#A0ABBE] leading-relaxed">{children}</div>
    </div>
  )
}

/* ── Steps ── */
export function Steps({ children }) {
  return <div className="my-6 divide-y divide-white/[0.06]">{children}</div>
}

export function Step({ num, title, children }) {
  return (
    <div className="flex gap-5 py-4">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-semibold text-[#00D46A] mt-0.5"
        style={{ background: 'rgba(0,212,106,0.12)', border: '1px solid rgba(0,212,106,0.3)' }}>
        {num}
      </div>
      <div>
        <h4 className="text-[14px] font-semibold mb-1 text-[#E8EDF5]">{title}</h4>
        <p className="text-[13px] text-[#A0ABBE] leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

/* ── Endpoint Badge ── */
const METHOD_STYLES = {
  GET:    { bg: 'rgba(0,212,106,0.15)',   color: '#00D46A' },
  POST:   { bg: 'rgba(121,192,255,0.15)', color: '#79C0FF' },
  PUT:    { bg: 'rgba(247,185,107,0.15)', color: '#F7B96B' },
  DELETE: { bg: 'rgba(255,90,90,0.15)',   color: '#FF5A5A' },
}

export function Endpoint({ method = 'GET', path }) {
  const s = METHOD_STYLES[method] || METHOD_STYLES.GET
  return (
    <div className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 my-2 font-mono text-[13px]"
      style={{ background: '#161D2E', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded"
        style={{ background: s.bg, color: s.color }}>{method}</span>
      <span className="text-[#A0ABBE]">{path}</span>
    </div>
  )
}

/* ── Inline Code ── */
export function Code({ children }) {
  return (
    <code className="px-1.5 py-0.5 rounded text-[13px] text-[#79C0FF] font-mono"
      style={{ background: '#161D2E', border: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </code>
  )
}

/* ── Table ── */
export function DocTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-5 rounded-xl border border-white/[0.06]">
      <table className="w-full text-[13px]">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#5A6478] uppercase tracking-wide bg-[#161D2E] border-b border-white/[0.06]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-[#161D2E] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-[#A0ABBE] align-top"
                  dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Section heading helpers ── */
export function H1({ children }) {
  return <h1 className="font-display text-4xl font-semibold mb-3 tracking-tight text-[#E8EDF5]" style={{ fontFamily: "'Fraunces', serif" }}>{children}</h1>
}
export function H2({ children }) {
  return <h2 className="text-[22px] font-semibold mt-12 mb-4 pt-12 border-t border-white/[0.06] text-[#E8EDF5]">{children}</h2>
}
export function H3({ children }) {
  return <h3 className="text-[17px] font-semibold mt-8 mb-3 text-[#E8EDF5]">{children}</h3>
}
export function Lead({ children }) {
  return <p className="text-[17px] text-[#A0ABBE] mb-8 leading-relaxed">{children}</p>
}
export function P({ children }) {
  return <p className="text-[15px] text-[#A0ABBE] mb-4 leading-relaxed">{children}</p>
}
export function TagLine({ tags }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-8">
      {tags.map(t => (
        <span key={t} className="text-[12px] px-2.5 py-1 rounded font-mono text-[#A0ABBE]"
          style={{ background: '#161D2E', border: '1px solid rgba(255,255,255,0.06)' }}>{t}</span>
      ))}
    </div>
  )
}
