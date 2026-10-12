import { RoomInterval, Room } from '../types';
import { INITIAL_ROOMS } from './roomConfig';

// Deterministic sample day: 2026-10-12
const DATE_STR = '2026-10-12';

export const SAMPLE_ROOM_INTERVALS: RoomInterval[] = [
  // --- Room R-101 (Classroom 101, baseline 0.35) ---
  // 08:00 - Empty, normal baseline
  {
    id: 'R101-08',
    roomId: 'R-101',
    timestamp: `${DATE_STR}T08:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.38,
    expectedKwh: 0.35,
    dataSource: 'simulated',
  },
  // 09:00 - Occupied, normal lecture
  {
    id: 'R101-09',
    roomId: 'R-101',
    timestamp: `${DATE_STR}T09:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.15,
    expectedKwh: 1.10,
    dataSource: 'simulated',
  },
  // 10:00 - Occupied, normal lecture
  {
    id: 'R101-10',
    roomId: 'R-101',
    timestamp: `${DATE_STR}T10:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.20,
    expectedKwh: 1.10,
    dataSource: 'simulated',
  },
  // 11:00 - Empty according to timetable, but lights & fans left ON! (Excess: 1.05 - 0.35 = 0.70 kWh > 0.50 threshold)
  {
    id: 'R101-11',
    roomId: 'R-101',
    timestamp: `${DATE_STR}T11:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 1.05,
    expectedKwh: 0.35,
    dataSource: 'simulated',
  },
  // 12:00 - Empty, staff turned off lights (normal baseline)
  {
    id: 'R101-12',
    roomId: 'R-101',
    timestamp: `${DATE_STR}T12:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.36,
    expectedKwh: 0.35,
    dataSource: 'simulated',
  },

  // --- Room R-102 (Embedded Systems Lab, baseline 0.65) ---
  // 09:00 - Occupied lab session
  {
    id: 'R102-09',
    roomId: 'R-102',
    timestamp: `${DATE_STR}T09:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 2.80,
    expectedKwh: 2.75,
    dataSource: 'simulated',
  },
  // 10:00 - Occupied lab session
  {
    id: 'R102-10',
    roomId: 'R-102',
    timestamp: `${DATE_STR}T10:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 2.90,
    expectedKwh: 2.75,
    dataSource: 'simulated',
  },
  // 11:00 - Empty (Class ended, students left for recess), but 2 ACs and 35 PCs remained ON!
  // Actual: 2.65 kWh vs Baseline: 0.65 kWh -> Excess: 2.00 kWh (HIGH SEVERITY)
  {
    id: 'R102-11',
    roomId: 'R-102',
    timestamp: `${DATE_STR}T11:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 2.65,
    expectedKwh: 0.65,
    dataSource: 'simulated',
  },
  // 12:00 - Consecutive Empty Interval, STILL NOT SWITCHED OFF! Persistence triggered!
  // Actual: 2.60 kWh vs Baseline: 0.65 kWh -> Excess: 1.95 kWh (PERSISTENT HIGH SEVERITY)
  {
    id: 'R102-12',
    roomId: 'R-102',
    timestamp: `${DATE_STR}T12:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 2.60,
    expectedKwh: 0.65,
    dataSource: 'simulated',
  },
  // 13:00 - Maintenance shut down equipment; dropped to baseline
  {
    id: 'R102-13',
    roomId: 'R-102',
    timestamp: `${DATE_STR}T13:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.68,
    expectedKwh: 0.65,
    dataSource: 'simulated',
  },

  // --- Room R-103 (Faculty Lounge A, baseline 0.40) ---
  // 10:00 - Occupied, coffee machine & AC running
  {
    id: 'R103-10',
    roomId: 'R-103',
    timestamp: `${DATE_STR}T10:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.45,
    expectedKwh: 1.30,
    dataSource: 'simulated',
  },
  // 14:00 - Empty, but AC left cooling unoccupied room (Excess: 1.10 - 0.40 = 0.70 kWh > 0.50 threshold)
  {
    id: 'R103-14',
    roomId: 'R-103',
    timestamp: `${DATE_STR}T14:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 1.10,
    expectedKwh: 0.40,
    dataSource: 'simulated',
  },

  // --- Room R-104 (Seminar Hall North, baseline 0.80) ---
  // 10:00 - Empty, unbooked, baseline normal
  {
    id: 'R104-10',
    roomId: 'R-104',
    timestamp: `${DATE_STR}T10:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.82,
    expectedKwh: 0.80,
    dataSource: 'simulated',
  },
  // 14:00 - Occupied conference session
  {
    id: 'R104-14',
    roomId: 'R-104',
    timestamp: `${DATE_STR}T14:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 4.20,
    expectedKwh: 4.10,
    dataSource: 'simulated',
  },
  // 15:00 - Empty after conference, 4 cassette ACs & stage lights running!
  // Actual: 3.85 kWh vs Expected: 0.80 kWh -> Excess: 3.05 kWh (CRITICAL WASTE)
  {
    id: 'R104-15',
    roomId: 'R-104',
    timestamp: `${DATE_STR}T15:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 3.85,
    expectedKwh: 0.80,
    dataSource: 'simulated',
  },
  // 16:00 - Empty (Continued waste, 2nd consecutive interval)
  // Actual: 3.70 kWh vs Expected: 0.80 kWh -> Excess: 2.90 kWh
  {
    id: 'R104-16',
    roomId: 'R-104',
    timestamp: `${DATE_STR}T16:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 3.70,
    expectedKwh: 0.80,
    dataSource: 'simulated',
  },

  // --- Room R-201 (VLSI Design Studio, baseline 0.70) ---
  // 11:00 - Occupied CAD lab
  {
    id: 'R201-11',
    roomId: 'R-201',
    timestamp: `${DATE_STR}T11:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 3.10,
    expectedKwh: 3.00,
    dataSource: 'simulated',
  },
  // 12:00 - Empty during student lunch hour; workstations idling without sleep mode
  // Actual: 1.45 kWh vs Expected: 0.70 kWh -> Excess: 0.75 kWh (> 0.50 threshold)
  {
    id: 'R201-12',
    roomId: 'R-201',
    timestamp: `${DATE_STR}T12:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 1.45,
    expectedKwh: 0.70,
    dataSource: 'simulated',
  },

  // --- Room R-202 (Classroom 202, baseline 0.35) ---
  // 09:00 - Occupied
  {
    id: 'R202-09',
    roomId: 'R-202',
    timestamp: `${DATE_STR}T09:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.08,
    expectedKwh: 1.05,
    dataSource: 'simulated',
  },
  // 10:00 - Empty, properly switched off (low consumption test case)
  {
    id: 'R202-10',
    roomId: 'R-202',
    timestamp: `${DATE_STR}T10:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.35,
    expectedKwh: 0.35,
    dataSource: 'simulated',
  },
  // 11:00 - Empty, minimal leakage below threshold (0.60 vs 0.35 = 0.25 kWh <= 0.50 threshold: NO ALERT)
  {
    id: 'R202-11',
    roomId: 'R-202',
    timestamp: `${DATE_STR}T11:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.60,
    expectedKwh: 0.35,
    dataSource: 'simulated',
  },

  // --- Room S-301 (Physics Optics Lab, baseline 0.45) ---
  // 10:00 - Occupied, normal lab
  {
    id: 'S301-10',
    roomId: 'S-301',
    timestamp: `${DATE_STR}T10:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.85,
    expectedKwh: 1.80,
    dataSource: 'simulated',
  },
  // 11:00 - Unknown occupancy (Schedule gap/unregistered booking), high draw: 2.10 vs 0.45 = 1.65 kWh
  // Must generate a REVIEW / DATA-QUALITY WARNING, NOT a confirmed empty-room wastage alert
  {
    id: 'S301-11',
    roomId: 'S-301',
    timestamp: `${DATE_STR}T11:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'unknown',
    occupancySource: 'timetable',
    actualKwh: 2.10,
    expectedKwh: 0.45,
    dataSource: 'simulated',
  },

  // --- Room S-302 (Auditorium Magna, baseline 1.20) ---
  // 13:00 - Occupied, unusually elevated consumption (e.g. extra halogen spotlights, actual: 6.80 vs expected: 5.50 -> excess: 1.30 kWh > 0.80 occupied threshold)
  // Must generate an ELEVATED-USAGE REVIEW ALERT (not labeled as pure waste)
  {
    id: 'S302-13',
    roomId: 'S-302',
    timestamp: `${DATE_STR}T13:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 6.80,
    expectedKwh: 5.50,
    dataSource: 'simulated',
  },
  // 14:00 - Occupied, normal rehearsal
  {
    id: 'S302-14',
    roomId: 'S-302',
    timestamp: `${DATE_STR}T14:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 5.45,
    expectedKwh: 5.50,
    dataSource: 'simulated',
  },

  // --- Room S-303 (Data Science Lab, baseline 0.85) ---
  // 14:00 - Occupied practical session
  {
    id: 'S303-14',
    roomId: 'S-303',
    timestamp: `${DATE_STR}T14:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 3.40,
    expectedKwh: 3.30,
    dataSource: 'simulated',
  },
  // 15:00 - Empty, but both 2.5-ton AC units left cooling at 18°C!
  // Actual: 2.85 vs Baseline: 0.85 -> Excess: 2.00 kWh (HIGH SEVERITY)
  {
    id: 'S303-15',
    roomId: 'S-303',
    timestamp: `${DATE_STR}T15:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 2.85,
    expectedKwh: 0.85,
    dataSource: 'simulated',
  },

  // --- Room S-304 (Faculty Cabins B, baseline 0.30) ---
  // 11:00 - Occupied
  {
    id: 'S304-11',
    roomId: 'S-304',
    timestamp: `${DATE_STR}T11:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.10,
    expectedKwh: 1.05,
    dataSource: 'simulated',
  },
  // 12:00 - Empty, normal baseline
  {
    id: 'S304-12',
    roomId: 'S-304',
    timestamp: `${DATE_STR}T12:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.32,
    expectedKwh: 0.30,
    dataSource: 'simulated',
  },

  // --- Room T-401 (Smart Classroom 401, baseline 0.40) ---
  // 10:00 - Occupied
  {
    id: 'T401-10',
    roomId: 'T-401',
    timestamp: `${DATE_STR}T10:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.35,
    expectedKwh: 1.30,
    dataSource: 'simulated',
  },
  // 11:00 - Empty, interactive panel & projector left running
  // Actual: 1.25 kWh vs Baseline: 0.40 kWh -> Excess: 0.85 kWh (> 0.50 threshold)
  {
    id: 'T401-11',
    roomId: 'T-401',
    timestamp: `${DATE_STR}T11:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 1.25,
    expectedKwh: 0.40,
    dataSource: 'simulated',
  },

  // --- Room T-402 (Conference Room 402, baseline 0.35) ---
  // 15:00 - Occupied
  {
    id: 'T402-15',
    roomId: 'T-402',
    timestamp: `${DATE_STR}T15:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'occupied',
    occupancySource: 'timetable',
    actualKwh: 1.80,
    expectedKwh: 1.70,
    dataSource: 'simulated',
  },
  // 16:00 - Empty, clean baseline
  {
    id: 'T402-16',
    roomId: 'T-402',
    timestamp: `${DATE_STR}T16:00:00.000Z`,
    intervalMinutes: 60,
    expectedOccupancy: 'empty',
    occupancySource: 'timetable',
    actualKwh: 0.36,
    expectedKwh: 0.35,
    dataSource: 'simulated',
  },
];

