/**
 * Preset selector component
 * Allows users to select pre-configured grid generation strategies
 */

'use client';

import { GridPreset } from '@/lib/stats/advanced-types';
import { getAllPresets } from '@/lib/stats/presets';

interface PresetSelectorProps {
  value: GridPreset;
  onChange: (preset: GridPreset) => void;
}

export default function PresetSelector({ value, onChange }: PresetSelectorProps) {
  const presets = getAllPresets();
  
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-400">
        Profil de génération
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => {
          const isSelected = value === preset.value;
          
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-white/10 bg-dark-900/60 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-base font-semibold text-white">
                  {preset.label}
                </span>
                {isSelected && (
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
      
      {value !== 'custom' && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>Astuce :</strong> Vous pouvez modifier les paramètres après avoir sélectionné un profil. 
            Le profil passera automatiquement en mode "Personnalisé".
          </p>
        </div>
      )}
    </div>
  );
}
