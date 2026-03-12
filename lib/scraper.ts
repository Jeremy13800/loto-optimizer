import * as cheerio from "cheerio";
import { ParsedDraw } from "./types";

const FRENCH_MONTHS: Record<string, string> = {
  janvier: "01",
  février: "02",
  mars: "03",
  avril: "04",
  mai: "05",
  juin: "06",
  juillet: "07",
  août: "08",
  septembre: "09",
  octobre: "10",
  novembre: "11",
  décembre: "12",
};

const FRENCH_DAYS: Record<string, string> = {
  lundi: "lundi",
  mardi: "mardi",
  mercredi: "mercredi",
  jeudi: "jeudi",
  vendredi: "vendredi",
  samedi: "samedi",
  dimanche: "dimanche",
};

export async function fetchDrawsHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout after 30s");
    }
    throw error;
  }
}

function parseDate(
  dateText: string,
): { dateISO: string; dateLabel: string } | null {
  const cleaned = dateText.trim().toLowerCase();

  // Pattern: "mercredi 25/02/2026" or "25/02/2026"
  const slashPattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const slashMatch = cleaned.match(slashPattern);
  if (slashMatch) {
    const [_, day, month, year] = slashMatch;
    const dateISO = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    return { dateISO, dateLabel: dateText.trim() };
  }

  // Pattern: "mercredi 25 février 2026"
  const frenchPattern = /(\w+)\s+(\d{1,2})\s+(\w+)\s+(\d{4})/;
  const frenchMatch = cleaned.match(frenchPattern);
  if (frenchMatch) {
    const [_, dayName, day, monthName, year] = frenchMatch;
    const month = FRENCH_MONTHS[monthName];
    if (month) {
      const dateISO = `${year}-${month}-${day.padStart(2, "0")}`;
      return { dateISO, dateLabel: dateText.trim() };
    }
  }

  // Pattern: "25 février 2026"
  const simplePattern = /(\d{1,2})\s+(\w+)\s+(\d{4})/;
  const simpleMatch = cleaned.match(simplePattern);
  if (simpleMatch) {
    const [_, day, monthName, year] = simpleMatch;
    const month = FRENCH_MONTHS[monthName];
    if (month) {
      const dateISO = `${year}-${month}-${day.padStart(2, "0")}`;
      return { dateISO, dateLabel: dateText.trim() };
    }
  }

  return null;
}

function extractNumbers(text: string): number[] {
  const numbers: number[] = [];
  const matches = text.match(/\b\d{1,2}\b/g);

  if (matches) {
    for (const match of matches) {
      const num = parseInt(match, 10);
      if (num >= 1 && num <= 49 && !numbers.includes(num)) {
        numbers.push(num);
      }
    }
  }

  return numbers;
}

export function parseDrawsFromHTML(html: string): ParsedDraw[] {
  const $ = cheerio.load(html);
  const draws: ParsedDraw[] = [];

  $("table.table").each((_, table) => {
    let dateText = "";
    let nums: number[] = [];
    let chance: number | null = null;

    $(table)
      .find("tr")
      .each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 2) return;

        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();

        if (label.includes("date du tirage")) {
          dateText = value;
        } else if (label === "tirage") {
          nums = extractNumbers(value);
        } else if (label.includes("numéro chance")) {
          const chanceNums = extractNumbers(value);
          if (
            chanceNums.length > 0 &&
            chanceNums[0] >= 1 &&
            chanceNums[0] <= 10
          ) {
            chance = chanceNums[0];
          }
        }
      });

    if (dateText && nums.length === 5 && chance !== null) {
      const dateMatch = parseDate(dateText);
      if (dateMatch) {
        draws.push({
          dateISO: dateMatch.dateISO,
          dateLabel: dateMatch.dateLabel,
          nums: nums.sort((a, b) => a - b),
          chance: chance,
          rawDateText: dateText,
        });
      }
    }
  });

  return draws;
}

export function validateDraw(draw: ParsedDraw): boolean {
  if (!draw.dateISO || !draw.dateLabel) return false;

  if (!Array.isArray(draw.nums) || draw.nums.length !== 5) return false;

  const uniqueNums = new Set(draw.nums);
  if (uniqueNums.size !== 5) return false;

  for (const num of draw.nums) {
    if (!Number.isInteger(num) || num < 1 || num > 49) return false;
  }

  if (!Number.isInteger(draw.chance) || draw.chance < 1 || draw.chance > 10)
    return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(draw.dateISO)) return false;

  return true;
}

export function generateDrawId(draw: ParsedDraw): string {
  const sortedNums = [...draw.nums].sort((a, b) => a - b).join("-");
  return `${draw.dateISO}_${sortedNums}_${draw.chance}`;
}
