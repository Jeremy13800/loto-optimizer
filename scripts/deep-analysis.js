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

async function analyzeDraws() {
  console.log("\n" + "=".repeat(100));
  console.log("🔍 ANALYSE APPROFONDIE DE TOUS LES TIRAGES DU LOTO");
  console.log("=".repeat(100) + "\n");

  const draws = await prisma.draw.findMany({
    orderBy: { dateISO: "desc" },
  });

  console.log(`📊 Total de tirages analysés: ${draws.length}\n`);

  // Analyse complète de chaque tirage
  const analyses = draws.map((draw) => {
    const nums = (
      typeof draw.nums === "string" ? JSON.parse(draw.nums) : draw.nums
    ).sort((a, b) => a - b);
    const sum = nums.reduce((a, b) => a + b, 0);
    const range = nums[4] - nums[0];
    const evenCount = nums.filter((n) => n % 2 === 0).length;
    const oddCount = 5 - evenCount;
    const lowCount = nums.filter((n) => n <= 24).length;
    const highCount = 5 - lowCount;
    const primeCount = nums.filter(isPrime).length;
    const multiplesOf5 = nums.filter((n) => n % 5 === 0).length;
    const multiplesOf3 = nums.filter((n) => n % 3 === 0).length;
    const consecutivePairs = nums.filter(
      (n, i) => i < 4 && nums[i + 1] === n + 1,
    ).length;

    const endings = nums.map((n) => n % 10);
    const uniqueEndings = new Set(endings).size;

    const decades = [0, 0, 0, 0, 0];
    nums.forEach((n) => {
      if (n <= 10) decades[0]++;
      else if (n <= 20) decades[1]++;
      else if (n <= 30) decades[2]++;
      else if (n <= 40) decades[3]++;
      else decades[4]++;
    });
    const maxPerDecade = Math.max(...decades);
    const decadeSpread = decades.filter((d) => d > 0).length;

    const highNumbers = nums.filter((n) => n >= 31).length;
    const veryHighNumbers = nums.filter((n) => n >= 40).length;

    const gaps = nums.slice(1).map((n, i) => n - nums[i]);
    const minGap = Math.min(...gaps);
    const maxGap = Math.max(...gaps);
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

    // Nouveaux patterns à analyser
    const hasArithmeticProgression = gaps.every(
      (g, i, arr) => i === 0 || g === arr[0],
    );
    const digitSum = nums.reduce(
      (sum, n) => sum + Math.floor(n / 10) + (n % 10),
      0,
    );
    const productMod10 = nums.reduce((prod, n) => (prod * n) % 10, 1);

    // Analyse des écarts avec le tirage précédent
    const prevDraw = draws[draws.indexOf(draw) + 1];
    let overlapWithPrevious = 0;
    let chanceRepeat = false;
    if (prevDraw) {
      const prevNums =
        typeof prevDraw.nums === "string"
          ? JSON.parse(prevDraw.nums)
          : prevDraw.nums;
      overlapWithPrevious = nums.filter((n) => prevNums.includes(n)).length;
      chanceRepeat = draw.chance === prevDraw.chance;
    }

    return {
      nums,
      chance: draw.chance,
      sum,
      range,
      evenCount,
      oddCount,
      lowCount,
      highCount,
      primeCount,
      multiplesOf5,
      multiplesOf3,
      consecutivePairs,
      uniqueEndings,
      maxPerDecade,
      decadeSpread,
      highNumbers,
      veryHighNumbers,
      minGap,
      maxGap,
      avgGap,
      hasArithmeticProgression,
      digitSum,
      productMod10,
      overlapWithPrevious,
      chanceRepeat,
    };
  });

  console.log("━".repeat(100));
  console.log("📈 ANALYSE 1: DISTRIBUTION DES SOMMES");
  console.log("━".repeat(100));
  const sums = analyses.map((a) => a.sum).sort((a, b) => a - b);
  const sumMin = Math.min(...sums);
  const sumMax = Math.max(...sums);
  const sumAvg = sums.reduce((a, b) => a + b, 0) / sums.length;
  const sumMedian = sums[Math.floor(sums.length / 2)];
  const sumP10 = sums[Math.floor(sums.length * 0.1)];
  const sumP90 = sums[Math.floor(sums.length * 0.9)];
  const sumP25 = sums[Math.floor(sums.length * 0.25)];
  const sumP75 = sums[Math.floor(sums.length * 0.75)];

  console.log(
    `Min: ${sumMin} | Max: ${sumMax} | Moyenne: ${sumAvg.toFixed(1)} | Médiane: ${sumMedian}`,
  );
  console.log(
    `P10: ${sumP10} | P25: ${sumP25} | P75: ${sumP75} | P90: ${sumP90}`,
  );
  console.log(
    `✅ RECOMMANDATION: Plage optimale = ${sumP25}-${sumP75} (50% central) ou ${sumP10}-${sumP90} (80% central)\n`,
  );

  console.log("━".repeat(100));
  console.log("⚖️  ANALYSE 2: RATIO PAIR/IMPAIR");
  console.log("━".repeat(100));
  const evenOddDist = {};
  analyses.forEach((a) => {
    const key = `${a.evenCount}/${a.oddCount}`;
    evenOddDist[key] = (evenOddDist[key] || 0) + 1;
  });

  Object.entries(evenOddDist)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ratio, count]) => {
      const pct = ((count / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${ratio.padEnd(5)} : ${count.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const top2EvenOdd = Object.entries(evenOddDist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  const totalTop2 = top2EvenOdd.reduce((sum, [, count]) => sum + count, 0);
  const pctTop2 = ((totalTop2 / analyses.length) * 100).toFixed(1);
  console.log(
    `✅ RECOMMANDATION: ${top2EvenOdd.map(([r]) => r).join(" ou ")} (${pctTop2}% des tirages)\n`,
  );

  console.log("━".repeat(100));
  console.log("🎯 ANALYSE 3: RATIO BAS (1-24) / HAUT (25-49)");
  console.log("━".repeat(100));
  const lowHighDist = {};
  analyses.forEach((a) => {
    const key = `${a.lowCount}/${a.highCount}`;
    lowHighDist[key] = (lowHighDist[key] || 0) + 1;
  });

  Object.entries(lowHighDist)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ratio, count]) => {
      const pct = ((count / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${ratio.padEnd(5)} : ${count.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const top2LowHigh = Object.entries(lowHighDist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  const totalTop2LH = top2LowHigh.reduce((sum, [, count]) => sum + count, 0);
  const pctTop2LH = ((totalTop2LH / analyses.length) * 100).toFixed(1);
  console.log(
    `✅ RECOMMANDATION: ${top2LowHigh.map(([r]) => r).join(" ou ")} (${pctTop2LH}% des tirages)\n`,
  );

  console.log("━".repeat(100));
  console.log("🔢 ANALYSE 4: NOMBRES PREMIERS");
  console.log("━".repeat(100));
  const primeDist = {};
  analyses.forEach((a) => {
    primeDist[a.primeCount] = (primeDist[a.primeCount] || 0) + 1;
  });

  Object.entries(primeDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} premiers : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const avgPrimes =
    analyses.reduce((sum, a) => sum + a.primeCount, 0) / analyses.length;
  const mostCommonPrimes = Object.entries(primeDist).sort(
    (a, b) => b[1] - a[1],
  )[0];
  console.log(
    `Moyenne: ${avgPrimes.toFixed(2)} | Plus fréquent: ${mostCommonPrimes[0]} (${((mostCommonPrimes[1] / analyses.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `✅ RECOMMANDATION: Viser ${mostCommonPrimes[0]} nombres premiers\n`,
  );

  console.log("━".repeat(100));
  console.log("⚠️  ANALYSE 5: MULTIPLES DE 5 (ÉVALUATION CRITIQUE)");
  console.log("━".repeat(100));
  const mult5Dist = {};
  analyses.forEach((a) => {
    mult5Dist[a.multiplesOf5] = (mult5Dist[a.multiplesOf5] || 0) + 1;
  });

  Object.entries(mult5Dist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} mult. de 5 : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const zeroMult5 = mult5Dist[0] || 0;
  const zeroMult5Pct = ((zeroMult5 / analyses.length) * 100).toFixed(1);
  console.log(`\n⚠️  ${zeroMult5Pct}% des tirages n'ont AUCUN multiple de 5`);

  if (parseFloat(zeroMult5Pct) > 30) {
    console.log(
      `❌ CONCLUSION: Ce paramètre est PEU DISCRIMINANT - À SUPPRIMER OU RENDRE OPTIONNEL\n`,
    );
  } else {
    console.log(`✅ CONCLUSION: Ce paramètre est discriminant - À CONSERVER\n`);
  }

  console.log("━".repeat(100));
  console.log("🆕 ANALYSE 6: MULTIPLES DE 3 (NOUVEAU PARAMÈTRE POTENTIEL)");
  console.log("━".repeat(100));
  const mult3Dist = {};
  analyses.forEach((a) => {
    mult3Dist[a.multiplesOf3] = (mult3Dist[a.multiplesOf3] || 0) + 1;
  });

  Object.entries(mult3Dist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} mult. de 3 : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const zeroMult3 = mult3Dist[0] || 0;
  const zeroMult3Pct = ((zeroMult3 / analyses.length) * 100).toFixed(1);
  const mostCommonMult3 = Object.entries(mult3Dist).sort(
    (a, b) => b[1] - a[1],
  )[0];
  console.log(`\n${zeroMult3Pct}% des tirages n'ont AUCUN multiple de 3`);
  console.log(
    `Plus fréquent: ${mostCommonMult3[0]} (${((mostCommonMult3[1] / analyses.length) * 100).toFixed(1)}%)`,
  );

  if (parseFloat(zeroMult3Pct) < 20) {
    console.log(
      `✅ NOUVEAU PARAMÈTRE UTILE: Viser ${mostCommonMult3[0]} multiples de 3\n`,
    );
  } else {
    console.log(`❌ Paramètre peu discriminant - NE PAS AJOUTER\n`);
  }

  console.log("━".repeat(100));
  console.log("🎲 ANALYSE 7: TERMINAISONS UNIQUES");
  console.log("━".repeat(100));
  const endingsDist = {};
  analyses.forEach((a) => {
    endingsDist[a.uniqueEndings] = (endingsDist[a.uniqueEndings] || 0) + 1;
  });

  Object.entries(endingsDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} terminaisons : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const avgEndings =
    analyses.reduce((sum, a) => sum + a.uniqueEndings, 0) / analyses.length;
  const mostCommonEndings = Object.entries(endingsDist).sort(
    (a, b) => b[1] - a[1],
  )[0];
  console.log(
    `Moyenne: ${avgEndings.toFixed(2)} | Plus fréquent: ${mostCommonEndings[0]} (${((mostCommonEndings[1] / analyses.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `✅ RECOMMANDATION: Minimum ${mostCommonEndings[0]} terminaisons uniques\n`,
  );

  console.log("━".repeat(100));
  console.log("📊 ANALYSE 8: RÉPARTITION PAR DIZAINE");
  console.log("━".repeat(100));
  const decadeDist = {};
  analyses.forEach((a) => {
    decadeDist[a.maxPerDecade] = (decadeDist[a.maxPerDecade] || 0) + 1;
  });

  Object.entries(decadeDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `Max ${count}/dizaine : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const mostCommonMaxDecade = Object.entries(decadeDist).sort(
    (a, b) => b[1] - a[1],
  )[0];
  console.log(
    `✅ RECOMMANDATION: Maximum ${mostCommonMaxDecade[0]} numéros par dizaine\n`,
  );

  console.log("━".repeat(100));
  console.log(
    "🆕 ANALYSE 9: NOMBRE DE DIZAINES DIFFÉRENTES (NOUVEAU PARAMÈTRE)",
  );
  console.log("━".repeat(100));
  const decadeSpreadDist = {};
  analyses.forEach((a) => {
    decadeSpreadDist[a.decadeSpread] =
      (decadeSpreadDist[a.decadeSpread] || 0) + 1;
  });

  Object.entries(decadeSpreadDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} dizaines : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const mostCommonSpread = Object.entries(decadeSpreadDist).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const spreadPct = ((mostCommonSpread[1] / analyses.length) * 100).toFixed(1);
  if (parseFloat(spreadPct) > 40) {
    console.log(
      `✅ NOUVEAU PARAMÈTRE UTILE: Viser ${mostCommonSpread[0]} dizaines différentes (${spreadPct}%)\n`,
    );
  } else {
    console.log(`❌ Paramètre peu discriminant - NE PAS AJOUTER\n`);
  }

  console.log("━".repeat(100));
  console.log("🔝 ANALYSE 10: NUMÉROS HAUTS (≥31)");
  console.log("━".repeat(100));
  const highNumDist = {};
  analyses.forEach((a) => {
    highNumDist[a.highNumbers] = (highNumDist[a.highNumbers] || 0) + 1;
  });

  Object.entries(highNumDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} numéros ≥31 : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const avgHighNum =
    analyses.reduce((sum, a) => sum + a.highNumbers, 0) / analyses.length;
  const mostCommonHighNum = Object.entries(highNumDist).sort(
    (a, b) => b[1] - a[1],
  )[0];
  console.log(
    `Moyenne: ${avgHighNum.toFixed(2)} | Plus fréquent: ${mostCommonHighNum[0]} (${((mostCommonHighNum[1] / analyses.length) * 100).toFixed(1)}%)`,
  );
  console.log(`✅ RECOMMANDATION: Viser ${mostCommonHighNum[0]} numéros ≥31\n`);

  console.log("━".repeat(100));
  console.log("🆕 ANALYSE 11: NUMÉROS TRÈS HAUTS (≥40) - NOUVEAU PARAMÈTRE");
  console.log("━".repeat(100));
  const veryHighDist = {};
  analyses.forEach((a) => {
    veryHighDist[a.veryHighNumbers] =
      (veryHighDist[a.veryHighNumbers] || 0) + 1;
  });

  Object.entries(veryHighDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} numéros ≥40 : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const mostCommonVeryHigh = Object.entries(veryHighDist).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const veryHighPct = ((mostCommonVeryHigh[1] / analyses.length) * 100).toFixed(
    1,
  );
  if (parseFloat(veryHighPct) > 30) {
    console.log(
      `✅ NOUVEAU PARAMÈTRE UTILE: Viser ${mostCommonVeryHigh[0]} numéros ≥40 (${veryHighPct}%)\n`,
    );
  } else {
    console.log(`❌ Paramètre peu discriminant - NE PAS AJOUTER\n`);
  }

  console.log("━".repeat(100));
  console.log("🔗 ANALYSE 12: NUMÉROS CONSÉCUTIFS");
  console.log("━".repeat(100));
  const consecutiveDist = {};
  analyses.forEach((a) => {
    consecutiveDist[a.consecutivePairs] =
      (consecutiveDist[a.consecutivePairs] || 0) + 1;
  });

  Object.entries(consecutiveDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / analyses.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} paire(s) : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const withConsecutive = analyses.filter((a) => a.consecutivePairs > 0).length;
  const pctWithConsecutive = (
    (withConsecutive / analyses.length) *
    100
  ).toFixed(1);
  console.log(
    `${pctWithConsecutive}% des tirages ont au moins une paire consécutive`,
  );
  console.log(`✅ RECOMMANDATION: Autoriser 0-1 paire consécutive\n`);

  console.log("━".repeat(100));
  console.log("🆕 ANALYSE 13: OVERLAP AVEC TIRAGE PRÉCÉDENT");
  console.log("━".repeat(100));
  const overlapDist = {};
  analyses.forEach((a) => {
    if (a.overlapWithPrevious !== undefined) {
      overlapDist[a.overlapWithPrevious] =
        (overlapDist[a.overlapWithPrevious] || 0) + 1;
    }
  });

  Object.entries(overlapDist)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, freq]) => {
      const pct = ((freq / (analyses.length - 1)) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(pct / 2));
      console.log(
        `${count} numéros communs : ${freq.toString().padStart(5)} fois (${pct.padStart(5)}%) ${bar}`,
      );
    });

  const avgOverlap =
    analyses.reduce((sum, a) => sum + (a.overlapWithPrevious || 0), 0) /
    (analyses.length - 1);
  console.log(`Moyenne d'overlap: ${avgOverlap.toFixed(2)} numéros`);
  console.log(
    `✅ OBSERVATION: En moyenne ${avgOverlap.toFixed(0)} numéros se répètent entre deux tirages consécutifs\n`,
  );

  console.log("━".repeat(100));
  console.log("🆕 ANALYSE 14: RÉPÉTITION DU NUMÉRO CHANCE");
  console.log("━".repeat(100));
  const chanceRepeats = analyses.filter((a) => a.chanceRepeat).length;
  const chanceRepeatPct = (
    (chanceRepeats / (analyses.length - 1)) *
    100
  ).toFixed(1);
  console.log(
    `Répétitions du numéro chance: ${chanceRepeats} fois (${chanceRepeatPct}%)`,
  );

  if (parseFloat(chanceRepeatPct) < 15) {
    console.log(
      `✅ RECOMMANDATION: Exclure le numéro chance précédent est pertinent\n`,
    );
  } else {
    console.log(`❌ La répétition est fréquente - Paramètre peu utile\n`);
  }

  console.log("\n" + "=".repeat(100));
  console.log("🎯 RÉSUMÉ FINAL ET RECOMMANDATIONS");
  console.log("=".repeat(100) + "\n");

  console.log("✅ PARAMÈTRES À CONSERVER:");
  console.log(
    `   1. Somme: ${sumP25}-${sumP75} (50% central) ou ${sumP10}-${sumP90} (80% central)`,
  );
  console.log(
    `   2. Ratio Pair/Impair: ${top2EvenOdd.map(([r]) => r).join(" ou ")} (${pctTop2}%)`,
  );
  console.log(
    `   3. Ratio Bas/Haut: ${top2LowHigh.map(([r]) => r).join(" ou ")} (${pctTop2LH}%)`,
  );
  console.log(
    `   4. Nombres Premiers: ${mostCommonPrimes[0]} (${((mostCommonPrimes[1] / analyses.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `   5. Terminaisons Uniques: Min ${mostCommonEndings[0]} (${((mostCommonEndings[1] / analyses.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `   6. Max par Dizaine: ${mostCommonMaxDecade[0]} (${((mostCommonMaxDecade[1] / analyses.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `   7. Numéros ≥31: ${mostCommonHighNum[0]} (${((mostCommonHighNum[1] / analyses.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `   8. Consécutifs: 0-1 paire (${pctWithConsecutive}% en ont au moins 1)`,
  );

  console.log("\n❌ PARAMÈTRES À SUPPRIMER:");
  if (parseFloat(zeroMult5Pct) > 30) {
    console.log(
      `   - Multiples de 5: ${zeroMult5Pct}% n'en ont AUCUN - PEU DISCRIMINANT`,
    );
  }

  console.log("\n🆕 NOUVEAUX PARAMÈTRES POTENTIELS:");
  if (parseFloat(zeroMult3Pct) < 20) {
    console.log(
      `   ✅ Multiples de 3: Viser ${mostCommonMult3[0]} (${((mostCommonMult3[1] / analyses.length) * 100).toFixed(1)}%)`,
    );
  }
  if (parseFloat(spreadPct) > 40) {
    console.log(
      `   ✅ Nombre de dizaines différentes: ${mostCommonSpread[0]} (${spreadPct}%)`,
    );
  }
  if (parseFloat(veryHighPct) > 30) {
    console.log(
      `   ✅ Numéros ≥40: ${mostCommonVeryHigh[0]} (${veryHighPct}%)`,
    );
  }
  console.log(
    `   ℹ️  Overlap moyen avec tirage précédent: ${avgOverlap.toFixed(1)} numéros`,
  );
  console.log(`   ℹ️  Répétition numéro chance: ${chanceRepeatPct}%`);

  console.log("\n" + "=".repeat(100));
  console.log("✅ ANALYSE TERMINÉE");
  console.log("=".repeat(100) + "\n");

  await prisma.$disconnect();
}

analyzeDraws().catch(console.error);
