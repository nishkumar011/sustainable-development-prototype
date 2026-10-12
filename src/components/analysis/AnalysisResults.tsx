import React, { useState } from 'react';
import { RoomInterval, AnalysisSummary, EnergyAlert, OccupancyStatus } from '../../types';
import { formatKwh, formatInr } from '../../utils/formatters';
import { formatTimeOnly } from '../../utils/dates';
import { StatusBadge } from '../common/StatusBadge';
import { Download, Search, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { exportAlertsToCSV, exportRoomSummariesToCSV } from '../../utils/csvExporter';

interface AnalysisResultsProps {
  summary: AnalysisSummary;
  intervals: RoomInterval[];
  alerts: EnergyAlert[];
  onOverrideOccupancy: (intervalId: string, newOccupancy: OccupancyStatus) => void;
  onNavigateToAlert: (alertId: string) => void;
  onNavigateToRoom: (roomId: string) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  summary,
  intervals,
  alerts,
  onOverrideOccupancy,
  onNavigateToAlert,
  onNavigateToRoom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);

  // Map alerts by interval ID
  const alertByIntervalId = new Map<string, EnergyAlert>();
  alerts.forEach((a) => alertByIntervalId.set(a.intervalId, a));

  const filteredIntervals = intervals.filter((inv) => {
    if (!showAllRows && !alertByIntervalId.has(inv.id)) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRoom = inv.roomId.toLowerCase().includes(q);
      const matchName = (inv.roomName || '').toLowerCase().includes(q);
      if (!matchRoom && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Quick Results Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
            {alerts.length}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {alerts.length} Energy Issues Detected Across {summary.validIntervalsCount} Intervals
            </h4>
            <p className="text-xs text-slate-500">
              Total estimated loss: <strong>{formatInr(summary.totalPotentialCostInr)}</strong> ({formatKwh(summary.totalExcessKwh)} excess power)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAlertsToCSV(alerts)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table header & filter */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              {showAllRows ? 'All Monitored Intervals' : 'Flagged Wastage Intervals Only'}
            </span>
            <span className="text-xs text-slate-400">({filteredIntervals.length} shown)</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setShowAllRows(!showAllRows)}
              className="font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              {showAllRows ? 'Show Only Flagged' : 'Show All Intervals'}
            </button>
          </div>
        </div>

        {/* Table rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <th className="py-2.5 px-3">Room &amp; Time</th>
                <th className="py-2.5 px-3">Occupancy</th>
                <th className="py-2.5 px-3 text-right">Power Draw</th>
                <th className="py-2.5 px-3 text-right">Normal Idle</th>
                <th className="py-2.5 px-3 text-right">Wasted</th>
                <th className="py-2.5 px-3">Finding</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIntervals.map((inv) => {
                const alert = alertByIntervalId.get(inv.id);
                const excess = Math.max(0, inv.actualKwh - inv.expectedKwh);

                return (
                  <tr
                    key={inv.id}
                    className={alert ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50'}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">
                        {inv.roomName || inv.roomId}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatTimeOnly(inv.timestamp)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <select
                        value={inv.expectedOccupancy}
                        onChange={(e) =>
                          onOverrideOccupancy(
                            inv.id,
                            e.target.value as OccupancyStatus
                          )
                        }
                        className="text-[11px] font-medium border border-slate-200 rounded px-1.5 py-0.5 bg-white cursor-pointer"
                        title="Click to test changing room occupancy status"
                      >
                        <option value="empty">Empty</option>
                        <option value="occupied">Occupied</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-3 text-right font-medium">
                      {formatKwh(inv.actualKwh)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {formatKwh(inv.expectedKwh)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${excess > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {excess > 0 ? `+${formatKwh(excess)}` : '0.00'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      {alert ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[11px]">
                          🚨 {alert.ruleTriggered}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium text-[11px]">Normal</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {alert && (
                        <button
                          onClick={() => onNavigateToAlert(alert.id)}
                          className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Inspect &rarr;
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
