import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchDrawsHTML,
  parseDrawsFromHTML,
  validateDraw,
  generateDrawId,
} from "@/lib/scraper";
import { SyncResult } from "@/lib/types";

const CACHE_DURATION = 6 * 60 * 60 * 1000;
let lastSync: { timestamp: number; etag: string } | null = null;

export async function POST(request: NextRequest) {
  try {
    const now = Date.now();

    if (lastSync && now - lastSync.timestamp < CACHE_DURATION) {
      return NextResponse.json(
        {
          error: "Sync too recent. Please wait before syncing again.",
          nextSync: new Date(lastSync.timestamp + CACHE_DURATION),
        },
        { status: 429 },
      );
    }

    const url = "https://www.reducmiz.com/resultat_fdj.php?jeu=loto&nb=3000";

    console.log("Fetching draws from ReducMiz...");
    const html = await fetchDrawsHTML(url);

    console.log("Parsing HTML...");
    const parsedDraws = parseDrawsFromHTML(html);

    console.log(`Parsed ${parsedDraws.length} draws`);

    const validDraws = parsedDraws.filter(validateDraw);
    console.log(`Valid draws: ${validDraws.length}`);

    if (validDraws.length === 0) {
      return NextResponse.json(
        {
          error: "No valid draws found in source",
          parsedCount: parsedDraws.length,
        },
        { status: 500 },
      );
    }

    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const draw of validDraws) {
      try {
        const id = generateDrawId(draw);

        const existing = await prisma.draw.findUnique({ where: { id } });

        const data = {
          id,
          dateISO: draw.dateISO,
          dateLabel: draw.dateLabel,
          nums: JSON.stringify(draw.nums),
          chance: draw.chance,
          source: "ReducMiz",
          rawDateText: draw.rawDateText || null,
        };

        if (existing) {
          await prisma.draw.update({
            where: { id },
            data,
          });
          updated++;
        } else {
          await prisma.draw.create({ data });
          inserted++;
        }
      } catch (error) {
        errors.push(
          `Error processing draw ${draw.dateISO}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    const latestDraw = await prisma.draw.findFirst({
      orderBy: { dateISO: "desc" },
    });

    const etag = `${validDraws.length}-${latestDraw?.dateISO || "none"}`;
    lastSync = { timestamp: now, etag };

    const result: SyncResult = {
      count: validDraws.length,
      inserted,
      updated,
      lastDate: latestDraw?.dateISO || null,
      errors: errors.slice(0, 10),
    };

    console.log("Sync complete:", result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=21600",
        ETag: etag,
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync draws",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
