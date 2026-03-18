/**
 * Import JSON data to PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data-export.json');

if (!fs.existsSync(dataPath)) {
  console.error('❌ Export file not found. Run: node scripts/export-sqlite-data.js');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Create .env.local with your PostgreSQL URL');
  process.exit(1);
}

const prisma = new PrismaClient();

async function importData() {
  console.log('📦 Importing data to PostgreSQL...\n');

  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`✅ Loaded ${data.length} draws from export file`);

    // Clear existing data
    const existing = await prisma.draw.count();
    if (existing > 0) {
      console.log(`⚠️  Found ${existing} existing draws. Deleting...`);
      await prisma.draw.deleteMany();
    }

    // Import in batches
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      await prisma.draw.createMany({
        data: batch.map(draw => ({
          id: draw.id,
          dateISO: draw.dateISO,
          dateLabel: draw.dateLabel,
          nums: draw.nums,
          chance: draw.chance,
          source: draw.source || 'ReducMiz',
          rawDateText: draw.rawDateText,
          createdAt: new Date(draw.createdAt),
          updatedAt: new Date(draw.updatedAt),
        })),
        skipDuplicates: true,
      });

      imported += batch.length;
      console.log(`   Imported ${imported}/${data.length} draws...`);
    }

    console.log(`\n✅ Successfully imported ${imported} draws to PostgreSQL!`);
    console.log('🎉 Database migration complete!\n');

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
