"use client";

import { BarChart as CustomBarChart, StatsCard } from "./AdvancedAnalysisCharts";

interface AdvancedAnalysisSectionProps {
  advancedAnalysis: any;
}

export default function AdvancedAnalysisSection({ advancedAnalysis }: AdvancedAnalysisSectionProps) {
  if (!advancedAnalysis) return null;

  return (
    <>
      {/* Section Header */}
      <div className="col-span-full mt-12 mb-6">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-3xl">🔬</span> Analyses Statistiques Avancées
        </h2>
        <p className="text-slate-400">
          9 dimensions d'analyse pour comprendre la structure des tirages
        </p>
      </div>

      {/* Stats Cards */}
      <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          label="Tirages analysés" 
          value={advancedAnalysis.metadata?.totalDraws || 0}
          icon="📊"
          color="primary"
        />
        <StatsCard 
          label="Somme moyenne" 
          value={advancedAnalysis.sums?.average.toFixed(0) || 0}
          icon="➕"
          color="blue"
        />
        <StatsCard 
          label="Amplitude moyenne" 
          value={advancedAnalysis.amplitudes?.average.toFixed(0) || 0}
          icon="📏"
          color="green"
        />
        <StatsCard 
          label="Dispersion moyenne" 
          value={advancedAnalysis.dispersion?.average.toFixed(1) || 0}
          icon="📐"
          color="purple"
        />
      </div>

      {/* Répétitions entre tirages */}
      {advancedAnalysis.repetitions && (
        <CustomBarChart
          data={advancedAnalysis.repetitions.distribution}
          title="1️⃣ Répétitions entre tirages consécutifs"
          description="Nombre de numéros identiques entre un tirage et le suivant"
          color="blue"
        />
      )}

      {/* Distribution des sommes */}
      {advancedAnalysis.sums && (
        <CustomBarChart
          data={advancedAnalysis.sums.distribution}
          title="2️⃣ Distribution des sommes"
          description="Somme des 5 numéros par tirage (plage optimale : 104-145)"
          color="green"
        />
      )}

      {/* Distribution des amplitudes */}
      {advancedAnalysis.amplitudes && (
        <CustomBarChart
          data={advancedAnalysis.amplitudes.distribution}
          title="3️⃣ Distribution des amplitudes"
          description="Écart entre le plus petit et le plus grand numéro"
          color="purple"
        />
      )}

      {/* Indice de dispersion */}
      {advancedAnalysis.dispersion && (
        <CustomBarChart
          data={advancedAnalysis.dispersion.distribution}
          title="4️⃣ Indice de dispersion"
          description="Moyenne des écarts entre numéros consécutifs triés"
          color="pink"
        />
      )}

      {/* Couverture des dizaines */}
      {advancedAnalysis.decadeCoverage && (
        <CustomBarChart
          data={advancedAnalysis.decadeCoverage.distribution}
          title="5️⃣ Nombre de dizaines différentes"
          description="Combien de tranches de 10 sont représentées (1-10, 11-20, etc.)"
          color="yellow"
        />
      )}

      {/* Numéros consécutifs */}
      {advancedAnalysis.consecutives && (
        <CustomBarChart
          data={advancedAnalysis.consecutives.distribution}
          title="6️⃣ Distribution des numéros consécutifs"
          description="Nombre de paires de numéros qui se suivent (ex: 7-8)"
          color="red"
        />
      )}

      {/* Multiples de 5 */}
      {advancedAnalysis.multiplesOf5 && (
        <CustomBarChart
          data={advancedAnalysis.multiplesOf5.distribution}
          title="7️⃣ Distribution des multiples de 5"
          description="Nombre de multiples de 5 par tirage (5, 10, 15, 20, etc.)"
          color="orange"
        />
      )}

      {/* Numéros >31 */}
      {advancedAnalysis.highNumbers && (
        <CustomBarChart
          data={advancedAnalysis.highNumbers.distribution}
          title="8️⃣ Distribution des numéros >31"
          description="Nombre de numéros supérieurs à 31 par tirage"
          color="cyan"
        />
      )}

      {/* Centre de gravité */}
      {advancedAnalysis.centerGravity && (
        <CustomBarChart
          data={advancedAnalysis.centerGravity.distribution}
          title="9️⃣ Centre de gravité"
          description="Moyenne des 5 numéros (optimal : 22-28)"
          color="indigo"
        />
      )}
    </>
  );
}
