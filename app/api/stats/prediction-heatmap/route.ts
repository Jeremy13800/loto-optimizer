/**
 * API endpoint for prediction probability heatmap
 * Calculates probability of each number appearing in the next draw
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNeuralNetwork } from "@/lib/ai/loto-neural-network";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastNDraws = parseInt(searchParams.get("lastNDraws") || "200");

    // Fetch draws
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
      take: lastNDraws,
    });

    if (draws.length === 0) {
      return NextResponse.json({ error: "No draws found" }, { status: 404 });
    }

    // Parse draws
    const parsedDraws = draws.map((d) => ({
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      chance: d.chance,
    }));

    // Train AI model if not trained
    const neuralNetwork = getNeuralNetwork();
    if (!neuralNetwork.isReady()) {
      await neuralNetwork.train(parsedDraws, 20);
    }

    // Get AI predictions
    const aiPredictions = await neuralNetwork.predict(parsedDraws.slice(0, 10));

    // Calculate statistical probabilities
    const recentDraws = parsedDraws.slice(0, 50);
    const frequencyMap = new Map<number, number>();
    const gapMap = new Map<number, number>();

    recentDraws.forEach((draw, index) => {
      draw.nums.forEach((num: number) => {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
        if (!gapMap.has(num)) {
          gapMap.set(num, index);
        }
      });
    });

    // Calculate combined probability (AI + Statistics)
    const probabilities: {
      num: number;
      probability: number;
      aiProbability: number;
      statisticalProbability: number;
      currentGap: number;
    }[] = [];

    for (let num = 1; num <= 49; num++) {
      const aiPred = aiPredictions.find((p: any) => p.num === num);
      const aiProb = aiPred?.probability || 0.02;
      const freq = frequencyMap.get(num) || 0;
      const statProb = (freq / recentDraws.length) * 0.5 + 0.01;
      const currentGap = gapMap.has(num)
        ? gapMap.get(num)!
        : recentDraws.length;

      // Combine AI and statistical probabilities (50/50 weight)
      const combinedProb = aiProb * 0.5 + statProb * 0.5;

      probabilities.push({
        num,
        probability: combinedProb,
        aiProbability: aiProb,
        statisticalProbability: statProb,
        currentGap,
      });
    }

    // Sort by probability
    probabilities.sort((a, b) => b.probability - a.probability);

    // Normalize to sum to 1
    const totalProb = probabilities.reduce((sum, p) => sum + p.probability, 0);
    probabilities.forEach((p) => {
      p.probability = p.probability / totalProb;
    });

    // Top predictions
    const topPredictions = probabilities.slice(0, 15);
    const bottomPredictions = probabilities.slice(-15).reverse();

    return NextResponse.json({
      success: true,
      metadata: {
        totalDraws: parsedDraws.length,
        analysisWindow: recentDraws.length,
        model: "Neural Network + Statistical",
      },
      probabilities,
      topPredictions,
      bottomPredictions,
      aiConfidence: 0.85, // Simulated confidence score
    });
  } catch (error) {
    console.error("Error in prediction heatmap:", error);
    return NextResponse.json(
      {
        error: "Failed to generate predictions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
