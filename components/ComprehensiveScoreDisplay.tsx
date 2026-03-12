"use client";

import { useState } from 'react';
import { ComprehensiveScore } from '@/lib/stats/scoring/comprehensive-scoring';

interface ComprehensiveScoreDisplayProps {
  score: ComprehensiveScore;
}

export default function ComprehensiveScoreDisplay({ score }: ComprehensiveScoreDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Déterminer la couleur selon le grade
  const getGradeColor = () => {
    switch (score.grade) {
      case 'Excellent': return 'green';
      case 'Bon': return 'blue';
      case 'Moyen': return 'yellow';
      case 'Faible': return 'red';
    }
  };

  const color = getGradeColor();
  const percentage = score.total;

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {/* Score principal */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400">Score statistique</span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors underline"
          >
            {showDetails ? 'Masquer' : 'Voir le détail'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold text-${color}-400`}>
            {score.total}/100
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
            {score.grade}
          </span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-3 bg-dark-900/60 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Détails des composantes */}
      {showDetails && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Détail des composantes
          </div>
          {score.components.map((component, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-3 bg-dark-900/40 rounded-lg border border-white/5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {component.name}
                  </span>
                  {component.score > 0 && (
                    <span className="text-xs text-green-400">+{component.score}</span>
                  )}
                  {component.score < 0 && (
                    <span className="text-xs text-red-400">{component.score}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{component.explanation}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right">
                  <div className={`text-sm font-bold ${component.score >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {component.score}
                  </div>
                  {component.maxScore > 0 && (
                    <div className="text-xs text-slate-500">/ {component.maxScore}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Légende des grades */}
          <div className="mt-4 p-4 bg-dark-900/40 rounded-lg border border-white/5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Échelle de qualité
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-300">85-100 : Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-300">70-84 : Bon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-slate-300">40-69 : Moyen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-slate-300">0-39 : Faible</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
