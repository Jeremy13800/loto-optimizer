/**
 * Export SQLite data to JSON for PostgreSQL import
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const outputPath = path.join(__dirname, '..', 'data-export.json');

if (!fs.existsSync(dbPath)) {
  console.error('❌ SQLite database not found at:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log('📦 Exporting data from SQLite...\n');

db.all('SELECT * FROM Draw ORDER BY dateISO DESC', [], (err, rows) => {
  if (err) {
    console.error('❌ Error reading data:', err);
    process.exit(1);
  }

  console.log(`✅ Found ${rows.length} draws`);
  
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
  console.log(`✅ Data exported to: ${outputPath}`);
  console.log('\n💡 Next step: node scripts/import-to-postgres.js\n');
  
  db.close();
});
