import { validateDraw, generateDrawId } from "../lib/scraper";
import { ParsedDraw } from "../lib/types";

const validDraw: ParsedDraw = {
  dateISO: "2024-03-15",
  dateLabel: "vendredi 15 mars 2024",
  nums: [5, 12, 23, 34, 45],
  chance: 7,
  rawDateText: "vendredi 15 mars 2024",
};

describe("validateDraw", () => {
  it("accepts a valid draw", () => {
    expect(validateDraw(validDraw)).toBe(true);
  });

  it("rejects wrong number count", () => {
    expect(validateDraw({ ...validDraw, nums: [1, 2, 3] })).toBe(false);
  });

  it("rejects duplicate numbers", () => {
    expect(validateDraw({ ...validDraw, nums: [5, 5, 23, 34, 45] })).toBe(false);
  });

  it("rejects number out of range", () => {
    expect(validateDraw({ ...validDraw, nums: [0, 12, 23, 34, 45] })).toBe(false);
    expect(validateDraw({ ...validDraw, nums: [5, 12, 23, 34, 50] })).toBe(false);
  });

  it("rejects invalid chance (0 or 11)", () => {
    expect(validateDraw({ ...validDraw, chance: 0 })).toBe(false);
    expect(validateDraw({ ...validDraw, chance: 11 })).toBe(false);
  });

  it("rejects malformed date", () => {
    expect(validateDraw({ ...validDraw, dateISO: "2024/03/15" })).toBe(false);
    expect(validateDraw({ ...validDraw, dateISO: "" })).toBe(false);
  });
});

describe("generateDrawId", () => {
  it("produces a deterministic id", () => {
    const id1 = generateDrawId(validDraw);
    const id2 = generateDrawId(validDraw);
    expect(id1).toBe(id2);
  });

  it("includes date, sorted nums, and chance", () => {
    const id = generateDrawId(validDraw);
    expect(id).toContain("2024-03-15");
    expect(id).toContain("7");
  });

  it("sorts nums before generating id", () => {
    const shuffled = { ...validDraw, nums: [45, 5, 34, 12, 23] };
    expect(generateDrawId(shuffled)).toBe(generateDrawId(validDraw));
  });
});
