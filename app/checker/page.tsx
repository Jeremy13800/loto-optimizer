"use client";

import { useState } from "react";
import NumberBadge from "@/components/NumberBadge";

interface CheckResult {
  totalDraws: number;
  matches: {
    dateISO: string;
    dateLabel: string;
    drawNums: number[];
    drawChance: number;
    matchedNums: number[];
    matchedChance: boolean;
    rank: string;
  }[];
  summary: {
    rank: string;
    count: number;
  }[];
}

const RANK_LABELS: Record<string, { label: string; color: string }> = {
  "5+C": { label: "Jackpot (5+Chance)", color: "text-yellow-300" },
  "5":   { label: "2e rang (5 numéros)", color: "text-yellow-400" },
  "4+C": { label: "3e rang (4+Chance)", color: "text-orange-400" },
  "4":   { label: "4e rang (4 numéros)", color: "text-orange-300" },
  "3+C": { label: "5e rang (3+Chance)", color: "text-blue-400" },
  "3":   { label: "6e rang (3 numéros)", color: "text-blue-300" },
  "2+C": { label: "7e rang (2+Chance)", color: "text-purple-400" },
  "2":   { label: "8e rang (2 numéros)", color: "text-purple-300" },
  "1+C": { label: "9e rang (1+Chance)", color: "text-slate-300" },
  "0+C": { label: "10e rang (Chance seule)", color: "text-slate-400" },
  "0":   { label: "Pas de gain", color: "text-slate-600" },
};

function getRank(matched: number, chanceMatched: boolean): string {
  if (matched === 5 && chanceMatched) return "5+C";
  if (matched === 5) return "5";
  if (matched === 4 && chanceMatched) return "4+C";
  if (matched === 4) return "4";
  if (matched === 3 && chanceMatched) return "3+C";
  if (matched === 3) return "3";
  if (matched === 2 && chanceMatched) return "2+C";
  if (matched === 2) return "2";
  if (matched === 1 && chanceMatched) return "1+C";
  if (chanceMatched) return "0+C";
  return "0";
}

export default function CheckerPage() {
  const [nums, setNums] = useState<string[]>(["", "", "", "", ""]);
  const [chance, setChance] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleNumChange = (index: number, value: string) => {
    const next = [...nums];
    next[index] = value;
    setNums(next);
  };

  const isValid = () => {
    const parsed = nums.map((n) => parseInt(n));
    const chanceNum = parseInt(chance);
    if (parsed.some((n) => isNaN(n) || n < 1 || n > 49)) return false;
    if (new Set(parsed).size !== 5) return false;
    if (isNaN(chanceNum) || chanceNum < 1 || chanceNum > 10) return false;
    return true;
  };

  const handleCheck = async () => {
    if (!isValid()) {
      setError("Veuillez entrer 5 numéros distincts (1-49) et un numéro chance (1-10).");
      return;
    }
    setChecking(true);
    setError(null);
    setResult(null);

    try {
      const parsedNums = nums.map((n) => parseInt(n)).sort((a, b) => a - b);
      const parsedChance = parseInt(chance);

      const response = await fetch(
        `/api/checker?nums=${parsedNums.join(",")}&chance=${parsedChance}`
      );
      if (!response.ok) throw new Error("Erreur serveur");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setChecking(false);
    }
  };

  const winningMatches = result?.matches.filter((m) => m.rank !== "0") ?? [];
  const displayedMatches = showAll ? result?.matches ?? [] : winningMatches.slice(0, 20);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Vérificateur de <span className="text-gradient">Gains</span>
        </h1>
        <p className="text-slate-400">
          Entrez une grille et découvrez combien de fois elle aurait été gagnante sur l'historique complet.
        </p>
      </div>

      {/* Input panel */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 mb-8">
        <h2 className="text-lg font-bold text-white mb-6">Votre grille</h2>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {nums.map((n, i) => (
            <input
              key={i}
              type="number"
              min={1}
              max={49}
              value={n}
              onChange={(e) => handleNumChange(i, e.target.value)}
              placeholder={`N${i + 1}`}
              className="w-16 h-14 text-center text-lg font-bold bg-dark-900/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/40 transition-all"
            />
          ))}
          <div className="w-px h-10 bg-white/10 mx-1" />
          <input
            type="number"
            min={1}
            max={10}
            value={chance}
            onChange={(e) => setChance(e.target.value)}
            placeholder="C"
            className="w-16 h-14 text-center text-lg font-bold bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 focus:outline-none focus:border-yellow-500/60 transition-all"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 flex items-center gap-2">
            <span>❌</span> {error}
          </p>
        )}

        <button
          onClick={handleCheck}
          disabled={checking || !isValid()}
          className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-500 hover:to-blue-400 text-white rounded-2xl font-bold text-base transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {checking ? "Vérification..." : "Vérifier sur l'historique"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-fade-in space-y-6">
          {/* Summary */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">
              Résultats sur {result.totalDraws.toLocaleString("fr-FR")} tirages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {result.summary
                .filter((s) => s.rank !== "0")
                .map((s) => (
                  <div
                    key={s.rank}
                    className="bg-dark-900/60 rounded-xl p-4 border border-white/5"
                  >
                    <div className={`text-sm font-bold mb-1 ${RANK_LABELS[s.rank]?.color ?? "text-white"}`}>
                      {RANK_LABELS[s.rank]?.label ?? s.rank}
                    </div>
                    <div className="text-2xl font-extrabold text-white">{s.count}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {((s.count / result.totalDraws) * 100).toFixed(3)}% des tirages
                    </div>
                  </div>
                ))}
            </div>
            {result.summary.every((s) => s.rank === "0" || s.count === 0) && (
              <p className="text-slate-400 text-center py-4">
                Cette grille n'aurait jamais été gagnante sur l'historique disponible.
              </p>
            )}
          </div>

          {/* Winning draws detail */}
          {winningMatches.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                Tirages gagnants ({winningMatches.length})
              </h3>
              <div className="space-y-3">
                {displayedMatches
                  .filter((m) => m.rank !== "0")
                  .map((m, i) => (
                    <div key={i} className="bg-dark-900/50 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="min-w-[110px]">
                        <div className="text-xs text-slate-500">{m.dateISO}</div>
                        <div className={`text-sm font-bold mt-0.5 ${RANK_LABELS[m.rank]?.color ?? "text-white"}`}>
                          {RANK_LABELS[m.rank]?.label ?? m.rank}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {m.drawNums.map((n) => (
                          <span
                            key={n}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${
                              m.matchedNums.includes(n)
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-dark-900/60 border-white/10 text-slate-400"
                            }`}
                          >
                            {n}
                          </span>
                        ))}
                        <div className="w-px bg-white/10 mx-1" />
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${
                            m.matchedChance
                              ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
                              : "bg-dark-900/60 border-white/10 text-slate-400"
                          }`}
                        >
                          {m.drawChance}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              {winningMatches.length > 20 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-4 text-sm text-primary-400 hover:text-primary-300 underline"
                >
                  Voir les {winningMatches.length - 20} autres tirages gagnants
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
