import React, { useState } from 'react';
import { Room, RoomAnalyticsSummary } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatKwh, formatInr } from '../../utils/formatters';
import { Building2, Search, ArrowRight, Zap, Users, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface RoomListProps {
  rooms: Room[];
  roomSummaries: RoomAnalyticsSummary[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  roomSummaries,
  selectedRoomId,
  onSelectRoom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Map summary by room ID
  const summaryMap = new Map<string, RoomAnalyticsSummary>();
  roomSummaries.forEach((s) => summaryMap.set(s.roomId, s));

  const filteredRooms = rooms.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      const matchBldg = r.building.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchBldg) return false;
    }

    if (buildingFilter !== 'all' && r.building !== buildingFilter) {
      return false;
    }

    if (typeFilter !== 'all' && r.roomType !== typeFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search campus room, lab, or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-200 bg-white py-2 px-3 focus:outline-none"
            >
              <option value="all">All Buildings</option>
              <option value="Aryabhata Hall">Aryabhata Hall</option>
              <option value="Ramanujan Tower">Ramanujan Tower</option>
              <option value="Tagore Humanities">Tagore Humanities</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-200 bg-white py-2 px-3 focus:outline-none"
            >
              <option value="all">All Room Types</option>
              <option value="Classroom">Classroom</option>
              <option value="Computer Lab">Computer Lab</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Faculty Room">Faculty Room</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Research Lab">Research Lab</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Campus Spaces Match Filter"
          description="Adjust your search query or reset building filters to browse all 12 monitored spaces."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const summary = summaryMap.get(room.id);
            const isSelected = selectedRoomId === room.id;

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 font-mono block">
                        {room.id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {room.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium shrink-0">
                      {room.roomType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.building} • {room.floor}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Idle Baseline
                      </span>
                      <span className="font-bold text-slate-700">
                        {formatKwh(room.expectedBaselineKwh)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Capacity
                      </span>
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {room.capacity} seats
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Observed Draw
                      </span>
                      <span className="font-bold text-slate-900">
                        {summary ? formatKwh(summary.totalActualKwh) : '0.00 kWh'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Potential Excess
                      </span>
                      <span
                        className={`font-bold ${
                          summary && summary.totalExcessKwh > 0 ? 'text-rose-600' : 'text-slate-500'
                        }`}
                      >
                        {summary && summary.totalExcessKwh > 0
                          ? `+${formatKwh(summary.totalExcessKwh)}`
                          : '0.00 kWh'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    {summary && summary.alertsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        {summary.alertsCount} Alert{summary.alertsCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Baseline Stable
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
