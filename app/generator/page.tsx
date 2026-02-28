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

      // Scroll to results slightly
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
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
    <div className="container mx-auto px-4 py-8 animate-fade-in relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            Générateur <span className="text-purple-400 font-light">&</span> Optimiseur
          </h1>
          <p className="text-slate-400 text-lg">Création intelligente de grilles basées sur des algorithmes statistiques.</p>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-10 flex items-start gap-4 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
        <span className="text-2xl mt-1">⚠️</span>
        <div>
          <p className="text-yellow-400 font-bold mb-1">Avertissement Légal & Statistique</p>
          <p className="text-yellow-200/70 text-sm leading-relaxed">
            Ce générateur utilise des contraintes statistiques historiques pour filtrer et optimiser la création de grilles.
            Cependant, chaque tirage du Loto reste un événement mathématiquement indépendant et totalement aléatoire.
            <strong>Aucune méthode ne peut garantir un gain.</strong>
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-10 mb-10 relative overflow-hidden text-slate-200">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-primary-500 to-emerald-500"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400">⚙️</span> Configuration de l&apos;algorithme
        </h2>

        <div className="space-y-8 relative z-10">

          {/* Section 1: Base */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-dark-900/40 p-6 rounded-2xl border border-white/5">
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">Nombre de grilles</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-2 bg-dark-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-16 h-12 bg-dark-900 border border-purple-500/30 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-inner">
                  {count}
                </div>
              </div>
            </div>

            <div className="bg-dark-900/40 p-6 rounded-2xl border border-white/5">
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">Base d&apos;apprentissage</label>
              <div className="flex bg-dark-900 rounded-xl p-1 border border-white/5">
                {[
                  { id: 'all', label: 'Historique Complet' },
                  { id: '1000', label: '1000 Derniers' },
                  { id: '200', label: '200 Derniers' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setWindow(opt.id as any)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${window === opt.id
                        ? 'bg-purple-600/80 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Contraintes Dures */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-rose-500 rounded-full"></span> Contraintes Strictes
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <label className="flex items-center justify-between bg-dark-900/40 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Exclure numéros du tirage précédent</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={excludePrevious}
                    onChange={(e) => setExcludePrevious(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${excludePrevious ? 'bg-primary-500' : 'bg-dark-900'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${excludePrevious ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between bg-dark-900/40 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Exclure Chance précédente</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={excludePreviousChance}
                    onChange={(e) => setExcludePreviousChance(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${excludePreviousChance ? 'bg-primary-500' : 'bg-dark-900'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${excludePreviousChance ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Ratio Pair / Impair</label>
                <select
                  value={evenOddRatio}
                  onChange={(e) => setEvenOddRatio(e.target.value as any)}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white appearance-none"
                >
                  <option value="">Naturel (Sans contrainte)</option>
                  <option value="2/3">2 Pairs / 3 Impairs (Fréquent)</option>
                  <option value="3/2">3 Pairs / 2 Impairs (Fréquent)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Ratio Bas (1-24) / Haut (25-49)</label>
                <select
                  value={lowHighRatio}
                  onChange={(e) => setLowHighRatio(e.target.value as any)}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white appearance-none"
                >
                  <option value="">Naturel (Sans contrainte)</option>
                  <option value="2/3">2 Bas / 3 Hauts</option>
                  <option value="3/2">3 Bas / 2 Hauts</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Max. numéros par dizaine</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxPerDecade}
                  onChange={(e) => setMaxPerDecade(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Max. doublons entre grilles</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={maxOverlap}
                  onChange={(e) => setMaxOverlap(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contraintes d'Optimisation */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Optimisation Flexibles
            </h3>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Amplitude minimume</label>
                <input
                  type="number"
                  min="10"
                  max="48"
                  value={minRange}
                  onChange={(e) => setMinRange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Qte Min. numéros ≥ 31</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={minHighNumbers}
                  onChange={(e) => setMinHighNumbers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Max. multiples de 5</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={maxMultiplesOf5}
                  onChange={(e) => setMaxMultiplesOf5(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Éviter numéros exacts (CSV)</label>
                <input
                  type="text"
                  value={avoidPopular}
                  onChange={(e) => setAvoidPopular(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-600"
                  placeholder="Ex: 7, 13, 21"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Éviter N° Chance exacts (CSV)</label>
                <input
                  type="text"
                  value={avoidChances}
                  onChange={(e) => setAvoidChances(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-600"
                  placeholder="Ex: 1, 7, 9"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 via-primary-600 to-emerald-600 hover:from-purple-500 hover:via-primary-500 hover:to-emerald-500 text-white py-5 rounded-2xl font-black text-xl tracking-wide transition-all duration-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12"></div>
            {generating ? (
              <span className="flex items-center justify-center gap-4 relative z-10">
                <span className="animate-spin h-6 w-6 border-4 border-white/30 border-t-white rounded-full"></span>
                Génération algorithmique...
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">🎲</span> Lancer la génération
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 flex items-center gap-4 animate-fade-in">
          <span className="text-red-400 text-2xl bg-red-500/20 p-2 rounded-full">❌</span>
          <p className="text-red-100 font-medium text-lg">{error}</p>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-8 animate-fade-in">
          <p className="font-bold text-orange-400 mb-3 flex items-center gap-2">
            <span className="bg-orange-500/20 p-1.5 rounded-full">⚠️</span> Ajustements algorithmiques :
          </p>
          <ul className="list-disc list-inside text-orange-200/90 text-sm space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {grids.length > 0 && (
        <div id="results-section" className="animate-slide-up pt-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Grilles Validées</h2>
              {genStats && (
                <p className="text-sm text-slate-400 font-mono">
                  Score moy: <span className="text-emerald-400 font-bold">{genStats.avgScore.toFixed(1)}</span> •
                  Itérations: {genStats.iterations} • Rejets: {genStats.rejections}
                </p>
              )}
            </div>
            <button
              onClick={exportCSV}
              className="bg-dark-900 border border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2"
            >
              <span>📥</span> Exporter CSV
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grids.map((grid, i) => (
              <div key={i} className="glass-panel border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20">
                {/* Score Glow Background */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-40"
                  style={{ backgroundColor: grid.score > 200 ? '#10b981' : grid.score > 100 ? '#3b82f6' : '#8b5cf6' }}
                ></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Grille {String(i + 1).padStart(2, '0')}</span>
                  <div className="flex items-center gap-2 bg-dark-900/60 px-3 py-1 rounded-lg border border-white/5 text-sm">
                    <span className="text-slate-400">Score</span>
                    <span className={`font-bold ${grid.score > 200 ? 'text-emerald-400' : grid.score > 100 ? 'text-primary-400' : 'text-purple-400'}`}>
                      {grid.score.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="bg-dark-900/50 rounded-2xl p-4 md:p-5 mb-6 border border-white/5 relative z-10 shadow-inner flex flex-wrap justify-between gap-y-3 gap-x-1">
                  {grid.nums.map((num) => (
                    <NumberBadge key={num} number={num} />
                  ))}
                  <div className="w-px bg-white/10 mx-1"></div>
                  <NumberBadge number={grid.chance} variant="chance" />
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs relative z-10">
                  <div className="bg-dark-900/30 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block mb-1">Somme</span>
                    <span className="font-bold text-white">{grid.metadata.sum}</span>
                  </div>
                  <div className="bg-dark-900/30 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block mb-1">Amplitude</span>
                    <span className="font-bold text-white">{grid.metadata.range}</span>
                  </div>
                  <div className="bg-dark-900/30 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block mb-1">Pair/Impair</span>
                    <span className="font-bold text-white">{grid.metadata.evenCount}/{grid.metadata.oddCount}</span>
                  </div>
                  <div className="bg-dark-900/30 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block mb-1">Bas/Haut</span>
                    <span className="font-bold text-white">{grid.metadata.lowCount}/{grid.metadata.highCount}</span>
                  </div>
                </div>

                {grid.metadata.highNumbers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 relative z-10 flex items-center justify-between text-xs">
                    <span className="text-slate-500">N° ≥ 31</span>
                    <span className="font-bold text-orange-300">{grid.metadata.highNumbers.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
