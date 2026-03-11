/**
 * Advanced statistical types for lottery grid generation
 * These types extend the base system with sophisticated analysis capabilities
 */

// ============================================================================
// DISPERSION & SPACING
// ============================================================================

export type DispersionProfile = 'compact' | 'balanced' | 'dispersed' | 'free';

export interface SpacingMetrics {
  gaps: number[];           // Écarts entre numéros consécutifs triés
  avgGap: number;           // Écart moyen
  minGap: number;           // Écart minimum
  maxGap: number;           // Écart maximum
  gapVariance: number;      // Variance des écarts
  gapSum: number;           // Somme des écarts
}

export interface DispersionConstraints {
  profile?: DispersionProfile;
  avgGapMin?: number;
  avgGapMax?: number;
  varianceMin?: number;
  varianceMax?: number;
}

// ============================================================================
// CENTER OF GRAVITY
// ============================================================================

export interface CenterOfGravityConstraints {
  min?: number;  // Centre de gravité minimum (moyenne des 5 numéros)
  max?: number;  // Centre de gravité maximum
}

// ============================================================================
// REPETITION WITH PREVIOUS DRAW
// ============================================================================

export interface RepetitionConstraints {
  minRepetitions?: number;      // Min numéros communs avec tirage précédent
  maxRepetitions?: number;      // Max numéros communs avec tirage précédent
  favorExactlyOne?: boolean;    // Favoriser exactement 1 répétition
}

// ============================================================================
// FREQUENT PAIRS & TRIPLETS
// ============================================================================

export interface PairFrequency {
  pair: [number, number];
  count: number;
  percentage: number;
}

export interface TripletFrequency {
  triplet: [number, number, number];
  count: number;
  percentage: number;
}

export interface FrequentPairsConstraints {
  enabled?: boolean;
  bonusWeight?: number;         // Poids du bonus (0-10)
  maxPairsPerGrid?: number;     // Max paires fréquentes par grille
  topN?: number;                // Considérer les N paires les plus fréquentes
}

// ============================================================================
// TEMPORAL WEIGHTING / RECENCY
// ============================================================================

export type RecencyMode = 'uniform' | 'light' | 'strong' | 'exponential';

export interface RecencyWeighting {
  mode: RecencyMode;
  exponentialFactor?: number;   // Pour mode 'exponential' (0.9-0.99)
}

// ============================================================================
// DECADE DISTRIBUTION PROFILES
// ============================================================================

export type DecadeProfile = 
  | '1-1-1-1-1'   // 5 dizaines différentes, 1 numéro chacune
  | '2-1-1-1'     // 4 dizaines, dont une avec 2 numéros
  | '2-2-1'       // 3 dizaines, deux avec 2 numéros
  | '3-1-1'       // 3 dizaines, dont une avec 3 numéros
  | '3-2'         // 2 dizaines, 3 et 2 numéros
  | '2-2-1-0-0'   // Profil spécifique par dizaine
  | 'free';       // Pas de contrainte

export interface DecadeDistributionConstraints {
  preferredProfile?: DecadeProfile;
  bonusWeight?: number;
}

// ============================================================================
// ANTI-HUMAN BIAS
// ============================================================================

export interface AntiHumanBiasConfig {
  enabled: boolean;
  penalizeObviousSequences?: boolean;      // 1,2,3 ou 5,10,15
  penalizeArithmeticProgressions?: boolean;
  penalizeTooManyLow?: boolean;            // Trop de numéros <=31
  penalizeMultiplesOf5?: boolean;
  penalizeSymmetries?: boolean;
  penalizeSameEndings?: boolean;           // Terminaisons répétitives
  penalizeBirthdayPattern?: boolean;       // Distribution type anniversaire
  penaltyWeight?: number;                  // Poids global des pénalités
}

// ============================================================================
// MODULAR SIGNATURE (EXPERIMENTAL)
// ============================================================================

export interface ModularSignature {
  mod5Distribution: number[];   // Distribution modulo 5
  mod7Distribution: number[];   // Distribution modulo 7
}

export interface ModularConstraints {
  enabled?: boolean;
  bonusWeight?: number;
}

// ============================================================================
// GRID PRESETS
// ============================================================================

export type GridPreset = 
  | 'balanced'        // Équilibré
  | 'dispersed'       // Dispersé
  | 'anti-share'      // Anti-partage
  | 'hot-cold-mix'    // Mix chaud/froid
  | 'conservative'    // Conservateur
  | 'experimental'    // Expérimental
  | 'custom';         // Personnalisé

// ============================================================================
// SCORE EXPLANATION
// ============================================================================

export interface ScoreContribution {
  category: string;
  label: string;
  points: number;
  maxPoints: number;
  explanation: string;
}

export interface ExplainableScore {
  total: number;              // Score total /100
  contributions: ScoreContribution[];
  constraintType: 'hard' | 'soft';
}

// ============================================================================
// EXTENDED CONSTRAINTS
// ============================================================================

export interface AdvancedConstraints {
  // Dispersion
  dispersion?: DispersionConstraints;
  
  // Centre de gravité
  centerOfGravity?: CenterOfGravityConstraints;
  
  // Répétition avec tirage précédent
  repetition?: RepetitionConstraints;
  
  // Paires fréquentes
  frequentPairs?: FrequentPairsConstraints;
  
  // Pondération temporelle
  recencyWeighting?: RecencyWeighting;
  
  // Profil de dizaines
  decadeDistribution?: DecadeDistributionConstraints;
  
  // Anti-biais humain
  antiHumanBias?: AntiHumanBiasConfig;
  
  // Signature modulaire
  modularSignature?: ModularConstraints;
  
  // Preset sélectionné
  preset?: GridPreset;
}

// ============================================================================
// MONTE CARLO CALIBRATION
// ============================================================================

export interface MonteCarloCalibration {
  sampleSize: number;
  sumDistribution: { value: number; frequency: number }[];
  rangeDistribution: { value: number; frequency: number }[];
  dispersionDistribution: { value: number; frequency: number }[];
  centerOfGravityDistribution: { value: number; frequency: number }[];
  decadeProfileDistribution: { profile: DecadeProfile; frequency: number }[];
}

// ============================================================================
// GRID ANALYSIS RESULT
// ============================================================================

export interface GridAnalysis {
  nums: number[];
  chance: number;
  
  // Métriques de base
  sum: number;
  range: number;
  evenCount: number;
  oddCount: number;
  
  // Métriques avancées
  spacing: SpacingMetrics;
  centerOfGravity: number;
  repetitionsWithPrevious: number;
  frequentPairsCount: number;
  decadeProfile: string;
  modularSignature?: ModularSignature;
  
  // Score
  score: ExplainableScore;
  
  // Anti-biais
  humanBiasScore: number;
}
