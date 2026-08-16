import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFdjCsv } from "@/lib/fdj-csv-parser";
import { validateDraw, generateDrawId } from "@/lib/scraper";
import { invalidateCache } from "@/lib/stats-cache";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let csvText = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "Fichier CSV manquant" }, { status: 400 });
      }
      csvText = await (file as File).text();
    } else {
      const body = await request.json().catch(() => null);
      if (body?.csv) {
        csvText = body.csv;
      } else {
        return NextResponse.json(
          { error: "Envoyez un fichier CSV (multipart) ou { csv: '...' } en JSON" },
          { status: 400 },
        );
      }
    }

    const parsed = parseFdjCsv(csvText);
    const valid = parsed.filter(validateDraw);

    if (valid.length === 0) {
      return NextResponse.json(
        { error: "Aucun tirage valide trouvé dans le CSV", parsed: parsed.length },
        { status: 422 },
      );
    }

    const existingIds = new Set(
      (await prisma.draw.findMany({ select: { id: true } })).map((d) => d.id),
    );

    const toInsert = valid
      .filter((d) => !existingIds.has(generateDrawId(d)))
      .map((d) => ({
        id: generateDrawId(d),
        dateISO: d.dateISO,
        dateLabel: d.dateLabel,
        nums: JSON.stringify(d.nums),
        chance: d.chance,
        source: "FDJ-CSV",
        rawDateText: d.rawDateText ?? null,
      }));

    let inserted = 0;
    const batchSize = 100;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      await prisma.draw.createMany({
        data: toInsert.slice(i, i + batchSize),
        skipDuplicates: true,
      });
      inserted += Math.min(batchSize, toInsert.length - i);
    }

    await invalidateCache("stats:");

    const latest = await prisma.draw.findFirst({ orderBy: { dateISO: "desc" } });

    return NextResponse.json({
      parsed: parsed.length,
      valid: valid.length,
      inserted,
      skipped: valid.length - inserted,
      lastDate: latest?.dateISO ?? null,
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Échec de l'import", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