// Helper to look up room details by ID
export function getRoomById(roomId: string): Room | undefined {
  return INITIAL_ROOMS.find((r) => r.id === roomId);
}

// Sample CSV content for public download or quick testing
export const SAMPLE_CSV_CONTENT = `room_id,timestamp,expected_occupancy,actual_kwh,expected_kwh,building,room_name,occupancy_source,data_source
R-101,2026-10-12T08:00:00.000Z,empty,0.38,0.35,Aryabhata Hall,Classroom 101,timetable,simulated
R-101,2026-10-12T09:00:00.000Z,occupied,1.15,1.10,Aryabhata Hall,Classroom 101,timetable,simulated
R-101,2026-10-12T10:00:00.000Z,occupied,1.20,1.10,Aryabhata Hall,Classroom 101,timetable,simulated
R-101,2026-10-12T11:00:00.000Z,empty,1.05,0.35,Aryabhata Hall,Classroom 101,timetable,simulated
R-101,2026-10-12T12:00:00.000Z,empty,0.36,0.35,Aryabhata Hall,Classroom 101,timetable,simulated
R-102,2026-10-12T09:00:00.000Z,occupied,2.80,2.75,Aryabhata Hall,Embedded Systems Lab,timetable,simulated
R-102,2026-10-12T10:00:00.000Z,occupied,2.90,2.75,Aryabhata Hall,Embedded Systems Lab,timetable,simulated
R-102,2026-10-12T11:00:00.000Z,empty,2.65,0.65,Aryabhata Hall,Embedded Systems Lab,timetable,simulated
R-102,2026-10-12T12:00:00.000Z,empty,2.60,0.65,Aryabhata Hall,Embedded Systems Lab,timetable,simulated
R-102,2026-10-12T13:00:00.000Z,empty,0.68,0.65,Aryabhata Hall,Embedded Systems Lab,timetable,simulated
R-103,2026-10-12T10:00:00.000Z,occupied,1.45,1.30,Aryabhata Hall,Faculty Lounge A,timetable,simulated
R-103,2026-10-12T14:00:00.000Z,empty,1.10,0.40,Aryabhata Hall,Faculty Lounge A,timetable,simulated
R-104,2026-10-12T10:00:00.000Z,empty,0.82,0.80,Aryabhata Hall,Seminar Hall North,timetable,simulated
R-104,2026-10-12T14:00:00.000Z,occupied,4.20,4.10,Aryabhata Hall,Seminar Hall North,timetable,simulated
R-104,2026-10-12T15:00:00.000Z,empty,3.85,0.80,Aryabhata Hall,Seminar Hall North,timetable,simulated
R-104,2026-10-12T16:00:00.000Z,empty,3.70,0.80,Aryabhata Hall,Seminar Hall North,timetable,simulated
R-201,2026-10-12T11:00:00.000Z,occupied,3.10,3.00,Aryabhata Hall,VLSI Design Studio,timetable,simulated
R-201,2026-10-12T12:00:00.000Z,empty,1.45,0.70,Aryabhata Hall,VLSI Design Studio,timetable,simulated
R-202,2026-10-12T09:00:00.000Z,occupied,1.08,1.05,Aryabhata Hall,Classroom 202,timetable,simulated
R-202,2026-10-12T10:00:00.000Z,empty,0.35,0.35,Aryabhata Hall,Classroom 202,timetable,simulated
R-202,2026-10-12T11:00:00.000Z,empty,0.60,0.35,Aryabhata Hall,Classroom 202,timetable,simulated
S-301,2026-10-12T10:00:00.000Z,occupied,1.85,1.80,Ramanujan Tower,Physics Optics Lab,timetable,simulated
S-301,2026-10-12T11:00:00.000Z,unknown,2.10,0.45,Ramanujan Tower,Physics Optics Lab,timetable,simulated
S-302,2026-10-12T13:00:00.000Z,occupied,6.80,5.50,Ramanujan Tower,Auditorium Magna,timetable,simulated
S-302,2026-10-12T14:00:00.000Z,occupied,5.45,5.50,Ramanujan Tower,Auditorium Magna,timetable,simulated
S-303,2026-10-12T14:00:00.000Z,occupied,3.40,3.30,Ramanujan Tower,Data Science Lab,timetable,simulated
S-303,2026-10-12T15:00:00.000Z,empty,2.85,0.85,Ramanujan Tower,Data Science Lab,timetable,simulated
S-304,2026-10-12T11:00:00.000Z,occupied,1.10,1.05,Ramanujan Tower,Faculty Cabins B,timetable,simulated
S-304,2026-10-12T12:00:00.000Z,empty,0.32,0.30,Ramanujan Tower,Faculty Cabins B,timetable,simulated
T-401,2026-10-12T10:00:00.000Z,occupied,1.35,1.30,Tagore Humanities,Smart Classroom 401,timetable,simulated
T-401,2026-10-12T11:00:00.000Z,empty,1.25,0.40,Tagore Humanities,Smart Classroom 401,timetable,simulated
T-402,2026-10-12T15:00:00.000Z,occupied,1.80,1.70,Tagore Humanities,Conference Room 402,timetable,simulated
T-402,2026-10-12T16:00:00.000Z,empty,0.36,0.35,Tagore Humanities,Conference Room 402,timetable,simulated`;

// Deliberately flawed dataset for testing CSV validation handling
export const INVALID_TEST_CSV = `room_id,timestamp,expected_occupancy,actual_kwh,expected_kwh
R-101,2026-10-12T08:00:00.000Z,empty,-0.50,0.35
INVALID_ROOM,,occupied,1.20,1.00
R-102,not-a-date,empty,2.00,0.65
,2026-10-12T10:00:00.000Z,empty,1.50,0.50
R-103,2026-10-12T11:00:00.000Z,invalid_status,1.10,0.40
R-104,2026-10-12T12:00:00.000Z,empty,not_a_number,0.80`;
