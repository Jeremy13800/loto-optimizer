"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const response = await fetch("/api/draws/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la synchronisation");
      } else {
        setSyncResult(data);
      }
    } catch (err) {
      setError("Erreur réseau lors de la synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/draws/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) setImportError(data.error || "Erreur import");
      else setImportResult(data);
    } catch {
      setImportError("Erreur réseau");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in relative">
      {/* Decorative background blur */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-20">
        {/* HERO SECTION */}
        <div className="text-center space-y-8 animate-slide-up relative z-10 pt-10">
          <div className="inline-block mb-4">
            <span className="px-5 py-2 rounded-full glass border-primary-500/30 text-primary-400 text-sm font-semibold tracking-wider uppercase shadow-[0_0_20px_rgba(59,130,246,0.15)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
              Intelligence Statistique
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Analyseur{" "}
            <span className="text-gradient drop-shadow-xl inline-block mt-2">
              Loto FDJ
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Exploitez l&apos;historique complet des tirages pour générer des
            grilles optimisées basées sur les mathématiques et les probabilités.
          </p>
        </div>

        {/* SYNC PANEL */}
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-white/5 mx-auto max-w-4xl z-10">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-1000 ease-out"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-4">
                <span className="p-3 bg-primary-500/20 rounded-xl text-primary-400 shadow-inner">
                  🔄
                </span>
                Base de données
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Gardez une longueur d&apos;avance en récupérant automatiquement
                les derniers tirages officiels du Loto FDJ pour nourrir vos
                analyses.
              </p>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-500 hover:to-blue-400 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group/btn"
            >
              {/* Button inner glow */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>

              {syncing ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <span className="animate-spin h-6 w-6 border-3 border-white/30 border-t-white rounded-full"></span>
                  Synchronisation...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Synchroniser maintenant
                  <span className="text-xl">➔</span>
                </span>
              )}
            </button>
          </div>

          {syncing && (
            <div className="mt-6 p-6 bg-primary-500/10 border border-primary-500/30 rounded-xl animate-fade-in">
              <div className="flex items-center justify-center gap-4">
                <span className="animate-spin h-8 w-8 border-3 border-primary-400 border-t-transparent rounded-full"></span>
                <span className="text-primary-300 text-xl font-bold">
                  Synchronisation en cours... Veuillez patienter quelques
                  secondes
                </span>
              </div>
            </div>
          )}

          {syncResult && (
            <div className="mt-12 p-8 glass rounded-2xl border-emerald-500/30 bg-emerald-500/5 animate-fade-in">
              <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                <span className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-400">
                  ✓
                </span>
                Synchronisation réussie
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-5 rounded-xl bg-dark-900/60 border border-white/5 shadow-inner">
                  <div className="text-slate-400 text-sm font-medium">
                    Total tirages
                  </div>
                  <div className="text-3xl font-bold text-white mt-2">
                    {syncResult.count}
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-dark-900/60 border border-white/5 shadow-inner">
                  <div className="text-slate-400 text-sm font-medium">
                    Nouveaux
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mt-2">
                    +{syncResult.inserted}
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-dark-900/60 border border-white/5 shadow-inner">
                  <div className="text-slate-400 text-sm font-medium">
                    Mis à jour
                  </div>
                  <div className="text-3xl font-bold text-primary-400 mt-2">
                    {syncResult.updated}
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-dark-900/60 border border-white/5 shadow-inner">
                  <div className="text-slate-400 text-sm font-medium">
                    Dernier tirage
                  </div>
                  <div className="text-xl font-bold text-white mt-2 pt-1">
                    {syncResult.lastDate}
                  </div>
                </div>
              </div>

              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="mt-6 p-5 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <p className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <span>⚠️</span> Avertissements rencontrés :
                  </p>
                  <ul className="text-sm text-orange-200/80 list-disc list-inside space-y-2">
                    {syncResult.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in flex items-center gap-4">
              <span className="text-red-400 text-2xl bg-red-500/20 p-2 rounded-full">
                ❌
              </span>
              <p className="text-red-100 font-medium text-lg">{error}</p>
            </div>
          )}
        </div>

        {/* IMPORT CSV PANEL */}
        <div className="glass-panel rounded-3xl p-8 border border-white/5 mx-auto max-w-4xl z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="p-2 bg-teal-500/20 rounded-xl text-teal-400">📂</span>
                Import CSV officiel FDJ
              </h2>
              <p className="text-slate-400">
                Importez un fichier CSV depuis{" "}
                <span className="text-teal-400 font-medium">data.gouv.fr</span>{" "}
                pour enrichir la base sans limite de fréquence.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleImport}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className={`cursor-pointer inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all border ${
                  importing
                    ? "opacity-50 cursor-wait border-teal-500/30 text-teal-400"
                    : "border-teal-500/40 text-teal-300 hover:bg-teal-500/10 hover:border-teal-400"
                }`}
              >
                {importing ? "Import en cours..." : "Choisir un fichier CSV"}
              </label>
            </div>
          </div>

          {importResult && (
            <div className="mt-6 p-5 bg-teal-500/5 border border-teal-500/30 rounded-xl animate-fade-in">
              <p className="text-teal-400 font-bold mb-2">Import réussi</p>
              <div className="flex gap-6 text-sm text-slate-300">
                <span>Lus : <b>{importResult.parsed}</b></span>
                <span>Valides : <b>{importResult.valid}</b></span>
                <span className="text-emerald-400">Insérés : <b>+{importResult.inserted}</b></span>
                <span className="text-slate-500">Doublons ignorés : <b>{importResult.skipped}</b></span>
              </div>
            </div>
          )}
          {importError && (
            <p className="mt-4 text-red-400 text-sm flex items-center gap-2">
              <span>❌</span> {importError}
            </p>
          )}
        </div>

        {/* NAVIGATION CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 z-10 relative">
          <Link
            href="/results"
            className="group glass rounded-3xl p-10 hover:-translate-y-3 hover:bg-white/10 hover:border-blue-500/40 transition-all duration-500 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)]"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              📊
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
              Résultats
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Consultez l&apos;historique complet des tirages. Filtrez,
              recherchez et explorez les résultats passés avec précision.
            </p>
          </Link>

          <Link
            href="/analysis"
            className="group glass rounded-3xl p-10 hover:-translate-y-3 hover:bg-white/10 hover:border-emerald-500/40 transition-all duration-500 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              📈
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
              Analyse
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Visualisez les fréquences, les écarts et la distribution des
              numéros à travers des graphiques experts interactifs.
            </p>
          </Link>

          <Link
            href="/generator"
            className="group glass rounded-3xl p-10 hover:-translate-y-3 hover:bg-white/10 hover:border-purple-500/40 transition-all duration-500 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.3)]"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              🎲
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
              Générateur
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Créez des grilles hautement optimisées en appliquant des
              contraintes statistiques et mathématiques intelligentes.
            </p>
          </Link>

          <Link
            href="/checker"
            className="group glass rounded-3xl p-10 hover:-translate-y-3 hover:bg-white/10 hover:border-amber-500/40 transition-all duration-500 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              🏆
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">
              Vérificateur
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Testez n&apos;importe quelle grille contre l&apos;historique complet et découvrez combien de fois elle aurait été gagnante.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
