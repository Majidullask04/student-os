import React, { useEffect, useState } from 'react';

interface AnimatedProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'indigo',
  size = 'md',
  animated = true,
}) => {
  const [width, setWidth] = useState(0);
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const colorVariants = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30',
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
    blue: 'from-sky-400 to-blue-600 shadow-blue-500/30',
    purple: 'from-fuchsia-500 to-purple-600 shadow-purple-500/30',
    amber: 'from-amber-400 to-amber-600 shadow-amber-500/30',
  }[color];

  const heightVariants = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700">
          {label && <span className="truncate">{label}</span>}
          {showPercentage && <span className="font-mono text-slate-500 font-semibold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner ${heightVariants}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorVariants} transition-all duration-700 ease-out shadow-xs ${
            animated ? 'relative overflow-hidden' : ''
          }`}
          style={{ width: `${width}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-gradient-x" />
          )}
        </div>
      </div>
    </div>
  );
};
