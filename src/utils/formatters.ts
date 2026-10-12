import { AlertSeverity, AlertStatus, OccupancyStatus } from '../types';

export function formatInr(val: number): string {
  if (isNaN(val)) return '₹0.00';
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatKwh(val: number, decimals = 2): string {
  if (isNaN(val)) return '0.00 kWh';
  return `${val.toFixed(decimals)} kWh`;
}

export function getSeverityBadgeClass(severity: AlertSeverity): string {
  switch (severity) {
    case 'high':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
    case 'low':
      return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
  }
}

export function getStatusBadgeClass(status: AlertStatus): string {
  switch (status) {
    case 'new':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'investigating':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'acknowledged':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getOccupancyBadgeClass(occ: OccupancyStatus): string {
  switch (occ) {
    case 'occupied':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'empty':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'unknown':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}
