"use client";

import { useState } from "react";
import NumberBadge from "@/components/NumberBadge";
import Tooltip from "@/components/Tooltip";
import PresetSelector from "@/components/PresetSelector";
import ScoreExplanation from "@/components/ScoreExplanation";
import { GenerateConstraints, GeneratedGrid } from "@/lib/types";
import { GridPreset, DispersionProfile, DecadeProfile, RecencyMode } from "@/lib/stats/advanced-types";

export default function AdvancedGeneratorPage() {
  const [generating, setGenerating] = useState(false);
  const [grids, setGrids] = useState<GeneratedGrid[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Preset
  const [selectedPreset, setSelectedPreset] = useState<GridPreset>('balanced');

  // Basic parameters
  const [count, setCount] = useState(5);
  const [window, setWindow] = useState<"all" | "1000" | "200">("all");
  const [excludePrevious, setExcludePrevious] = useState(true);
  const [excludePreviousChance, setExcludePreviousChance] = useState(false);

  // Structure
  const [centerOfGravityMin, setCenterOfGravityMin] = useState(22);
  const [centerOfGravityMax, setCenterOfGravityMax] = useState(28);
  const [targetSumMin, setTargetSumMin] = useState(104);
  const [targetSumMax, setTargetSumMax] = useState(145);
  const [minRange, setMinRange] = useState(25);

  // Repetition & History
  const [minRepetitions, setMinRepetitions] = useState(0);
  const [maxRepetitions, setMaxRepetitions] = useState(1);
  const [favorExactlyOne, setFavorExactlyOne] = useState(false);

  // Dispersion
  const [dispersionProfile, setDispersionProfile] = useState<DispersionProfile>('balanced');
  const [avgGapMin, setAvgGapMin] = useState(8);
  const [avgGapMax, setAvgGapMax] = useState(14);

  // Distribution
  const [evenOddRatio, setEvenOddRatio] = useState<"1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5" | "">("");
  const [lowHighRatio, setLowHighRatio] = useState<"1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5" | "">("");
  const [decadeProfile, setDecadeProfile] = useState<DecadeProfile>('free');
  const [decadeBonus, setDecadeBonus] = useState(5);

  // Anti-Human Bias
  const [antiHumanBias, setAntiHumanBias] = useState(false);
  const [penalizeSequences, setPenalizeSequences] = useState(true);
  const [penalizeProgressions, setPenalizeProgressions] = useState(true);
  const [penalizeBirthday, setPenalizeBirthday] = useState(true);
  const [penalizeMultiplesOf5, setPenalizeMultiplesOf5] = useState(true);
  const [penalizeSameEndings, setPenalizeSameEndings] = useState(true);
  const [penaltyWeight, setPenaltyWeight] = useState(1.0);

  // Frequent Patterns
  const [enableFrequentPairs, setEnableFrequentPairs] = useState(true);
  const [pairBonusWeight, setPairBonusWeight] = useState(3);
  const [maxPairsPerGrid, setMaxPairsPerGrid] = useState(2);

  // Experimental
  const [enableModular, setEnableModular] = useState(false);
  const [recencyMode, setRecencyMode] = useState<RecencyMode>('light');

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'structure' | 'dispersion' | 'distribution' | 'anti-bias' | 'patterns' | 'experimental'>('structure');

  const handlePresetChange = (preset: GridPreset) => {
    setSelectedPreset(preset);
    
    // Apply preset defaults
    if (preset === 'balanced') {
      setDispersionProfile('balanced');
      setCenterOfGravityMin(22);
      setCenterOfGravityMax(28);
      setMinRepetitions(0);
      setMaxRepetitions(1);
      setDecadeProfile('2-1-1-1');
      setEnableFrequentPairs(true);
      setPairBonusWeight(3);
      setAntiHumanBias(false);
      setRecencyMode('light');
    } else if (preset === 'dispersed') {
      setDispersionProfile('dispersed');
      setCenterOfGravityMin(20);
      setCenterOfGravityMax(30);
      setMinRepetitions(0);
      setMaxRepetitions(0);
      setDecadeProfile('1-1-1-1-1');
      setEnableFrequentPairs(false);
      setRecencyMode('uniform');
    } else if (preset === 'anti-share') {
      setDispersionProfile('balanced');
      setCenterOfGravityMin(26);
      setCenterOfGravityMax(32);
      setMinRepetitions(0);
      setMaxRepetitions(0);
      setDecadeProfile('3-1-1');
      setEnableFrequentPairs(false);
      setAntiHumanBias(true);
      setPenaltyWeight(1.5);
      setEnableModular(true);
    } else if (preset === 'hot-cold-mix') {
      setDispersionProfile('balanced');
      setCenterOfGravityMin(22);
      setCenterOfGravityMax(28);
      setMinRepetitions(0);
      setMaxRepetitions(2);
      setDecadeProfile('2-2-1');
      setEnableFrequentPairs(true);
      setPairBonusWeight(5);
      setRecencyMode('strong');
    } else if (preset === 'conservative') {
      setDispersionProfile('balanced');
      setCenterOfGravityMin(23);
      setCenterOfGravityMax(27);
      setMinRepetitions(0);
      setMaxRepetitions(1);
      setFavorExactlyOne(true);
      setDecadeProfile('2-1-1-1');
      setEnableFrequentPairs(true);
      setPairBonusWeight(6);
      setRecencyMode('light');
    } else if (preset === 'experimental') {
      setDispersionProfile('free');
      setCenterOfGravityMin(20);
      setCenterOfGravityMax(30);
      setMinRepetitions(0);
      setMaxRepetitions(2);
      setDecadeProfile('free');
      setEnableFrequentPairs(true);
      setPairBonusWeight(4);
      setAntiHumanBias(true);
      setPenaltyWeight(0.8);
      setEnableModular(true);
      setRecencyMode('exponential');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setWarnings([]);
    setGrids([]);

    const constraints: GenerateConstraints = {
      window: { window },
      count,
      excludePreviousDraw: excludePrevious,
      excludePreviousChance,
      minRange,
      advanced: {
        preset: selectedPreset,
        centerOfGravity: {
          min: centerOfGravityMin,
          max: centerOfGravityMax
        },
        repetition: {
          minRepetitions,
          maxRepetitions,
          favorExactlyOne
        },
        dispersion: {
          profile: dispersionProfile,
          avgGapMin,
          avgGapMax
        },
        decadeDistribution: {
          preferredProfile: decadeProfile,
          bonusWeight: decadeBonus
        },
        antiHumanBias: {
          enabled: antiHumanBias,
          penalizeObviousSequences: penalizeSequences,
          penalizeArithmeticProgressions: penalizeProgressions,
          penalizeBirthdayPattern: penalizeBirthday,
          penalizeMultiplesOf5: penalizeMultiplesOf5,
          penalizeSameEndings: penalizeSameEndings,
          penaltyWeight
        },
        frequentPairs: {
          enabled: enableFrequentPairs,
          bonusWeight: pairBonusWeight,
          maxPairsPerGrid,
          topN: 50
        },
        modularSignature: {
          enabled: enableModular,
          bonusWeight: 2
        },
        recencyWeighting: {
          mode: recencyMode
        }
      }
    };

    if (evenOddRatio) constraints.evenOddRatio = evenOddRatio;
    if (lowHighRatio) constraints.lowHighRatio = lowHighRatio;
    if (targetSumMin > 0) constraints.targetSumMin = targetSumMin;
    if (targetSumMax > 0) constraints.targetSumMax = targetSumMax;

    try {
      const response = await fetch("/api/generate-advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(constraints),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate grids");
      }

      const data = await response.json();
      setGrids(data.grids);
      setWarnings(data.warnings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 Générateur Avancé de Grilles
          </h1>
          <p className="text-slate-400">
            Génération optimisée avec scoring explicable et profils intelligents
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mb-8">
          <PresetSelector value={selectedPreset} onChange={handlePresetChange} />
        </div>

        {/* Basic Parameters */}
        <div className="bg-dark-800/50 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Paramètres de Base</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Nombre de grilles
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Base d'apprentissage
              </label>
              <select
                value={window}
                onChange={(e) => setWindow(e.target.value as any)}
                className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white"
              >
                <option value="all">Historique complet</option>
                <option value="1000">1000 derniers tirages</option>
                <option value="200">200 derniers tirages</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludePrevious}
                  onChange={(e) => setExcludePrevious(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-dark-900/60 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-300">Exclure numéros du tirage précédent</span>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Parameters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full mb-6 px-6 py-4 bg-primary-500/10 border-2 border-primary-500/30 rounded-xl hover:bg-primary-500/20 transition-all flex items-center justify-between"
        >
          <span className="text-lg font-semibold text-primary-300">
            ⚙️ Paramètres Avancés
          </span>
          <svg
            className={`w-6 h-6 text-primary-300 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Advanced Parameters */}
        {showAdvanced && (
          <div className="mb-6 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'structure', label: '🏗️ Structure', color: 'blue' },
                { id: 'dispersion', label: '📊 Dispersion', color: 'purple' },
                { id: 'distribution', label: '⚖️ Répartition', color: 'green' },
                { id: 'anti-bias', label: '🎯 Anti-biais', color: 'red' },
                { id: 'patterns', label: '🔗 Patterns', color: 'yellow' },
                { id: 'experimental', label: '🧪 Expérimental', color: 'pink' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-500/20 border-2 border-${tab.color}-500/50 text-${tab.color}-300`
                      : 'bg-dark-800/50 border border-white/10 text-slate-400 hover:bg-dark-700/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Structure Tab */}
            {activeTab === 'structure' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-blue-300">🏗️ Structure de la Grille</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      Centre de gravité minimum
                      <Tooltip text="Moyenne des 5 numéros. Optimal: 22-28 (centré autour de 25)" />
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="35"
                      value={centerOfGravityMin}
                      onChange={(e) => setCenterOfGravityMin(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      Centre de gravité maximum
                      <Tooltip text="Limite supérieure du centre de gravité" />
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="35"
                      value={centerOfGravityMax}
                      onChange={(e) => setCenterOfGravityMax(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      Somme minimale
                      <Tooltip text="Somme minimale des 5 numéros. Plage optimale: 104-145" />
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="200"
                      value={targetSumMin}
                      onChange={(e) => setTargetSumMin(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      Somme maximale
                      <Tooltip text="Somme maximale des 5 numéros" />
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="200"
                      value={targetSumMax}
                      onChange={(e) => setTargetSumMax(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      Amplitude minimale
                      <Tooltip text="Écart entre le plus petit et le plus grand numéro. Recommandé: 25+" />
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="48"
                      value={minRange}
                      onChange={(e) => setMinRange(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">Répétition avec tirage précédent</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Min répétitions</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={minRepetitions}
                        onChange={(e) => setMinRepetitions(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-dark-900/60 border border-blue-500/30 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Max répétitions</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={maxRepetitions}
                        onChange={(e) => setMaxRepetitions(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-dark-900/60 border border-blue-500/30 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={favorExactlyOne}
                          onChange={(e) => setFavorExactlyOne(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-dark-900/60 text-blue-500"
                        />
                        <span className="text-xs text-slate-300">Exactement 1</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dispersion Tab */}
            {activeTab === 'dispersion' && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-purple-300">📊 Dispersion & Espacement</h3>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                    Profil de dispersion
                    <Tooltip text="Contrôle l'espacement entre les numéros. Compact = resserré, Dispersé = étalé" />
                  </label>
                  <select
                    value={dispersionProfile}
                    onChange={(e) => setDispersionProfile(e.target.value as DispersionProfile)}
                    className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="free">Libre</option>
                    <option value="compact">Compact (écarts faibles)</option>
                    <option value="balanced">Équilibré (recommandé)</option>
                    <option value="dispersed">Dispersé (écarts élevés)</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      Écart moyen minimum
                      <Tooltip text="Écart moyen entre numéros consécutifs triés. Optimal: 8-14" />
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="20"
                      value={avgGapMin}
                      onChange={(e) => setAvgGapMin(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      Écart moyen maximum
                      <Tooltip text="Limite supérieure de l'écart moyen" />
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="20"
                      value={avgGapMax}
                      onChange={(e) => setAvgGapMax(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Distribution Tab */}
            {activeTab === 'distribution' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-green-300">⚖️ Répartition des Numéros</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-400 mb-2 block">
                      Ratio Pair / Impair
                    </label>
                    <select
                      value={evenOddRatio}
                      onChange={(e) => setEvenOddRatio(e.target.value as any)}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-green-500/30 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
                    >
                      <option value="">Naturel (Sans contrainte)</option>
                      <option value="0/5">0 Pair / 5 Impairs</option>
                      <option value="1/4">1 Pair / 4 Impairs</option>
                      <option value="2/3">2 Pairs / 3 Impairs (Fréquent)</option>
                      <option value="3/2">3 Pairs / 2 Impairs (Fréquent)</option>
                      <option value="4/1">4 Pairs / 1 Impair</option>
                      <option value="5/0">5 Pairs / 0 Impair</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400 mb-2 block">
                      Ratio Bas (1-24) / Haut (25-49)
                    </label>
                    <select
                      value={lowHighRatio}
                      onChange={(e) => setLowHighRatio(e.target.value as any)}
                      className="w-full px-4 py-3 bg-dark-900/60 border border-green-500/30 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
                    >
                      <option value="">Naturel (Sans contrainte)</option>
                      <option value="0/5">0 Bas / 5 Hauts</option>
                      <option value="1/4">1 Bas / 4 Hauts</option>
                      <option value="2/3">2 Bas / 3 Hauts</option>
                      <option value="3/2">3 Bas / 2 Hauts</option>
                      <option value="4/1">4 Bas / 1 Haut</option>
                      <option value="5/0">5 Bas / 0 Haut</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                    Profil de dizaines
                    <Tooltip text="Distribution des numéros par dizaine. 2-1-1-1 est le plus fréquent (35% des tirages)" />
                  </label>
                  <select
                    value={decadeProfile}
                    onChange={(e) => setDecadeProfile(e.target.value as DecadeProfile)}
                    className="w-full px-4 py-3 bg-dark-900/60 border border-green-500/30 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
                  >
                    <option value="free">Libre</option>
                    <option value="1-1-1-1-1">1-1-1-1-1 (5 dizaines, 1 chacune)</option>
                    <option value="2-1-1-1">2-1-1-1 (4 dizaines, une avec 2)</option>
                    <option value="2-2-1">2-2-1 (3 dizaines, deux avec 2)</option>
                    <option value="3-1-1">3-1-1 (3 dizaines, une avec 3)</option>
                    <option value="3-2">3-2 (2 dizaines, 3 et 2)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                    Bonus profil dizaines
                    <Tooltip text="Poids du bonus si le profil correspond (0-10)" />
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={decadeBonus}
                    onChange={(e) => setDecadeBonus(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-slate-400 mt-1">{decadeBonus}</div>
                </div>
              </div>
            )}

            {/* Anti-Bias Tab */}
            {activeTab === 'anti-bias' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-red-300">🎯 Anti-biais Humain</h3>
                <p className="text-sm text-slate-400">
                  Pénalise les patterns typiquement choisis par les humains pour réduire le risque de partage de jackpot
                </p>
                
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <input
                    type="checkbox"
                    checked={antiHumanBias}
                    onChange={(e) => setAntiHumanBias(e.target.checked)}
                    className="w-6 h-6 rounded border-white/20 bg-dark-900/60 text-red-500"
                  />
                  <label className="text-base font-semibold text-red-300 cursor-pointer">
                    Activer l'anti-biais humain
                  </label>
                </div>

                {antiHumanBias && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-lg cursor-pointer hover:bg-dark-900/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={penalizeSequences}
                        onChange={(e) => setPenalizeSequences(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-dark-900/60 text-red-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-300">Pénaliser séquences évidentes</div>
                        <div className="text-xs text-slate-500">Ex: 1,2,3 ou numéros consécutifs</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-lg cursor-pointer hover:bg-dark-900/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={penalizeProgressions}
                        onChange={(e) => setPenalizeProgressions(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-dark-900/60 text-red-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-300">Pénaliser progressions arithmétiques</div>
                        <div className="text-xs text-slate-500">Ex: 5,10,15 ou 7,14,21</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-lg cursor-pointer hover:bg-dark-900/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={penalizeBirthday}
                        onChange={(e) => setPenalizeBirthday(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-dark-900/60 text-red-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-300">Pénaliser pattern anniversaire</div>
                        <div className="text-xs text-slate-500">Trop de numéros ≤31 (dates)</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-lg cursor-pointer hover:bg-dark-900/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={penalizeMultiplesOf5}
                        onChange={(e) => setPenalizeMultiplesOf5(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-dark-900/60 text-red-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-300">Pénaliser multiples de 5</div>
                        <div className="text-xs text-slate-500">Ex: 5, 10, 15, 20...</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-lg cursor-pointer hover:bg-dark-900/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={penalizeSameEndings}
                        onChange={(e) => setPenalizeSameEndings(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-dark-900/60 text-red-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-300">Pénaliser terminaisons répétitives</div>
                        <div className="text-xs text-slate-500">3+ numéros avec même chiffre final</div>
                      </div>
                    </label>

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">
                        Poids des pénalités
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={penaltyWeight}
                        onChange={(e) => setPenaltyWeight(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-slate-400 mt-1">{penaltyWeight.toFixed(1)}x</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Patterns Tab */}
            {activeTab === 'patterns' && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-yellow-300">🔗 Patterns Fréquents</h3>
                
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <input
                    type="checkbox"
                    checked={enableFrequentPairs}
                    onChange={(e) => setEnableFrequentPairs(e.target.checked)}
                    className="w-6 h-6 rounded border-white/20 bg-dark-900/60 text-yellow-500"
                  />
                  <label className="text-base font-semibold text-yellow-300 cursor-pointer">
                    Favoriser les paires fréquentes
                  </label>
                </div>

                {enableFrequentPairs && (
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Poids du bonus paires
                        <Tooltip text="Points bonus par paire fréquente détectée (0-10)" />
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={pairBonusWeight}
                        onChange={(e) => setPairBonusWeight(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-slate-400 mt-1">{pairBonusWeight} points</div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Max paires fréquentes par grille
                        <Tooltip text="Nombre maximum de paires fréquentes autorisées dans une grille" />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={maxPairsPerGrid}
                        onChange={(e) => setMaxPairsPerGrid(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-dark-900/60 border border-yellow-500/30 rounded-xl focus:ring-2 focus:ring-yellow-500 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Experimental Tab */}
            {activeTab === 'experimental' && (
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-pink-300">🧪 Fonctionnalités Expérimentales</h3>
                
                <div className="flex items-center gap-3 p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                  <input
                    type="checkbox"
                    checked={enableModular}
                    onChange={(e) => setEnableModular(e.target.checked)}
                    className="w-6 h-6 rounded border-white/20 bg-dark-900/60 text-pink-500"
                  />
                  <div>
                    <label className="text-base font-semibold text-pink-300 cursor-pointer block">
                      Signature modulaire (mod 5, mod 7)
                    </label>
                    <p className="text-xs text-slate-400">Analyse la distribution modulo 5 et 7</p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                    Pondération temporelle
                    <Tooltip text="Donne plus de poids aux tirages récents dans les statistiques" />
                  </label>
                  <select
                    value={recencyMode}
                    onChange={(e) => setRecencyMode(e.target.value as RecencyMode)}
                    className="w-full px-4 py-3 bg-dark-900/60 border border-pink-500/30 rounded-xl focus:ring-2 focus:ring-pink-500 text-white"
                  >
                    <option value="uniform">Uniforme (tous les tirages égaux)</option>
                    <option value="light">Légère (récence modérée)</option>
                    <option value="strong">Forte (privilégie le récent)</option>
                    <option value="exponential">Exponentielle (très récent)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-lg"
        >
          {generating ? "Génération en cours..." : "🚀 Générer les grilles"}
        </button>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Avertissements</h3>
            <ul className="space-y-1">
              {warnings.map((warning, i) => (
                <li key={i} className="text-sm text-yellow-200">{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h3 className="text-red-300 font-semibold mb-2">❌ Erreur</h3>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Generated Grids */}
        {grids.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">
              ✨ Grilles Générées ({grids.length})
            </h2>
            
            {grids.map((grid, index) => (
              <div
                key={index}
                className="bg-dark-800/50 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Grille #{index + 1}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Score:</span>
                    <span className={`text-2xl font-bold ${
                      grid.score >= 80 ? 'text-green-400' :
                      grid.score >= 60 ? 'text-blue-400' :
                      grid.score >= 40 ? 'text-yellow-400' :
                      'text-orange-400'
                    }`}>
                      {grid.score}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex gap-2">
                    {grid.nums.map((num) => (
                      <NumberBadge key={num} number={num} size="lg" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Chance:</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {grid.chance}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="bg-dark-900/60 rounded-lg p-2">
                    <div className="text-slate-500 text-xs">Somme</div>
                    <div className="text-white font-semibold">{grid.metadata.sum}</div>
                  </div>
                  <div className="bg-dark-900/60 rounded-lg p-2">
                    <div className="text-slate-500 text-xs">Amplitude</div>
                    <div className="text-white font-semibold">{grid.metadata.range}</div>
                  </div>
                  <div className="bg-dark-900/60 rounded-lg p-2">
                    <div className="text-slate-500 text-xs">Pair/Impair</div>
                    <div className="text-white font-semibold">{grid.metadata.evenCount}/{grid.metadata.oddCount}</div>
                  </div>
                  <div className="bg-dark-900/60 rounded-lg p-2">
                    <div className="text-slate-500 text-xs">Bas/Haut</div>
                    <div className="text-white font-semibold">{grid.metadata.lowCount}/{grid.metadata.highCount}</div>
                  </div>
                </div>

                {grid.explainableScore && (
                  <ScoreExplanation score={grid.explainableScore} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
