"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NumberBadge from "@/components/NumberBadge";

interface DrawDetail {
  id: string;
  dateISO: string;
  dateLabel: string;
  nums: number[];
  chance: number;
  source: string;
  rawDateText?: string;
  previousId: string | null;
  nextId: string | null;
}

export default function DrawDetailPage() {
  const params = useParams();
  const [draw, setDraw] = useState<DrawDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchDraw(params.id as string);
    }
  }, [params.id]);

  const fetchDraw = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/draws/${id}`);
      if (!response.ok) throw new Error("Draw not found");

      const data = await response.json();
      setDraw(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !draw) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">❌ {error || "Tirage non trouvé"}</p>
          <Link
            href="/results"
            className="text-primary-600 hover:underline mt-4 inline-block"
          >
            ← Retour aux résultats
          </Link>
        </div>
      </div>
    );
  }

  // Basic stats
  const sum = draw.nums.reduce((a, b) => a + b, 0);
  const range = Math.max(...draw.nums) - Math.min(...draw.nums);
  const evenCount = draw.nums.filter((n) => n % 2 === 0).length;
  const oddCount = 5 - evenCount;
  const lowCount = draw.nums.filter((n) => n <= 24).length;
  const highCount = 5 - lowCount;

  // Advanced stats
  const isPrime = (n: number) => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const primeCount = draw.nums.filter(isPrime).length;
  const primes = draw.nums.filter(isPrime);

  // Digit endings
  const endings = draw.nums.map((n) => n % 10);
  const uniqueEndings = new Set(endings).size;

  // Consecutive numbers
  const sorted = [...draw.nums].sort((a, b) => a - b);
  const consecutivePairs = sorted.filter(
    (n, i) => i < sorted.length - 1 && sorted[i + 1] === n + 1,
  ).length;
  const hasConsecutive = consecutivePairs > 0;

  // Gaps between consecutive numbers
  const gaps = sorted.slice(1).map((n, i) => n - sorted[i]);
  const minGap = Math.min(...gaps);
  const maxGap = Math.max(...gaps);
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  // Multiples of 5
  const multiplesOf5 = draw.nums.filter((n) => n % 5 === 0).length;

  // Decade distribution
  const decades = [0, 0, 0, 0, 0]; // 1-10, 11-20, 21-30, 31-40, 41-49
  draw.nums.forEach((n) => {
    if (n <= 10) decades[0]++;
    else if (n <= 20) decades[1]++;
    else if (n <= 30) decades[2]++;
    else if (n <= 40) decades[3]++;
    else decades[4]++;
  });
  const maxPerDecade = Math.max(...decades);

  // High numbers (>= 31)
  const highNumbers = draw.nums.filter((n) => n >= 31).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/results"
        className="text-primary-600 hover:underline mb-6 inline-block"
      >
        ← Retour aux résultats
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-primary-700">
            Détails du tirage
          </h1>

          <div className="mb-6">
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              {draw.dateLabel}
            </p>
            <p className="text-gray-500">{draw.dateISO}</p>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-3">
              Numéros tirés :
            </p>
            <div className="flex gap-3">
              {draw.nums.map((num) => (
                <NumberBadge key={num} number={num} size="lg" />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-3">
              Numéro Chance :
            </p>
            <NumberBadge number={draw.chance} variant="chance" size="lg" />
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              📊 Statistiques Basiques
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Somme</p>
                <p className="text-2xl font-bold text-blue-900">{sum}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">Amplitude</p>
                <p className="text-2xl font-bold text-purple-900">{range}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  Pair / Impair
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {evenCount} / {oddCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 font-medium">
                  Bas / Haut
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {lowCount} / {highCount}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4 text-gray-800 mt-8">
              🔬 Analyses Avancées
            </h2>

            {/* Nombres Premiers */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-lg border border-indigo-200 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-indigo-900">
                  🔢 Nombres Premiers
                </h3>
                <span className="text-2xl font-bold text-indigo-700">
                  {primeCount}
                </span>
              </div>
              {primeCount > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {primes.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 bg-indigo-200 text-indigo-900 rounded-full text-sm font-semibold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-indigo-700">
                  Aucun nombre premier dans ce tirage
                </p>
              )}
            </div>

            {/* Terminaisons */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-lg border border-pink-200 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-pink-900">
                  🎲 Terminaisons des Chiffres
                </h3>
                <span className="text-2xl font-bold text-pink-700">
                  {uniqueEndings} uniques
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {endings.map((e, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-pink-200 text-pink-900 rounded-full text-sm font-semibold"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Numéros Consécutifs */}
            <div
              className={`p-5 rounded-lg border mb-4 ${hasConsecutive ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`text-lg font-semibold ${hasConsecutive ? "text-amber-900" : "text-gray-900"}`}
                >
                  🔗 Numéros Consécutifs
                </h3>
                <span
                  className={`text-2xl font-bold ${hasConsecutive ? "text-amber-700" : "text-gray-700"}`}
                >
                  {consecutivePairs > 0
                    ? `${consecutivePairs} paire${consecutivePairs > 1 ? "s" : ""}`
                    : "Aucun"}
                </span>
              </div>
              <p
                className={`text-sm ${hasConsecutive ? "text-amber-700" : "text-gray-600"}`}
              >
                {hasConsecutive
                  ? "Ce tirage contient des numéros consécutifs"
                  : "Aucun numéro consécutif dans ce tirage"}
              </p>
            </div>

            {/* Écarts entre numéros */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-lg border border-cyan-200 mb-4">
              <h3 className="text-lg font-semibold text-cyan-900 mb-3">
                📏 Écarts entre Numéros Consécutifs
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-cyan-700 font-medium">Minimum</p>
                  <p className="text-xl font-bold text-cyan-900">{minGap}</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-700 font-medium">Moyenne</p>
                  <p className="text-xl font-bold text-cyan-900">
                    {avgGap.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-cyan-700 font-medium">Maximum</p>
                  <p className="text-xl font-bold text-cyan-900">{maxGap}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {gaps.map((g, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-cyan-200 text-cyan-900 rounded text-xs font-semibold"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Distribution par Dizaine */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-lg border border-emerald-200 mb-4">
              <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                📊 Distribution par Dizaine
              </h3>
              <div className="space-y-2">
                {["1-10", "11-20", "21-30", "31-40", "41-49"].map(
                  (label, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-emerald-800 w-16">
                        {label}
                      </span>
                      <div className="flex-1 bg-emerald-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(decades[i] / 5) * 100}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-900">
                          {decades[i]} numéro{decades[i] > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
              <p className="text-sm text-emerald-700 mt-3">
                Max par dizaine :{" "}
                <span className="font-bold">{maxPerDecade}</span>
              </p>
            </div>

            {/* Autres Statistiques */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-lg border border-rose-200">
                <p className="text-sm text-rose-700 font-medium">
                  Multiples de 5
                </p>
                <p className="text-2xl font-bold text-rose-900">
                  {multiplesOf5}
                </p>
                {multiplesOf5 > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {draw.nums
                      .filter((n) => n % 5 === 0)
                      .map((n) => (
                        <span
                          key={n}
                          className="px-2 py-1 bg-rose-200 text-rose-900 rounded text-xs font-semibold"
                        >
                          {n}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-lg border border-violet-200">
                <p className="text-sm text-violet-700 font-medium">
                  Numéros ≥ 31
                </p>
                <p className="text-2xl font-bold text-violet-900">
                  {highNumbers}
                </p>
                {highNumbers > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {draw.nums
                      .filter((n) => n >= 31)
                      .map((n) => (
                        <span
                          key={n}
                          className="px-2 py-1 bg-violet-200 text-violet-900 rounded text-xs font-semibold"
                        >
                          {n}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <p className="text-sm text-gray-500">Source: {draw.source}</p>
            {draw.rawDateText && (
              <p className="text-xs text-gray-400 mt-1">
                Date brute: {draw.rawDateText}
              </p>
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
  );
}
