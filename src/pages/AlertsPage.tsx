import React from 'react';
import { useRoomPulse } from '../context/RoomPulseContext';
import { useAlerts } from '../hooks/useAlerts';
import { AlertList } from '../components/alerts/AlertList';
import { AlertDetail } from '../components/alerts/AlertDetail';

export const AlertsPage: React.FC = () => {
  const { navigateToRoom } = useRoomPulse();
  const {
    alerts,
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
  } = useAlerts();

  return (
    <div className="space-y-6">
      {/* If an alert is selected, show split view on desktop or detail on mobile */}
      {selectedAlert ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <AlertList
              alerts={alerts}
              selectedAlertId={selectedAlertId}
              onSelectAlert={(id) => setSelectedAlertId(id)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBuilding={selectedBuilding}
              onBuildingChange={setSelectedBuilding}
              selectedSeverity={selectedSeverity}
              onSeverityChange={setSelectedSeverity}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 sticky top-20">
            <AlertDetail
              alert={selectedAlert}
              onClose={() => setSelectedAlertId(null)}
              onNavigateToRoom={(roomId) => navigateToRoom(roomId)}
            />
          </div>
        </div>
      ) : (
        <AlertList
          alerts={alerts}
          selectedAlertId={selectedAlertId}
          onSelectAlert={(id) => setSelectedAlertId(id)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBuilding={selectedBuilding}
          onBuildingChange={setSelectedBuilding}
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}
    </div>
  );
};
