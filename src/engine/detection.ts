import {
  RoomInterval,
  EnergyAlert,
  AnalysisSettings,
  Room,
  AlertSeverity,
  AlertType,
  AlertStatus,
} from '../types';
import { calculateExcessEnergy, calculatePotentialCost, formatKwh, formatInr } from './calculations';

export interface DetectionResult {
  alerts: EnergyAlert[];
  analyzedIntervalsCount: number;
}

export function runDetectionEngine(
  intervals: RoomInterval[],
  rooms: Room[],
  settings: AnalysisSettings,
  existingAlertsMap: Map<string, AlertStatus> = new Map()
): DetectionResult {
  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  // Sort intervals chronologically per room for consecutive persistence evaluation
  const intervalsByRoom = new Map<string, RoomInterval[]>();
  intervals.forEach((interval) => {
    if (!intervalsByRoom.has(interval.roomId)) {
      intervalsByRoom.set(interval.roomId, []);
    }
    intervalsByRoom.get(interval.roomId)!.push(interval);
  });

  const alerts: EnergyAlert[] = [];

  intervalsByRoom.forEach((roomIntervals, roomId) => {
    // Sort ascending by timestamp
    roomIntervals.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const roomInfo = roomMap.get(roomId);
    const roomName = roomInfo?.name || roomIntervals[0]?.roomName || `Room ${roomId}`;
    const building = roomInfo?.building || roomIntervals[0]?.building || 'Main Campus';

    // Track consecutive breach count for persistence rule
    let consecutiveEmptyBreaches = 0;
    let consecutiveOccupiedBreaches = 0;

    roomIntervals.forEach((interval, idx) => {
      const excessKwh = calculateExcessEnergy(interval.actualKwh, interval.expectedKwh);
      const potentialCostInr = calculatePotentialCost(excessKwh, settings.tariffPerKwh);
      const timestampFormatted = new Date(interval.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateFormatted = new Date(interval.timestamp).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });

      // --- Rule 1: Empty Room Wastage ---
      if (interval.expectedOccupancy === 'empty') {
        if (excessKwh > settings.emptyRoomThresholdKwh) {
          consecutiveEmptyBreaches += 1;
          const isPersistent = consecutiveEmptyBreaches >= settings.persistenceIntervals;

          // Severity calculation
          let severity: AlertSeverity = 'low';
          if (isPersistent || excessKwh >= settings.emptyRoomThresholdKwh * 3 || excessKwh >= 2.0) {
            severity = 'high';
          } else if (excessKwh >= settings.emptyRoomThresholdKwh * 1.5) {
            severity = 'medium';
          }

          const alertId = `alert-${roomId}-${interval.timestamp}-wastage`;
          const existingStatus = existingAlertsMap.get(alertId) || 'new';

          const evidence: string[] = [
            `Status: Room is scheduled to be EMPTY (${interval.occupancySource})`,
            `Power used: ${formatKwh(interval.actualKwh)} | Normal idle baseline: ${formatKwh(interval.expectedKwh)}`,
            `Wasted energy: ${formatKwh(excessKwh)} above threshold`,
            `Estimated cost loss: ${formatInr(potentialCostInr)} (at ₹${settings.tariffPerKwh}/kWh)`,
            isPersistent ? `⚠️ Notice: Power has been left on for multiple consecutive hours` : `Single hour occurrence`,
          ];

          const reason = isPersistent
            ? `${roomName} in ${building} has been empty for consecutive hours, but equipment is still running and drawing ${formatKwh(interval.actualKwh)}.`
            : `${roomName} in ${building} is scheduled to be empty, but is drawing ${formatKwh(interval.actualKwh)} instead of idling at ${formatKwh(interval.expectedKwh)}.`;

          const recommendedAction = isPersistent
            ? `Urgent: Turn off high-power equipment (ACs, projectors, or computers) left running in ${roomName}.`
            : `Inspect ${roomName} switches and ensure lights/fans were turned off after class.`;

          alerts.push({
            id: alertId,
            roomId,
            roomName,
            building,
            intervalId: interval.id,
            timestamp: interval.timestamp,
            excessKwh,
            potentialCostInr,
            severity,
            status: existingStatus,
            type: 'potential_wastage',
            ruleTriggered: isPersistent ? 'Persistent Empty Room Waste' : 'Power Left On in Empty Room',
            reason,
            recommendedAction,
            evidence,
            dataSource: interval.dataSource,
            createdAt: interval.timestamp,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Reset consecutive counter if within normal baseline
          consecutiveEmptyBreaches = 0;
        }
      }

      // --- Rule 2: Occupied Room Elevated Usage Review ---
      else if (interval.expectedOccupancy === 'occupied') {
        if (excessKwh > settings.occupiedRoomThresholdKwh) {
          consecutiveOccupiedBreaches += 1;
          const isPersistent = consecutiveOccupiedBreaches >= settings.persistenceIntervals;

          let severity: AlertSeverity = 'medium';
          if (excessKwh >= settings.occupiedRoomThresholdKwh * 2 || isPersistent) {
            severity = 'high';
          }

          const alertId = `alert-${roomId}-${interval.timestamp}-elevated`;
          const existingStatus = existingAlertsMap.get(alertId) || 'new';

          const evidence: string[] = [
            `Status: Room is in use for scheduled class (${interval.occupancySource})`,
            `Power used: ${formatKwh(interval.actualKwh)} vs typical class load: ${formatKwh(interval.expectedKwh)}`,
            `Higher by: ${formatKwh(excessKwh)} above expected class usage`,
            `Estimated cost difference: ${formatInr(potentialCostInr)}`,
          ];

          const reason = `${roomName} was in use for class, but drew ${formatKwh(interval.actualKwh)} (${formatKwh(excessKwh)} higher than standard class load).`;

          const recommendedAction = `Verify if extra equipment (stage lighting, multiple heaters, or laboratory apparatus) was running.`;

          alerts.push({
            id: alertId,
            roomId,
            roomName,
            building,
            intervalId: interval.id,
            timestamp: interval.timestamp,
            excessKwh,
            potentialCostInr,
            severity,
            status: existingStatus,
            type: 'elevated_usage',
            ruleTriggered: 'High Usage During Class',
            reason,
            recommendedAction,
            evidence,
            dataSource: interval.dataSource,
            createdAt: interval.timestamp,
            updatedAt: new Date().toISOString(),
          });
        } else {
          consecutiveOccupiedBreaches = 0;
        }
      }

      // --- Rule 3: Unknown Occupancy Audit Warning ---
      else if (interval.expectedOccupancy === 'unknown') {
        if (excessKwh > settings.emptyRoomThresholdKwh) {
          const alertId = `alert-${roomId}-${interval.timestamp}-unknown`;
          const existingStatus = existingAlertsMap.get(alertId) || 'new';

          const evidence: string[] = [
            `Status: Timetable booking is unrecorded or inconclusive`,
            `Observed power: ${formatKwh(interval.actualKwh)} (${formatKwh(excessKwh)} above idle)`,
            `Potential cost exposure: ${formatInr(potentialCostInr)}`,
          ];

          const reason = `No timetable schedule found for ${roomName}, but energy is being drawn (${formatKwh(interval.actualKwh)}).`;

          const recommendedAction = `Check if an unscheduled meeting or student project session took place.`;

          alerts.push({
            id: alertId,
            roomId,
            roomName,
            building,
            intervalId: interval.id,
            timestamp: interval.timestamp,
            excessKwh,
            potentialCostInr,
            severity: 'low',
            status: existingStatus,
            type: 'review_warning',
            ruleTriggered: 'Rule DQ-01: Unverified Occupancy Anomaly Warning',
            reason,
            recommendedAction,
            evidence,
            dataSource: interval.dataSource,
            createdAt: interval.timestamp,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });
  });

  // Sort alerts descending by severity and excess energy
  const severityWeight: Record<AlertSeverity, number> = { high: 3, medium: 2, low: 1 };
  alerts.sort((a, b) => {
    const sevDiff = severityWeight[b.severity] - severityWeight[a.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.excessKwh - a.excessKwh;
  });

  return {
    alerts,
    analyzedIntervalsCount: intervals.length,
  };
}
