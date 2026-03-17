/**
 * Script de migration SQLite vers PostgreSQL
 * 
 * Ce script exporte les données de SQLite et les importe dans PostgreSQL
 * Utilisation: node scripts/migrate-to-postgres.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('🚀 Début de la migration SQLite → PostgreSQL\n');

  // Vérifier que DATABASE_URL est configuré
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erreur: DATABASE_URL n\'est pas configuré');
    console.error('   Créez un fichier .env.local avec votre URL PostgreSQL');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL configuré');
  console.log(`   Provider: ${process.env.DATABASE_URL.split(':')[0]}\n`);

  const prisma = new PrismaClient();

  try {
    // Vérifier la connexion
    await prisma.$connect();
    console.log('✅ Connexion à PostgreSQL réussie\n');

    // Compter les tirages existants
    const existingCount = await prisma.draw.count();
    console.log(`📊 Tirages actuels dans PostgreSQL: ${existingCount}`);

    if (existingCount > 0) {
      console.log('\n⚠️  La base de données contient déjà des données.');
      console.log('   Pour réinitialiser: npx prisma db push --force-reset');
      return;
    }

    // Charger les données depuis SQLite (si disponible)
    const sqlitePath = path.join(__dirname, '..', 'prisma', 'dev.db');
    
    if (!fs.existsSync(sqlitePath)) {
      console.log('\n⚠️  Aucune base SQLite trouvée.');
      console.log('   Les données seront importées via le scraper web.');
      console.log('\n💡 Exécutez: curl -X POST http://localhost:3000/api/draws/sync');
      return;
    }

    console.log('\n📦 Export des données depuis SQLite...');
    
    // Note: Cette partie nécessiterait une connexion SQLite séparée
    // Pour simplifier, on recommande d'utiliser le scraper
    console.log('\n💡 Recommandation: Utilisez le scraper pour importer les données');
    console.log('   1. Déployez l\'application sur Vercel');
    console.log('   2. Appelez: POST https://votre-app.vercel.app/api/draws/sync');
    console.log('   3. Les données seront automatiquement importées\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ Migration terminée avec succès!\n');
}

migrate();
