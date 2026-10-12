/**
 * Core mathematical and financial calculations for RoomPulse.
 * Pure and deterministic functions.
 */

export function calculateExcessEnergy(actualKwh: number, expectedKwh: number): number {
  if (isNaN(actualKwh) || isNaN(expectedKwh)) return 0;
  return Math.max(0, Number((actualKwh - expectedKwh).toFixed(4)));
}

export function calculatePotentialCost(excessKwh: number, tariffPerKwh: number): number {
  if (isNaN(excessKwh) || isNaN(tariffPerKwh) || excessKwh <= 0 || tariffPerKwh <= 0) return 0;
  return Number((excessKwh * tariffPerKwh).toFixed(2));
}

export function calculatePercentageExcess(actualKwh: number, expectedKwh: number): number {
  if (expectedKwh <= 0) return actualKwh > 0 ? 100 : 0;
  const ratio = ((actualKwh - expectedKwh) / expectedKwh) * 100;
  return Math.max(0, Number(ratio.toFixed(1)));
}

export function formatKwh(value: number, decimals = 2): string {
  if (isNaN(value)) return '0.00 kWh';
  return `${value.toFixed(decimals)} kWh`;
}

export function formatInr(value: number): string {
  if (isNaN(value)) return '₹0.00';
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
