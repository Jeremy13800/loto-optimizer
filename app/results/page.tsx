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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-primary-700">Résultats des tirages</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Filtres</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Numéro (1-49)</label>
            <input
              type="number"
              min="1"
              max="49"
              value={numFilter}
              onChange={(e) => setNumFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: 7"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Chance (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={chanceFilter}
              onChange={(e) => setChanceFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date début</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date fin</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleFilter}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Appliquer
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {!loading && data && (
        <>
          <div className="mb-6 text-gray-600">
            {data.total} tirage{data.total > 1 ? 's' : ''} trouvé{data.total > 1 ? 's' : ''}
          </div>

          <div className="space-y-6">
            {data.draws.map((draw) => (
              <div key={draw.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-3">
                  <p className="text-lg font-semibold text-gray-800">{draw.dateLabel}</p>
                  <p className="text-sm text-gray-500">{draw.dateISO}</p>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Tirage :</p>
                  <div className="flex gap-2">
                    {draw.nums.map((num) => (
                      <NumberBadge key={num} number={num} />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Chance :</p>
                  <NumberBadge number={draw.chance} variant="chance" />
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="text-gray-400 text-sm">* * *</div>
                  <Link
                    href={`/results/${draw.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Afficher détails →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
              >
                ← Précédent
              </button>
              
              <div className="flex items-center gap-2">
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
                      className={`px-4 py-2 rounded-lg transition ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
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
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
