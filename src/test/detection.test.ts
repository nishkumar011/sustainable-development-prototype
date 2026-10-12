import { describe, it, expect } from 'vitest';
import { runDetectionEngine } from '../engine/detection';
import { calculateExcessEnergy, calculatePotentialCost } from '../engine/calculations';
import { validateRawRecord, validateIntervals } from '../engine/validation';
import { parseCSV } from '../utils/csvParser';
import { Room, RoomInterval, AnalysisSettings } from '../types';

const mockRooms: Room[] = [
  {
    id: 'TEST-101',
    name: 'Classroom Test',
    building: 'Test Hall',
    floor: '1st Floor',
    capacity: 40,
    expectedBaselineKwh: 0.40,
    roomType: 'Classroom',
    installedEquipment: ['Fans', 'Lights'],
  },
  {
    id: 'TEST-102',
    name: 'Lab Test',
    building: 'Test Hall',
    floor: '2nd Floor',
    capacity: 30,
    expectedBaselineKwh: 0.70,
    roomType: 'Computer Lab',
    installedEquipment: ['PCs', 'AC'],
  },
];

const mockSettings: AnalysisSettings = {
  tariffPerKwh: 8.0,
  emptyRoomThresholdKwh: 0.50,
  occupiedRoomThresholdKwh: 0.20,
  persistenceIntervals: 2,
  defaultIntervalMinutes: 60,
};

