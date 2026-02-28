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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-primary-700">Analyse statistique</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Fenêtre de données</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setWindow('all')}
            className={`px-4 py-2 rounded-lg transition ${
              window === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Tout (2412)
          </button>
          <button
            onClick={() => setWindow('1000')}
            className={`px-4 py-2 rounded-lg transition ${
              window === '1000' ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            1000 derniers
          </button>
          <button
            onClick={() => setWindow('200')}
            className={`px-4 py-2 rounded-lg transition ${
              window === '200' ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            200 derniers
          </button>
          <button
            onClick={() => setWindow('custom')}
            className={`px-4 py-2 rounded-lg transition ${
              window === 'custom' ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Personnalisé
          </button>
        </div>

        {window === 'custom' && (
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Date début</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date fin</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleCustomFetch}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Analyser
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Analyse en cours...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Vue d&apos;ensemble</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-primary-600 font-medium">Total tirages</p>
                <p className="text-3xl font-bold text-primary-800">{stats.totalDraws}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Somme P10</p>
                <p className="text-3xl font-bold text-green-800">{stats.sumPercentiles.p10}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Somme P90</p>
                <p className="text-3xl font-bold text-blue-800">{stats.sumPercentiles.p90}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Fréquences des numéros (1-49)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.numberFrequencies}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="number" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563eb" name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {stats.numberFrequencies.slice(0, 49).map((nf) => (
                <div key={nf.number} className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-primary-700">{nf.number}</div>
                  <div className="text-xs text-gray-600">{nf.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Fréquences Chance (1-10)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.chanceFrequencies}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="number" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#eab308" name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Distribution Pair/Impair</h2>
            <div className="space-y-2">
              {stats.evenOddDistribution.slice(0, 10).map((dist, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 font-medium">
                    {dist.even} pair / {dist.odd} impair
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                      style={{ width: `${(dist.count / stats.totalDraws) * 100}%` }}
                    >
                      {dist.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Distribution Bas/Haut (1-24 / 25-49)</h2>
            <div className="space-y-2">
              {stats.lowHighDistribution.slice(0, 10).map((dist, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 font-medium">
                    {dist.low} bas / {dist.high} haut
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                      style={{ width: `${(dist.count / stats.totalDraws) * 100}%` }}
                    >
                      {dist.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Numéros ≥31 par tirage</h2>
            <p className="mb-4 text-gray-600">
              Tirages contenant au moins un numéro ≥31: <strong>{stats.drawsWithHighNumbers}</strong> ({((stats.drawsWithHighNumbers / stats.totalDraws) * 100).toFixed(1)}%)
            </p>
            <div className="space-y-2">
              {stats.highNumberDistribution.map((dist) => (
                <div key={dist.count} className="flex items-center gap-4">
                  <div className="w-32 font-medium">{dist.count} numéro(s)</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-orange-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-sm"
                      style={{ width: `${(dist.frequency / stats.totalDraws) * 100}%` }}
                    >
                      {dist.frequency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Gaps actuels (tirages depuis dernière sortie)</h2>
            <div className="grid grid-cols-7 gap-2">
              {stats.currentGaps.slice(0, 49).map((gap) => (
                <div
                  key={gap.number}
                  className={`text-center p-2 rounded ${
                    gap.gap > 50 ? 'bg-red-100 border border-red-300' : 'bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-primary-700">{gap.number}</div>
                  <div className="text-xs text-gray-600">{gap.gap}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Top 20 paires fréquentes</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {stats.topPairs.map((pair, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">
                    {pair.pair[0]} - {pair.pair[1]}
                  </div>
                  <div className="text-primary-700 font-bold">{pair.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
