import {
  Room,
  RoomInterval,
  EnergyAlert,
  AnalysisSettings,
  AnalysisSummary,
  ValidationResult,
  AlertStatus,
} from '../types';
import { StorageService } from './storageService';
import { validateIntervals } from '../engine/validation';
import { runDetectionEngine } from '../engine/detection';
import { computeAnalyticsSummary } from '../engine/analytics';
import { parseCSV } from '../utils/csvParser';
import { SAMPLE_ROOM_INTERVALS } from '../data/sampleData';

export interface AppState {
  rooms: Room[];
  intervals: RoomInterval[];
  settings: AnalysisSettings;
  alerts: EnergyAlert[];
  summary: AnalysisSummary;
  validationWarningsCount: number;
  lastAnalysisTimestamp: string;
}

export const RoomPulseService = {
  getInitialState(): AppState {
    const settings = StorageService.loadSettings();
    const rooms = StorageService.loadRooms();
    const intervals = StorageService.loadIntervals();
    const savedStatuses = StorageService.loadAlertStatuses();

    // Map saved statuses
    const statusMap = new Map<string, AlertStatus>(Object.entries(savedStatuses));

    const detection = runDetectionEngine(intervals, rooms, settings, statusMap);
    const summary = computeAnalyticsSummary(intervals, detection.alerts, rooms, 0);

    return {
      rooms,
      intervals,
      settings,
      alerts: detection.alerts,
      summary,
      validationWarningsCount: 0,
      lastAnalysisTimestamp: new Date().toISOString(),
    };
  },

  runAnalysis(
    intervals: RoomInterval[],
    rooms: Room[],
    settings: AnalysisSettings,
    warningsCount = 0
  ): { alerts: EnergyAlert[]; summary: AnalysisSummary } {
    const savedStatuses = StorageService.loadAlertStatuses();
    const statusMap = new Map<string, AlertStatus>(Object.entries(savedStatuses));

    const detection = runDetectionEngine(intervals, rooms, settings, statusMap);
    const summary = computeAnalyticsSummary(intervals, detection.alerts, rooms, warningsCount);

    return {
      alerts: detection.alerts,
      summary,
    };
  },

  importCSV(csvText: string): ValidationResult {
    const rawRows = parseCSV(csvText);
    return validateIntervals(rawRows);
  },

  updateAlertStatus(alertId: string, newStatus: AlertStatus): void {
    StorageService.saveAlertStatus(alertId, newStatus);
  },

  updateIntervalOccupancy(
    intervalId: string,
    newOccupancy: 'occupied' | 'empty' | 'unknown',
    currentIntervals: RoomInterval[]
  ): RoomInterval[] {
    const updated = currentIntervals.map((inv) => {
      if (inv.id === intervalId) {
        return {
          ...inv,
          expectedOccupancy: newOccupancy,
          occupancySource: 'manual' as const,
        };
      }
      return inv;
    });
    StorageService.saveIntervals(updated);
    return updated;
  },

  resetToDemo(): AppState {
    const { rooms, intervals, settings } = StorageService.resetAllToDemoDefaults();
    const detection = runDetectionEngine(intervals, rooms, settings);
    const summary = computeAnalyticsSummary(intervals, detection.alerts, rooms, 0);

    return {
      rooms,
      intervals,
      settings,
      alerts: detection.alerts,
      summary,
      validationWarningsCount: 0,
      lastAnalysisTimestamp: new Date().toISOString(),
    };
  },

  loadSampleDataset(): RoomInterval[] {
    StorageService.saveIntervals(SAMPLE_ROOM_INTERVALS);
    return SAMPLE_ROOM_INTERVALS;
  },
};
