import { EnergyAlert, RoomAnalyticsSummary } from '../types';
import { SAMPLE_CSV_CONTENT } from '../data/sampleData';

function downloadBlob(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportAlertsToCSV(alerts: EnergyAlert[]): void {
  const headers = [
    'Alert ID',
    'Room ID',
    'Room Name',
    'Building',
    'Timestamp',
    'Excess kWh',
    'Estimated Cost (INR)',
    'Severity',
    'Status',
    'Alert Type',
    'Rule Triggered',
    'Reason',
    'Recommended Action',
    'Data Source',
  ];

  const rows = alerts.map((a) => [
    escapeCsvField(a.id),
    escapeCsvField(a.roomId),
    escapeCsvField(a.roomName),
    escapeCsvField(a.building),
    escapeCsvField(a.timestamp),
    escapeCsvField(a.excessKwh.toFixed(2)),
    escapeCsvField(a.potentialCostInr.toFixed(2)),
    escapeCsvField(a.severity),
    escapeCsvField(a.status),
    escapeCsvField(a.type),
    escapeCsvField(a.ruleTriggered),
    escapeCsvField(a.reason),
    escapeCsvField(a.recommendedAction),
    escapeCsvField(a.dataSource),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadBlob(csvContent, `roompulse-alerts-${dateStr}.csv`);
}

export function exportRoomSummariesToCSV(rooms: RoomAnalyticsSummary[]): void {
  const headers = [
    'Room ID',
    'Room Name',
    'Building',
    'Floor',
    'Room Type',
    'Total Actual kWh',
    'Total Expected kWh',
    'Total Excess kWh',
    'Potential Cost Impact (INR)',
    'Intervals Analyzed',
    'Alert Count',
    'Highest Severity',
    'Latest Occupancy',
    'Latest Reading kWh',
  ];

  const rows = rooms.map((r) => [
    escapeCsvField(r.roomId),
    escapeCsvField(r.roomName),
    escapeCsvField(r.building),
    escapeCsvField(r.floor),
    escapeCsvField(r.roomType),
    escapeCsvField(r.totalActualKwh.toFixed(2)),
    escapeCsvField(r.totalExpectedKwh.toFixed(2)),
    escapeCsvField(r.totalExcessKwh.toFixed(2)),
    escapeCsvField(r.totalPotentialCostInr.toFixed(2)),
    escapeCsvField(r.intervalsCount),
    escapeCsvField(r.alertsCount),
    escapeCsvField(r.highestSeverity),
    escapeCsvField(r.latestOccupancy),
    escapeCsvField(r.latestActualKwh.toFixed(2)),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadBlob(csvContent, `roompulse-room-analysis-${dateStr}.csv`);
}

export function exportSampleTemplateCSV(): void {
  downloadBlob(SAMPLE_CSV_CONTENT, 'roompulse-sample-template.csv');
}
