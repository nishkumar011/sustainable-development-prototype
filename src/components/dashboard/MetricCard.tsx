import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  badge?: { text: string; variant: 'emerald' | 'rose' | 'amber' | 'slate' | 'blue' };
  actionText?: string;
  onAction?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  badge,
  actionText,
  onAction,
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-105 group-hover:bg-slate-100 transition-all">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {badge && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              badgeClasses[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
        {sublabel && <span className="truncate pr-2">{sublabel}</span>}
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="text-emerald-700 font-semibold hover:text-emerald-800 hover:underline shrink-0 cursor-pointer ml-auto"
          >
            {actionText} &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
