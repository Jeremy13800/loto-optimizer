/**
 * SCRIPT DE TEST DU GÉNÉRATEUR AVANCÉ
 * 
 * Ce script teste le nouveau système de génération basé sur l'analyse
 * complète des 2420+ tirages historiques.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testAdvancedGeneration() {
  console.log("\n" + "=".repeat(100));
  console.log("🚀 TEST DU GÉNÉRATEUR AVANCÉ BASÉ SUR L'ANALYSE HISTORIQUE COMPLÈTE");
  console.log("=".repeat(100) + "\n");

  // Récupérer tous les tirages
  const draws = await prisma.draw.findMany({
    orderBy: { dateISO: "desc" },
  });

  console.log(`📊 ${draws.length} tirages chargés pour l'analyse\n`);

  // Importer les fonctions d'analyse
  const {
    extractHistoricalPatterns,
    calculateNumberWeights,
    generateNumbersFromPatterns,
    validateAgainstPatterns,
  } = require("../lib/advanced-pattern-analysis.ts");

  console.log("━".repeat(100));
  console.log("ÉTAPE 1: EXTRACTION DES PATTERNS HISTORIQUES");
  console.log("━".repeat(100));

  const patterns = extractHistoricalPatterns(draws);

  console.log(`✅ Patterns extraits:`);
  console.log(`   - ${patterns.sumDistribution.size} sommes différentes`);
  console.log(`   - ${patterns.rangeDistribution.size} amplitudes différentes`);
  console.log(`   - ${patterns.evenOddDistribution.size} ratios pair/impair`);
  console.log(`   - ${patterns.numberPairFrequency.size} paires uniques`);
  console.log(`   - ${patterns.numberTripletFrequency.size} triplets uniques`);
  console.log(`   - ${patterns.cyclicNumbers.size} numéros cycliques détectés`);

  console.log(`\n🔥 Numéros chauds (200 derniers tirages):`);
  console.log(`   ${patterns.hotNumbers.join(", ")}`);

  console.log(`\n❄️  Numéros froids (200 derniers tirages):`);
  console.log(`   ${patterns.coldNumbers.join(", ")}\n`);

  console.log("━".repeat(100));
  console.log("ÉTAPE 2: CALCUL DES POIDS POUR CHAQUE NUMÉRO");
  console.log("━".repeat(100));

  const weights = calculateNumberWeights(patterns, draws.slice(0, 200));

  // Afficher les 10 numéros avec les meilleurs poids
  const topWeights = Array.from(weights.values())
    .sort((a, b) => b.finalWeight - a.finalWeight)
    .slice(0, 10);

  console.log(`\n🏆 Top 10 numéros par poids final:\n`);
  topWeights.forEach((w, i) => {
    console.log(
      `   ${(i + 1).toString().padStart(2)}. Numéro ${w.number.toString().padStart(2)} : ${(w.finalWeight * 100).toFixed(1)}%`,
    );
    console.log(
      `       Fréquence: ${(w.frequencyWeight * 100).toFixed(1)}% | Récence: ${(w.recencyWeight * 100).toFixed(1)}% | Cycle: ${(w.cycleWeight * 100).toFixed(1)}% | Paires: ${(w.pairWeight * 100).toFixed(1)}%`,
    );
  });

  console.log("\n━".repeat(100));
  console.log("ÉTAPE 3: GÉNÉRATION DE GRILLES BASÉES SUR LES PATTERNS");
  console.log("━".repeat(100));

  const generatedGrids = [];

  for (let i = 0; i < 10; i++) {
    const nums = generateNumbersFromPatterns(patterns, weights, 5);
    const validation = validateAgainstPatterns(nums, patterns);

    generatedGrids.push({
      nums,
      score: validation.score,
      valid: validation.valid,
      matches: validation.matches.length,
    });
  }

  // Trier par score
  generatedGrids.sort((a, b) => b.score - a.score);

  console.log(`\n✅ ${generatedGrids.length} grilles générées\n`);

  generatedGrids.forEach((grid, i) => {
    const sum = grid.nums.reduce((a, b) => a + b, 0);
    const range = Math.max(...grid.nums) - Math.min(...grid.nums);
    const evenCount = grid.nums.filter((n) => n % 2 === 0).length;

    console.log(`Grille ${(i + 1).toString().padStart(2)}: ${grid.nums.join(" - ")}`);
    console.log(
      `   Score: ${(grid.score * 100).toFixed(1)}% | Somme: ${sum} | Amplitude: ${range} | Pair/Impair: ${evenCount}/${5 - evenCount} | Matches: ${grid.matches}`,
    );
    console.log(
      `   ${grid.valid ? "✅ VALIDE" : "❌ INVALIDE"} selon les patterns historiques\n`,
    );
  });

  console.log("━".repeat(100));
  console.log("ÉTAPE 4: COMPARAISON AVEC GÉNÉRATION ALÉATOIRE");
  console.log("━".repeat(100));

  // Générer 10 grilles aléatoires pour comparaison
  const randomGrids = [];

  for (let i = 0; i < 10; i++) {
    const nums = [];
    while (nums.length < 5) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!nums.includes(num)) {
        nums.push(num);
      }
    }
    nums.sort((a, b) => a - b);

    const validation = validateAgainstPatterns(nums, patterns);
    randomGrids.push({
      nums,
      score: validation.score,
      valid: validation.valid,
    });
  }

  const avgScoreAdvanced =
    generatedGrids.reduce((sum, g) => sum + g.score, 0) /
    generatedGrids.length;
  const avgScoreRandom =
    randomGrids.reduce((sum, g) => sum + g.score, 0) / randomGrids.length;
  const validAdvanced = generatedGrids.filter((g) => g.valid).length;
  const validRandom = randomGrids.filter((g) => g.valid).length;

  console.log(`\n📊 RÉSULTATS DE LA COMPARAISON:\n`);
  console.log(`Génération AVANCÉE (basée sur patterns):`);
  console.log(
    `   Score moyen: ${(avgScoreAdvanced * 100).toFixed(1)}% | Grilles valides: ${validAdvanced}/10 (${(validAdvanced * 10).toFixed(0)}%)`,
  );
  console.log(`\nGénération ALÉATOIRE:`);
  console.log(
    `   Score moyen: ${(avgScoreRandom * 100).toFixed(1)}% | Grilles valides: ${validRandom}/10 (${(validRandom * 10).toFixed(0)}%)`,
  );

  const improvement =
    ((avgScoreAdvanced - avgScoreRandom) / avgScoreRandom) * 100;
  console.log(
    `\n🚀 AMÉLIORATION: ${improvement > 0 ? "+" : ""}${improvement.toFixed(1)}% de score en moyenne`,
  );

  if (improvement > 20) {
    console.log(
      `\n✅ CONCLUSION: Le générateur avancé est SIGNIFICATIVEMENT meilleur!`,
    );
  } else if (improvement > 10) {
    console.log(`\n✅ CONCLUSION: Le générateur avancé est meilleur.`);
  } else {
    console.log(
      `\n⚠️  CONCLUSION: L'amélioration est marginale. Ajuster les poids.`,
    );
  }

  console.log("\n" + "=".repeat(100));
  console.log("ÉTAPE 5: ANALYSE DES CYCLES DÉTECTÉS");
  console.log("=".repeat(100));

  const topCycles = Array.from(patterns.cyclicNumbers.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  if (topCycles.length > 0) {
    console.log(`\n🔄 Top 10 numéros avec cycles détectés:\n`);
    topCycles.forEach((cycle, i) => {
      console.log(
        `   ${(i + 1).toString().padStart(2)}. Numéro ${cycle.number.toString().padStart(2)} : Période de ${cycle.period} tirages (confiance: ${(cycle.confidence * 100).toFixed(1)}%)`,
      );
      console.log(
        `       Dernier vu: il y a ${cycle.lastSeen} tirages | Prochain attendu: dans ${cycle.nextExpected - cycle.lastSeen} tirages`,
      );
    });
  } else {
    console.log(`\n⚠️  Aucun cycle significatif détecté.`);
  }

  console.log("\n" + "=".repeat(100));
  console.log("✅ TEST TERMINÉ");
  console.log("=".repeat(100) + "\n");

  await prisma.$disconnect();
}

testAdvancedGeneration().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