describe('RoomPulse Detection and Calculation Engine', () => {
  // Test 1: Normal occupied room
  it('Test 1: Normal occupied room generates no alert when within occupied threshold', () => {
    // Input: Occupancy: occupied. Actual energy: 0.90 kWh. Expected energy: 0.85 kWh. Occupied threshold: 0.20 kWh.
    // Difference is 0.05 kWh <= 0.20 kWh -> No alert.
    const interval: RoomInterval = {
      id: 'inv-1',
      roomId: 'TEST-101',
      timestamp: '2026-10-12T09:00:00.000Z',
      intervalMinutes: 60,
      expectedOccupancy: 'occupied',
      occupancySource: 'timetable',
      actualKwh: 0.90,
      expectedKwh: 0.85,
      dataSource: 'measured',
    };

    const result = runDetectionEngine([interval], mockRooms, mockSettings);
    expect(result.alerts.length).toBe(0);
  });

  // Test 2: Empty room with elevated usage
  it('Test 2: Empty room with elevated usage generates one potential-wastage alert with exact excess and cost', () => {
    // Input: Occupancy: empty. Actual energy: 1.10 kWh. Expected energy: 0.40 kWh. Empty-room threshold: 0.50 kWh. Tariff: ₹8/kWh.
    // Expected: One potential-wastage alert. Excess energy: 0.70 kWh. Potential cost: ₹5.60.
    const interval: RoomInterval = {
      id: 'inv-2',
      roomId: 'TEST-101',
      timestamp: '2026-10-12T11:00:00.000Z',
      intervalMinutes: 60,
      expectedOccupancy: 'empty',
      occupancySource: 'timetable',
      actualKwh: 1.10,
      expectedKwh: 0.40,
      dataSource: 'measured',
    };

    const result = runDetectionEngine([interval], mockRooms, mockSettings);
    expect(result.alerts.length).toBe(1);
    const alert = result.alerts[0];
    expect(alert.type).toBe('potential_wastage');
    expect(alert.excessKwh).toBe(0.70);
    expect(alert.potentialCostInr).toBe(5.60);
    expect(alert.status).toBe('new');
  });

  // Test 3: Empty room below threshold
  it('Test 3: Empty room below threshold generates no potential-wastage alert', () => {
    // Input: Occupancy: empty. Actual energy: 0.75 kWh. Expected energy: 0.40 kWh. Threshold: 0.50 kWh.
    // Excess = 0.35 kWh <= 0.50 kWh -> No alert.
    const interval: RoomInterval = {
      id: 'inv-3',
      roomId: 'TEST-101',
      timestamp: '2026-10-12T12:00:00.000Z',
      intervalMinutes: 60,
      expectedOccupancy: 'empty',
      occupancySource: 'timetable',
      actualKwh: 0.75,
      expectedKwh: 0.40,
      dataSource: 'measured',
    };

    const result = runDetectionEngine([interval], mockRooms, mockSettings);
    expect(result.alerts.length).toBe(0);
  });

  // Test 4: Exact threshold
  it('Test 4: Excess energy exactly equals configured threshold generates no alert (strict greater-than)', () => {
    // Excess = 0.90 - 0.40 = 0.50 kWh exactly equals threshold of 0.50 kWh.
    const interval: RoomInterval = {
      id: 'inv-4',
      roomId: 'TEST-101',
      timestamp: '2026-10-12T13:00:00.000Z',
      intervalMinutes: 60,
      expectedOccupancy: 'empty',
      occupancySource: 'timetable',
      actualKwh: 0.90,
      expectedKwh: 0.40,
      dataSource: 'measured',
    };

    const result = runDetectionEngine([interval], mockRooms, mockSettings);
    expect(result.alerts.length).toBe(0);
  });

  // Test 5: Unknown occupancy
  it('Test 5: Unknown occupancy with elevated draw creates review warning, not confirmed empty wastage', () => {
    const interval: RoomInterval = {
      id: 'inv-5',
      roomId: 'TEST-101',
      timestamp: '2026-10-12T14:00:00.000Z',
      intervalMinutes: 60,
      expectedOccupancy: 'unknown',
      occupancySource: 'timetable',
      actualKwh: 1.50,
      expectedKwh: 0.40,
      dataSource: 'measured',
    };

    const result = runDetectionEngine([interval], mockRooms, mockSettings);
    expect(result.alerts.length).toBe(1);
    expect(result.alerts[0].type).toBe('review_warning');
    expect(result.alerts[0].type).not.toBe('potential_wastage');
  });

  // Test 6: Invalid energy reading
  it('Test 6: Negative actual energy generates validation error and is excluded', () => {
    const raw = {
      room_id: 'TEST-101',
      timestamp: '2026-10-12T15:00:00.000Z',
      expected_occupancy: 'empty',
      actual_kwh: -1.25,
      expected_kwh: 0.40,
    };

    const { validInterval, issues } = validateRawRecord(raw, 1);
    expect(validInterval).toBeUndefined();
    expect(issues.some((i) => i.severity === 'error' && i.message.includes('negative'))).toBe(true);
  });

  // Test 7: Cost calculation
  it('Test 7: Potential cost calculation accurately computes ₹20.00 for 2.5 kWh at ₹8/kWh', () => {
    // Input: Excess energy: 2.5 kWh. Tariff: ₹8/kWh.
    // Expected: Potential cost: ₹20.00.
    const excess = calculateExcessEnergy(3.5, 1.0);
    expect(excess).toBe(2.5);
    const cost = calculatePotentialCost(excess, 8.0);
    expect(cost).toBe(20.0);
  });

  // Test 8: Persistence rule
  it('Test 8: Consecutive empty breaches elevate severity to high when reaching persistence threshold', () => {
    const intervals: RoomInterval[] = [
      {
        id: 'inv-p1',
        roomId: 'TEST-102',
        timestamp: '2026-10-12T11:00:00.000Z',
        intervalMinutes: 60,
        expectedOccupancy: 'empty',
        occupancySource: 'timetable',
        actualKwh: 1.30,
        expectedKwh: 0.70, // excess 0.60 > 0.50 threshold
        dataSource: 'simulated',
      },
      {
        id: 'inv-p2',
        roomId: 'TEST-102',
        timestamp: '2026-10-12T12:00:00.000Z',
        intervalMinutes: 60,
        expectedOccupancy: 'empty',
        occupancySource: 'timetable',
        actualKwh: 1.35,
        expectedKwh: 0.70, // excess 0.65 > 0.50 threshold (consecutive = 2)
        dataSource: 'simulated',
      },
    ];

    const result = runDetectionEngine(intervals, mockRooms, mockSettings);
    expect(result.alerts.length).toBe(2);
    // 2nd interval should be elevated to high severity because persistenceIntervals is 2
    const secondAlert = result.alerts.find((a) => a.intervalId === 'inv-p2');
    expect(secondAlert?.severity).toBe('high');
    expect(secondAlert?.ruleTriggered).toContain('Persistent');
  });

  // Test 9: Repeat analysis determinism
  it('Test 9: The same records and settings generate identical deterministic results and do not duplicate alerts', () => {
    const interval: RoomInterval = {
      id: 'inv-det-1',
      roomId: 'TEST-101',
      timestamp: '2026-10-12T16:00:00.000Z',
      intervalMinutes: 60,
      expectedOccupancy: 'empty',
      occupancySource: 'timetable',
      actualKwh: 1.50,
      expectedKwh: 0.40,
      dataSource: 'simulated',
    };

    const run1 = runDetectionEngine([interval], mockRooms, mockSettings);
    const run2 = runDetectionEngine([interval], mockRooms, mockSettings);

    expect(run1.alerts.length).toBe(1);
    expect(run2.alerts.length).toBe(1);
    expect(run1.alerts[0].id).toBe(run2.alerts[0].id);
    expect(run1.alerts[0].excessKwh).toBe(run2.alerts[0].excessKwh);
    expect(run1.alerts[0].potentialCostInr).toBe(run2.alerts[0].potentialCostInr);
  });

  // Test 10: CSV upload parsing and validation
  it('Test 10: CSV upload validates clean rows and identifies corrupted rows without crashing', () => {
    const csvContent = `room_id,timestamp,expected_occupancy,actual_kwh,expected_kwh
TEST-101,2026-10-12T08:00:00.000Z,empty,0.40,0.40
TEST-101,2026-10-12T09:00:00.000Z,occupied,1.10,1.00
BAD_ROW,not-a-date,empty,1.00,0.50
TEST-102,2026-10-12T10:00:00.000Z,empty,-0.50,0.70`;

    const parsed = parseCSV(csvContent);
    expect(parsed.length).toBe(4);

    const validation = validateIntervals(parsed);
    expect(validation.validIntervals.length).toBe(2);
    expect(validation.errors.length).toBe(2);
    expect(validation.errors.some((e) => e.message.includes('timestamp'))).toBe(true);
    expect(validation.errors.some((e) => e.message.includes('negative'))).toBe(true);
  });
});
