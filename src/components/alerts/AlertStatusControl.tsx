import React from 'react';
import { AlertStatus } from '../../types';
import { CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';

interface AlertStatusControlProps {
  currentStatus: AlertStatus;
  onChangeStatus: (status: AlertStatus) => void;
}

export const AlertStatusControl: React.FC<AlertStatusControlProps> = ({
  currentStatus,
  onChangeStatus,
}) => {
  const statuses: { id: AlertStatus; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'new', label: 'New', icon: AlertCircle, color: 'text-purple-600 border-purple-200 hover:bg-purple-50' },
    { id: 'acknowledged', label: 'Acknowledged', icon: Eye, color: 'text-blue-600 border-blue-200 hover:bg-blue-50' },
    { id: 'investigating', label: 'Investigating', icon: Clock, color: 'text-amber-600 border-amber-200 hover:bg-amber-50' },
    { id: 'resolved', label: 'Resolved (Closed)', icon: CheckCircle2, color: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' },
  ];

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-slate-700 block">Workflow Status</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statuses.map((s) => {
          const Icon = s.icon;
          const isActive = currentStatus === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChangeStatus(s.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/20'
                  : `bg-white text-slate-600 border-slate-200 ${s.color}`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-400 italic">
        Status changes persist in browser storage. Marking resolved records field inspection completion without claiming verified financial savings.
      </p>
    </div>
  );
};
