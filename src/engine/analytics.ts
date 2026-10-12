import {
  RoomInterval,
  EnergyAlert,
  Room,
  AnalysisSummary,
  RoomAnalyticsSummary,
  EnergyTrendPoint,
  AlertSeverity,
  AlertStatus,
  DataSource,
} from '../types';
import { calculateExcessEnergy } from './calculations';

export function computeAnalyticsSummary(
  validIntervals: RoomInterval[],
  alerts: EnergyAlert[],
  rooms: Room[],
  dataQualityWarningsCount: number
): AnalysisSummary {
  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  let totalActualKwh = 0;
  let totalExpectedKwh = 0;
  let totalExcessKwh = 0;
  let totalPotentialCostInr = 0;

  const alertsBySeverity: Record<AlertSeverity, number> = { high: 0, medium: 0, low: 0 };
  const alertsByStatus: Record<AlertStatus, number> = { new: 0, acknowledged: 0, investigating: 0, resolved: 0 };
  const dataSourceDistribution: Record<DataSource, number> = { simulated: 0, uploaded: 0, measured: 0 };

  let potentialWastageAlertsCount = 0;
  let elevatedUsageAlertsCount = 0;
  let reviewWarningsCount = 0;

  alerts.forEach((alert) => {
    alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    alertsByStatus[alert.status] = (alertsByStatus[alert.status] || 0) + 1;

    if (alert.type === 'potential_wastage') {
      potentialWastageAlertsCount += 1;
      totalPotentialCostInr += alert.potentialCostInr;
    } else if (alert.type === 'elevated_usage') {
      elevatedUsageAlertsCount += 1;
      // Add to potential cost review scope
      totalPotentialCostInr += alert.potentialCostInr;
    } else if (alert.type === 'review_warning') {
      reviewWarningsCount += 1;
    }
  });

  // Track rooms statistics
  const roomStatsMap = new Map<
    string,
    {
      totalActualKwh: number;
      totalExpectedKwh: number;
      totalExcessKwh: number;
      totalPotentialCostInr: number;
      intervalsCount: number;
      alertsCount: number;
      highestSeverity: AlertSeverity | 'none';
      latestTimestamp: string;
      latestOccupancy: RoomInterval['expectedOccupancy'];
      latestActualKwh: number;
    }
  >();

  // Aggregate time series for charts
  const timeBuckets = new Map<string, { actual: number; expected: number; excess: number; count: number; alerts: number }>();

  validIntervals.forEach((interval) => {
    totalActualKwh += interval.actualKwh;
    totalExpectedKwh += interval.expectedKwh;
    const excess = calculateExcessEnergy(interval.actualKwh, interval.expectedKwh);
    totalExcessKwh += excess;

    dataSourceDistribution[interval.dataSource] = (dataSourceDistribution[interval.dataSource] || 0) + 1;

    // Room stats
    let rStat = roomStatsMap.get(interval.roomId);
    if (!rStat) {
      rStat = {
        totalActualKwh: 0,
        totalExpectedKwh: 0,
        totalExcessKwh: 0,
        totalPotentialCostInr: 0,
        intervalsCount: 0,
        alertsCount: 0,
        highestSeverity: 'none',
        latestTimestamp: interval.timestamp,
        latestOccupancy: interval.expectedOccupancy,
        latestActualKwh: interval.actualKwh,
      };
      roomStatsMap.set(interval.roomId, rStat);
    }

    rStat.totalActualKwh += interval.actualKwh;
    rStat.totalExpectedKwh += interval.expectedKwh;
    rStat.totalExcessKwh += excess;
    rStat.intervalsCount += 1;

    if (new Date(interval.timestamp).getTime() >= new Date(rStat.latestTimestamp).getTime()) {
      rStat.latestTimestamp = interval.timestamp;
      rStat.latestOccupancy = interval.expectedOccupancy;
      rStat.latestActualKwh = interval.actualKwh;
    }

    // Time buckets
    const timeKey = interval.timestamp;
    let b = timeBuckets.get(timeKey);
    if (!b) {
      b = { actual: 0, expected: 0, excess: 0, count: 0, alerts: 0 };
      timeBuckets.set(timeKey, b);
    }
    b.actual += interval.actualKwh;
    b.expected += interval.expectedKwh;
    b.excess += excess;
    b.count += 1;
  });

  // Assign alert stats to rooms
  const severityRank: Record<AlertSeverity, number> = { high: 3, medium: 2, low: 1 };
  alerts.forEach((alert) => {
    const rStat = roomStatsMap.get(alert.roomId);
    if (rStat) {
      rStat.alertsCount += 1;
      rStat.totalPotentialCostInr += alert.potentialCostInr;
      const currentRank = rStat.highestSeverity === 'none' ? 0 : severityRank[rStat.highestSeverity];
      if (severityRank[alert.severity] > currentRank) {
        rStat.highestSeverity = alert.severity;
      }
    }

    // Add alert count to time bucket
    const b = timeBuckets.get(alert.timestamp);
    if (b) {
      b.alerts += 1;
    }
  });

  // Top rooms by excess
  const topRoomsByExcess: RoomAnalyticsSummary[] = Array.from(roomStatsMap.entries()).map(([roomId, stat]) => {
    const room = roomMap.get(roomId);
    return {
      roomId,
      roomName: room?.name || `Room ${roomId}`,
      building: room?.building || 'Main Campus',
      roomType: room?.roomType || 'General',
      floor: room?.floor || 'Floor 1',
      totalActualKwh: Number(stat.totalActualKwh.toFixed(2)),
      totalExpectedKwh: Number(stat.totalExpectedKwh.toFixed(2)),
      totalExcessKwh: Number(stat.totalExcessKwh.toFixed(2)),
      totalPotentialCostInr: Number(stat.totalPotentialCostInr.toFixed(2)),
      intervalsCount: stat.intervalsCount,
      alertsCount: stat.alertsCount,
      highestSeverity: stat.highestSeverity,
      latestOccupancy: stat.latestOccupancy,
      latestActualKwh: stat.latestActualKwh,
      latestTimestamp: stat.latestTimestamp,
    };
  });

  topRoomsByExcess.sort((a, b) => b.totalExcessKwh - a.totalExcessKwh);

  // Build sorted trend series
  const sortedTimeKeys = Array.from(timeBuckets.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const trendSeries: EnergyTrendPoint[] = sortedTimeKeys.map((timestamp) => {
    const b = timeBuckets.get(timestamp)!;
    const date = new Date(timestamp);
    const timeLabel = isNaN(date.getTime())
      ? timestamp
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return {
      timestamp,
      timeLabel,
      actualKwh: Number(b.actual.toFixed(2)),
      expectedKwh: Number(b.expected.toFixed(2)),
      excessKwh: Number(b.excess.toFixed(2)),
      intervalCount: b.count,
      alertsTriggered: b.alerts,
    };
  });

  return {
    roomsAnalyzedCount: roomStatsMap.size,
    validIntervalsCount: validIntervals.length,
    dataQualityWarningsCount,
    potentialWastageAlertsCount,
    elevatedUsageAlertsCount,
    reviewWarningsCount,
    totalActualKwh: Number(totalActualKwh.toFixed(2)),
    totalExpectedKwh: Number(totalExpectedKwh.toFixed(2)),
    totalExcessKwh: Number(totalExcessKwh.toFixed(2)),
    totalPotentialCostInr: Number(totalPotentialCostInr.toFixed(2)),
    alertsBySeverity,
    alertsByStatus,
    topRoomsByExcess,
    trendSeries,
    dataSourceDistribution,
    generatedAt: new Date().toISOString(),
  };
}
