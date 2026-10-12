import { useMemo } from 'react';
import { useRoomPulse } from '../context/RoomPulseContext';
import { Room, RoomInterval } from '../types';

export function useRoomData(roomId?: string) {
  const { rooms, intervals, summary, navigateToRoom } = useRoomPulse();

  const selectedRoom = useMemo(() => {
    if (!roomId) return undefined;
    return rooms.find((r) => r.id === roomId);
  }, [rooms, roomId]);

  const roomIntervals = useMemo(() => {
    if (!roomId) return [];
    return intervals
      .filter((i) => i.roomId === roomId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [intervals, roomId]);

  const roomSummary = useMemo(() => {
    if (!roomId) return undefined;
    return summary.topRoomsByExcess.find((r) => r.roomId === roomId);
  }, [summary, roomId]);

  return {
    rooms,
    selectedRoom,
    roomIntervals,
    roomSummary,
    navigateToRoom,
  };
}
