import React from 'react';
import { EnergyAlert, AlertSeverity, AlertStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatKwh, formatInr } from '../../utils/formatters';
import { formatTimestamp } from '../../utils/dates';
import { Search, Filter, ArrowUpDown, Building2, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { useRoomPulse } from '../../context/RoomPulseContext';

interface AlertListProps {
  alerts: EnergyAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBuilding: string;
  onBuildingChange: (b: string) => void;
  selectedSeverity: string;
  onSeverityChange: (s: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  sortBy: 'severity' | 'time' | 'excess';
  onSortChange: (sort: 'severity' | 'time' | 'excess') => void;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  searchQuery,
  onSearchChange,
  selectedBuilding,
  onBuildingChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}) => {
  const { updateAlertStatus } = useRoomPulse();

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search room, ID, rule, or building..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'severity' | 'time' | 'excess')}
              className="text-xs font-semibold rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="severity">Severity (High &rarr; Low)</option>
              <option value="excess">Excess Energy (Max)</option>
              <option value="time">Timestamp (Latest)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Building */}
          <select
            value={selectedBuilding}
            onChange={(e) => onBuildingChange(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 bg-white py-1 px-2 focus:outline-none"
          >
            <option value="all">All Buildings</option>
            <option value="Aryabhata Hall">Aryabhata Hall</option>
            <option value="Ramanujan Tower">Ramanujan Tower</option>
            <option value="Tagore Humanities">Tagore Humanities</option>
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 bg-white py-1 px-2 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 bg-white py-1 px-2 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          <span className="ml-auto text-xs text-slate-400 font-medium">
            Showing {alerts.length} alerts
          </span>
        </div>
      </div>

      {/* Alert Cards list */}
      {alerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No Matching Alerts Found"
          description="Try broadening your search query or reset your building/severity filter options."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isSelected = selectedAlertId === alert.id;

            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type="severity" value={alert.severity} size="sm" />
                    <StatusBadge type="status" value={alert.status} size="sm" />
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {alert.roomName}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">({alert.roomId})</span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  {alert.reason}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      Excess: <strong className="text-rose-600">{formatKwh(alert.excessKwh)}</strong>
                    </span>
                    <span className="text-slate-500">
                      Cost: <strong className="text-slate-900">{formatInr(alert.potentialCostInr)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAlertStatus(alert.id, 'investigating');
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                        alert.status === 'investigating'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Checking
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAlertStatus(
                          alert.id,
                          alert.status === 'resolved' ? 'new' : 'resolved'
                        );
                      }}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                        alert.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{alert.status === 'resolved' ? 'Fixed' : 'Mark Fixed'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
