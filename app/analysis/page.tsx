'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Stats } from '@/lib/types'

export default function AnalysisPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [window, setWindow] = useState<'all' | '1000' | '200' | 'custom'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    if (window !== 'custom') {
      fetchStats()
    }
  }, [window])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ window })
    if (window === 'custom' && fromDate && toDate) {
      params.append('from', fromDate)
      params.append('to', toDate)
    }

    try {
      const response = await fetch(`/api/stats?${params}`)
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomFetch = () => {
    if (fromDate && toDate) {
      fetchStats()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            Analyse <span className="text-emerald-400 font-light">&</span> Statistiques
          </h1>
          <p className="text-slate-400 text-lg">Visualisez et étudiez le comportement des numéros au fil du temps.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 mb-10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <span className="text-emerald-400">⏱️</span> Fenêtre de données
        </h2>

        <div className="flex flex-wrap gap-4 mb-6 relative z-10">
          {[
            { id: 'all', label: 'Tout (2412)' },
            { id: '1000', label: '1000 derniers' },
            { id: '200', label: '200 derniers' },
            { id: 'custom', label: 'Personnalisé' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setWindow(btn.id as any)}
              className={`px-6 py-3 rounded-xl transition-all font-medium ${window === btn.id
                  ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-dark-900/50 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {window === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 items-end relative z-10 animate-slide-up">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-slate-300 mb-2">Date début</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all [color-scheme:dark]"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-slate-300 mb-2">Date fin</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all [color-scheme:dark]"
              />
            </div>
            <button
              onClick={handleCustomFetch}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 font-semibold"
            >
              Analyser
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-20 animate-pulse">
          <div className="inline-block h-16 w-16 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-slate-400 font-medium tracking-widest uppercase">Analyse en cours...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 flex items-center gap-4">
          <span className="text-red-400 text-2xl">❌</span>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-8 animate-slide-up">

          {/* VUE D'ENSEMBLE */}
          <div className="glass rounded-3xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Vue d&apos;ensemble</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                <p className="text-sm text-indigo-300 font-semibold uppercase tracking-wider mb-2">Total tirages</p>
                <p className="text-4xl font-extrabold text-white">{stats.totalDraws}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <p className="text-sm text-emerald-300 font-semibold uppercase tracking-wider mb-2">Somme P10</p>
                <p className="text-4xl font-extrabold text-white">{stats.sumPercentiles.p10}</p>
              </div>
              <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/5 border border-rose-500/20 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                <p className="text-sm text-rose-300 font-semibold uppercase tracking-wider mb-2">Somme P90</p>
                <p className="text-4xl font-extrabold text-white">{stats.sumPercentiles.p90}</p>
              </div>
            </div>
          </div>

          {/* FREQUENCES NUMEROS */}
          <div className="glass rounded-3xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-8">Fréquences des numéros</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.numberFrequencies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="count" fill="url(#blueGradient)" name="Occurrences" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FREQUENCES CHANCE */}
          <div className="glass rounded-3xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-8">Fréquences Numéro Chance</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chanceFrequencies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="count" fill="url(#goldGradient)" name="Occurrences" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* DISTRIBUTION PAIR/IMPAIR */}
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6">Pair / Impair</h2>
              <div className="space-y-5">
                {stats.evenOddDistribution.slice(0, 5).map((dist, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-40 text-slate-300 font-medium text-sm">
                      <span className="text-white">{dist.even}</span> pair / <span className="text-white">{dist.odd}</span> impair
                    </div>
                    <div className="flex-1 bg-dark-900/50 rounded-full h-8 border border-white/5 overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full flex items-center justify-end pr-3 text-white text-xs font-bold rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-1000"
                        style={{ width: `${Math.max((dist.count / stats.totalDraws) * 100, 15)}%` }}
                      >
                        {dist.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DISTRIBUTION BAS/HAUT */}
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6">Bas / Haut (1-24 / 25-49)</h2>
              <div className="space-y-5">
                {stats.lowHighDistribution.slice(0, 5).map((dist, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-40 text-slate-300 font-medium text-sm">
                      <span className="text-white">{dist.low}</span> bas / <span className="text-white">{dist.high}</span> haut
                    </div>
                    <div className="flex-1 bg-dark-900/50 rounded-full h-8 border border-white/5 overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full flex items-center justify-end pr-3 text-white text-xs font-bold rounded-full shadow-[0_0_10px_rgba(45,212,191,0.3)] transition-all duration-1000"
                        style={{ width: `${Math.max((dist.count / stats.totalDraws) * 100, 15)}%` }}
                      >
                        {dist.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* GAPS */}
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6">Écarts actuels (Gaps)</h2>
              <p className="text-sm text-slate-400 mb-6">Nombre de tirages depuis la dernière sortie du numéro.</p>
              <div className="grid grid-cols-7 gap-2">
                {stats.currentGaps.slice(0, 49).map((gap) => (
                  <div
                    key={gap.number}
                    className={`text-center py-2 rounded-lg border ${gap.gap > 50
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : gap.gap > 30
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                          : 'bg-dark-900/50 border-white/5 text-slate-300'
                      } transition-colors hover:bg-white/10`}
                  >
                    <div className="font-bold">{gap.number}</div>
                    <div className="text-[10px] opacity-80 mt-1">{gap.gap}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP PAIRES */}
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6">Top Paires & Affinités</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.topPairs.slice(0, 15).map((pair, i) => (
                  <div key={i} className="flex items-center justify-between bg-dark-900/50 border border-white/5 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-900/50 border border-primary-500/30 flex items-center justify-center font-bold text-white shadow-inner">
                        {pair.pair[0]}
                      </div>
                      <span className="text-slate-500 font-bold px-1">+</span>
                      <div className="w-10 h-10 rounded-full bg-primary-900/50 border border-primary-500/30 flex items-center justify-center font-bold text-white shadow-inner">
                        {pair.pair[1]}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-primary-400 font-bold text-xl group-hover:text-primary-300 transition-colors">
                        {pair.count} <span className="text-sm font-normal text-slate-500">fois</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
