/**
 * Decade distribution analysis and profiling
 */

import { DecadeProfile } from './advanced-types';

/**
 * Get decade for a number (1-10=1, 11-20=2, etc.)
 */
export function getDecade(num: number): number {
  if (num <= 10) return 1;
  if (num <= 20) return 2;
  if (num <= 30) return 3;
  if (num <= 40) return 4;
  return 5;
}

/**
 * Count numbers per decade
 */
export function countPerDecade(nums: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  
  for (const num of nums) {
    const decade = getDecade(num);
    counts.set(decade, (counts.get(decade) || 0) + 1);
  }
  
  return counts;
}

/**
 * Get decade distribution profile
 * Returns a sorted array of counts (e.g., [2, 2, 1] for profile '2-2-1')
 */
export function getDecadeDistribution(nums: number[]): number[] {
  const counts = countPerDecade(nums);
  const distribution = Array.from(counts.values()).sort((a, b) => b - a);
  return distribution;
}

/**
 * Convert distribution to profile string
 */
export function distributionToProfile(distribution: number[]): DecadeProfile {
  const profile = distribution.join('-');
  
  switch (profile) {
    case '1-1-1-1-1':
      return '1-1-1-1-1';
    case '2-1-1-1':
      return '2-1-1-1';
    case '2-2-1':
      return '2-2-1';
    case '3-1-1':
      return '3-1-1';
    case '3-2':
      return '3-2';
    default:
      return 'free';
  }
}

/**
 * Get decade profile for a grid
 */
export function getDecadeProfile(nums: number[]): DecadeProfile {
  const distribution = getDecadeDistribution(nums);
  return distributionToProfile(distribution);
}

/**
 * Check if grid matches desired decade profile
 */
export function matchesDecadeProfile(
  nums: number[],
  targetProfile: DecadeProfile
): boolean {
  if (targetProfile === 'free') return true;
  
  const actualProfile = getDecadeProfile(nums);
  return actualProfile === targetProfile;
}

/**
 * Calculate decade distribution score
 * Bonus for matching common profiles
 */
export function calculateDecadeDistributionScore(
  nums: number[],
  preferredProfile?: DecadeProfile,
  bonusWeight: number = 5
): number {
  const profile = getDecadeProfile(nums);
  
  // Bonus si le profil correspond au profil préféré
  if (preferredProfile && profile === preferredProfile) {
    return bonusWeight;
  }
  
  // Profils naturels courants (basé sur l'analyse)
  const commonProfiles: DecadeProfile[] = ['2-1-1-1', '2-2-1', '3-1-1'];
  
  if (commonProfiles.includes(profile)) {
    return bonusWeight * 0.5; // Bonus partiel pour profils courants
  }
  
  return 0;
}

/**
 * Analyze decade distribution from historical draws
 */
export function analyzeDecadeProfiles(
  draws: { nums: number[] }[]
): Map<DecadeProfile, number> {
  const profileCounts = new Map<DecadeProfile, number>();
  
  for (const draw of draws) {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const profile = getDecadeProfile(nums);
    profileCounts.set(profile, (profileCounts.get(profile) || 0) + 1);
  }
  
  return profileCounts;
}

/**
 * Get most common decade profiles
 */
export function getMostCommonDecadeProfiles(
  draws: { nums: number[] }[],
  topN: number = 5
): Array<{ profile: DecadeProfile; count: number; percentage: number }> {
  const profileCounts = analyzeDecadeProfiles(draws);
  const totalDraws = draws.length;
  
  return Array.from(profileCounts.entries())
    .map(([profile, count]) => ({
      profile,
      count,
      percentage: (count / totalDraws) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
