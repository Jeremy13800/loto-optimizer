import { calculateStats } from "../lib/stats";
import { Draw } from "../lib/types";

function makeDraw(
  dateISO: string,
  nums: number[],
  chance: number,
): Draw {
  return {
    id: `${dateISO}_${nums.join("-")}_${chance}`,
    dateISO,
    dateLabel: dateISO,
    nums,
    chance,
    source: "test",
  };
}

const SAMPLE_DRAWS: Draw[] = [
  makeDraw("2024-01-01", [1, 10, 20, 30, 40], 5),
  makeDraw("2024-01-03", [2, 11, 21, 31, 41], 3),
  makeDraw("2024-01-06", [3, 12, 22, 32, 42], 7),
  makeDraw("2024-01-08", [1, 15, 25, 35, 45], 2),
  makeDraw("2024-01-10", [5, 10, 20, 35, 49], 1),
];

describe("calculateStats", () => {
  it("returns correct totalDraws", () => {
    const stats = calculateStats(SAMPLE_DRAWS);
    expect(stats.totalDraws).toBe(5);
  });

  it("number 1 appears in 2 draws", () => {
    const stats = calculateStats(SAMPLE_DRAWS);
    const freq = stats.numberFrequencies.find((f) => f.number === 1);
    expect(freq?.count).toBe(2);
  });

  it("chance frequencies sum to totalDraws", () => {
    const stats = calculateStats(SAMPLE_DRAWS);
    const total = stats.chanceFrequencies.reduce((s, f) => s + f.count, 0);
    expect(total).toBe(stats.totalDraws);
  });

  it("sum percentiles are ordered p10 <= p90", () => {
    const stats = calculateStats(SAMPLE_DRAWS);
    expect(stats.sumPercentiles.p10).toBeLessThanOrEqual(stats.sumPercentiles.p90);
  });

  it("currentGaps has 49 entries", () => {
    const stats = calculateStats(SAMPLE_DRAWS);
    expect(stats.currentGaps.length).toBe(49);
  });

  it("numberFrequencies covers all 49 numbers", () => {
    const stats = calculateStats(SAMPLE_DRAWS);
    expect(stats.numberFrequencies.length).toBe(49);
    const nums = stats.numberFrequencies.map((f) => f.number).sort((a, b) => a - b);
    expect(nums[0]).toBe(1);
    expect(nums[48]).toBe(49);
  });

  it("returns empty stats gracefully for zero draws", () => {
    const stats = calculateStats([]);
    expect(stats.totalDraws).toBe(0);
    expect(stats.numberFrequencies.every((f) => f.count === 0)).toBe(true);
  });
});
