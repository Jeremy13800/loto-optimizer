/**
 * Score explanation component
 * Displays detailed breakdown of grid score
 */

'use client';

import { useState } from 'react';
import { ExplainableScore } from '@/lib/stats/advanced-types';

interface ScoreExplanationProps {
  score: ExplainableScore;
}

export default function ScoreExplanation({ score }: ScoreExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Group contributions by category
  const byCategory = new Map<string, typeof score.contributions>();
  for (const contrib of score.contributions) {
    if (!byCategory.has(contrib.category)) {
      byCategory.set(contrib.category, []);
    }
    byCategory.get(contrib.category)!.push(contrib);
  }
  
  // Calculate category totals
  const categoryTotals = new Map<string, number>();
  for (const [category, contribs] of byCategory.entries()) {
    const total = contribs.reduce((sum, c) => sum + c.points, 0);
    categoryTotals.set(category, total);
  }
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };
  
  // Get score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-orange-500/20 border-orange-500/30';
  };
  
  return (
    <div className="mt-3">
      {/* Score badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${getScoreBg(score.total)} hover:opacity-80`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Score qualité</span>
          <span className={`text-lg font-bold ${getScoreColor(score.total)}`}>
            {score.total}/100
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Detailed breakdown */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-dark-800/50 rounded-lg border border-white/5 space-y-3">
          {Array.from(byCategory.entries()).map(([category, contribs]) => {
            const categoryTotal = categoryTotals.get(category) || 0;
            const isPositive = categoryTotal >= 0;
            
            return (
              <div key={category} className="space-y-1">
                {/* Category header */}
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                  <span className="text-xs font-semibold text-slate-300">{category}</span>
                  <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{categoryTotal}
                  </span>
                </div>
                
                {/* Category contributions */}
                <div className="space-y-1">
                  {contribs.map((contrib, idx) => {
                    const isPos = contrib.points >= 0;
                    
                    return (
                      <div key={idx} className="flex items-start justify-between text-xs">
                        <div className="flex-1">
                          <div className="text-slate-400">{contrib.label}</div>
                          <div className="text-slate-500 text-[10px] mt-0.5">{contrib.explanation}</div>
                        </div>
                        <div className={`ml-2 font-mono font-semibold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{contrib.points}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Total */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Score total</span>
            <span className={`text-lg font-bold ${getScoreColor(score.total)}`}>
              {score.total}/100
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
