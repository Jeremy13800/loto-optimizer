/**
 * Script pour synchroniser les données en production
 * Usage: node scripts/sync-production.js
 */

const VERCEL_URL = process.env.VERCEL_URL || 'https://loto-optimizer.vercel.app';
const API_KEY = process.env.SYNC_API_KEY;

async function syncProduction() {
  console.log('🚀 Synchronisation des données en production...\n');

  if (!API_KEY) {
    console.error('❌ Erreur: SYNC_API_KEY non défini');
    console.error('   Créez un fichier .env.local avec:');
    console.error('   SYNC_API_KEY=votre_token_secret\n');
    process.exit(1);
  }

  try {
    console.log(`📡 Appel de ${VERCEL_URL}/api/draws/sync`);
    console.log(`🔐 Utilisation de l'API key: ${API_KEY.substring(0, 8)}...`);
    console.log('⏳ Scraping en cours (cela peut prendre 2-5 minutes)...\n');

    const response = await fetch(`${VERCEL_URL}/api/draws/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur lors de la synchronisation:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Message: ${data.error || 'Unknown error'}\n`);
      process.exit(1);
    }

    console.log('✅ Synchronisation réussie!\n');
    console.log('📊 Résultats:');
    console.log(`   - Tirages récupérés: ${data.fetched || 0}`);
    console.log(`   - Nouveaux tirages: ${data.inserted || 0}`);
    console.log(`   - Tirages mis à jour: ${data.updated || 0}`);
    console.log(`   - Total en base: ${data.total || 0}`);
    console.log(`   - Durée: ${data.duration || 'N/A'}\n`);

    console.log('🎉 Vos données sont maintenant à jour en production!');
    console.log(`🌐 Vérifiez: ${VERCEL_URL}/results\n`);

  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
    process.exit(1);
  }
}

syncProduction();
