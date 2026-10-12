import React from 'react';
import { useRoomPulse } from '../context/RoomPulseContext';
import { EnergyTrendChart } from '../components/dashboard/EnergyTrendChart';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatKwh, formatInr } from '../utils/formatters';
import { formatTimeOnly } from '../utils/dates';
import {
  AlertTriangle,
  Zap,
  Coins,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    summary,
    alerts,
    settings,
    updateAlertStatus,
    navigateToAlert,
    navigateToRoom,
    setActiveTab,
    isAnalyzing,
    triggerAnalysis,
  } = useRoomPulse();

  const unresolvedAlerts = alerts.filter((a) => a.status !== 'resolved');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Hero Summary Cards: Plain numbers, high impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Estimated Cost Loss */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Waste Cost</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatInr(summary.totalPotentialCostInr)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculated at ₹{settings.tariffPerKwh} per unit of wasted power
          </p>
        </div>

        {/* Wasted Energy */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Wasted Electricity</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatKwh(summary.totalExcessKwh)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Excess energy consumed while rooms were empty or unbooked
          </p>
        </div>

        {/* Rooms with Waste */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rooms With Waste</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{unresolvedAlerts.length} Rooms</span>
            {resolvedAlerts.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600">
                ({resolvedAlerts.length} fixed)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary.roomsAnalyzedCount} total campus spaces monitored
          </p>
        </div>
      </div>

      {/* Main Focus: Live Waste Alerts with 1-Click Action */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Rooms Wasting Electricity Right Now
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              These rooms are scheduled as empty on the timetable, but electricity is actively running.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerAnalysis()}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Re-check Now</span>
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>Upload CSV</span>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {unresolvedAlerts.length === 0 ? (
          <div className="py-10 text-center rounded-xl bg-emerald-50/40 border border-emerald-100 p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">All Flagged Rooms Resolved!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              No active energy waste detected. All empty classrooms have equipment turned off according to schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {unresolvedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all bg-slate-50/40 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {alert.roomName}
                        </span>
                        <StatusBadge type="severity" value={alert.severity} size="sm" />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {alert.building} • {formatTimeOnly(alert.timestamp)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-rose-600 block">
                        +{formatKwh(alert.excessKwh)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">
                        {formatInr(alert.potentialCostInr)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {alert.reason}
                  </p>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigateToAlert(alert.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'investigating')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        alert.status === 'investigating'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Checking
                    </button>

                    <button
                      onClick={() => updateAlertStatus(alert.id, 'resolved')}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Mark Fixed</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly Energy Trend Chart */}
      <EnergyTrendChart data={summary.trendSeries} />
    </div>
  );
};
