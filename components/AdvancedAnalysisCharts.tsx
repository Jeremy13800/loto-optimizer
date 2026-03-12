"use client";

import { useMemo } from "react";

interface BarChartProps {
  data: Record<string, number>;
  title: string;
  description: string;
  color?: string;
  showPercentage?: boolean;
}

export function BarChart({
  data,
  title,
  description,
  color = "blue",
  showPercentage = true,
}: BarChartProps) {
  const maxValue = Math.max(...Object.values(data));
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  // Color mapping
  const colorMap: Record<string, { from: string; to: string }> = {
    blue: { from: "#3b82f6", to: "#60a5fa" },
    green: { from: "#10b981", to: "#34d399" },
    purple: { from: "#a855f7", to: "#c084fc" },
    pink: { from: "#ec4899", to: "#f472b6" },
    yellow: { from: "#eab308", to: "#facc15" },
    red: { from: "#ef4444", to: "#f87171" },
    orange: { from: "#f97316", to: "#fb923c" },
    cyan: { from: "#06b6d4", to: "#22d3ee" },
    indigo: { from: "#6366f1", to: "#818cf8" },
    primary: { from: "#10b981", to: "#34d399" },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-dark-800/40 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{description}</p>

      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          const percentage = (value / total) * 100;
          const width = (value / maxValue) * 100;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">{key}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{value}</span>
                  {showPercentage && (
                    <span className="text-slate-500 text-xs">
                      ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-8 bg-dark-900/60 rounded-lg overflow-hidden">
                <div
                  className="h-full transition-all duration-500 flex items-center justify-end px-3"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
                  }}
                >
                  {width > 20 && (
                    <span className="text-white text-xs font-semibold">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TopPatternsProps {
  patterns: Array<{ pattern: string; count: number; percentage: number }>;
  title: string;
  description: string;
}

export function TopPatterns({
  patterns,
  title,
  description,
}: TopPatternsProps) {
  return (
    <div className="bg-dark-800/40 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{description}</p>

      <div className="space-y-2">
        {patterns.slice(0, 10).map((pattern, index) => (
          <div
            key={pattern.pattern}
            className="flex items-center justify-between p-3 bg-dark-900/40 rounded-lg border border-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary-400 font-bold text-lg">
                #{index + 1}
              </span>
              <span className="text-white font-mono font-semibold">
                {pattern.pattern}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">
                {pattern.count} tirages
              </span>
              <span className="text-primary-300 font-bold">
                {pattern.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TopPairsProps {
  pairs: Array<{ nums: [number, number]; count: number; percentage: number }>;
  title: string;
  description: string;
}

export function TopPairs({ pairs, title, description }: TopPairsProps) {
  return (
    <div className="bg-dark-800/40 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{description}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {pairs.slice(0, 12).map((pair, index) => (
          <div
            key={`${pair.nums[0]}-${pair.nums[1]}`}
            className="p-4 bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">#{index + 1}</span>
              <span className="text-primary-300 font-bold text-sm">
                {pair.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-2xl font-bold text-white">
                {pair.nums[0]}
              </span>
              <span className="text-slate-500">-</span>
              <span className="text-2xl font-bold text-white">
                {pair.nums[1]}
              </span>
            </div>
            <div className="text-center text-xs text-slate-400 mt-2">
              {pair.count} fois
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  color = "primary",
}: StatsCardProps) {
  const colorStyles: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    primary: {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.2)",
      text: "#6ee7b7",
    },
    blue: {
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.2)",
      text: "#93c5fd",
    },
    green: {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.2)",
      text: "#6ee7b7",
    },
    purple: {
      bg: "rgba(168, 85, 247, 0.1)",
      border: "rgba(168, 85, 247, 0.2)",
      text: "#d8b4fe",
    },
  };

  const styles = colorStyles[color] || colorStyles.primary;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color: styles.text }}>
        {value}
      </div>
    </div>
  );
}
