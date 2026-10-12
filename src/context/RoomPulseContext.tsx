import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Room,
  RoomInterval,
  EnergyAlert,
  AnalysisSettings,
  AnalysisSummary,
  ActiveNavTab,
  AlertStatus,
  ValidationResult,
  OccupancyStatus,
} from '../types';
import { RoomPulseService } from '../services/roomPulseService';
import { StorageService } from '../services/storageService';
import { SAMPLE_ROOM_INTERVALS } from '../data/sampleData';

interface RoomPulseContextType {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  rooms: Room[];
  intervals: RoomInterval[];
  settings: AnalysisSettings;
  alerts: EnergyAlert[];
  summary: AnalysisSummary;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  isAnalyzing: boolean;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  setToastMessage: (msg: { text: string; type: 'success' | 'info' | 'error' } | null) => void;

  // Actions
  triggerAnalysis: (customIntervals?: RoomInterval[], customSettings?: AnalysisSettings, warningsCount?: number) => void;
  updateSettings: (newSettings: AnalysisSettings) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  overrideIntervalOccupancy: (intervalId: string, newOccupancy: OccupancyStatus) => void;
  loadSampleData: () => void;
  importValidatedIntervals: (result: ValidationResult) => void;
  resetAllDemoData: () => void;
  navigateToAlert: (alertId: string) => void;
  navigateToRoom: (roomId: string) => void;
}

const RoomPulseContext = createContext<RoomPulseContextType | undefined>(undefined);

