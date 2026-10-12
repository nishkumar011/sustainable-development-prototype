import { RoomInterval, DataQualityIssue, ValidationResult, AnalysisSettings } from '../types';

export function validateSettings(settings: AnalysisSettings): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof settings.tariffPerKwh !== 'number' || isNaN(settings.tariffPerKwh) || settings.tariffPerKwh < 0) {
    errors.push('Tariff must be a non-negative number.');
  }
  if (typeof settings.emptyRoomThresholdKwh !== 'number' || isNaN(settings.emptyRoomThresholdKwh) || settings.emptyRoomThresholdKwh < 0) {
    errors.push('Empty room excess threshold must be a non-negative number.');
  }
  if (typeof settings.occupiedRoomThresholdKwh !== 'number' || isNaN(settings.occupiedRoomThresholdKwh) || settings.occupiedRoomThresholdKwh < 0) {
    errors.push('Occupied room excess threshold must be a non-negative number.');
  }
  if (typeof settings.persistenceIntervals !== 'number' || isNaN(settings.persistenceIntervals) || settings.persistenceIntervals < 1) {
    errors.push('Persistence intervals must be at least 1.');
  }
  if (typeof settings.defaultIntervalMinutes !== 'number' || isNaN(settings.defaultIntervalMinutes) || settings.defaultIntervalMinutes <= 0) {
    errors.push('Interval duration must be greater than 0 minutes.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRawRecord(
  raw: Record<string, unknown>,
  rowIndex: number
): { validInterval?: RoomInterval; issues: DataQualityIssue[] } {
  const issues: DataQualityIssue[] = [];
  
  // Room ID
  const roomIdRaw = raw.room_id ?? raw.roomId;
  const roomId = typeof roomIdRaw === 'string' ? roomIdRaw.trim() : typeof roomIdRaw === 'number' ? String(roomIdRaw) : '';
  if (!roomId) {
    issues.push({
      id: `err-row-${rowIndex}-roomId`,
      row: rowIndex,
      field: 'room_id',
      message: `Row ${rowIndex}: Missing or empty Room ID.`,
      severity: 'error',
      rawData: raw,
    });
  }

  // Timestamp
  const timestampRaw = raw.timestamp ?? raw.time;
  const timestampStr = typeof timestampRaw === 'string' ? timestampRaw.trim() : '';
  const parsedDate = timestampStr ? new Date(timestampStr) : null;
  const isDateValid = parsedDate !== null && !isNaN(parsedDate.getTime());
  if (!isDateValid) {
    issues.push({
      id: `err-row-${rowIndex}-timestamp`,
      row: rowIndex,
      roomId,
      field: 'timestamp',
      message: `Row ${rowIndex}: Invalid or missing timestamp "${timestampRaw}". Expected ISO 8601 date.`,
      severity: 'error',
      rawData: raw,
    });
  }

  // Actual kWh
  const actualRaw = raw.actual_kwh ?? raw.actualKwh;
  const actualKwh = typeof actualRaw === 'number' ? actualRaw : typeof actualRaw === 'string' ? parseFloat(actualRaw.trim()) : NaN;
  if (isNaN(actualKwh)) {
    issues.push({
      id: `err-row-${rowIndex}-actualKwh`,
      row: rowIndex,
      roomId,
      field: 'actual_kwh',
      message: `Row ${rowIndex}: Non-numeric actual energy reading "${actualRaw}".`,
      severity: 'error',
      rawData: raw,
    });
  } else if (actualKwh < 0) {
    issues.push({
      id: `err-row-${rowIndex}-actualKwh-negative`,
      row: rowIndex,
      roomId,
      field: 'actual_kwh',
      message: `Row ${rowIndex}: Actual energy reading cannot be negative (${actualKwh} kWh).`,
      severity: 'error',
      rawData: raw,
    });
  }

  // Expected kWh
  const expectedRaw = raw.expected_kwh ?? raw.expectedKwh;
  const expectedKwh = typeof expectedRaw === 'number' ? expectedRaw : typeof expectedRaw === 'string' ? parseFloat(expectedRaw.trim()) : NaN;
  if (isNaN(expectedKwh)) {
    issues.push({
      id: `err-row-${rowIndex}-expectedKwh`,
      row: rowIndex,
      roomId,
      field: 'expected_kwh',
      message: `Row ${rowIndex}: Non-numeric expected baseline reading "${expectedRaw}".`,
      severity: 'error',
      rawData: raw,
    });
  } else if (expectedKwh < 0) {
    issues.push({
      id: `err-row-${rowIndex}-expectedKwh-negative`,
      row: rowIndex,
      roomId,
      field: 'expected_kwh',
      message: `Row ${rowIndex}: Expected baseline cannot be negative (${expectedKwh} kWh).`,
      severity: 'error',
      rawData: raw,
    });
  }

  // Expected Occupancy
  const occupancyRaw = raw.expected_occupancy ?? raw.expectedOccupancy;
  const occupancyNorm = typeof occupancyRaw === 'string' ? occupancyRaw.trim().toLowerCase() : '';
  let expectedOccupancy: 'occupied' | 'empty' | 'unknown' = 'unknown';
  if (occupancyNorm === 'occupied' || occupancyNorm === 'empty' || occupancyNorm === 'unknown') {
    expectedOccupancy = occupancyNorm;
  } else {
    issues.push({
      id: `err-row-${rowIndex}-occupancy`,
      row: rowIndex,
      roomId,
      field: 'expected_occupancy',
      message: `Row ${rowIndex}: Invalid occupancy state "${occupancyRaw}". Must be 'occupied', 'empty', or 'unknown'.`,
      severity: 'error',
      rawData: raw,
    });
  }

  // Warnings for unusual readings
  if (!isNaN(actualKwh) && actualKwh > 50) {
    issues.push({
      id: `warn-row-${rowIndex}-highKwh`,
      row: rowIndex,
      roomId,
      field: 'actual_kwh',
      message: `Row ${rowIndex}: Unusually high consumption reading (${actualKwh} kWh) for a single interval. Please verify meter multiplier.`,
      severity: 'warning',
      rawData: raw,
    });
  }

  // Interval Minutes
  const intervalRaw = raw.interval_minutes ?? raw.intervalMinutes;
  const intervalMinutes = typeof intervalRaw === 'number' ? intervalRaw : typeof intervalRaw === 'string' ? parseInt(intervalRaw.trim(), 10) : 60;
  const finalIntervalMinutes = (!isNaN(intervalMinutes) && intervalMinutes > 0) ? intervalMinutes : 60;

  // Occupancy Source & Data Source
  const occSourceRaw = raw.occupancy_source ?? raw.occupancySource;
  const occSource = (occSourceRaw === 'manual' || occSourceRaw === 'timetable' || occSourceRaw === 'simulated')
    ? (occSourceRaw as 'manual' | 'timetable' | 'simulated')
    : 'timetable';

  const dataSourceRaw = raw.data_source ?? raw.dataSource;
  const dataSource = (dataSourceRaw === 'measured' || dataSourceRaw === 'uploaded' || dataSourceRaw === 'simulated')
    ? (dataSourceRaw as 'measured' | 'uploaded' | 'simulated')
    : 'uploaded';

  const hasFatalErrors = issues.some((i) => i.severity === 'error');

  if (hasFatalErrors) {
    return { issues };
  }

  const validInterval: RoomInterval = {
    id: (raw.id as string) || `${roomId}-${parsedDate!.toISOString()}`,
    roomId,
    timestamp: parsedDate!.toISOString(),
    intervalMinutes: finalIntervalMinutes,
    expectedOccupancy,
    occupancySource: occSource,
    actualKwh,
    expectedKwh,
    dataSource,
    building: (raw.building as string) || undefined,
    roomName: (raw.room_name as string) || (raw.roomName as string) || undefined,
  };

  return { validInterval, issues };
}

export function validateIntervals(records: Record<string, unknown>[]): ValidationResult {
  const validIntervals: RoomInterval[] = [];
  const errors: DataQualityIssue[] = [];
  const warnings: DataQualityIssue[] = [];
  const seenKeys = new Map<string, number>();

  records.forEach((raw, idx) => {
    const rowNum = idx + 1;
    const { validInterval, issues } = validateRawRecord(raw, rowNum);

    issues.forEach((issue) => {
      if (issue.severity === 'error') {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    });

    if (validInterval) {
      // Deduplication check: roomId + timestamp
      const dedupeKey = `${validInterval.roomId}__${validInterval.timestamp}`;
      if (seenKeys.has(dedupeKey)) {
        const previousRow = seenKeys.get(dedupeKey)!;
        warnings.push({
          id: `warn-row-${rowNum}-duplicate`,
          row: rowNum,
          roomId: validInterval.roomId,
          field: 'timestamp',
          message: `Row ${rowNum}: Duplicate interval record detected for Room ${validInterval.roomId} at ${validInterval.timestamp} (earlier entry at Row ${previousRow}). Skipped duplicate to avoid double counting.`,
          severity: 'warning',
          rawData: raw,
        });
      } else {
        seenKeys.set(dedupeKey, rowNum);
        validIntervals.push(validInterval);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    validIntervals,
    errors,
    warnings,
    totalRowsProcessed: records.length,
  };
}
