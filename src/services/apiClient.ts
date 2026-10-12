import {
  Room,
  RoomInterval,
  EnergyAlert,
  AnalysisSettings,
  AlertStatus,
} from '../types';
import { runDetectionEngine } from '../engine/detection';
import { INITIAL_ROOMS } from '../data/roomConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const ApiClient = {
  async isBackendAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1200) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchRooms(): Promise<Room[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local config
    }
    return INITIAL_ROOMS;
  },

  async analyzeIntervals(
    intervals: RoomInterval[],
    settings: AnalysisSettings,
    rooms: Room[]
  ): Promise<{ alerts: EnergyAlert[]; totalExcessKwh: number; totalPotentialCostInr: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervals, settings }),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          alerts: data.alerts,
          totalExcessKwh: data.totalExcessKwh,
          totalPotentialCostInr: data.totalPotentialCostInr,
        };
      }
    } catch {
      // Fallback to local engine seamlessly
    }

    const localDetection = runDetectionEngine(intervals, rooms, settings);
    const totalExcess = localDetection.alerts.reduce((acc, a) => acc + a.excessKwh, 0);
    const totalCost = localDetection.alerts.reduce((acc, a) => acc + a.potentialCostInr, 0);

    return {
      alerts: localDetection.alerts,
      totalExcessKwh: Number(totalExcess.toFixed(2)),
      totalPotentialCostInr: Number(totalCost.toFixed(2)),
    };
  },

  async updateAlertStatus(alertId: string, status: AlertStatus): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
