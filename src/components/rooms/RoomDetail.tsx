import React from 'react';
import { Room, RoomInterval, EnergyAlert, OccupancyStatus } from '../../types';
import { formatKwh, formatInr } from '../../utils/formatters';
import { formatTimestamp, formatTimeOnly } from '../../utils/dates';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  Building2,
  Users,
  Gauge,
  Zap,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useRoomPulse } from '../../context/RoomPulseContext';

interface RoomDetailProps {
  room: Room;
  intervals: RoomInterval[];
  alerts: EnergyAlert[];
  onClose: () => void;
  onSelectAlert: (alertId: string) => void;
}

export const RoomDetail: React.FC<RoomDetailProps> = ({
  room,
  intervals,
  alerts,
  onClose,
  onSelectAlert,
}) => {
  const { overrideIntervalOccupancy } = useRoomPulse();

  const totalActual = intervals.reduce((acc, i) => acc + i.actualKwh, 0);
  const totalExpected = intervals.reduce((acc, i) => acc + i.expectedKwh, 0);
  const totalExcess = Math.max(0, totalActual - totalExpected);

  const roomAlerts = alerts.filter((a) => a.roomId === room.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-slate-400 font-mono">{room.id}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {room.roomType}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{room.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {room.building} • {room.floor} • Capacity: {room.capacity} seats
            </span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Baseline Reference
          </span>
          <span className="text-xl font-bold text-slate-800 block mt-0.5">
            {formatKwh(room.expectedBaselineKwh)}
          </span>
          <span className="text-[10px] text-slate-500">Unoccupied idle rate</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Observed Energy
          </span>
          <span className="text-xl font-bold text-slate-900 block mt-0.5">
            {formatKwh(totalActual)}
          </span>
          <span className="text-[10px] text-slate-500">{intervals.length} intervals total</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Potential Excess
          </span>
          <span className="text-xl font-black text-rose-600 block mt-0.5">
            {totalExcess > 0 ? `+${formatKwh(totalExcess)}` : '0.00 kWh'}
          </span>
          <span className="text-[10px] text-slate-500">Above schedule baselines</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Flagged Alerts
          </span>
          <span className="text-xl font-black text-slate-900 block mt-0.5">
            {roomAlerts.length}
          </span>
          <span className="text-[10px] text-slate-500">Active anomalies</span>
        </div>
      </div>

      {/* Installed Equipment */}
      {room.installedEquipment && room.installedEquipment.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Installed Electrical Fixtures</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {room.installedEquipment.map((eq, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-xs shadow-2xs"
              >
                {eq}
              </span>
            ))}
          </div>
          {room.notes && (
            <p className="text-xs text-slate-500 italic pt-1">{room.notes}</p>
          )}
        </div>
      )}

      {/* Room Alerts Section if any */}
      {roomAlerts.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Active Alerts for this Space ({roomAlerts.length})</span>
          </h3>
          <div className="space-y-2">
            {roomAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge type="severity" value={alert.severity} size="sm" />
                  <span className="font-bold text-slate-900">{formatTimeOnly(alert.timestamp)}</span>
                  <span className="text-slate-600 line-clamp-1">{alert.reason}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-rose-600">+{formatKwh(alert.excessKwh)}</span>
                  <span className="font-bold text-slate-900">{formatInr(alert.potentialCostInr)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intervals Ledger for this Room */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">Recorded Energy Intervals</h3>
        <div className="rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Occupancy (Override)</th>
                <th className="py-2.5 px-3 text-right">Actual</th>
                <th className="py-2.5 px-3 text-right">Baseline</th>
                <th className="py-2.5 px-3 text-right">Excess</th>
                <th className="py-2.5 px-3">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {intervals.map((inv) => {
                const excess = Math.max(0, inv.actualKwh - inv.expectedKwh);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {formatTimeOnly(inv.timestamp)}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={inv.expectedOccupancy}
                        onChange={(e) =>
                          overrideIntervalOccupancy(
                            inv.id,
                            e.target.value as OccupancyStatus
                          )
                        }
                        className="text-[11px] font-semibold rounded border border-slate-200 bg-white py-0.5 px-1.5 focus:outline-none"
                      >
                        <option value="empty">Empty</option>
                        <option value="occupied">Occupied</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {formatKwh(inv.actualKwh)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {formatKwh(inv.expectedKwh)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${excess > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {excess > 0 ? `+${formatKwh(excess)}` : '0.00'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge type="source" value={inv.dataSource} size="sm" />
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
