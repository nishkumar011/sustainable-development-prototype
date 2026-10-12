import {
  RoomInterval,
  AnalysisSettings,
  AlertStatus,
  Room,
} from '../types';
import { INITIAL_ROOMS, DEFAULT_SETTINGS } from '../data/roomConfig';
import { SAMPLE_ROOM_INTERVALS } from '../data/sampleData';

const STORAGE_KEYS = {
  INTERVALS: 'roompulse_intervals_v1',
  ROOMS: 'roompulse_rooms_v1',
  SETTINGS: 'roompulse_settings_v1',
  ALERT_STATUSES: 'roompulse_alert_statuses_v1',
  LAST_ANALYSIS_DATE: 'roompulse_last_analysis_v1',
};

export const StorageService = {
  loadSettings(): AnalysisSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        tariffPerKwh: typeof parsed.tariffPerKwh === 'number' ? parsed.tariffPerKwh : DEFAULT_SETTINGS.tariffPerKwh,
        emptyRoomThresholdKwh: typeof parsed.emptyRoomThresholdKwh === 'number' ? parsed.emptyRoomThresholdKwh : DEFAULT_SETTINGS.emptyRoomThresholdKwh,
        occupiedRoomThresholdKwh: typeof parsed.occupiedRoomThresholdKwh === 'number' ? parsed.occupiedRoomThresholdKwh : DEFAULT_SETTINGS.occupiedRoomThresholdKwh,
        persistenceIntervals: typeof parsed.persistenceIntervals === 'number' ? parsed.persistenceIntervals : DEFAULT_SETTINGS.persistenceIntervals,
        defaultIntervalMinutes: typeof parsed.defaultIntervalMinutes === 'number' ? parsed.defaultIntervalMinutes : DEFAULT_SETTINGS.defaultIntervalMinutes,
      };
    } catch (e) {
      console.warn('Failed to parse saved settings, falling back to defaults:', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AnalysisSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  },

  loadRooms(): Room[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (!raw) return INITIAL_ROOMS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  },

  saveRooms(rooms: Room[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save rooms to localStorage:', e);
    }
  },

  loadIntervals(): RoomInterval[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INTERVALS);
      if (!raw) return SAMPLE_ROOM_INTERVALS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return SAMPLE_ROOM_INTERVALS;
    } catch {
      return SAMPLE_ROOM_INTERVALS;
    }
  },

  saveIntervals(intervals: RoomInterval[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INTERVALS, JSON.stringify(intervals));
    } catch (e) {
      console.error('Failed to save intervals to localStorage:', e);
    }
  },

  loadAlertStatuses(): Record<string, AlertStatus> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ALERT_STATUSES);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  saveAlertStatus(alertId: string, status: AlertStatus): void {
    try {
      const current = this.loadAlertStatuses();
      current[alertId] = status;
      localStorage.setItem(STORAGE_KEYS.ALERT_STATUSES, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save alert status:', e);
    }
  },

  resetAllToDemoDefaults(): {
    rooms: Room[];
    intervals: RoomInterval[];
    settings: AnalysisSettings;
  } {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.ROOMS);
      localStorage.removeItem(STORAGE_KEYS.INTERVALS);
      localStorage.removeItem(STORAGE_KEYS.ALERT_STATUSES);
      localStorage.removeItem(STORAGE_KEYS.LAST_ANALYSIS_DATE);
    } catch (e) {
      console.error('Failed to reset storage:', e);
    }
    return {
      rooms: INITIAL_ROOMS,
      intervals: SAMPLE_ROOM_INTERVALS,
      settings: DEFAULT_SETTINGS,
    };
  },
};
