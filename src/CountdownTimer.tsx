import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Clock, Copy, Check, Calendar } from 'lucide-react'

const translations = {
  en: {
    title: 'Countdown Timer',
    subtitle: 'Countdown to any date and time. Shareable via URL.',
    targetLabel: 'Target date & time',
    titleLabel: 'Event name (optional)',
    titlePlaceholder: 'e.g. New Year 2025',
    shareUrl: 'Share URL',
    copied: 'Copied!',
    copy: 'Copy',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    expired: 'This countdown has expired!',
    setDate: 'Set a date above to start the countdown.',
    builtBy: 'Built by',
  },
  pt: {
    title: 'Temporizador de Contagem Regressiva',
    subtitle: 'Contagem regressiva para qualquer data e hora. Compartilhavel via URL.',
    targetLabel: 'Data e hora alvo',
    titleLabel: 'Nome do evento (opcional)',
    titlePlaceholder: 'ex: Ano Novo 2025',
    shareUrl: 'Compartilhar URL',
    copied: 'Copiado!',
    copy: 'Copiar',
    days: 'Dias',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    expired: 'Esta contagem regressiva expirou!',
    setDate: 'Defina uma data acima para iniciar a contagem.',
    builtBy: 'Criado por',
  }
} as const

type Lang = keyof typeof translations

function parseURLParams() {
  if (typeof window === 'undefined') return { target: '', title: '' }
  const params = new URLSearchParams(window.location.search)
  return { target: params.get('target') ?? '', title: params.get('title') ?? '' }
}

function timeDiff(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, total: diff }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds, expired: false, total: diff }
}

export default function CountdownTimer() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const params = parseURLParams()
  const [targetStr, setTargetStr] = useState(params.target || '')
  const [eventTitle, setEventTitle] = useState(params.title || '')
  const [now, setNow] = useState(Date.now())
  const [copied, setCopied] = useState(false)

  const t = translations[lang]

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const target = targetStr ? new Date(targetStr) : null
  const diff = (target && !isNaN(target.getTime()) && now > 0) ? timeDiff(target) : null

  const getShareURL = () => {
    const base = window.location.href.split('?')[0]
    const params = new URLSearchParams({ target: targetStr, ...(eventTitle ? { title: eventTitle } : {}) })
    return `${base}?${params.toString()}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareURL()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const toLocalInput = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toISOString().slice(0, 16)
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  const segments = diff ? [
    { label: t.days, value: diff.days, color: 'purple' },
    { label: t.hours, value: diff.hours, color: 'blue' },
    { label: t.minutes, value: diff.minutes, color: 'green' },
    { label: t.seconds, value: diff.seconds, color: 'amber' },
  ] : null

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-white" />
            </div>
            <span className="font-semibold">Countdown Timer</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/countdown-timer" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Config */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.titleLabel}</label>
                <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder={t.titlePlaceholder}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2"><Calendar size={14} />{t.targetLabel}</label>
                <input type="datetime-local" value={toLocalInput(targetStr)} onChange={e => setTargetStr(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            {targetStr && (
              <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? t.copied : t.shareUrl}
              </button>
            )}
          </div>

          {/* Countdown display */}
          {diff ? (
            diff.expired ? (
              <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-6 py-8 text-center">
                <p className="text-2xl font-bold text-red-500">{t.expired}</p>
                {eventTitle && <p className="mt-1 text-zinc-500">{eventTitle}</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4">
                {eventTitle && <h2 className="text-center text-xl font-semibold text-zinc-700 dark:text-zinc-300">{eventTitle}</h2>}
                <div className="grid grid-cols-4 gap-3">
                  {segments!.map(seg => (
                    <div key={seg.label} className="flex flex-col items-center gap-1.5">
                      <div className={`w-full rounded-xl border-2 border-${seg.color}-200 dark:border-${seg.color}-800 bg-${seg.color}-50 dark:bg-${seg.color}-900/20 py-4 flex items-center justify-center`}>
                        <span className={`text-4xl sm:text-5xl font-bold tabular-nums font-mono text-${seg.color}-500`}>
                          {seg.label === t.days ? String(seg.value) : pad(seg.value)}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{seg.label}</span>
                    </div>
                  ))}
                </div>
                {target && (
                  <p className="text-center text-xs text-zinc-400">
                    {target.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-12 text-center text-zinc-400">
              {t.setDate}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-purple-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
