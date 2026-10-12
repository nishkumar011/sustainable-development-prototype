import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
  sublabel?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Processing energy intervals...',
  sublabel = 'Running deterministic occupancy cross-referencing engine',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xs">
      <div className="relative mb-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
      <p className="text-base font-semibold text-slate-800">{label}</p>
      {sublabel && <p className="text-xs text-slate-500 mt-1 max-w-sm">{sublabel}</p>}
    </div>
  );
};
