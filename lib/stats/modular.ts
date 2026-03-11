/**
 * Modular signature analysis (experimental)
 */

import { ModularSignature } from './advanced-types';

/**
 * Calculate modular signature for a grid
 */
export function calculateModularSignature(nums: number[]): ModularSignature {
  const mod5Distribution = [0, 0, 0, 0, 0]; // Indices 0-4
  const mod7Distribution = [0, 0, 0, 0, 0, 0, 0]; // Indices 0-6
  
  for (const num of nums) {
    mod5Distribution[num % 5]++;
    mod7Distribution[num % 7]++;
  }
  
  return {
    mod5Distribution,
    mod7Distribution
  };
}

/**
 * Calculate modular diversity score
 * Higher score = more diverse modular distribution
 */
export function calculateModularDiversityScore(signature: ModularSignature): number {
  let score = 10;
  
  // Pénaliser si trop de numéros ont le même modulo
  const maxMod5 = Math.max(...signature.mod5Distribution);
  const maxMod7 = Math.max(...signature.mod7Distribution);
  
  if (maxMod5 >= 3) score -= 3; // 3+ numéros avec même mod5
  if (maxMod7 >= 3) score -= 2; // 3+ numéros avec même mod7
  
  return Math.max(0, score);
}

/**
 * Analyze modular signatures from historical draws
 */
export function analyzeModularSignatures(
  draws: { nums: number[] }[]
): {
  mod5Patterns: Map<string, number>;
  mod7Patterns: Map<string, number>;
} {
  const mod5Patterns = new Map<string, number>();
  const mod7Patterns = new Map<string, number>();
  
  for (const draw of draws) {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const signature = calculateModularSignature(nums);
    
    const mod5Key = signature.mod5Distribution.join('-');
    const mod7Key = signature.mod7Distribution.join('-');
    
    mod5Patterns.set(mod5Key, (mod5Patterns.get(mod5Key) || 0) + 1);
    mod7Patterns.set(mod7Key, (mod7Patterns.get(mod7Key) || 0) + 1);
  }
  
  return { mod5Patterns, mod7Patterns };
}
