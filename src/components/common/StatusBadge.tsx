import React from 'react';
import { AlertSeverity, AlertStatus, OccupancyStatus } from '../../types';
import { getSeverityBadgeClass, getStatusBadgeClass, getOccupancyBadgeClass } from '../../utils/formatters';

interface StatusBadgeProps {
  type: 'severity' | 'status' | 'occupancy' | 'source';
  value: AlertSeverity | AlertStatus | OccupancyStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';
  let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let displayValue = String(value);

  if (type === 'severity') {
    badgeClass = getSeverityBadgeClass(value as AlertSeverity);
    displayValue = value === 'high' ? 'High' : value === 'medium' ? 'Medium' : 'Low';
  } else if (type === 'status') {
    badgeClass = getStatusBadgeClass(value as AlertStatus);
    displayValue = value === 'resolved' ? 'Fixed' : value === 'investigating' ? 'Checking' : value === 'acknowledged' ? 'Seen' : 'New';
  } else if (type === 'occupancy') {
    badgeClass = getOccupancyBadgeClass(value as OccupancyStatus);
    displayValue = value === 'occupied' ? 'Occupied' : value === 'empty' ? 'Empty' : 'Unknown';
  } else if (type === 'source') {
    if (value === 'simulated') {
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
      displayValue = 'Demo Data';
    } else if (value === 'uploaded') {
      badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      displayValue = 'Uploaded CSV';
    } else {
      badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      displayValue = 'Live Meter';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${badgeClass} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {displayValue}
    </span>
  );
};
