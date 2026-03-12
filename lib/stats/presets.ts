/**
 * Intelligent grid generation presets
 * Pre-configured combinations of parameters for different strategies
 */

import { AdvancedConstraints, GridPreset } from './advanced-types';
import { DEFAULT_ANTI_HUMAN_BIAS } from './anti-human-bias';
import { DEFAULT_RECENCY_WEIGHTING } from './recency';

/**
 * Get preset configuration by name
 */
export function getPresetConfig(preset: GridPreset): Partial<AdvancedConstraints> {
  switch (preset) {
    case 'balanced':
      return getBalancedPreset();
    
    case 'dispersed':
      return getDispersedPreset();
    
    case 'anti-share':
      return getAntiSharePreset();
    
    case 'hot-cold-mix':
      return getHotColdMixPreset();
    
    case 'conservative':
      return getConservativePreset();
    
    case 'experimental':
      return getExperimentalPreset();
    
    case 'custom':
    default:
      return {};
  }
}

/**
 * PRESET: Équilibré
 * Configuration optimale basée sur l'analyse statistique
 */
function getBalancedPreset(): Partial<AdvancedConstraints> {
  return {
    // Dispersion naturelle
    dispersion: {
      profile: 'balanced',
      avgGapMin: 8,
      avgGapMax: 14
    },
    
    // Centre de gravité équilibré
    centerOfGravity: {
      min: 22,
      max: 28
    },
    
    // Répétition naturelle avec tirage précédent
    repetition: {
      minRepetitions: 0,
      maxRepetitions: 1,
      favorExactlyOne: false
    },
    
    // Profil de dizaines courant
    decadeDistribution: {
      preferredProfile: '2-1-1-1',
      bonusWeight: 5
    },
    
    // Paires fréquentes avec bonus modéré
    frequentPairs: {
      enabled: true,
      bonusWeight: 3,
      maxPairsPerGrid: 2,
      topN: 50
    },
    
    // Pondération temporelle légère
    recencyWeighting: {
      mode: 'light'
    },
    
    // Anti-biais désactivé (pour rester naturel)
    antiHumanBias: {
      enabled: false
    }
  };
}

/**
 * PRESET: Dispersé
 * Grilles avec espacement maximal
 */
function getDispersedPreset(): Partial<AdvancedConstraints> {
  return {
    // Dispersion maximale
    dispersion: {
      profile: 'dispersed',
      avgGapMin: 12,
      avgGapMax: 20,
      varianceMin: 40
    },
    
    // Centre de gravité libre
    centerOfGravity: {
      min: 20,
      max: 30
    },
    
    // Pas de répétition avec tirage précédent
    repetition: {
      minRepetitions: 0,
      maxRepetitions: 0
    },
    
    // Maximum de dizaines différentes
    decadeDistribution: {
      preferredProfile: '1-1-1-1-1',
      bonusWeight: 8
    },
    
    // Paires fréquentes désactivées
    frequentPairs: {
      enabled: false
    },
    
    // Pondération uniforme
    recencyWeighting: {
      mode: 'uniform'
    }
  };
}

/**
 * PRESET: Anti-partage
 * Minimise le risque de partager un jackpot
 */
function getAntiSharePreset(): Partial<AdvancedConstraints> {
  return {
    // Dispersion naturelle à élevée
    dispersion: {
      profile: 'balanced',
      avgGapMin: 10,
      avgGapMax: 16
    },
    
    // Centre de gravité décalé vers le haut
    centerOfGravity: {
      min: 26,
      max: 32
    },
    
    // Pas de répétition
    repetition: {
      minRepetitions: 0,
      maxRepetitions: 0
    },
    
    // Profils moins courants
    decadeDistribution: {
      preferredProfile: '3-1-1',
      bonusWeight: 3
    },
    
    // Pas de paires fréquentes
    frequentPairs: {
      enabled: false
    },
    
    // Anti-biais humain activé au maximum
    antiHumanBias: {
      ...DEFAULT_ANTI_HUMAN_BIAS,
      enabled: true,
      penaltyWeight: 1.5
    },
    
    // Signature modulaire pour éviter patterns
    modularSignature: {
      enabled: true,
      bonusWeight: 3
    }
  };
}

/**
 * PRESET: Mix Chaud/Froid
 * Équilibre entre numéros chauds et froids
 */
function getHotColdMixPreset(): Partial<AdvancedConstraints> {
  return {
    // Dispersion équilibrée
    dispersion: {
      profile: 'balanced'
    },
    
    // Centre de gravité standard
    centerOfGravity: {
      min: 22,
      max: 28
    },
    
    // Répétition possible
    repetition: {
      minRepetitions: 0,
      maxRepetitions: 2
    },
    
    // Profil standard
    decadeDistribution: {
      preferredProfile: '2-2-1',
      bonusWeight: 4
    },
    
    // Paires fréquentes activées
    frequentPairs: {
      enabled: true,
      bonusWeight: 5,
      maxPairsPerGrid: 3,
      topN: 30
    },
    
    // Pondération forte sur la récence
    recencyWeighting: {
      mode: 'strong'
    }
  };
}

