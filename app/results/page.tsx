'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NumberBadge from '@/components/NumberBadge'
import { Draw, PaginatedDraws } from '@/lib/types'

export default function ResultsPage() {
  const [data, setData] = useState<PaginatedDraws | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [numFilter, setNumFilter] = useState('')
  const [chanceFilter, setChanceFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    fetchDraws()
  }, [page, numFilter, chanceFilter, fromDate, toDate])

  const fetchDraws = async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (numFilter) params.append('num', numFilter)
    if (chanceFilter) params.append('chance', chanceFilter)
    if (fromDate) params.append('from', fromDate)
    if (toDate) params.append('to', toDate)

    try {
      const response = await fetch(`/api/draws?${params}`)
      if (!response.ok) throw new Error('Failed to fetch draws')

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setPage(1)
    fetchDraws()
  }

  const handleReset = () => {
    setNumFilter('')
    setChanceFilter('')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            Résultats <span className="text-primary-400 font-light">&</span> Historique
          </h1>
          <p className="text-slate-400 text-lg">Consultez, filtrez et analysez tous les tirages passés.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 mb-10 relative overflow-hidden">
        {/* Subtle background glow for filter panel */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-primary-400">🔍</span> Filtres de recherche
        </h2>
        <div className="grid md:grid-cols-4 gap-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Numéro (1-49)</label>
            <input
              type="number"
              min="1"
              max="49"
              value={numFilter}
              onChange={(e) => setNumFilter(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
              placeholder="Ex: 7"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Chance (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={chanceFilter}
              onChange={(e) => setChanceFilter(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date début</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date fin</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all [color-scheme:dark]"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleFilter}
            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 font-semibold"
          >
            Appliquer les filtres
          </button>
          <button
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-3 rounded-xl transition-all border border-slate-700 font-semibold"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 animate-pulse">
          <div className="inline-block h-16 w-16 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-slate-400 font-medium tracking-widest uppercase">Chargement des tirages...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 flex items-center gap-4">
          <span className="text-red-400 text-2xl">❌</span>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {!loading && data && (
        <div className="animate-slide-up">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-slate-400 text-lg">
              <strong className="text-white text-2xl">{data.total}</strong> tirage{data.total > 1 ? 's' : ''} trouvé{data.total > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {data.draws.map((draw) => (
              <div key={draw.id} className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors border border-white/5 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="mb-3 md:mb-0 md:w-1/4">
                    <p className="text-xl font-bold text-white tracking-tight">{draw.dateLabel}</p>
                    <p className="text-sm text-slate-500 font-mono mt-1">{draw.dateISO}</p>
                  </div>

                  <div className="flex flex-1 items-center gap-8 justify-center md:justify-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tirage Principal</p>
                      <div className="flex gap-2 sm:gap-3">
                        {draw.nums.map((num) => (
                          <NumberBadge key={num} number={num} />
                        ))}
                      </div>
                    </div>

                    <div className="hidden md:block w-px h-16 bg-white/10"></div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center md:text-left">Chance</p>
                      <NumberBadge number={draw.chance} variant="chance" />
                    </div>
                  </div>

                  <div className="flex justify-end md:w-1/6">
                    <Link
                      href={`/results/${draw.id}`}
                      className="text-primary-400 hover:text-white font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Détails <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-5 py-3 bg-dark-900/80 border border-white/10 text-slate-300 justify-center rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 hover:text-white hover:border-transparent transition-all font-medium"
              >
                ← Précédent
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  let pageNum
                  if (data.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= data.totalPages - 2) {
                    pageNum = data.totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl font-medium transition-all ${page === pageNum
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-dark-900/80 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                disabled={page === data.totalPages}
                className="px-5 py-3 bg-dark-900/80 border border-white/10 text-slate-300 justify-center rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 hover:text-white hover:border-transparent transition-all font-medium"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
