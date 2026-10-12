import React, { useState } from 'react';
import { useRoomPulse } from '../context/RoomPulseContext';
import { DataUpload } from '../components/analysis/DataUpload';
import { AnalysisControls } from '../components/analysis/AnalysisControls';
import { AnalysisResults } from '../components/analysis/AnalysisResults';
import { ValidationResult, AnalysisSettings } from '../types';
import { DEFAULT_SETTINGS } from '../data/roomConfig';
import { LoadingState } from '../components/common/LoadingState';

export const AnalysisPage: React.FC = () => {
  const {
    intervals,
    alerts,
    summary,
    settings,
    isAnalyzing,
    triggerAnalysis,
    updateSettings,
    overrideIntervalOccupancy,
    importValidatedIntervals,
    navigateToAlert,
    navigateToRoom,
  } = useRoomPulse();

  const handleValidationComplete = (result: ValidationResult) => {
    if (result.isValid && result.validIntervals.length > 0) {
      importValidatedIntervals(result);
    }
  };

  const handleRunAnalysis = (updatedSettings: AnalysisSettings) => {
    updateSettings(updatedSettings);
    triggerAnalysis(undefined, updatedSettings);
  };

  const handleResetDefaults = () => {
    updateSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="space-y-6">
      {/* Dataset Ingestion */}
      <DataUpload
        onValidationComplete={handleValidationComplete}
        currentValidCount={intervals.length}
      />

      {/* Detection Parameters */}
      <AnalysisControls
        currentSettings={settings}
        isAnalyzing={isAnalyzing}
        onRunAnalysis={handleRunAnalysis}
        onResetDefaults={handleResetDefaults}
      />

      {/* Results View */}
      {isAnalyzing ? (
        <LoadingState
          label="Running Occupancy Cross-Referencing..."
          sublabel="Comparing actual meter energy draws against timetable scheduled bookings"
        />
      ) : (
        <AnalysisResults
          summary={summary}
          intervals={intervals}
          alerts={alerts}
          onOverrideOccupancy={overrideIntervalOccupancy}
          onNavigateToAlert={navigateToAlert}
          onNavigateToRoom={navigateToRoom}
        />
      )}
    </div>
  );
};
