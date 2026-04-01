/**
 * TEST SIMPLIFIÉ DU GÉNÉRATEUR AVANCÉ
 * 
 * Version JavaScript pure pour tester rapidement le système
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

async function testAdvancedGeneration() {
  console.log("\n" + "=".repeat(100));
  console.log("🚀 TEST DU GÉNÉRATEUR AVANCÉ - VERSION SIMPLIFIÉE");
  console.log("=".repeat(100) + "\n");

  // Récupérer tous les tirages
  const draws = await prisma.draw.findMany({
    orderBy: { dateISO: "desc" },
  });

  console.log(`📊 ${draws.length} tirages chargés\n`);

  console.log("━".repeat(100));
  console.log("ÉTAPE 1: ANALYSE DES PATTERNS HISTORIQUES");
  console.log("━".repeat(100) + "\n");

  // Analyser les fréquences
  const numberFrequency = new Map();
  const pairFrequency = new Map();
  const sumDistribution = new Map();
  const evenOddDistribution = new Map();

  draws.forEach((draw) => {
    const nums = Array.isArray(draw.nums)
      ? draw.nums
      : JSON.parse(draw.nums);
    const sorted = [...nums].sort((a, b) => a - b);

    // Fréquence des numéros
    sorted.forEach((num) => {
      numberFrequency.set(num, (numberFrequency.get(num) || 0) + 1);
    });

    // Fréquence des paires
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const pairKey = `${sorted[i]}-${sorted[j]}`;
        pairFrequency.set(pairKey, (pairFrequency.get(pairKey) || 0) + 1);
      }
    }

    // Distribution des sommes
    const sum = sorted.reduce((a, b) => a + b, 0);
    sumDistribution.set(sum, (sumDistribution.get(sum) || 0) + 1);

    // Distribution pair/impair
    const evenCount = sorted.filter((n) => n % 2 === 0).length;
    const key = `${evenCount}/${5 - evenCount}`;
    evenOddDistribution.set(key, (evenOddDistribution.get(key) || 0) + 1);
  });

  console.log(`✅ Patterns extraits:`);
  console.log(`   - ${numberFrequency.size} numéros différents`);
  console.log(`   - ${pairFrequency.size} paires uniques`);
  console.log(`   - ${sumDistribution.size} sommes différentes`);

  // Top 10 numéros par fréquence
  const topNumbers = Array.from(numberFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`\n🔥 Top 10 numéros les plus fréquents:\n`);
  topNumbers.forEach(([num, count], i) => {
    const pct = ((count / draws.length) * 100).toFixed(1);
    console.log(
      `   ${(i + 1).toString().padStart(2)}. Numéro ${num.toString().padStart(2)} : ${count} fois (${pct}%)`,
    );
  });

  // Numéros chauds (200 derniers tirages)
  const recentDraws = draws.slice(0, 200);
  const recentFrequency = new Map();

  recentDraws.forEach((draw) => {
    const nums = Array.isArray(draw.nums)
      ? draw.nums
      : JSON.parse(draw.nums);
    nums.forEach((num) => {
      recentFrequency.set(num, (recentFrequency.get(num) || 0) + 1);
    });
  });

  const hotNumbers = Array.from(recentFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([num]) => num);

  const coldNumbers = Array.from(recentFrequency.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(([num]) => num);

  console.log(`\n🔥 Numéros CHAUDS (200 derniers tirages):`);
  console.log(`   ${hotNumbers.join(", ")}`);

  console.log(`\n❄️  Numéros FROIDS (200 derniers tirages):`);
  console.log(`   ${coldNumbers.join(", ")}\n`);

  console.log("━".repeat(100));
  console.log("ÉTAPE 2: GÉNÉRATION PONDÉRÉE");
  console.log("━".repeat(100) + "\n");

  // Calculer les poids pour chaque numéro
  const weights = new Map();
  for (let num = 1; num <= 49; num++) {
    const globalFreq = numberFrequency.get(num) || 0;
    const recentFreq = recentFrequency.get(num) || 0;

    const globalWeight = globalFreq / draws.length;
    const recentWeight = recentFreq / 200;

    const finalWeight = globalWeight * 0.5 + recentWeight * 0.5;
    weights.set(num, finalWeight);
  }

  // Générer 10 grilles pondérées
  const generatedGrids = [];

  for (let i = 0; i < 10; i++) {
    const nums = [];

    // Créer un pool pondéré
    const weightedPool = [];
    for (let num = 1; num <= 49; num++) {
      const weight = weights.get(num);
      const copies = Math.max(1, Math.floor(weight * 100));
      for (let j = 0; j < copies; j++) {
        weightedPool.push(num);
      }
    }

    // Sélectionner 5 numéros uniques
    while (nums.length < 5) {
      const randomIndex = Math.floor(Math.random() * weightedPool.length);
      const num = weightedPool[randomIndex];
      if (!nums.includes(num)) {
        nums.push(num);
      }
    }

    nums.sort((a, b) => a - b);

    // Calculer le score
    const sum = nums.reduce((a, b) => a + b, 0);
    const range = nums[4] - nums[0];
    const evenCount = nums.filter((n) => n % 2 === 0).length;
    const evenOddKey = `${evenCount}/${5 - evenCount}`;

    // Score basé sur les patterns historiques
    let score = 0;

    // Score de la somme
    const sumFreq = sumDistribution.get(sum) || 0;
    score += (sumFreq / draws.length) * 30;

    // Score du ratio pair/impair
    const evenOddFreq = evenOddDistribution.get(evenOddKey) || 0;
    score += (evenOddFreq / draws.length) * 30;

    // Score des paires fréquentes
    let pairScore = 0;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const pairKey = `${nums[i]}-${nums[j]}`;
        const pairFreq = pairFrequency.get(pairKey) || 0;
        if (pairFreq > 5) {
          pairScore += pairFreq / draws.length;
        }
      }
    }
    score += pairScore * 40;

    generatedGrids.push({
      nums,
      sum,
      range,
      evenOddKey,
      score: score * 10, // Normaliser sur 100
    });
  }

  // Trier par score
  generatedGrids.sort((a, b) => b.score - a.score);

  console.log(`✅ 10 grilles générées avec pondération\n`);

  generatedGrids.forEach((grid, i) => {
    console.log(
      `Grille ${(i + 1).toString().padStart(2)}: ${grid.nums.join(" - ")}`,
    );
    console.log(
      `   Score: ${grid.score.toFixed(1)} | Somme: ${grid.sum} | Amplitude: ${grid.range} | Pair/Impair: ${grid.evenOddKey}\n`,
    );
  });

  console.log("━".repeat(100));
  console.log("ÉTAPE 3: COMPARAISON AVEC GÉNÉRATION ALÉATOIRE");
  console.log("━".repeat(100) + "\n");

  // Générer 10 grilles aléatoires
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

    const sum = nums.reduce((a, b) => a + b, 0);
    const evenCount = nums.filter((n) => n % 2 === 0).length;
    const evenOddKey = `${evenCount}/${5 - evenCount}`;

    // Calculer le même score
    let score = 0;
    const sumFreq = sumDistribution.get(sum) || 0;
    score += (sumFreq / draws.length) * 30;
    const evenOddFreq = evenOddDistribution.get(evenOddKey) || 0;
    score += (evenOddFreq / draws.length) * 30;

    let pairScore = 0;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const pairKey = `${nums[i]}-${nums[j]}`;
        const pairFreq = pairFrequency.get(pairKey) || 0;
        if (pairFreq > 5) {
          pairScore += pairFreq / draws.length;
        }
      }
    }
    score += pairScore * 40;

    randomGrids.push({ score: score * 10 });
  }

  const avgScoreAdvanced =
    generatedGrids.reduce((sum, g) => sum + g.score, 0) /
    generatedGrids.length;
  const avgScoreRandom =
    randomGrids.reduce((sum, g) => sum + g.score, 0) / randomGrids.length;

  console.log(`📊 RÉSULTATS:\n`);
  console.log(
    `Génération PONDÉRÉE : Score moyen = ${avgScoreAdvanced.toFixed(1)}`,
  );
  console.log(
    `Génération ALÉATOIRE : Score moyen = ${avgScoreRandom.toFixed(1)}`,
  );

  const improvement =
    ((avgScoreAdvanced - avgScoreRandom) / avgScoreRandom) * 100;
  console.log(
    `\n🚀 AMÉLIORATION: ${improvement > 0 ? "+" : ""}${improvement.toFixed(1)}%`,
  );

  if (improvement > 20) {
    console.log(
      `\n✅ CONCLUSION: La génération pondérée est SIGNIFICATIVEMENT meilleure!`,
    );
  } else if (improvement > 10) {
    console.log(`\n✅ CONCLUSION: La génération pondérée est meilleure.`);
  } else if (improvement > 0) {
    console.log(`\n✅ CONCLUSION: Légère amélioration avec la pondération.`);
  } else {
    console.log(`\n⚠️  CONCLUSION: Pas d'amélioration significative.`);
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
