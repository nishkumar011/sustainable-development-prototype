/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoomPulseProvider, useRoomPulse } from './context/RoomPulseContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { AlertsPage } from './pages/AlertsPage';
import { RoomsPage } from './pages/RoomsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useRoomPulse();

  return (
    <AppShell>
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'analysis' && <AnalysisPage />}
      {activeTab === 'alerts' && <AlertsPage />}
      {activeTab === 'rooms' && <RoomsPage />}
      {activeTab === 'settings' && <SettingsPage />}
    </AppShell>
  );
};

export default function App() {
  return (
    <RoomPulseProvider>
      <AppContent />
    </RoomPulseProvider>
  );
}
