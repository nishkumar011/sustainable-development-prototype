import React from 'react';
import { AnalysisSummary } from '../../types';
import { formatInr } from '../../utils/formatters';

interface AlertDistributionChartProps {
  summary: AnalysisSummary;
}

export const AlertDistributionChart: React.FC<AlertDistributionChartProps> = ({ summary }) => {
  const {
    potentialWastageAlertsCount,
    elevatedUsageAlertsCount,
    reviewWarningsCount,
    alertsBySeverity,
    totalPotentialCostInr,
  } = summary;

  const totalAlerts =
    potentialWastageAlertsCount + elevatedUsageAlertsCount + reviewWarningsCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Alert Categories & Severity</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {totalAlerts} Total Flags
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Deterministic breakdown across detection rules
        </p>

        {/* Severity Badges row */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-center">
            <span className="block text-rose-600 text-xl font-black">{alertsBySeverity.high}</span>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">High</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-center">
            <span className="block text-amber-600 text-xl font-black">{alertsBySeverity.medium}</span>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Medium</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-center">
            <span className="block text-sky-600 text-xl font-black">{alertsBySeverity.low}</span>
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">Low</span>
          </div>
        </div>

        {/* Categories breakdown bars */}
        <div className="space-y-4">
          {/* Confirmed Empty Wastage */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Empty Room Wastage
              </span>
              <span className="font-bold text-slate-900">
                {potentialWastageAlertsCount}{' '}
                <span className="text-slate-400 font-normal">
                  ({totalAlerts > 0 ? Math.round((potentialWastageAlertsCount / totalAlerts) * 100) : 0}%)
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{
                  width: `${totalAlerts > 0 ? (potentialWastageAlertsCount / totalAlerts) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Rooms expected to be empty exceeding baseline + threshold
            </p>
          </div>

          {/* Occupied Room Elevated Usage */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Occupied Elevated Load
              </span>
              <span className="font-bold text-slate-900">
                {elevatedUsageAlertsCount}{' '}
                <span className="text-slate-400 font-normal">
                  ({totalAlerts > 0 ? Math.round((elevatedUsageAlertsCount / totalAlerts) * 100) : 0}%)
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{
                  width: `${totalAlerts > 0 ? (elevatedUsageAlertsCount / totalAlerts) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Active sessions exceeding operational class expectation
            </p>
          </div>

          {/* Unknown Occupancy Warning */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Unknown Occupancy Audit
              </span>
              <span className="font-bold text-slate-900">
                {reviewWarningsCount}{' '}
                <span className="text-slate-400 font-normal">
                  ({totalAlerts > 0 ? Math.round((reviewWarningsCount / totalAlerts) * 100) : 0}%)
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{
                  width: `${totalAlerts > 0 ? (reviewWarningsCount / totalAlerts) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Missing timetable cross-reference requires manual audit
            </p>
          </div>
        </div>
      </div>

      {/* Cost Opportunity Summary Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-5 -mb-5 p-5 rounded-b-2xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Estimated Cost Opportunity
          </span>
          <span className="text-xs text-slate-400">If unnecessary loads are curtailed</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-slate-900">
            {formatInr(totalPotentialCostInr)}
          </span>
        </div>
      </div>
    </div>
  );
};