export const RoomPulseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [intervals, setIntervals] = useState<RoomInterval[]>([]);
  const [settings, setSettings] = useState<AnalysisSettings>(StorageService.loadSettings());
  const [alerts, setAlerts] = useState<EnergyAlert[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Initial load
  useEffect(() => {
    const initial = RoomPulseService.getInitialState();
    setRooms(initial.rooms);
    setIntervals(initial.intervals);
    setSettings(initial.settings);
    setAlerts(initial.alerts);
    setSummary(initial.summary);
  }, []);

  const triggerAnalysis = useCallback(
    (customIntervals?: RoomInterval[], customSettings?: AnalysisSettings, warningsCount = 0) => {
      setIsAnalyzing(true);
      const targetIntervals = customIntervals || intervals;
      const targetSettings = customSettings || settings;

      // Small async tick for UI responsiveness
      setTimeout(() => {
        const { alerts: newAlerts, summary: newSummary } = RoomPulseService.runAnalysis(
          targetIntervals,
          rooms,
          targetSettings,
          warningsCount
        );
        setAlerts(newAlerts);
        setSummary(newSummary);
        if (customIntervals) {
          setIntervals(customIntervals);
          StorageService.saveIntervals(customIntervals);
        }
        if (customSettings) {
          setSettings(customSettings);
          StorageService.saveSettings(customSettings);
        }
        setIsAnalyzing(false);
        setToastMessage({
          text: `Analysis complete: ${targetIntervals.length} intervals checked, ${newAlerts.length} issues identified.`,
          type: 'success',
        });
      }, 350);
    },
    [intervals, settings, rooms]
  );

  const updateSettings = useCallback(
    (newSettings: AnalysisSettings) => {
      setSettings(newSettings);
      StorageService.saveSettings(newSettings);
      // Re-run analysis with updated settings immediately
      const { alerts: newAlerts, summary: newSummary } = RoomPulseService.runAnalysis(
        intervals,
        rooms,
        newSettings
      );
      setAlerts(newAlerts);
      setSummary(newSummary);
      setToastMessage({ text: 'Settings updated and analysis recomputed.', type: 'success' });
    },
    [intervals, rooms]
  );

  const updateAlertStatus = useCallback((alertId: string, status: AlertStatus) => {
    RoomPulseService.updateAlertStatus(alertId, status);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );
    // Recalculate summary alert counts
    setSummary((prev) => {
      if (!prev) return null;
      const updatedAlerts = alerts.map((a) =>
        a.id === alertId ? { ...a, status, updatedAt: new Date().toISOString() } : a
      );
      return RoomPulseService.runAnalysis(intervals, rooms, settings).summary;
    });
    setToastMessage({ text: `Alert status updated to "${status}".`, type: 'info' });
  }, [alerts, intervals, rooms, settings]);

  const overrideIntervalOccupancy = useCallback(
    (intervalId: string, newOccupancy: OccupancyStatus) => {
      const updatedIntervals = RoomPulseService.updateIntervalOccupancy(
        intervalId,
        newOccupancy,
        intervals
      );
      setIntervals(updatedIntervals);
      const { alerts: newAlerts, summary: newSummary } = RoomPulseService.runAnalysis(
        updatedIntervals,
        rooms,
        settings
      );
      setAlerts(newAlerts);
      setSummary(newSummary);
      setToastMessage({ text: `Occupancy manually set to "${newOccupancy}". Engine re-evaluated.`, type: 'info' });
    },
    [intervals, rooms, settings]
  );

  const loadSampleData = useCallback(() => {
    const sample = RoomPulseService.loadSampleDataset();
    setIntervals(sample);
    const { alerts: newAlerts, summary: newSummary } = RoomPulseService.runAnalysis(
      sample,
      rooms,
      settings
    );
    setAlerts(newAlerts);
    setSummary(newSummary);
    setToastMessage({ text: 'Standard campus sample dataset loaded successfully.', type: 'success' });
  }, [rooms, settings]);

  const importValidatedIntervals = useCallback(
    (result: ValidationResult) => {
      setIntervals(result.validIntervals);
      StorageService.saveIntervals(result.validIntervals);
      const { alerts: newAlerts, summary: newSummary } = RoomPulseService.runAnalysis(
        result.validIntervals,
        rooms,
        settings,
        result.warnings.length
      );
      setAlerts(newAlerts);
      setSummary(newSummary);
      setToastMessage({
        text: `Imported ${result.validIntervals.length} valid intervals with ${result.warnings.length} warnings.`,
        type: 'success',
      });
    },
    [rooms, settings]
  );

  const resetAllDemoData = useCallback(() => {
    const resetState = RoomPulseService.resetToDemo();
    setRooms(resetState.rooms);
    setIntervals(resetState.intervals);
    setSettings(resetState.settings);
    setAlerts(resetState.alerts);
    setSummary(resetState.summary);
    setSelectedAlertId(null);
    setSelectedRoomId(null);
    setToastMessage({ text: 'All demo data, alert statuses, and settings restored to pristine defaults.', type: 'success' });
  }, []);

  const navigateToAlert = useCallback((alertId: string) => {
    setSelectedAlertId(alertId);
    setActiveTab('alerts');
  }, []);

  const navigateToRoom = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('rooms');
  }, []);

  // Fallback placeholder summary if loading
  const effectiveSummary = summary || {
    roomsAnalyzedCount: 0,
    validIntervalsCount: 0,
    dataQualityWarningsCount: 0,
    potentialWastageAlertsCount: 0,
    elevatedUsageAlertsCount: 0,
    reviewWarningsCount: 0,
    totalActualKwh: 0,
    totalExpectedKwh: 0,
    totalExcessKwh: 0,
    totalPotentialCostInr: 0,
    alertsBySeverity: { high: 0, medium: 0, low: 0 },
    alertsByStatus: { new: 0, acknowledged: 0, investigating: 0, resolved: 0 },
    topRoomsByExcess: [],
    trendSeries: [],
    dataSourceDistribution: { simulated: 0, uploaded: 0, measured: 0 },
    generatedAt: new Date().toISOString(),
  };

  return (
    <RoomPulseContext.Provider
      value={{
        activeTab,
        setActiveTab,
        rooms,
        intervals,
        settings,
        alerts,
        summary: effectiveSummary,
        selectedAlertId,
        setSelectedAlertId,
        selectedRoomId,
        setSelectedRoomId,
        isAnalyzing,
        toastMessage,
        setToastMessage,
        triggerAnalysis,
        updateSettings,
        updateAlertStatus,
        overrideIntervalOccupancy,
        loadSampleData,
        importValidatedIntervals,
        resetAllDemoData,
        navigateToAlert,
        navigateToRoom,
      }}
    >
      {children}
    </RoomPulseContext.Provider>
  );
};

export function useRoomPulse() {
  const context = useContext(RoomPulseContext);
  if (!context) {
    throw new Error('useRoomPulse must be used within a RoomPulseProvider');
  }
  return context;
}
