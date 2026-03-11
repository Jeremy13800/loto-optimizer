/**
 * Center of gravity calculations for lottery grids
 */

/**
 * Calculate center of gravity (average of all numbers)
 */
export function calculateCenterOfGravity(nums: number[]): number {
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return sum / nums.length;
}

/**
 * Check if center of gravity is within constraints
 */
export function isWithinCenterOfGravityRange(
  nums: number[],
  min?: number,
  max?: number
): boolean {
  const cog = calculateCenterOfGravity(nums);
  
  if (min !== undefined && cog < min) return false;
  if (max !== undefined && cog > max) return false;
  
  return true;
}

/**
 * Calculate center of gravity score based on optimal range
 * Optimal range based on analysis: 20-30 (balanced distribution)
 */
export function calculateCenterOfGravityScore(nums: number[]): number {
  const cog = calculateCenterOfGravity(nums);
  
  // Optimal range: 22-28 (centered around 25, which is middle of 1-49)
  let score = 10;
  
  if (cog < 18) score -= 3;      // Trop bas
  else if (cog < 20) score -= 1;
  else if (cog > 32) score -= 3; // Trop haut
  else if (cog > 30) score -= 1;
  
  return Math.max(0, score);
}
