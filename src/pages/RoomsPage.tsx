import React from 'react';
import { useRoomPulse } from '../context/RoomPulseContext';
import { RoomList } from '../components/rooms/RoomList';
import { RoomDetail } from '../components/rooms/RoomDetail';

export const RoomsPage: React.FC = () => {
  const {
    rooms,
    summary,
    intervals,
    alerts,
    selectedRoomId,
    setSelectedRoomId,
    navigateToAlert,
  } = useRoomPulse();

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedRoomIntervals = intervals.filter((i) => i.roomId === selectedRoomId);

  return (
    <div className="space-y-6">
      {selectedRoom ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <RoomList
              rooms={rooms}
              roomSummaries={summary.topRoomsByExcess}
              selectedRoomId={selectedRoomId}
              onSelectRoom={(id) => setSelectedRoomId(id)}
            />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 sticky top-20">
            <RoomDetail
              room={selectedRoom}
              intervals={selectedRoomIntervals}
              alerts={alerts}
              onClose={() => setSelectedRoomId(null)}
              onSelectAlert={(alertId) => navigateToAlert(alertId)}
            />
          </div>
        </div>
      ) : (
        <RoomList
          rooms={rooms}
          roomSummaries={summary.topRoomsByExcess}
          selectedRoomId={selectedRoomId}
          onSelectRoom={(id) => setSelectedRoomId(id)}
        />
      )}
    </div>
  );
};
