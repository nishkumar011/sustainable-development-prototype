import React from 'react';
import { RoomAnalyticsSummary } from '../../types';
import { formatKwh, formatInr } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowUpRight, Building2 } from 'lucide-react';

interface RoomUsageTableProps {
  rooms: RoomAnalyticsSummary[];
  onSelectRoom: (roomId: string) => void;
}

export const RoomUsageTable: React.FC<RoomUsageTableProps> = ({ rooms, onSelectRoom }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Top Energy Consuming Rooms</h3>
          <p className="text-xs text-slate-500">Ranked by estimated excess consumption above baseline</p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {rooms.slice(0, 6).length} of {rooms.length} rooms
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">Room & Building</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3 text-right">Actual Load</th>
              <th className="py-3 px-3 text-right">Potential Excess</th>
              <th className="py-3 px-3 text-right">Cost Exposure</th>
              <th className="py-3 px-3 text-center">Alerts</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rooms.slice(0, 6).map((r) => (
              <tr
                key={r.roomId}
                className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                onClick={() => onSelectRoom(r.roomId)}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block">
                        {r.roomName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {r.building} • {r.floor}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                    {r.roomType}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right font-medium">
                  {formatKwh(r.totalActualKwh)}
                </td>
                <td className="py-3.5 px-3 text-right">
                  <span
                    className={`font-bold ${
                      r.totalExcessKwh > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}
                  >
                    {r.totalExcessKwh > 0 ? `+${formatKwh(r.totalExcessKwh)}` : '0.00 kWh'}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                  {formatInr(r.totalPotentialCostInr)}
                </td>
                <td className="py-3.5 px-3 text-center">
                  {r.alertsCount > 0 ? (
                    <StatusBadge
                      type="severity"
                      value={r.highestSeverity === 'none' ? 'low' : r.highestSeverity}
                      size="sm"
                    />
                  ) : (
                    <span className="text-slate-400 text-[11px]">Normal</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoom(r.roomId);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="View room detail"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
