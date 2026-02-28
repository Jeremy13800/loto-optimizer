'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setSyncResult(null)

    try {
      const response = await fetch('/api/draws/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la synchronisation')
      } else {
        setSyncResult(data)
      }
    } catch (err) {
      setError('Erreur réseau lors de la synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-6 text-primary-700">
          Analyseur Loto FDJ
        </h1>
        
        <p className="text-xl text-center text-gray-600 mb-12">
          Analysez les tirages historiques et générez des grilles optimisées
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Synchroniser les données</h2>
          <p className="text-gray-600 mb-6">
            Récupérez automatiquement tous les tirages du Loto FDJ depuis ReducMiz (2412 tirages).
          </p>
          
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {syncing ? 'Synchronisation en cours...' : 'Synchroniser maintenant'}
          </button>

          {syncResult && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">✓ Synchronisation réussie</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>Total de tirages: {syncResult.count}</li>
                <li>Nouveaux tirages: {syncResult.inserted}</li>
                <li>Tirages mis à jour: {syncResult.updated}</li>
                <li>Dernier tirage: {syncResult.lastDate}</li>
              </ul>
              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-orange-700">Avertissements:</p>
                  <ul className="text-xs text-orange-600 list-disc list-inside">
                    {syncResult.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/results" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-3 text-primary-700">📊 Résultats</h3>
            <p className="text-gray-600">
              Consultez tous les tirages avec filtres et pagination
            </p>
          </Link>

          <Link href="/analysis" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-3 text-primary-700">📈 Analyse</h3>
            <p className="text-gray-600">
              Statistiques détaillées et visualisations
            </p>
          </Link>

          <Link href="/generator" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-3 text-primary-700">🎲 Générateur</h3>
            <p className="text-gray-600">
              Générez des grilles optimisées avec contraintes
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
