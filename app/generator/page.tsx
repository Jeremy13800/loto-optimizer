'use client'

import { useState } from 'react'
import NumberBadge from '@/components/NumberBadge'
import { GenerateConstraints, GeneratedGrid } from '@/lib/types'

export default function GeneratorPage() {
  const [generating, setGenerating] = useState(false)
  const [grids, setGrids] = useState<GeneratedGrid[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [genStats, setGenStats] = useState<any>(null)

  const [count, setCount] = useState(5)
  const [window, setWindow] = useState<'all' | '1000' | '200'>('all')
  const [excludePrevious, setExcludePrevious] = useState(true)
  const [excludePreviousChance, setExcludePreviousChance] = useState(false)
  const [evenOddRatio, setEvenOddRatio] = useState<'2/3' | '3/2' | ''>('')
  const [lowHighRatio, setLowHighRatio] = useState<'2/3' | '3/2' | ''>('')
  const [maxPerDecade, setMaxPerDecade] = useState(2)
  const [minRange, setMinRange] = useState(25)
  const [minHighNumbers, setMinHighNumbers] = useState(2)
  const [maxMultiplesOf5, setMaxMultiplesOf5] = useState(1)
  const [avoidPopular, setAvoidPopular] = useState('')
  const [avoidChances, setAvoidChances] = useState('')
  const [maxOverlap, setMaxOverlap] = useState(1)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setWarnings([])
    setGrids([])
    setGenStats(null)

    const constraints: GenerateConstraints = {
      window: { window },
      count,
      excludePreviousDraw: excludePrevious,
      excludePreviousChance,
      maxPerDecade,
      minRange,
      minHighNumbers,
      maxMultiplesOf5,
      maxOverlap,
    }

    if (evenOddRatio) constraints.evenOddRatio = evenOddRatio
    if (lowHighRatio) constraints.lowHighRatio = lowHighRatio
    
    if (avoidPopular.trim()) {
      const nums = avoidPopular.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 49)
      if (nums.length > 0) constraints.avoidPopular = nums
    }

    if (avoidChances.trim()) {
      const chances = avoidChances.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 10)
      if (chances.length > 0) constraints.avoidChances = chances
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constraints),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate grids')
      }

      const data = await response.json()
      setGrids(data.grids)
      setWarnings(data.warnings || [])
      setGenStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  const exportCSV = () => {
    if (grids.length === 0) return

    const headers = ['Grille', 'N1', 'N2', 'N3', 'N4', 'N5', 'Chance', 'Score', 'Somme', 'Amplitude']
    const rows = grids.map((grid, i) => [
      i + 1,
      ...grid.nums,
      grid.chance,
      grid.score.toFixed(1),
      grid.metadata.sum,
      grid.metadata.range,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `loto-grids-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-primary-700">Générateur de grilles</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-yellow-800 font-medium">
          ⚠️ Disclaimer: Ce générateur utilise des contraintes statistiques pour créer des grilles optimisées.
          Cela ne garantit aucun gain. Les résultats du Loto sont aléatoires et imprévisibles.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Configuration</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de grilles</label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fenêtre statistique</label>
            <div className="flex gap-3">
              <button
                onClick={() => setWindow('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  window === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setWindow('1000')}
                className={`px-4 py-2 rounded-lg transition ${
                  window === '1000' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                1000 derniers
              </button>
              <button
                onClick={() => setWindow('200')}
                className={`px-4 py-2 rounded-lg transition ${
                  window === '200' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                200 derniers
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Contraintes dures</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={excludePrevious}
                  onChange={(e) => setExcludePrevious(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Exclure numéros du tirage précédent</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={excludePreviousChance}
                  onChange={(e) => setExcludePreviousChance(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Exclure chance précédente</span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ratio Pair/Impair</label>
                <select
                  value={evenOddRatio}
                  onChange={(e) => setEvenOddRatio(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Aucun</option>
                  <option value="2/3">2 pairs / 3 impairs</option>
                  <option value="3/2">3 pairs / 2 impairs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ratio Bas/Haut</label>
                <select
                  value={lowHighRatio}
                  onChange={(e) => setLowHighRatio(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Aucun</option>
                  <option value="2/3">2 bas / 3 hauts</option>
                  <option value="3/2">3 bas / 2 hauts</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Max numéros par dizaine</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxPerDecade}
                  onChange={(e) => setMaxPerDecade(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max overlap entre grilles</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={maxOverlap}
                  onChange={(e) => setMaxOverlap(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Contraintes souples (optimisation)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amplitude min</label>
                <input
                  type="number"
                  min="10"
                  max="48"
                  value={minRange}
                  onChange={(e) => setMinRange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min numéros ≥31</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={minHighNumbers}
                  onChange={(e) => setMinHighNumbers(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max multiples de 5</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={maxMultiplesOf5}
                  onChange={(e) => setMaxMultiplesOf5(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Éviter numéros (ex: 7,13,21)</label>
                <input
                  type="text"
                  value={avoidPopular}
                  onChange={(e) => setAvoidPopular(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="7,13,21"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Éviter chances (ex: 1,7,9)</label>
                <input
                  type="text"
                  value={avoidChances}
                  onChange={(e) => setAvoidChances(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="1,7,9"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-bold text-lg"
          >
            {generating ? 'Génération en cours...' : '🎲 Générer les grilles'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="font-bold text-orange-800 mb-2">⚠️ Avertissements:</p>
          <ul className="list-disc list-inside text-orange-700 text-sm">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {grids.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Grilles générées ({grids.length})</h2>
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                📥 Exporter CSV
              </button>
            </div>
            {genStats && (
              <div className="text-sm text-gray-600 mb-4">
                Iterations: {genStats.iterations} | Rejections: {genStats.rejections} | Score moyen: {genStats.avgScore.toFixed(1)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {grids.map((grid, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-primary-700">Grille {i + 1}</h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Score</div>
                    <div className="text-2xl font-bold text-primary-700">{grid.score.toFixed(1)}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Numéros:</p>
                  <div className="flex gap-3">
                    {grid.nums.map((num) => (
                      <NumberBadge key={num} number={num} size="lg" />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Chance:</p>
                  <NumberBadge number={grid.chance} variant="chance" size="lg" />
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Somme:</span>
                      <span className="ml-2 font-bold">{grid.metadata.sum}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amplitude:</span>
                      <span className="ml-2 font-bold">{grid.metadata.range}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pair/Impair:</span>
                      <span className="ml-2 font-bold">{grid.metadata.evenCount}/{grid.metadata.oddCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bas/Haut:</span>
                      <span className="ml-2 font-bold">{grid.metadata.lowCount}/{grid.metadata.highCount}</span>
                    </div>
                  </div>
                  {grid.metadata.highNumbers.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Numéros ≥31:</span>
                      <span className="ml-2 font-bold">{grid.metadata.highNumbers.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
