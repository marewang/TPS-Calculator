import React, { useEffect, useMemo, useState } from 'react'

// Helpers
const fmtInt = (n) => (isFinite(n) ? Math.round(n).toLocaleString('id-ID') : '-')
const fmtDec = (n, d = 2) => (isFinite(n) ? n.toLocaleString('id-ID', { maximumFractionDigits: d, minimumFractionDigits: d }) : '-')
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
const parseNumber = (v) => {
  if (typeof v === 'number') return v
  if (!v) return 0
  const cleaned = String(v).replace(/\./g, '').replace(/,/g, '.').replace(/\s/g, '')
  const n = Number(cleaned)
  return isFinite(n) ? n : 0
}

// Defaults
const defaults = { users: 1_000_000, dauPercent: 10, concurrentPercent: 2, thinkTimeSec: 5 }

export default function App() {
  const [users, setUsers] = useState(defaults.users)
  const [dauPercent, setDauPercent] = useState(defaults.dauPercent)
  const [concurrentPercent, setConcurrentPercent] = useState(defaults.concurrentPercent)
  const [thinkTimeSec, setThinkTimeSec] = useState(defaults.thinkTimeSec)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('capacity_calc_v1')
      if (saved) {
        const s = JSON.parse(saved)
        if (typeof s.users === 'number') setUsers(s.users)
        if (typeof s.dauPercent === 'number') setDauPercent(s.dauPercent)
        if (typeof s.concurrentPercent === 'number') setConcurrentPercent(s.concurrentPercent)
        if (typeof s.thinkTimeSec === 'number') setThinkTimeSec(s.thinkTimeSec)
      }
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('capacity_calc_v1', JSON.stringify({ users, dauPercent, concurrentPercent, thinkTimeSec }))
  }, [users, dauPercent, concurrentPercent, thinkTimeSec])

  const dauRate = useMemo(() => clamp(parseNumber(dauPercent) / 100, 0, 1), [dauPercent])
  const concurrentRate = useMemo(() => clamp(parseNumber(concurrentPercent) / 100, 0, 1), [concurrentPercent])

  const dau = useMemo(() => users * dauRate, [users, dauRate])
  const peakConcurrent = useMemo(() => dau * concurrentRate, [dau, concurrentRate])
  const rpsPerUser = useMemo(() => (thinkTimeSec > 0 ? 1 / thinkTimeSec : 0), [thinkTimeSec])
  const tps = useMemo(() => peakConcurrent * rpsPerUser, [peakConcurrent, rpsPerUser])

  const resetDefaults = () => { setUsers(defaults.users); setDauPercent(defaults.dauPercent); setConcurrentPercent(defaults.concurrentPercent); setThinkTimeSec(defaults.thinkTimeSec) }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="px-6 py-5 border-b bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Kalkulator Kapasitas (DAU • Concurrency • TPS)</h1>
        <p className="text-sm text-slate-600 mt-1">Masukkan asumsi untuk menghitung DAU, Peak Concurrent, RPS per user, dan TPS total.</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid gap-6">
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold">Input Asumsi</h2>
            <div className="flex gap-2">
              <button onClick={resetDefaults} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm">Reset Default</button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputCard label="Jumlah User Terdaftar" hint="contoh: 1.000.000" value={users} onChange={(v) => setUsers(Math.max(0, parseNumber(v)))} suffix="user" />
            <InputCard label="% Daily Active Users (DAU)" hint="mis. 10 artinya 10%" value={dauPercent} onChange={(v) => setDauPercent(Math.max(0, parseNumber(v)))} suffix="%" />
            <InputCard label="% Peak Concurrent" hint="mis. 2 artinya 2% dari DAU" value={concurrentPercent} onChange={(v) => setConcurrentPercent(Math.max(0, parseNumber(v)))} suffix="%" />
            <InputCard label="Think Time" hint="detik per aksi (mis. 5 detik, bisa 0.5)" value={thinkTimeSec} onChange={(v) => setThinkTimeSec(Math.max(0.1, parseNumber(v)))} suffix="detik" />
          </div>

          <p className="text-xs text-slate-500 mt-3">Catatan: % diinput sebagai angka biasa (contoh 10 = 10%). Think time bisa desimal (contoh 0.5 detik = 2 RPS/user).</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Jumlah DAU" value={fmtInt(dau)} subtitle={`= Users × ${fmtDec(dauRate*100,2)}%`} />
          <StatCard title="Peak Concurrent" value={fmtInt(peakConcurrent)} subtitle={`= DAU × ${fmtDec(concurrentRate*100,2)}%`} />
          <StatCard title="RPS per User" value={fmtDec(rpsPerUser, 3)} subtitle="= 1 ÷ Think Time (detik)" />
          <StatCard title="TPS Total (≈ RPS)" value={fmtInt(tps)} subtitle="= Peak Concurrent × RPS/User" />
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold">What‑if: geser untuk melihat dampak</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="text-sm font-medium">Think Time (detik)</label>
              <input type="range" min={0.1} max={60} step={0.1} value={thinkTimeSec} onChange={(e) => setThinkTimeSec(parseNumber(e.target.value))} className="w-full" />
              <div className="text-sm text-slate-600 mt-1">{thinkTimeSec} detik → RPS/User ≈ {fmtDec(rpsPerUser, 3)}</div>
            </div>
            <div>
              <label className="text-sm font-medium">% Peak Concurrent</label>
              <input type="range" min={0} max={10} step={0.1} value={concurrentPercent} onChange={(e) => setConcurrentPercent(parseNumber(e.target.value))} className="w-full" />
              <div className="text-sm text-slate-600 mt-1">{fmtDec(concurrentPercent,1)}% dari DAU → Peak ≈ {fmtInt(peakConcurrent)}</div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold">Rumus yang dipakai</h2>
          <ul className="list-disc pl-6 mt-3 text-sm leading-7 text-slate-700">
            <li><span className="font-medium">DAU</span> = <code>Users × (DAU%)</code></li>
            <li><span className="font-medium">Peak Concurrent</span> = <code>DAU × (Concurrent%)</code></li>
            <li><span className="font-medium">RPS per User</span> = <code>1 ÷ Think Time (detik)</code></li>
            <li><span className="font-medium">TPS Total</span> ≈ <code>Peak Concurrent × RPS per User</code></li>
          </ul>
        </section>

        <footer className="text-xs text-slate-500 pb-8">
          Siap untuk Vercel. Build: <code>npm run build</code> → Output: <code>dist</code>. Node 18+.
        </footer>
      </main>
    </div>
  )
}

function InputCard({ label, hint, value, onChange, suffix }) {
  return (
    <div className="border rounded-2xl p-4 bg-slate-50 hover:bg-slate-100 transition">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="text" inputMode="decimal" className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" value={String(value)} onChange={(e) => onChange(e.target.value)} />
        {suffix && <span className="text-sm text-slate-600 w-16 text-right">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-2">{subtitle}</div>}
    </div>
  )
}
