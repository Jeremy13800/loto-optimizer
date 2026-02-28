'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import NumberBadge from '@/components/NumberBadge'

interface DrawDetail {
  id: string
  dateISO: string
  dateLabel: string
  nums: number[]
  chance: number
  source: string
  rawDateText?: string
  previousId: string | null
  nextId: string | null
}

export default function DrawDetailPage() {
  const params = useParams()
  const [draw, setDraw] = useState<DrawDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchDraw(params.id as string)
    }
  }, [params.id])

  const fetchDraw = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/draws/${id}`)
      if (!response.ok) throw new Error('Draw not found')
      
      const data = await response.json()
      setDraw(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !draw) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">❌ {error || 'Tirage non trouvé'}</p>
          <Link href="/results" className="text-primary-600 hover:underline mt-4 inline-block">
            ← Retour aux résultats
          </Link>
        </div>
      </div>
    )
  }

  const sum = draw.nums.reduce((a, b) => a + b, 0)
  const range = Math.max(...draw.nums) - Math.min(...draw.nums)
  const evenCount = draw.nums.filter(n => n % 2 === 0).length
  const oddCount = 5 - evenCount
  const lowCount = draw.nums.filter(n => n <= 24).length
  const highCount = 5 - lowCount

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/results" className="text-primary-600 hover:underline mb-6 inline-block">
        ← Retour aux résultats
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-primary-700">Détails du tirage</h1>

          <div className="mb-6">
            <p className="text-2xl font-semibold text-gray-800 mb-2">{draw.dateLabel}</p>
            <p className="text-gray-500">{draw.dateISO}</p>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-3">Numéros tirés :</p>
            <div className="flex gap-3">
              {draw.nums.map((num) => (
                <NumberBadge key={num} number={num} size="lg" />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-3">Numéro Chance :</p>
            <NumberBadge number={draw.chance} variant="chance" size="lg" />
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Statistiques</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Somme</p>
                <p className="text-2xl font-bold text-gray-800">{sum}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Amplitude</p>
                <p className="text-2xl font-bold text-gray-800">{range}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pair / Impair</p>
                <p className="text-2xl font-bold text-gray-800">{evenCount} / {oddCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Bas (1-24) / Haut (25-49)</p>
                <p className="text-2xl font-bold text-gray-800">{lowCount} / {highCount}</p>
              </div>
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <p className="text-sm text-gray-500">Source: {draw.source}</p>
            {draw.rawDateText && (
              <p className="text-xs text-gray-400 mt-1">Date brute: {draw.rawDateText}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          {draw.previousId ? (
            <Link
              href={`/results/${draw.previousId}`}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              ← Tirage précédent
            </Link>
          ) : (
            <div></div>
          )}
          
          {draw.nextId ? (
            <Link
              href={`/results/${draw.nextId}`}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Tirage suivant →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
}
