export type OccupancyStatus = 'occupied' | 'empty' | 'unknown';
export type OccupancySource = 'timetable' | 'manual' | 'simulated';
export type DataSource = 'simulated' | 'uploaded' | 'measured';
export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved';
export type AlertType = 'potential_wastage' | 'elevated_usage' | 'review_warning';

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  expectedBaselineKwh: number;
  roomType: 'Classroom' | 'Computer Lab' | 'Seminar Hall' | 'Faculty Room' | 'Lecture Hall' | 'Research Lab';
  installedEquipment: string[];
  notes?: string;
}

export interface RoomInterval {
  id: string;
  roomId: string;
  timestamp: string; // ISO 8601
  intervalMinutes: number;
  expectedOccupancy: OccupancyStatus;
  occupancySource: OccupancySource;
  actualKwh: number;
  expectedKwh: number;
  dataSource: DataSource;
  building?: string;
  roomName?: string;
}

export interface EnergyAlert {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  intervalId: string;
  timestamp: string;
  excessKwh: number;
  potentialCostInr: number;
  severity: AlertSeverity;
  status: AlertStatus;
  type: AlertType;
  reason: string;
  recommendedAction: string;
  evidence: string[];
  dataSource: DataSource;
  ruleTriggered: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisSettings {
  tariffPerKwh: number; // ₹ per kWh, default 8
  emptyRoomThresholdKwh: number; // kWh per interval, default 0.5
  occupiedRoomThresholdKwh: number; // kWh per interval, default 0.8
  persistenceIntervals: number; // default 2
  defaultIntervalMinutes: number; // default 60
}

export interface DataQualityIssue {
  id: string;
  row?: number;
  roomId?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
  timestamp?: string;
  rawData?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  validIntervals: RoomInterval[];
  errors: DataQualityIssue[];
  warnings: DataQualityIssue[];
  totalRowsProcessed: number;
}

export interface RoomAnalyticsSummary {
  roomId: string;
  roomName: string;
  building: string;
  roomType: string;
  floor: string;
  totalActualKwh: number;
  totalExpectedKwh: number;
  totalExcessKwh: number;
  totalPotentialCostInr: number;
  intervalsCount: number;
  alertsCount: number;
  highestSeverity: AlertSeverity | 'none';
  latestOccupancy: OccupancyStatus;
  latestActualKwh: number;
  latestTimestamp: string;
}

export interface EnergyTrendPoint {
  timestamp: string;
  timeLabel: string;
  actualKwh: number;
  expectedKwh: number;
  excessKwh: number;
  intervalCount: number;
  alertsTriggered: number;
}

export interface AnalysisSummary {
  roomsAnalyzedCount: number;
  validIntervalsCount: number;
  dataQualityWarningsCount: number;
  potentialWastageAlertsCount: number;
  elevatedUsageAlertsCount: number;
  reviewWarningsCount: number;
  totalActualKwh: number;
  totalExpectedKwh: number;
  totalExcessKwh: number;
  totalPotentialCostInr: number;
  alertsBySeverity: Record<AlertSeverity, number>;
  alertsByStatus: Record<AlertStatus, number>;
  topRoomsByExcess: RoomAnalyticsSummary[];
  trendSeries: EnergyTrendPoint[];
  dataSourceDistribution: Record<DataSource, number>;
  generatedAt: string;
}

export type ActiveNavTab = 'dashboard' | 'analysis' | 'alerts' | 'rooms' | 'settings';
