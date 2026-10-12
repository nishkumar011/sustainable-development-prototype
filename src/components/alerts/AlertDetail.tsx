import React from 'react';
import { EnergyAlert } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AlertStatusControl } from './AlertStatusControl';
import { formatKwh, formatInr } from '../../utils/formatters';
import { formatTimestamp } from '../../utils/dates';
import {
  X,
  Building2,
  Calendar,
  AlertTriangle,
  Lightbulb,
  FileCheck2,
  Coins,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import { useRoomPulse } from '../../context/RoomPulseContext';

interface AlertDetailProps {
  alert: EnergyAlert;
  onClose: () => void;
  onNavigateToRoom: (roomId: string) => void;
}

export const AlertDetail: React.FC<AlertDetailProps> = ({
  alert,
  onClose,
  onNavigateToRoom,
}) => {
  const { updateAlertStatus, rooms } = useRoomPulse();
  const room = rooms.find((r) => r.id === alert.roomId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge type="severity" value={alert.severity} size="md" />
            <StatusBadge type="status" value={alert.status} size="md" />
            <StatusBadge type="source" value={alert.dataSource} size="sm" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{alert.roomName}</span>
            <span className="text-slate-400 font-normal text-sm">({alert.roomId})</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {alert.building} {room?.floor ? `• ${room.floor}` : ''}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatTimestamp(alert.timestamp)}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Summary highlight banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Rule Triggered: {alert.ruleTriggered}</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          {alert.reason}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Calculated Excess
          </span>
          <span className="text-xl font-black text-rose-600 block mt-0.5">
            +{formatKwh(alert.excessKwh)}
          </span>
          <span className="text-[10px] text-slate-500">Above expected baseline</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Estimated Cost Impact
          </span>
          <span className="text-xl font-black text-slate-900 block mt-0.5">
            {formatInr(alert.potentialCostInr)}
          </span>
          <span className="text-[10px] text-slate-500">Single interval estimate</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Space Baseline
          </span>
          <span className="text-xl font-bold text-slate-700 block mt-0.5">
            {formatKwh(room?.expectedBaselineKwh || 0.4)}
          </span>
          <span className="text-[10px] text-slate-500">Idle equipment reference</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Room Type
          </span>
          <span className="text-sm font-bold text-slate-900 block mt-1">
            {room?.roomType || 'Campus Space'}
          </span>
          <span className="text-[10px] text-slate-500">Cap: {room?.capacity || 40} seats</span>
        </div>
      </div>

      {/* Evidence summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>Why was this room flagged?</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-1.5 text-xs text-slate-700">
          {alert.evidence.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Action */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-emerald-700" />
          <span>Recommended Facility Action</span>
        </div>
        <p className="text-xs text-emerald-950 leading-relaxed font-medium">
          {alert.recommendedAction}
        </p>
      </div>

      {/* Installed Equipment in Room */}
      {room?.installedEquipment && room.installedEquipment.length > 0 && (
        <div className="text-xs space-y-1.5">
          <span className="font-bold text-slate-700 block">Installed Electrical Fixtures to Inspect:</span>
          <div className="flex flex-wrap gap-1.5">
            {room.installedEquipment.map((eq, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Status Control */}
      <div className="pt-4 border-t border-slate-200">
        <AlertStatusControl
          currentStatus={alert.status}
          onChangeStatus={(newStatus) => updateAlertStatus(alert.id, newStatus)}
        />
      </div>

      {/* Link to room page */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => onNavigateToRoom(alert.roomId)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
        >
          <span>View all readings for {alert.roomName}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
