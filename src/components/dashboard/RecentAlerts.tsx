import React from 'react';
import { EnergyAlert } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatKwh, formatInr } from '../../utils/formatters';
import { formatTimeOnly } from '../../utils/dates';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface RecentAlertsProps {
  alerts: EnergyAlert[];
  onSelectAlert: (alertId: string) => void;
  onViewAllAlerts: () => void;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({
  alerts,
  onSelectAlert,
  onViewAllAlerts,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Wastage Alerts</h3>
          </div>
          <button
            onClick={onViewAllAlerts}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({alerts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Latest rule-triggered alerts requiring facility inspection
        </p>

        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No energy wastage alerts detected in the current dataset.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all bg-slate-50/50 hover:bg-white cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="severity" value={alert.severity} size="sm" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {alert.roomName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatTimeOnly(alert.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                  {alert.reason}
                </p>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">
                      Excess: <strong className="text-rose-600">{formatKwh(alert.excessKwh)}</strong>
                    </span>
                    <span className="text-slate-500 font-medium">
                      Cost: <strong className="text-slate-900">{formatInr(alert.potentialCostInr)}</strong>
                    </span>
                  </div>
                  <StatusBadge type="status" value={alert.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Status persists across page reloads
        </span>
        <span>Deterministic Rule Engine</span>
      </div>
    </div>
  );
};
