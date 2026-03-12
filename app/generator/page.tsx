"use client";

import { useState } from "react";
import NumberBadge from "@/components/NumberBadge";
import Tooltip from "@/components/Tooltip";
import PresetSelector from "@/components/PresetSelector";
import ScoreExplanation from "@/components/ScoreExplanation";
import ComprehensiveScoreDisplay from "@/components/ComprehensiveScoreDisplay";
import { GenerateConstraints, GeneratedGrid } from "@/lib/types";
import {
  GridPreset,
  DispersionProfile,
  DecadeProfile,
  RecencyMode,
} from "@/lib/stats/advanced-types";

export default function GeneratorPage() {
  const [generating, setGenerating] = useState(false);
  const [grids, setGrids] = useState<GeneratedGrid[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [genStats, setGenStats] = useState<any>(null);

  const [count, setCount] = useState(5);
  const [window, setWindow] = useState<"all" | "1000" | "200">("all");
  const [excludePrevious, setExcludePrevious] = useState(true);
  const [excludePreviousChance, setExcludePreviousChance] = useState(false);
  const [evenOddRatio, setEvenOddRatio] = useState<
    "1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5" | ""
  >("");
  const [lowHighRatio, setLowHighRatio] = useState<
    "1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5" | ""
  >("");
  const [maxPerDecade, setMaxPerDecade] = useState(2);
  const [minRange, setMinRange] = useState(25);
  const [minHighNumbers, setMinHighNumbers] = useState(2);
  const [maxMultiplesOf3, setMaxMultiplesOf3] = useState(2);
  const [avoidPopular, setAvoidPopular] = useState("");
  const [avoidChances, setAvoidChances] = useState("");
  const [maxOverlap, setMaxOverlap] = useState(1);

  // Advanced parameters
  const [minPrimes, setMinPrimes] = useState(1);
  const [maxPrimes, setMaxPrimes] = useState(2);
  const [minDecadeSpread, setMinDecadeSpread] = useState(3);
  const [maxDecadeSpread, setMaxDecadeSpread] = useState(4);
  const [minVeryHighNumbers, setMinVeryHighNumbers] = useState(0);
  const [maxVeryHighNumbers, setMaxVeryHighNumbers] = useState(2);
  const [minHotNumbers, setMinHotNumbers] = useState(1);
  const [maxHotNumbers, setMaxHotNumbers] = useState(2);
  const [minColdNumbers, setMinColdNumbers] = useState(0);
  const [maxColdNumbers, setMaxColdNumbers] = useState(2);
  const [minDigitEndings, setMinDigitEndings] = useState(4);
  const [favorTriplets, setFavorTriplets] = useState(true);
  const [minConsecutiveGap, setMinConsecutiveGap] = useState(1);
  const [maxConsecutiveGap, setMaxConsecutiveGap] = useState(15);
  const [targetSumMin, setTargetSumMin] = useState(0);
  const [targetSumMax, setTargetSumMax] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // New advanced parameters
  const [selectedPreset, setSelectedPreset] = useState<GridPreset>("custom");
  const [centerOfGravityMin, setCenterOfGravityMin] = useState(22);
  const [centerOfGravityMax, setCenterOfGravityMax] = useState(28);
  const [minRepetitions, setMinRepetitions] = useState(0);
  const [maxRepetitions, setMaxRepetitions] = useState(1);
  const [favorExactlyOne, setFavorExactlyOne] = useState(false);
  const [dispersionProfile, setDispersionProfile] =
    useState<DispersionProfile>("balanced");
  const [avgGapMin, setAvgGapMin] = useState(8);
  const [avgGapMax, setAvgGapMax] = useState(14);
  const [decadeProfile, setDecadeProfile] = useState<DecadeProfile>("free");
  const [decadeBonus, setDecadeBonus] = useState(5);
  const [antiHumanBias, setAntiHumanBias] = useState(false);
  const [penalizeSequences, setPenalizeSequences] = useState(true);
  const [penalizeProgressions, setPenalizeProgressions] = useState(true);
  const [penalizeBirthday, setPenalizeBirthday] = useState(true);
  const [penalizeMultiplesOf5, setPenalizeMultiplesOf5] = useState(true);
  const [penalizeSameEndings, setPenalizeSameEndings] = useState(true);
  const [penaltyWeight, setPenaltyWeight] = useState(1.0);
  const [enableFrequentPairs, setEnableFrequentPairs] = useState(true);
  const [pairBonusWeight, setPairBonusWeight] = useState(3);
  const [maxPairsPerGrid, setMaxPairsPerGrid] = useState(2);
  const [enableModular, setEnableModular] = useState(false);
  const [recencyMode, setRecencyMode] = useState<RecencyMode>("light");
  const [activeTab, setActiveTab] = useState<
    | "structure"
    | "dispersion"
    | "distribution"
    | "anti-bias"
    | "patterns"
    | "experimental"
  >("structure");

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setWarnings([]);
    setGrids([]);
    setGenStats(null);

    const constraints: GenerateConstraints = {
      window: { window },
      count,
      excludePreviousDraw: excludePrevious,
      excludePreviousChance,
      maxPerDecade,
      minRange,
      minHighNumbers,
      maxMultiplesOf3,
      maxOverlap,
    };

    if (evenOddRatio) constraints.evenOddRatio = evenOddRatio;
    if (lowHighRatio) constraints.lowHighRatio = lowHighRatio;

    // Advanced constraints
    if (showAdvanced) {
      if (minPrimes > 0) constraints.minPrimes = minPrimes;
      if (maxPrimes > 0) constraints.maxPrimes = maxPrimes;
      if (minDecadeSpread > 0) constraints.minDecadeSpread = minDecadeSpread;
      if (maxDecadeSpread > 0) constraints.maxDecadeSpread = maxDecadeSpread;
      if (minVeryHighNumbers > 0)
        constraints.minVeryHighNumbers = minVeryHighNumbers;
      if (maxVeryHighNumbers > 0)
        constraints.maxVeryHighNumbers = maxVeryHighNumbers;
      if (minHotNumbers > 0) constraints.minHotNumbers = minHotNumbers;
      if (maxHotNumbers > 0) constraints.maxHotNumbers = maxHotNumbers;
      if (minColdNumbers >= 0) constraints.minColdNumbers = minColdNumbers;
      if (maxColdNumbers > 0) constraints.maxColdNumbers = maxColdNumbers;
      if (minDigitEndings > 0) constraints.minDigitEndings = minDigitEndings;
      if (favorTriplets) constraints.favorTriplets = favorTriplets;
      if (minConsecutiveGap > 0)
        constraints.minConsecutiveGap = minConsecutiveGap;
      if (maxConsecutiveGap > 0)
        constraints.maxConsecutiveGap = maxConsecutiveGap;
      if (targetSumMin > 0) constraints.targetSumMin = targetSumMin;
      if (targetSumMax > 0) constraints.targetSumMax = targetSumMax;

      // New advanced constraints
      constraints.advanced = {
        preset: selectedPreset,
        centerOfGravity: {
          min: centerOfGravityMin,
          max: centerOfGravityMax,
        },
        repetition: {
          minRepetitions,
          maxRepetitions,
          favorExactlyOne,
        },
        dispersion: {
          profile: dispersionProfile,
          avgGapMin,
          avgGapMax,
        },
        decadeDistribution: {
          preferredProfile: decadeProfile,
          bonusWeight: decadeBonus,
        },
        antiHumanBias: {
          enabled: antiHumanBias,
          penalizeObviousSequences: penalizeSequences,
          penalizeArithmeticProgressions: penalizeProgressions,
          penalizeBirthdayPattern: penalizeBirthday,
          penalizeMultiplesOf5: penalizeMultiplesOf5,
          penalizeSameEndings: penalizeSameEndings,
          penaltyWeight,
        },
        frequentPairs: {
          enabled: enableFrequentPairs,
          bonusWeight: pairBonusWeight,
          maxPairsPerGrid,
          topN: 50,
        },
        modularSignature: {
          enabled: enableModular,
          bonusWeight: 2,
        },
        recencyWeighting: {
          mode: recencyMode,
        },
      };
    }

    if (avoidPopular.trim()) {
      const nums = avoidPopular
        .split(",")
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 49);
      if (nums.length > 0) constraints.avoidPopular = nums;
    }

    if (avoidChances.trim()) {
      const chances = avoidChances
        .split(",")
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 10);
      if (chances.length > 0) constraints.avoidChances = chances;
    }

    try {
      // Use advanced API if advanced parameters are enabled
      const apiEndpoint = showAdvanced
        ? "/api/generate-advanced"
        : "/api/generate";
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(constraints),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate grids");
      }

      const data = await response.json();
      setGrids(data.grids);
      setWarnings(data.warnings || []);
      setGenStats(data.stats);

      // Scroll to results slightly
      setTimeout(() => {
        document
          .getElementById("results-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  };

  const exportCSV = () => {
    if (grids.length === 0) return;

    const headers = [
      "Grille",
      "N1",
      "N2",
      "N3",
      "N4",
      "N5",
      "Chance",
      "Score",
      "Somme",
      "Amplitude",
    ];
    const rows = grids.map((grid, i) => [
      i + 1,
      ...grid.nums,
      grid.chance,
      grid.score.toFixed(1),
      grid.metadata.sum,
      grid.metadata.range,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loto-grids-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            Générateur <span className="text-purple-400 font-light">&</span>{" "}
            Optimiseur
          </h1>
          <p className="text-slate-400 text-lg">
            Création intelligente de grilles basées sur des algorithmes
            statistiques.
          </p>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-10 flex items-start gap-4 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
        <span className="text-2xl mt-1">⚠️</span>
        <div>
          <p className="text-yellow-400 font-bold mb-1">
            Avertissement Légal & Statistique
          </p>
          <p className="text-yellow-200/70 text-sm leading-relaxed">
            Ce générateur utilise des contraintes statistiques historiques pour
            filtrer et optimiser la création de grilles. Cependant, chaque
            tirage du Loto reste un événement mathématiquement indépendant et
            totalement aléatoire.
            <strong>Aucune méthode ne peut garantir un gain.</strong>
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="mb-10">
        <PresetSelector value={selectedPreset} onChange={setSelectedPreset} />
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-10 mb-10 relative overflow-hidden text-slate-200">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-primary-500 to-emerald-500"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            ⚙️
          </span>{" "}
          Configuration de l&apos;algorithme
        </h2>

        <div className="space-y-8 relative z-10">
          {/* Section 1: Base */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-dark-900/40 p-6 rounded-2xl border border-white/5">
              <label className="flex items-center gap-2 text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                Nombre de grilles
                <Tooltip text="Nombre de grilles optimisées à générer. Plus vous en générez, plus vous augmentez vos chances de couverture, mais le coût augmente proportionnellement." />
              </label>
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
              <label className="flex items-center gap-2 text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                Base d&apos;apprentissage
                <Tooltip text="Fenêtre de données utilisée pour calculer les statistiques. 'Historique Complet' utilise tous les tirages, '1000 Derniers' se concentre sur les tendances récentes, '200 Derniers' sur les tendances très récentes." />
              </label>
              <div className="flex bg-dark-900 rounded-xl p-1 border border-white/5">
                {[
                  { id: "all", label: "Historique Complet" },
                  { id: "1000", label: "1000 Derniers" },
                  { id: "200", label: "200 Derniers" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setWindow(opt.id as any)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      window === opt.id
                        ? "bg-purple-600/80 text-white shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
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
              <span className="w-2 h-6 bg-rose-500 rounded-full"></span>{" "}
              Contraintes Strictes
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <label className="flex items-center justify-between bg-dark-900/40 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
                <span className="flex items-center gap-2 font-medium text-slate-300 group-hover:text-white transition-colors">
                  Exclure numéros du tirage précédent
                  <Tooltip text="Empêche la génération de grilles contenant des numéros qui sont sortis lors du dernier tirage. Basé sur le principe que les mêmes numéros sortent rarement deux fois de suite." />
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={excludePrevious}
                    onChange={(e) => setExcludePrevious(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors ${excludePrevious ? "bg-primary-500" : "bg-dark-900"}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${excludePrevious ? "transform translate-x-6" : ""}`}
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between bg-dark-900/40 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
                <span className="flex items-center gap-2 font-medium text-slate-300 group-hover:text-white transition-colors">
                  Exclure Numéro Chance précédent
                  <Tooltip text="Empêche la génération du même numéro chance que celui du dernier tirage. Augmente la diversité de vos grilles." />
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={excludePreviousChance}
                    onChange={(e) => setExcludePreviousChance(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors ${excludePreviousChance ? "bg-primary-500" : "bg-dark-900"}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${excludePreviousChance ? "transform translate-x-6" : ""}`}
                  ></div>
                </div>
              </label>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Ratio Pair / Impair
                  <Tooltip text="Impose un ratio spécifique de numéros pairs et impairs. Historiquement, 2/3 et 3/2 sont les combinaisons les plus fréquentes (environ 60% des tirages)." />
                </label>
                <select
                  value={evenOddRatio}
                  onChange={(e) => setEvenOddRatio(e.target.value as any)}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white appearance-none"
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

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Ratio Bas (1-24) / Haut (25-49)
                  <Tooltip text="Impose un ratio entre numéros bas (1-24) et hauts (25-49). Une bonne répartition assure une couverture équilibrée de toute la plage de numéros." />
                </label>
                <select
                  value={lowHighRatio}
                  onChange={(e) => setLowHighRatio(e.target.value as any)}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-white appearance-none"
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

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Max. numéros par dizaine
                  <Tooltip text="Limite le nombre de numéros dans une même dizaine (1-10, 11-20, etc.). Évite les grilles trop concentrées sur une seule tranche. Recommandé : 2 maximum." />
                </label>
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
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Max. overlap entre grilles
                  <Tooltip text="Nombre maximum de numéros identiques autorisés entre deux grilles générées. Une valeur basse (0-1) assure une meilleure diversification de vos grilles." />
                </label>
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

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Amplitude minimale
                  <Tooltip text="Écart minimum entre le plus petit et le plus grand numéro de la grille. Une amplitude élevée (25+) assure une bonne répartition sur toute la plage 1-49." />
                </label>
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
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Qte Min. numéros ≥ 31
                  <Tooltip text="Nombre minimum de numéros élevés (31-49) dans la grille. Assure une présence de numéros hauts. Recommandé : 2 minimum." />
                </label>
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
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Max. multiples de 3
                  <Tooltip text="Nombre maximum de multiples de 3 (3, 6, 9, 12, etc.) autorisés. Basé sur l'analyse : 34.4% des tirages ont exactement 1 multiple de 3. Recommandé : 2 maximum." />
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={maxMultiplesOf3}
                  onChange={(e) => setMaxMultiplesOf3(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Éviter numéros exacts
                  <Tooltip text="Liste de numéros à exclure complètement des grilles générées. Format : numéros séparés par des virgules (ex: 7, 13, 21). Utile pour éviter vos numéros 'malchanceux'." />
                </label>
                <input
                  type="text"
                  value={avoidPopular}
                  onChange={(e) => setAvoidPopular(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900/60 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-600"
                  placeholder="Ex: 7, 13, 21"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  Éviter N° Chance exacts
                  <Tooltip text="Liste de numéros chance (1-10) à exclure. Format : numéros séparés par des virgules (ex: 1, 7, 9)." />
                </label>
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

          {/* Section 4: Paramètres Avancés */}
          <div className="border-t border-white/10 pt-8">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-5 rounded-xl hover:from-indigo-600/30 hover:to-purple-600/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">
                    Paramètres Avancés
                  </h3>
                  <p className="text-sm text-slate-400">
                    Optimisation basée sur toutes les analyses statistiques
                  </p>
                </div>
              </div>
              <span
                className={`text-white text-2xl transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-6 space-y-6 animate-slide-up">
                {/* Nombres Premiers */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                  <h4 className="text-md font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <span>🔢</span> Nombres Premiers (2, 3, 5, 7, 11, 13, 17,
                    19, 23, 29, 31, 37, 41, 43, 47)
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Historiquement, 2-3 nombres premiers par grille est optimal
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Min. nombres premiers
                        <Tooltip text="Nombre minimum de nombres premiers requis dans la grille. Les nombres premiers sont : 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={minPrimes}
                        onChange={(e) => setMinPrimes(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Max. nombres premiers
                        <Tooltip text="Nombre maximum de nombres premiers autorisés. L'analyse historique montre que 2-3 nombres premiers par grille est optimal." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={maxPrimes}
                        onChange={(e) => setMaxPrimes(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Répartition par Dizaine (NOUVEAU - Basé sur analyse) */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                  <h4 className="text-md font-bold text-emerald-300 mb-4 flex items-center gap-2">
                    <span>📊</span> Répartition par Dizaine (NOUVEAU)
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Basé sur l'analyse : 44.6% des tirages couvrent exactement 3
                    dizaines différentes
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Min. dizaines différentes
                        <Tooltip text="Nombre minimum de dizaines (1-10, 11-20, 21-30, 31-40, 41-49) à couvrir. Analyse : 44.6% des tirages couvrent 3 dizaines. Recommandé : 3." />
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={minDecadeSpread}
                        onChange={(e) =>
                          setMinDecadeSpread(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Max. dizaines différentes
                        <Tooltip text="Nombre maximum de dizaines différentes. Une bonne répartition assure une couverture équilibrée. Recommandé : 4." />
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={maxDecadeSpread}
                        onChange={(e) =>
                          setMaxDecadeSpread(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Numéros Très Hauts (NOUVEAU - Basé sur analyse) */}
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                  <h4 className="text-md font-bold text-cyan-300 mb-4 flex items-center gap-2">
                    <span>🔝</span> Numéros Très Hauts ≥40 (NOUVEAU)
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Basé sur l'analyse : 43.2% des tirages ont exactement 1
                    numéro ≥40
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Min. numéros ≥40
                        <Tooltip text="Nombre minimum de numéros très hauts (40-49). Analyse : 43.2% des tirages en ont exactement 1. Recommandé : 0 (pour flexibilité)." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={minVeryHighNumbers}
                        onChange={(e) =>
                          setMinVeryHighNumbers(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Max. numéros ≥40
                        <Tooltip text="Nombre maximum de numéros très hauts autorisés. Analyse : 43.2% en ont 1, 22% en ont 2. Recommandé : 2." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={maxVeryHighNumbers}
                        onChange={(e) =>
                          setMaxVeryHighNumbers(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Numéros Chauds/Froids */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                  <h4 className="text-md font-bold text-orange-300 mb-4 flex items-center gap-2">
                    <span>🔥</span> Numéros Chauds & Froids
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Équilibre entre numéros en tendance et numéros en retard
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-orange-300 mb-2">
                          🔥 Min. numéros chauds
                          <Tooltip text="Nombre minimum de numéros 'chauds' (sortis fréquemment dans les 100 derniers tirages). Recommandé : 1-2 pour équilibrer tendances et diversité." />
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={minHotNumbers}
                          onChange={(e) =>
                            setMinHotNumbers(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-3 bg-dark-900/60 border border-orange-500/30 rounded-xl focus:ring-2 focus:ring-orange-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-orange-300 mb-2">
                          🔥 Max. numéros chauds
                          <Tooltip text="Nombre maximum de numéros chauds autorisés. Trop de numéros chauds peut être contre-productif car ils sont surjoués." />
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={maxHotNumbers}
                          onChange={(e) =>
                            setMaxHotNumbers(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-3 bg-dark-900/60 border border-orange-500/30 rounded-xl focus:ring-2 focus:ring-orange-500 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-cyan-300 mb-2">
                          ❄️ Min. numéros froids
                          <Tooltip text="Nombre minimum de numéros 'froids' (en retard significatif). Les numéros froids peuvent être dus pour sortir selon la théorie de l'équilibre." />
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={minColdNumbers}
                          onChange={(e) =>
                            setMinColdNumbers(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-3 bg-dark-900/60 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-cyan-300 mb-2">
                          ❄️ Max. numéros froids
                          <Tooltip text="Nombre maximum de numéros froids. Trop de numéros froids peut être risqué. Recommandé : 0-2 maximum." />
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={maxColdNumbers}
                          onChange={(e) =>
                            setMaxColdNumbers(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-3 bg-dark-900/60 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terminaisons & Triplets */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <h4 className="text-md font-bold text-emerald-300 mb-4 flex items-center gap-2">
                      <span>🎲</span> Terminaisons Diversifiées
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Nombre minimum de chiffres finaux différents (0-9)
                    </p>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Min. terminaisons uniques
                        <Tooltip text="Nombre minimum de chiffres finaux différents (0-9). Par exemple : 12, 23, 34, 45, 16 a 5 terminaisons uniques. Recommandé : 4+ pour éviter les répétitions." />
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={minDigitEndings}
                        onChange={(e) =>
                          setMinDigitEndings(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-6">
                    <h4 className="text-md font-bold text-pink-300 mb-4 flex items-center gap-2">
                      <span>🎯</span> Triplets Fréquents
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Favoriser les combinaisons de 3 numéros historiquement
                      fréquentes
                    </p>
                    <label className="flex items-center justify-between bg-dark-900/40 p-4 rounded-xl border border-pink-500/20 cursor-pointer hover:bg-white/5 transition-colors group">
                      <span className="flex items-center gap-2 font-medium text-slate-300 group-hover:text-white transition-colors">
                        Activer bonus triplets
                        <Tooltip text="Donne un bonus de score aux grilles contenant des triplets (combinaisons de 3 numéros) qui sont sortis fréquemment ensemble dans l'historique. Augmente les chances de reproduire des patterns gagnants." />
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={favorTriplets}
                          onChange={(e) => setFavorTriplets(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`block w-14 h-8 rounded-full transition-colors ${favorTriplets ? "bg-pink-500" : "bg-dark-900"}`}
                        ></div>
                        <div
                          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${favorTriplets ? "transform translate-x-6" : ""}`}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Écarts entre numéros */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-md font-bold text-blue-300 mb-4 flex items-center gap-2">
                    <span>📏</span> Écarts entre Numéros Consécutifs
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Contrôle de l&apos;espacement dans la grille triée
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Écart minimum
                        <Tooltip text="Écart minimum autorisé entre deux numéros consécutifs dans la grille triée. Par exemple : 5-8-12 a des écarts de 3 et 4. Valeur basse = grille compacte." />
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={minConsecutiveGap}
                        onChange={(e) =>
                          setMinConsecutiveGap(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Écart maximum
                        <Tooltip text="Écart maximum autorisé entre deux numéros consécutifs. Évite les grilles trop dispersées avec de grands trous. Recommandé : 15 maximum." />
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="48"
                        value={maxConsecutiveGap}
                        onChange={(e) =>
                          setMaxConsecutiveGap(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Somme cible */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                  <h4 className="text-md font-bold text-amber-300 mb-4 flex items-center gap-2">
                    <span>🎰</span> Somme des Numéros
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Plage de somme optimale (P10-P90 historique : ~100-170).
                    Laisser à 0 pour désactiver.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Somme minimum
                        <Tooltip text="Somme minimale des 5 numéros. Historiquement, la plage optimale est 100-170 (P10-P90). Laisser à 0 pour désactiver cette contrainte." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="245"
                        value={targetSumMin}
                        onChange={(e) =>
                          setTargetSumMin(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-amber-500/30 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                        placeholder="0 = désactivé"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        Somme maximum
                        <Tooltip text="Somme maximale des 5 numéros. Combiné avec le minimum, cela définit une plage cible. Laisser à 0 pour désactiver." />
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="245"
                        value={targetSumMax}
                        onChange={(e) =>
                          setTargetSumMax(parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 bg-dark-900/60 border border-amber-500/30 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                        placeholder="0 = désactivé"
                      />
                    </div>
                  </div>
                </div>

                {/* NOUVEAUX ONGLETS AVANCÉS */}
                <div className="border-t border-white/10 pt-6 mt-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    🚀 Paramètres Avancés Supplémentaires
                  </h4>

                  {/* Tabs Navigation */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {[
                      { id: "structure", label: "🏗️ Structure" },
                      { id: "dispersion", label: "📊 Dispersion" },
                      { id: "distribution", label: "⚖️ Répartition" },
                      { id: "anti-bias", label: "🎯 Anti-biais" },
                      { id: "patterns", label: "🔗 Patterns" },
                      { id: "experimental", label: "🧪 Expérimental" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                          activeTab === tab.id
                            ? "bg-primary-500/20 border-2 border-primary-500/50 text-primary-300"
                            : "bg-dark-800/50 border border-white/10 text-slate-400 hover:bg-dark-700/50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Structure Tab */}
                  {activeTab === "structure" && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 space-y-6 animate-fade-in">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                            Centre de gravité min
                            <Tooltip text="Moyenne des 5 numéros. Optimal: 22-28" />
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="35"
                            value={centerOfGravityMin}
                            onChange={(e) =>
                              setCenterOfGravityMin(parseInt(e.target.value))
                            }
                            className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                            Centre de gravité max
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="35"
                            value={centerOfGravityMax}
                            onChange={(e) =>
                              setCenterOfGravityMax(parseInt(e.target.value))
                            }
                            className="w-full px-4 py-3 bg-dark-900/60 border border-blue-500/30 rounded-xl text-white"
                          />
                        </div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">
                          Répétition avec tirage précédent
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                              Min
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={minRepetitions}
                              onChange={(e) =>
                                setMinRepetitions(parseInt(e.target.value))
                              }
                              className="w-full px-3 py-2 bg-dark-900/60 border border-blue-500/30 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                              Max
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={maxRepetitions}
                              onChange={(e) =>
                                setMaxRepetitions(parseInt(e.target.value))
                              }
                              className="w-full px-3 py-2 bg-dark-900/60 border border-blue-500/30 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={favorExactlyOne}
                                onChange={(e) =>
                                  setFavorExactlyOne(e.target.checked)
                                }
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-xs text-slate-300">
                                Exactement 1
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dispersion Tab */}
                  {activeTab === "dispersion" && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 space-y-6 animate-fade-in">
                      <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">
                          Profil de dispersion
                        </label>
                        <select
                          value={dispersionProfile}
                          onChange={(e) =>
                            setDispersionProfile(
                              e.target.value as DispersionProfile,
                            )
                          }
                          className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl text-white"
                        >
                          <option value="free">Libre</option>
                          <option value="compact">Compact</option>
                          <option value="balanced">Équilibré</option>
                          <option value="dispersed">Dispersé</option>
                        </select>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-slate-400 mb-2 block">
                            Écart moyen min
                          </label>
                          <input
                            type="number"
                            min="4"
                            max="20"
                            value={avgGapMin}
                            onChange={(e) =>
                              setAvgGapMin(parseInt(e.target.value))
                            }
                            className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-400 mb-2 block">
                            Écart moyen max
                          </label>
                          <input
                            type="number"
                            min="4"
                            max="20"
                            value={avgGapMax}
                            onChange={(e) =>
                              setAvgGapMax(parseInt(e.target.value))
                            }
                            className="w-full px-4 py-3 bg-dark-900/60 border border-purple-500/30 rounded-xl text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Distribution Tab */}
                  {activeTab === "distribution" && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 space-y-6 animate-fade-in">
                      <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">
                          Profil de dizaines
                        </label>
                        <select
                          value={decadeProfile}
                          onChange={(e) =>
                            setDecadeProfile(e.target.value as DecadeProfile)
                          }
                          className="w-full px-4 py-3 bg-dark-900/60 border border-green-500/30 rounded-xl text-white"
                        >
                          <option value="free">Libre</option>
                          <option value="1-1-1-1-1">1-1-1-1-1</option>
                          <option value="2-1-1-1">2-1-1-1</option>
                          <option value="2-2-1">2-2-1</option>
                          <option value="3-1-1">3-1-1</option>
                          <option value="3-2">3-2</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">
                          Bonus profil ({decadeBonus})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={decadeBonus}
                          onChange={(e) =>
                            setDecadeBonus(parseInt(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Anti-Bias Tab */}
                  {activeTab === "anti-bias" && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 space-y-6 animate-fade-in">
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <input
                          type="checkbox"
                          checked={antiHumanBias}
                          onChange={(e) => setAntiHumanBias(e.target.checked)}
                          className="w-6 h-6 rounded"
                        />
                        <label className="text-base font-semibold text-red-300">
                          Activer anti-biais
                        </label>
                      </div>
                      {antiHumanBias && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-2 bg-dark-900/40 rounded-lg">
                            <input
                              type="checkbox"
                              checked={penalizeSequences}
                              onChange={(e) =>
                                setPenalizeSequences(e.target.checked)
                              }
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-300">
                              Séquences (1,2,3)
                            </span>
                          </label>
                          <label className="flex items-center gap-3 p-2 bg-dark-900/40 rounded-lg">
                            <input
                              type="checkbox"
                              checked={penalizeProgressions}
                              onChange={(e) =>
                                setPenalizeProgressions(e.target.checked)
                              }
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-300">
                              Progressions (5,10,15)
                            </span>
                          </label>
                          <label className="flex items-center gap-3 p-2 bg-dark-900/40 rounded-lg">
                            <input
                              type="checkbox"
                              checked={penalizeBirthday}
                              onChange={(e) =>
                                setPenalizeBirthday(e.target.checked)
                              }
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-300">
                              Anniversaires (≤31)
                            </span>
                          </label>
                          <label className="flex items-center gap-3 p-2 bg-dark-900/40 rounded-lg">
                            <input
                              type="checkbox"
                              checked={penalizeMultiplesOf5}
                              onChange={(e) =>
                                setPenalizeMultiplesOf5(e.target.checked)
                              }
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-300">
                              Multiples de 5
                            </span>
                          </label>
                          <label className="flex items-center gap-3 p-2 bg-dark-900/40 rounded-lg">
                            <input
                              type="checkbox"
                              checked={penalizeSameEndings}
                              onChange={(e) =>
                                setPenalizeSameEndings(e.target.checked)
                              }
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-300">
                              Terminaisons répétitives
                            </span>
                          </label>
                          <div>
                            <label className="text-sm text-slate-400 mb-1 block">
                              Poids ({penaltyWeight.toFixed(1)}x)
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value={penaltyWeight}
                              onChange={(e) =>
                                setPenaltyWeight(parseFloat(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Patterns Tab */}
                  {activeTab === "patterns" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 space-y-6 animate-fade-in">
                      <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <input
                          type="checkbox"
                          checked={enableFrequentPairs}
                          onChange={(e) =>
                            setEnableFrequentPairs(e.target.checked)
                          }
                          className="w-6 h-6 rounded"
                        />
                        <label className="text-base font-semibold text-yellow-300">
                          Paires fréquentes
                        </label>
                      </div>
                      {enableFrequentPairs && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-slate-400 mb-1 block">
                              Bonus ({pairBonusWeight} pts)
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={pairBonusWeight}
                              onChange={(e) =>
                                setPairBonusWeight(parseInt(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-400 mb-1 block">
                              Max paires/grille
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={maxPairsPerGrid}
                              onChange={(e) =>
                                setMaxPairsPerGrid(parseInt(e.target.value))
                              }
                              className="w-full px-4 py-3 bg-dark-900/60 border border-yellow-500/30 rounded-xl text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Experimental Tab */}
                  {activeTab === "experimental" && (
                    <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-6 space-y-6 animate-fade-in">
                      <div className="flex items-center gap-3 p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                        <input
                          type="checkbox"
                          checked={enableModular}
                          onChange={(e) => setEnableModular(e.target.checked)}
                          className="w-6 h-6 rounded"
                        />
                        <label className="text-base font-semibold text-pink-300">
                          Signature modulaire
                        </label>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                          Pondération temporelle
                        </label>
                        <select
                          value={recencyMode}
                          onChange={(e) =>
                            setRecencyMode(e.target.value as RecencyMode)
                          }
                          className="w-full px-4 py-3 bg-dark-900/60 border border-pink-500/30 rounded-xl text-white"
                        >
                          <option value="uniform">Uniforme</option>
                          <option value="light">Légère</option>
                          <option value="strong">Forte</option>
                          <option value="exponential">Exponentielle</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
          <span className="text-red-400 text-2xl bg-red-500/20 p-2 rounded-full">
            ❌
          </span>
          <p className="text-red-100 font-medium text-lg">{error}</p>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-8 animate-fade-in">
          <p className="font-bold text-orange-400 mb-3 flex items-center gap-2">
            <span className="bg-orange-500/20 p-1.5 rounded-full">⚠️</span>{" "}
            Ajustements algorithmiques :
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
              <h2 className="text-3xl font-extrabold text-white mb-2">
                Grilles Validées
              </h2>
              {genStats && (
                <p className="text-sm text-slate-400 font-mono">
                  Score moy:{" "}
                  <span className="text-emerald-400 font-bold">
                    {genStats.avgScore.toFixed(1)}
                  </span>{" "}
                  • Itérations: {genStats.iterations} • Rejets:{" "}
                  {genStats.rejections}
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
              <div
                key={i}
                className="glass-panel border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20"
              >
                {/* Score Glow Background */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-40"
                  style={{
                    backgroundColor:
                      grid.score > 200
                        ? "#10b981"
                        : grid.score > 100
                          ? "#3b82f6"
                          : "#8b5cf6",
                  }}
                ></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                    Grille {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-2 bg-dark-900/60 px-3 py-1 rounded-lg border border-white/5 text-sm">
                    <span className="text-slate-400">Score</span>
                    <span
                      className={`font-bold ${grid.score > 200 ? "text-emerald-400" : grid.score > 100 ? "text-primary-400" : "text-purple-400"}`}
                    >
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
                    <span className="font-bold text-white">
                      {grid.metadata.sum}
                    </span>
                  </div>
                  <div className="bg-dark-900/30 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block mb-1">Amplitude</span>
                    <span className="font-bold text-white">
                      {grid.metadata.range}
                    </span>
                  </div>
                  <div className="bg-dark-900/30 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block mb-1">
                      Pair/Impair
                    </span>
                    <span className="font-bold text-white">
                      {grid.metadata.evenCount}/{grid.metadata.oddCount}
                    </span>
                  </div>
                  <div className="bg-dark-900/30 p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block mb-1">Bas/Haut</span>
                    <span className="font-bold text-white">
                      {grid.metadata.lowCount}/{grid.metadata.highCount}
                    </span>
                  </div>
                </div>

                {grid.metadata.highNumbers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 relative z-10 flex items-center justify-between text-xs">
                    <span className="text-slate-500">N° ≥ 31</span>
                    <span className="font-bold text-orange-300">
                      {grid.metadata.highNumbers.join(", ")}
                    </span>
                  </div>
                )}

                {/* Score Explanation */}
                {grid.explainableScore && (
                  <ScoreExplanation score={grid.explainableScore} />
                )}

                {/* Comprehensive Score */}
                {grid.comprehensiveScore && (
                  <ComprehensiveScoreDisplay score={grid.comprehensiveScore} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