/**
 * PRESET: Conservateur
 * Suit strictement les patterns historiques
 */
function getConservativePreset(): Partial<AdvancedConstraints> {
  return {
    // Dispersion compacte à équilibrée
    dispersion: {
      profile: 'balanced',
      avgGapMin: 8,
      avgGapMax: 12
    },
    
    // Centre de gravité centré
    centerOfGravity: {
      min: 23,
      max: 27
    },
    
    // Répétition naturelle
    repetition: {
      minRepetitions: 0,
      maxRepetitions: 1,
      favorExactlyOne: true
    },
    
    // Profil le plus fréquent
    decadeDistribution: {
      preferredProfile: '2-1-1-1',
      bonusWeight: 8
    },
    
    // Paires fréquentes fortement favorisées
    frequentPairs: {
      enabled: true,
      bonusWeight: 6,
      maxPairsPerGrid: 3,
      topN: 20
    },
    
    // Pondération légère
    recencyWeighting: {
      mode: 'light'
    },
    
    // Pas d'anti-biais
    antiHumanBias: {
      enabled: false
    }
  };
}

/**
 * PRESET: Expérimental
 * Utilise toutes les fonctionnalités avancées
 */
function getExperimentalPreset(): Partial<AdvancedConstraints> {
  return {
    // Dispersion libre
    dispersion: {
      profile: 'free'
    },
    
    // Centre de gravité large
    centerOfGravity: {
      min: 20,
      max: 30
    },
    
    // Répétition variable
    repetition: {
      minRepetitions: 0,
      maxRepetitions: 2
    },
    
    // Profil libre
    decadeDistribution: {
      preferredProfile: 'free',
      bonusWeight: 0
    },
    
    // Paires fréquentes avec bonus modéré
    frequentPairs: {
      enabled: true,
      bonusWeight: 4,
      maxPairsPerGrid: 2,
      topN: 40
    },
    
    // Pondération exponentielle
    recencyWeighting: {
      mode: 'exponential',
      exponentialFactor: 0.95
    },
    
    // Anti-biais modéré
    antiHumanBias: {
      ...DEFAULT_ANTI_HUMAN_BIAS,
      enabled: true,
      penaltyWeight: 0.8
    },
    
    // Signature modulaire activée
    modularSignature: {
      enabled: true,
      bonusWeight: 2
    }
  };
}

/**
 * Get preset description
 */
export function getPresetDescription(preset: GridPreset): string {
  switch (preset) {
    case 'balanced':
      return 'Configuration optimale basée sur l\'analyse statistique. Équilibre entre tous les paramètres pour reproduire la structure naturelle des tirages.';
    
    case 'dispersed':
      return 'Grilles avec espacement maximal entre les numéros. Couvre le maximum de dizaines différentes et évite les numéros proches.';
    
    case 'anti-share':
      return 'Minimise le risque de partager un jackpot en évitant les patterns typiquement choisis par les joueurs humains.';
    
    case 'hot-cold-mix':
      return 'Équilibre entre numéros chauds (fréquents récemment) et numéros froids (moins sortis). Utilise une pondération temporelle forte.';
    
    case 'conservative':
      return 'Suit strictement les patterns historiques les plus fréquents. Favorise les paires et profils de dizaines courants.';
    
    case 'experimental':
      return 'Utilise toutes les fonctionnalités avancées avec pondération exponentielle et signature modulaire. Pour les utilisateurs avancés.';
    
    case 'custom':
      return 'Configuration personnalisée. Ajustez manuellement tous les paramètres selon vos préférences.';
    
    default:
      return '';
  }
}

/**
 * Get all available presets with descriptions
 */
export function getAllPresets(): Array<{ value: GridPreset; label: string; description: string }> {
  return [
    {
      value: 'balanced',
      label: '⚖️ Équilibré',
      description: getPresetDescription('balanced')
    },
    {
      value: 'dispersed',
      label: '📊 Dispersé',
      description: getPresetDescription('dispersed')
    },
    {
      value: 'anti-share',
      label: '🎯 Anti-partage',
      description: getPresetDescription('anti-share')
    },
    {
      value: 'hot-cold-mix',
      label: '🔥 Mix Chaud/Froid',
      description: getPresetDescription('hot-cold-mix')
    },
    {
      value: 'conservative',
      label: '🛡️ Conservateur',
      description: getPresetDescription('conservative')
    },
    {
      value: 'experimental',
      label: '🧪 Expérimental',
      description: getPresetDescription('experimental')
    },
    {
      value: 'custom',
      label: '⚙️ Personnalisé',
      description: getPresetDescription('custom')
    }
  ];
}
