import { useMemo, useState } from 'react';
import { useRoomPulse } from '../context/RoomPulseContext';
import { EnergyAlert, AlertSeverity, AlertStatus } from '../types';

export function useAlerts() {
  const { alerts, updateAlertStatus, selectedAlertId, setSelectedAlertId } = useRoomPulse();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'time' | 'excess'>('severity');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = alert.roomName.toLowerCase().includes(q);
        const matchesId = alert.roomId.toLowerCase().includes(q);
        const matchesBuilding = alert.building.toLowerCase().includes(q);
        const matchesRule = alert.ruleTriggered.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesBuilding && !matchesRule) {
          return false;
        }
      }

      // Building filter
      if (selectedBuilding !== 'all' && alert.building !== selectedBuilding) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && alert.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'severity') {
        const weight: Record<AlertSeverity, number> = { high: 3, medium: 2, low: 1 };
        const diff = weight[b.severity] - weight[a.severity];
        if (diff !== 0) return diff;
        return b.excessKwh - a.excessKwh;
      } else if (sortBy === 'time') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'excess') {
        return b.excessKwh - a.excessKwh;
      }
      return 0;
    });
  }, [alerts, searchQuery, selectedBuilding, selectedSeverity, selectedStatus, sortBy]);

  const selectedAlert = useMemo(() => {
    if (!selectedAlertId) return undefined;
    return alerts.find((a) => a.id === selectedAlertId);
  }, [alerts, selectedAlertId]);

  return {
    alerts: filteredAlerts,
    totalCount: alerts.length,
    selectedAlert,
    selectedAlertId,
    setSelectedAlertId,
    searchQuery,
    setSearchQuery,
    selectedBuilding,
    setSelectedBuilding,
    selectedSeverity,
    setSelectedSeverity,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    updateAlertStatus,
  };
}
