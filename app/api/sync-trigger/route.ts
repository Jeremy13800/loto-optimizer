import { NextResponse } from "next/server";

/**
 * Endpoint intermédiaire pour déclencher la synchronisation depuis le frontend
 * Cet endpoint est appelé par le bouton "Synchroniser" de la page d'accueil
 * Il appelle ensuite l'endpoint sécurisé /api/draws/sync avec l'API key
 */
export async function POST() {
  try {
    const apiKey = process.env.SYNC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Configuration error: SYNC_API_KEY not set" },
        { status: 500 }
      );
    }

    // Appeler l'endpoint sécurisé avec l'API key
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/draws/sync`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Sync trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
