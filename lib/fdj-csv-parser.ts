import { ParsedDraw } from "./types";

/**
 * Parses FDJ official CSV format from data.gouv.fr
 * Semicolon-separated, columns include: date_de_tirage, boule_1..5, numero_chance
 * Date format: DD/MM/YYYY
 */
export function parseFdjCsv(csvText: string): ParsedDraw[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = lines[0].split(";").map((h) => h.trim().toLowerCase());

  const dateIdx = header.findIndex((h) => h.includes("date"));
  const b1 = header.findIndex((h) => h === "boule_1");
  const b2 = header.findIndex((h) => h === "boule_2");
  const b3 = header.findIndex((h) => h === "boule_3");
  const b4 = header.findIndex((h) => h === "boule_4");
  const b5 = header.findIndex((h) => h === "boule_5");
  const chanceIdx = header.findIndex(
    (h) => h.includes("chance") || h.includes("complementaire"),
  );

  if ([dateIdx, b1, b2, b3, b4, b5, chanceIdx].some((i) => i === -1)) {
    throw new Error(
      "Format CSV non reconnu : colonnes attendues date_de_tirage, boule_1..5, numero_chance",
    );
  }

  const draws: ParsedDraw[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(";");
    if (cells.length < Math.max(dateIdx, b1, b2, b3, b4, b5, chanceIdx) + 1)
      continue;

    const rawDate = cells[dateIdx].trim();
    const nums = [b1, b2, b3, b4, b5].map((idx) => parseInt(cells[idx].trim()));
    const chanceNum = parseInt(cells[chanceIdx].trim());

    // Parse DD/MM/YYYY or YYYY-MM-DD
    let dateISO = "";
    const slashMatch = rawDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const isoMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (slashMatch) {
      dateISO = `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
    } else if (isoMatch) {
      dateISO = rawDate;
    } else {
      continue;
    }

    if (
      nums.some((n) => isNaN(n) || n < 1 || n > 49) ||
      new Set(nums).size !== 5 ||
      isNaN(chanceNum) ||
      chanceNum < 1 ||
      chanceNum > 10
    ) {
      continue;
    }

    draws.push({
      dateISO,
      dateLabel: rawDate,
      nums: nums.sort((a, b) => a - b),
      chance: chanceNum,
      rawDateText: rawDate,
    });
  }

  return draws;
}
