"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Stats,
  FrequencyData,
  DistributionData,
  PredictionHeatmap,
  ExtremeGaps,
  DueNumber,
} from "@/lib/types";
import {
  BarChart as CustomBarChart,
  StatsCard,
} from "@/components/AdvancedAnalysisCharts";

export default function AnalysisPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [advancedAnalysis, setAdvancedAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [window, setWindow] = useState<"all" | "1000" | "200" | "custom">(
    "all",
  );
  const [customDraws, setCustomDraws] = useState(500);

  // New advanced analyses states
  const [temporalTrends, setTemporalTrends] = useState<any>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<any>(null);
  const [cooccurrenceHeatmap, setCooccurrenceHeatmap] = useState<any>(null);
  const [streaksData, setStreaksData] = useState<any>(null);
  const [predictionHeatmap, setPredictionHeatmap] =
    useState<PredictionHeatmap | null>(null);
  const [seasonalPatterns, setSeasonalPatterns] = useState<any>(null);
  const [extremeGaps, setExtremeGaps] = useState<ExtremeGaps | null>(null);
  const [backtestingResults, setBacktestingResults] = useState<any>(null);

  useEffect(() => {
    if (window !== "custom") {
      fetchStats();
    }
  }, [window]);

  useEffect(() => {
    if (window === "custom") {
      fetchStats();
    }
  }, [customDraws, window]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    // Determine the number of draws based on window selection
    const windowDraws =
      window === "all"
        ? 10000
        : window === "1000"
          ? 1000
          : window === "200"
            ? 200
            : customDraws;

    const params = new URLSearchParams({ window });
    if (window === "custom") {
      params.append("lastNDraws", customDraws.toString());
    }

    try {
      // Fetch regular stats
      const response = await fetch(`/api/stats?${params}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.stats);

      // Fetch advanced analysis
      const advancedResponse = await fetch(
        `/api/stats/advanced-analysis?${params}`,
      );
      if (advancedResponse.ok) {
        const advancedData = await advancedResponse.json();
        setAdvancedAnalysis(advancedData);
      }

      // Fetch new advanced analyses in parallel based on selected window
      const cacheBuster = Date.now();
      const [
        temporalRes,
        correlationRes,
        cooccurrenceRes,
        streaksRes,
        predictionRes,
        extremeGapsRes,
        backtestingRes,
      ] = await Promise.all([
        fetch(
          `/api/stats/temporal-trends?lastNDraws=${windowDraws}&_=${cacheBuster}`,
        ),
        fetch(
          `/api/stats/correlation-matrix?lastNDraws=${windowDraws}&_=${cacheBuster}`,
        ),
        fetch(
          `/api/stats/cooccurrence-heatmap?lastNDraws=${windowDraws}&_=${cacheBuster}`,
        ),
        fetch(`/api/stats/streaks?lastNDraws=${windowDraws}&_=${cacheBuster}`),
        fetch(
          `/api/stats/prediction-heatmap?lastNDraws=${
            window === "all" ? 200 : windowDraws
          }&_=${cacheBuster}`,
        ),
        fetch(
          `/api/stats/extreme-gaps?lastNDraws=${windowDraws}&_=${cacheBuster}`,
        ),
        fetch(
          `/api/stats/backtesting?testPeriod=${Math.min(windowDraws, 100)}&_=${cacheBuster}`,
        ),
      ]);

      if (temporalRes.ok) setTemporalTrends(await temporalRes.json());
      if (correlationRes.ok) setCorrelationMatrix(await correlationRes.json());
      if (cooccurrenceRes.ok)
        setCooccurrenceHeatmap(await cooccurrenceRes.json());
      if (streaksRes.ok) setStreaksData(await streaksRes.json());
      if (predictionRes.ok) setPredictionHeatmap(await predictionRes.json());
      if (extremeGapsRes.ok) setExtremeGaps(await extremeGapsRes.json());
      if (backtestingRes.ok) setBacktestingResults(await backtestingRes.json());

      // Seasonal patterns always uses all data
      const seasonalRes = await fetch("/api/stats/seasonal-patterns");
      if (seasonalRes.ok) setSeasonalPatterns(await seasonalRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFetch = () => {
    if (customDraws > 0) {
      fetchStats();
    }
  };

  // Helper functions for automatic insights
  const generateGlobalInsights = (stats: Stats) => {
    const insights = [];

    // Even/Odd insight
    const topEvenOdd = stats.evenOddDistribution[0];
    if (topEvenOdd) {
      insights.push({
        category: "Répartition",
        text: `Les grilles contiennent généralement ${topEvenOdd.even} numéros pairs et ${topEvenOdd.odd} impairs`,
        recommendation:
          "Privilégiez 2 ou 3 numéros pairs pour une grille équilibrée",
      });
    }

    // Low/High insight
    const topLowHigh = stats.lowHighDistribution[0];
    if (topLowHigh) {
      insights.push({
        category: "Répartition",
        text: `La combinaison ${topLowHigh.low} bas / ${topLowHigh.high} haut est la plus fréquente`,
        recommendation:
          "Mélangez petits et grands numéros pour une meilleure couverture",
      });
    }

    // Sum insight
    insights.push({
      category: "Somme",
      text: `La plage optimale pour la somme des numéros est entre ${stats.sumPercentiles.p10} et ${stats.sumPercentiles.p90}`,
      recommendation:
        "Visez une somme dans cette plage pour maximiser vos chances",
    });

    return insights;
  };

  const generateFrequencyInsight = (frequencies: FrequencyData[]) => {
    const sorted = [...frequencies].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, 5);
    const bottom = sorted.slice(-5);

    return {
      top: top.map((f) => f.number),
      bottom: bottom.map((f) => f.number),
      message: `Les numéros ${top.map((f) => f.number).join(", ")} sortent le plus souvent`,
      recommendation: "Considérez inclure 1-2 de ces numéros dans votre grille",
    };
  };

  const generateEvenOddInsight = (
    distribution: DistributionData[],
    stats: Stats,
  ) => {
    const top = distribution[0];
    const percentage = ((top.count / stats.totalDraws) * 100).toFixed(1);

    return {
      message: `${top.even} pairs / ${top.odd} impairs représente ${percentage}% des tirages`,
      recommendation: `Pour une grille équilibrée, visez ${top.even} numéros pairs et ${top.odd} impairs`,
    };
  };

  const generateLowHighInsight = (
    distribution: DistributionData[],
    stats: Stats,
  ) => {
    const top = distribution[0];
    const percentage = ((top.count / stats.totalDraws) * 100).toFixed(1);

    return {
      message: `${top.low} bas / ${top.high} haut représente ${percentage}% des tirages`,
      recommendation:
        "Évitez de prendre uniquement des numéros élevés ou uniquement des bas",
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            Comprendre les données
          </h1>
          <p className="text-slate-400 text-lg">
            Découvrez les tendances et utilisez-les pour créer des grilles plus
            intelligentes.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 mb-10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <span className="text-emerald-400">⏱️</span> Fenêtre de données
        </h2>

        <div className="flex flex-wrap gap-4 mb-6 relative z-10">
          {[
            { id: "all", label: "Tous les tirages" },
            { id: "1000", label: "1000 derniers" },
            { id: "200", label: "200 derniers" },
            { id: "custom", label: "Personnalisé" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setWindow(btn.id as any)}
              className={`px-6 py-3 rounded-xl transition-all font-medium ${
                window === btn.id
                  ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "bg-slate-800/50 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {window === "custom" && (
          <div className="flex flex-col sm:flex-row gap-4 items-end relative z-10 animate-slide-up">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre de tirages
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={customDraws}
                onChange={(e) => setCustomDraws(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all"
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
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-red-400 text-2xl">❌</span>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 text-sm border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all whitespace-nowrap"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-8 animate-slide-up">
          {/* RÉSUMÉ INTELLIGENT */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Ce que les données nous disent
              </h2>
            </div>

            <div className="space-y-4">
              {generateGlobalInsights(stats).map((insight, i) => (
                <div
                  key={i}
                  className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-emerald-400 text-sm font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">
                        {insight.text}
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span className="text-slate-300">
                          {insight.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <Link
                href="/generator"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <span>Utiliser ces insights pour générer une grille</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* SECTION 1: RÉPARTITION DES NUMÉROS */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-400">📊</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Répartition des numéros
              </h2>
            </div>

            {/* FREQUENCES NUMEROS */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Quels numéros sortent le plus souvent ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Fréquence de sortie de chaque numéro sur l'historique
                sélectionné
              </p>

              <div className="h-[400px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.numberFrequencies}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="number"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "0.75rem",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#38bdf8" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="count"
                      fill="url(#blueGradient)"
                      name="Occurrences"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="blueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insight Block */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-blue-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      {
                        generateFrequencyInsight(stats.numberFrequencies)
                          .message
                      }
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        {
                          generateFrequencyInsight(stats.numberFrequencies)
                            .recommendation
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DISTRIBUTION PAIR/IMPAIR */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Quelle répartition pair / impair est la plus fréquente ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Analyse de la répartition des numéros pairs et impairs dans les
                grilles gagnantes
              </p>

              <div className="space-y-5 mb-6">
                {stats.evenOddDistribution.slice(0, 5).map((dist, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-40 text-slate-300 font-medium text-sm">
                      <span className="text-white">{dist.even}</span> pair /{" "}
                      <span className="text-white">{dist.odd}</span> impair
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded-full h-8 border border-slate-700/30 overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full flex items-center justify-end pr-3 text-white text-xs font-bold rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.max((dist.count / stats.totalDraws) * 100, 15)}%`,
                        }}
                      >
                        {dist.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight Block */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-blue-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      {
                        generateEvenOddInsight(stats.evenOddDistribution, stats)
                          .message
                      }
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        {
                          generateEvenOddInsight(
                            stats.evenOddDistribution,
                            stats,
                          ).recommendation
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DISTRIBUTION BAS/HAUT */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Faut-il privilégier les petits ou grands numéros ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Analyse de la répartition entre numéros bas (1-24) et hauts
                (25-49)
              </p>

              <div className="space-y-5 mb-6">
                {stats.lowHighDistribution.slice(0, 5).map((dist, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-40 text-slate-300 font-medium text-sm">
                      <span className="text-white">{dist.low}</span> bas /{" "}
                      <span className="text-white">{dist.high}</span> haut
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded-full h-8 border border-slate-700/30 overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full flex items-center justify-end pr-3 text-white text-xs font-bold rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.max((dist.count / stats.totalDraws) * 100, 15)}%`,
                        }}
                      >
                        {dist.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight Block */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-emerald-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      {
                        generateLowHighInsight(stats.lowHighDistribution, stats)
                          .message
                      }
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        {
                          generateLowHighInsight(
                            stats.lowHighDistribution,
                            stats,
                          ).recommendation
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TENDANCES ET PATTERNS */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <span className="text-purple-400">🔥</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Tendances et patterns
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* GAPS */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Quels numéros sont en retard de sortie ?
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Nombre de tirages depuis la dernière sortie de chaque numéro
                </p>

                <div className="grid grid-cols-7 gap-2 mb-6">
                  {stats.currentGaps.slice(0, 49).map((gap) => (
                    <div
                      key={gap.number}
                      className={`text-center py-2 rounded-lg border ${
                        gap.gap > 50
                          ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                          : gap.gap > 30
                            ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                            : "bg-slate-800/50 border-slate-700/30 text-slate-300"
                      } transition-colors hover:bg-white/10`}
                    >
                      <div className="font-bold">{gap.number}</div>
                      <div className="text-[10px] opacity-80 mt-1">
                        {gap.gap}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insight Block */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-purple-300 font-medium mb-2">
                        Ce qu'on observe
                      </p>
                      <p className="text-white text-sm mb-3">
                        Les numéros en rouge sont en retard significatif (plus
                        de 50 tirages)
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span className="text-slate-300">
                          Ces numéros pourraient être "dus" pour sortir, mais ne
                          misez pas tout dessus
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP PAIRES */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Quelles paires de numéros sortent souvent ensemble ?
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Combinaisons de 2 numéros qui apparaissent fréquemment dans
                  les mêmes tirages
                </p>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 mb-6">
                  {stats.topPairs.slice(0, 10).map((pair, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-800/30 border border-slate-700/30 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center font-bold text-white shadow-inner">
                          {pair.pair[0]}
                        </div>
                        <span className="text-slate-500 font-bold px-1">+</span>
                        <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center font-bold text-white shadow-inner">
                          {pair.pair[1]}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-blue-400 font-bold text-xl group-hover:text-blue-300 transition-colors">
                          {pair.count}{" "}
                          <span className="text-sm font-normal text-slate-500">
                            fois
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insight Block */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-purple-300 font-medium mb-2">
                        Ce qu'on observe
                      </p>
                      <p className="text-white text-sm mb-3">
                        Certaines paires ont une affinité et sortent ensemble
                        plus souvent
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span className="text-slate-300">
                          Inclure 1-2 de ces paires peut améliorer vos chances
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NOUVELLES STATISTIQUES AVANCÉES */}

          {/* NUMÉROS CHAUDS ET FROIDS */}
          {stats.hotNumbers && stats.coldNumbers && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Quels numéros sont en tendance ?
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Numéros sortis fréquemment dans les 100 derniers tirages
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  {stats.hotNumbers.map((num) => (
                    <div
                      key={num}
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 border border-orange-500/50 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:scale-110 transition-transform"
                    >
                      {num}
                    </div>
                  ))}
                  {stats.hotNumbers.length === 0 && (
                    <p className="text-slate-500 italic">
                      Aucun numéro chaud détecté
                    </p>
                  )}
                </div>

                {/* Insight Block */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-orange-300 font-medium mb-2">
                        Ce qu'on observe
                      </p>
                      <p className="text-white text-sm mb-3">
                        Ces numéros sont en forte tendance récente
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span className="text-slate-300">
                          Inclure 1-2 numéros chauds peut être judicieux, mais
                          évitez de tous prendre
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Quels numéros sont en retard ?
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Numéros en retard significatif par rapport à leur moyenne
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  {stats.coldNumbers.map((num) => (
                    <div
                      key={num}
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/50 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-110 transition-transform"
                    >
                      {num}
                    </div>
                  ))}
                  {stats.coldNumbers.length === 0 && (
                    <p className="text-slate-500 italic">
                      Aucun numéro froid détecté
                    </p>
                  )}
                </div>

                {/* Insight Block */}
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-cyan-300 font-medium mb-2">
                        Ce qu'on observe
                      </p>
                      <p className="text-white text-sm mb-3">
                        Ces numéros sont en retard et pourraient être "dus" pour
                        sortir
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span className="text-slate-300">
                          Considérez en inclure 1, mais ne misez pas tout dessus
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRIPLETS FRÉQUENTS */}
          {stats.topTriplets && stats.topTriplets.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Quels triplets de numéros sortent souvent ensemble ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Combinaisons de 3 numéros qui apparaissent fréquemment dans les
                mêmes tirages
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {stats.topTriplets.slice(0, 9).map((triplet, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/30 border border-slate-700/30 p-5 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {triplet.triplet.map((num, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className="w-10 h-10 rounded-lg bg-purple-900/50 border border-purple-500/30 flex items-center justify-center font-bold text-white shadow-inner">
                            {num}
                          </div>
                          {idx < 2 && (
                            <span className="text-slate-600 text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <span className="text-purple-400 font-bold text-lg">
                        {triplet.count}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">fois</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight Block */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-purple-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      Certains triplets ont une affinité statistique forte
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        Inclure un triplet fréquent peut améliorer vos chances
                        de reproduction de patterns
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DISTRIBUTION PAR DIZAINE */}
          {stats.decadeDistribution && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Comment sont répartis les numéros par dizaine ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Analyse de la couverture des différentes tranches de numéros
                (1-10, 11-20, etc.)
              </p>

              <div className="space-y-4 mb-6">
                {stats.decadeDistribution.map((decade) => {
                  const decadeLabel =
                    decade.decade === 0
                      ? "1-10"
                      : decade.decade === 1
                        ? "11-20"
                        : decade.decade === 2
                          ? "21-30"
                          : decade.decade === 3
                            ? "31-40"
                            : "41-49";
                  return (
                    <div
                      key={decade.decade}
                      className="flex items-center gap-4"
                    >
                      <div className="w-24 text-slate-300 font-medium text-sm">
                        {decadeLabel}
                      </div>
                      <div className="flex-1 bg-slate-800/50 rounded-full h-10 border border-slate-700/30 overflow-hidden relative">
                        <div
                          className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full flex items-center justify-end pr-4 text-white text-sm font-bold rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.max(decade.percentage, 10)}%`,
                          }}
                        >
                          {decade.count} ({decade.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insight Block */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-indigo-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      La distribution par dizaine est relativement équilibrée
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        Essayez de couvrir 3-4 dizaines différentes pour une
                        grille équilibrée
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOMBRES PREMIERS */}
          {stats.primeNumberStats && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Combien de nombres premiers par grille ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Analyse de la fréquence des nombres premiers (2, 3, 5, 7, 11,
                13, 17, 19, 23, 29, 31, 37, 41, 43, 47)
              </p>

              <div className="h-[300px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.primeNumberStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="primeCount"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                      label={{
                        value: "Nombre de premiers",
                        position: "insideBottom",
                        offset: -5,
                        fill: "rgba(255,255,255,0.6)",
                      }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "0.75rem",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#a78bfa" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="frequency"
                      fill="url(#purpleGradient)"
                      name="Fréquence"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="purpleGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insight Block */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-purple-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      Historiquement, 2-3 nombres premiers par grille est
                      optimal
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        Visez 2 ou 3 nombres premiers dans votre grille
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TERMINAISONS DES CHIFFRES */}
          {stats.digitEndingDistribution && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Quelles terminaisons sont les plus fréquentes ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Fréquence des chiffres finaux (0-9) dans les numéros
              </p>

              <div className="h-[300px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.digitEndingDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="digit"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "0.75rem",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#34d399" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="count"
                      fill="url(#greenGradient)"
                      name="Occurrences"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="greenGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insight Block */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-emerald-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      Les terminaisons sont relativement équilibrées
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        Évitez de répéter les mêmes terminaisons (ex: 12, 22,
                        32) pour diversifier votre grille
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉCARTS ENTRE NUMÉROS CONSÉCUTIFS */}
          {stats.consecutiveGapDistribution && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Quel espacement entre les numéros dans la grille ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Distribution des écarts entre numéros consécutifs dans les
                grilles triées
              </p>

              <div className="h-[350px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.consecutiveGapDistribution.slice(0, 20)}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="gap"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                      label={{
                        value: "Écart",
                        position: "insideBottom",
                        offset: -5,
                        fill: "rgba(255,255,255,0.6)",
                      }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.6)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "0.75rem",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fb923c" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="count"
                      fill="url(#orangeGradient)"
                      name="Fréquence"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="orangeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insight Block */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-orange-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      Les écarts moyens entre 4 et 8 sont les plus fréquents
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        Évitez les grilles trop compactes (écarts &lt; 2) ou
                        trop dispersées (écarts &gt; 15)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CORRÉLATION CHANCE / SOMME */}
          {stats.chanceCorrelation && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-2">
                Le numéro chance influence-t-il la grille ?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Relation entre le numéro chance et les caractéristiques des
                grilles (somme, amplitude)
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Chance
                      </th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                        Somme Moyenne
                      </th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                        Amplitude Moyenne
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.chanceCorrelation.map((corr) => (
                      <tr
                        key={corr.chance}
                        className="border-b border-slate-700/50 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-lg bg-amber-900/50 border border-amber-500/30 flex items-center justify-center font-bold text-white shadow-inner">
                            {corr.chance}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-white font-medium">
                          {corr.avgSum.toFixed(1)}
                        </td>
                        <td className="text-right py-3 px-4 text-white font-medium">
                          {corr.avgRange.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insight Block */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-amber-300 font-medium mb-2">
                      Ce qu'on observe
                    </p>
                    <p className="text-white text-sm mb-3">
                      Certains numéros chance sont associés à des sommes ou
                      amplitudes spécifiques
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-slate-300">
                        Utilisez cette corrélation pour affiner votre choix de
                        numéro chance
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOUVELLES ANALYSES AVANCÉES */}
          {advancedAnalysis && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-400">🔬</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Analyses avancées
                </h2>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-1">
                    Tirages analysés
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {advancedAnalysis.metadata?.totalDraws || 0}
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-1">
                    Somme moyenne
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {advancedAnalysis.sums?.average.toFixed(0) || 0}
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-1">
                    Amplitude moyenne
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {advancedAnalysis.amplitudes?.average.toFixed(0) || 0}
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-1">
                    Dispersion moyenne
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {advancedAnalysis.dispersion?.average.toFixed(1) || 0}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Répétitions entre tirages */}
                {advancedAnalysis.repetitions && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.repetitions.distribution}
                      title="1️⃣ Répétitions entre tirages consécutifs"
                      description="Nombre de numéros identiques entre un tirage et le suivant"
                      color="blue"
                    />
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-blue-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            La plupart des tirages ont 0-1 numéros en commun
                            avec le tirage précédent
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Évitez de réutiliser trop de numéros du tirage
                              précédent
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Distribution des sommes */}
                {advancedAnalysis.sums && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.sums.distribution}
                      title="2️⃣ Distribution des sommes"
                      description="Somme des 5 numéros par tirage (plage optimale : 104-145)"
                      color="green"
                    />
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-green-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            Les sommes entre 100 et 150 sont les plus fréquentes
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Visez une somme entre 104 et 145 pour rester dans
                              la moyenne
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Distribution des amplitudes */}
                {advancedAnalysis.amplitudes && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.amplitudes.distribution}
                      title="3️⃣ Distribution des amplitudes"
                      description="Écart entre le plus petit et le plus grand numéro"
                      color="purple"
                    />
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-purple-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            Les amplitudes entre 25 et 35 sont les plus
                            courantes
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Évitez les grilles trop compactes ou trop
                              dispersées
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Indice de dispersion */}
                {advancedAnalysis.dispersion && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.dispersion.distribution}
                      title="4️⃣ Indice de dispersion"
                      description="Moyenne des écarts entre numéros consécutifs triés"
                      color="pink"
                    />
                    <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-pink-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            Les dispersions entre 4 et 8 sont les plus
                            fréquentes
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Une grille bien répartie a une dispersion moyenne
                              autour de 6
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Couverture des dizaines */}
                {advancedAnalysis.decadeCoverage && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.decadeCoverage.distribution}
                      title="5️⃣ Nombre de dizaines différentes"
                      description="Combien de tranches de 10 sont représentées (1-10, 11-20, etc.)"
                      color="yellow"
                    />
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-yellow-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            La plupart des tirages couvrent 3-4 dizaines
                            différentes
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Évitez de concentrer vos numéros dans seulement 2
                              dizaines
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Numéros consécutifs */}
                {advancedAnalysis.consecutives && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.consecutives.distribution}
                      title="6️⃣ Distribution des numéros consécutifs"
                      description="Nombre de paires de numéros qui se suivent (ex: 7-8)"
                      color="red"
                    />
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-red-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            0-2 paires consécutives sont les plus fréquentes
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Inclure 1 paire consécutive est statistiquement
                              normal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiples de 5 */}
                {advancedAnalysis.multiplesOf5 && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.multiplesOf5.distribution}
                      title="7️⃣ Distribution des multiples de 5"
                      description="Nombre de multiples de 5 par tirage (5, 10, 15, 20, etc.)"
                      color="orange"
                    />
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-orange-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            0-2 multiples de 5 par tirage sont les plus courants
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Évitez d'avoir trop de multiples de 5 dans votre
                              grille
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Numéros >31 */}
                {advancedAnalysis.highNumbers && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.highNumbers.distribution}
                      title="8️⃣ Distribution des numéros &gt;31"
                      description="Nombre de numéros supérieurs à 31 par tirage"
                      color="cyan"
                    />
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-cyan-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            1-2 numéros &gt;31 par tirage sont les plus
                            fréquents
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Les numéros &gt;31 représentent les dates de
                              naissance possibles
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Centre de gravité */}
                {advancedAnalysis.centerGravity && (
                  <div>
                    <CustomBarChart
                      data={advancedAnalysis.centerGravity.distribution}
                      title="9️⃣ Centre de gravité"
                      description="Moyenne des 5 numéros (optimal : 22-28)"
                      color="indigo"
                    />
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-indigo-300 font-medium mb-2">
                            Ce qu'on observe
                          </p>
                          <p className="text-white text-sm mb-3">
                            Les centres de gravité entre 20 et 30 sont les plus
                            fréquents
                          </p>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 mt-0.5">→</span>
                            <span className="text-slate-300">
                              Visez un centre de gravité entre 22 et 28 pour un
                              équilibre optimal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOUVELLES ANALYSES PRÉDICTIVES */}
          {predictionHeatmap && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-rose-600/20 border border-rose-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-rose-400">🎯</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Analyses prédictives
                </h2>
              </div>

              {/* Heatmap de prédiction */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Quels numéros ont le plus de chances de sortir ?
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Probabilités calculées par l'IA basées sur les tendances
                  historiques
                </p>

                <div className="grid grid-cols-7 gap-2 mb-6">
                  {predictionHeatmap.probabilities?.map((p) => (
                    <div
                      key={p.num}
                      className={`text-center py-3 rounded-lg border transition-all hover:scale-110 ${
                        p.probability > 0.025
                          ? "bg-gradient-to-br from-orange-500/30 to-red-500/20 border-orange-500/50 text-orange-300 font-bold"
                          : p.probability > 0.02
                            ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300"
                            : "bg-slate-800/50 border-slate-700/30 text-slate-400"
                      }`}
                    >
                      <div className="font-bold">{p.num}</div>
                      <div className="text-[10px] opacity-80 mt-1">
                        {(p.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insight Block */}
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-rose-300 font-medium mb-2">
                        Ce qu'on observe
                      </p>
                      <p className="text-white text-sm mb-3">
                        Les numéros en rouge/orange ont les probabilités les
                        plus élevées
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span className="text-slate-300">
                          Considérez inclure 1-2 de ces numéros dans votre
                          grille
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYSES DE TENDANCES */}
          {temporalTrends && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">📈</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Tendances temporelles
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Quels numéros sont en hausse ?
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Numéros dont la fréquence augmente récemment
                  </p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    {temporalTrends.risingNumbers?.map((num: number) => (
                      <div
                        key={num}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 border border-green-500/50 flex items-center justify-center font-bold text-white text-lg"
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-green-300 font-medium mb-2">
                          Ce qu'on observe
                        </p>
                        <p className="text-white text-sm mb-3">
                          Ces numéros sont en phase de montée
                        </p>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-400 mt-0.5">→</span>
                          <span className="text-slate-300">
                            Surfez sur la tendance en incluant 1-2 de ces
                            numéros
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Quels numéros sont en baisse ?
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Numéros dont la fréquence diminue récemment
                  </p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    {temporalTrends.fallingNumbers?.map((num: number) => (
                      <div
                        key={num}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-rose-500/20 border border-red-500/50 flex items-center justify-center font-bold text-white text-lg"
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-red-300 font-medium mb-2">
                          Ce qu'on observe
                        </p>
                        <p className="text-white text-sm mb-3">
                          Ces numéros sont en phase de baisse
                        </p>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-400 mt-0.5">→</span>
                          <span className="text-slate-300">
                            Évitez de miser trop sur ces numéros pour le moment
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYSES DE STREAKS */}
          {streaksData && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-600/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-orange-400">🔥</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Séries chaudes et froides
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Quels numéros sont en série chaude ?
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Numéros sortis consécutivement (série en cours)
                  </p>

                  {streaksData.currentlyHot?.length > 0 ? (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {streaksData.currentlyHot.map((num: number) => (
                        <div
                          key={num}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 border border-orange-500/50 flex items-center justify-center font-bold text-white text-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic mb-6">
                      Aucun numéro en série chaude actuellement
                    </p>
                  )}

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-orange-300 font-medium mb-2">
                          Ce qu'on observe
                        </p>
                        <p className="text-white text-sm mb-3">
                          Ces numéros sont en train de sortir souvent
                        </p>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-400 mt-0.5">→</span>
                          <span className="text-slate-300">
                            Surfez sur la série en incluant 1 de ces numéros
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Quels numéros sont en série froide ?
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Numéros absents depuis longtemps (série froide en cours)
                  </p>

                  {streaksData.currentlyCold?.length > 0 ? (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {streaksData.currentlyCold.map((num: number) => (
                        <div
                          key={num}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/50 flex items-center justify-center font-bold text-white text-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic mb-6">
                      Aucun numéro en série froide actuellement
                    </p>
                  )}

                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-cyan-300 font-medium mb-2">
                          Ce qu'on observe
                        </p>
                        <p className="text-white text-sm mb-3">
                          Ces numéros n'ont pas sorti depuis longtemps
                        </p>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-400 mt-0.5">→</span>
                          <span className="text-slate-300">
                            Ils pourraient être "dus" mais ne misez pas tout
                            dessus
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYSES D'ÉCARTS */}
          {extremeGaps && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-600/20 border border-yellow-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400">⚡</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Écarts extrêmes
                </h2>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Quels numéros sont en retard significatif ?
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Numéros dont l'écart actuel dépasse leur moyenne historique
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {extremeGaps.dueNumbers?.slice(0, 9).map((item) => (
                    <div
                      key={item.num}
                      className="bg-slate-800/30 border border-slate-700/30 p-4 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-white">
                          {item.num}
                        </span>
                        <span className="text-xs text-orange-400 font-bold">
                          x{item.ratio.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        Écart: {item.currentGap} tirages
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-yellow-300 font-medium mb-2">
                        Ce qu'on observe
                      </p>
                      <p className="text-white text-sm mb-3">
                        Ces numéros sont en retard par rapport à leur moyenne
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span className="text-slate-300">
                          Le ratio indique combien de fois leur écart dépasse la
                          moyenne
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
