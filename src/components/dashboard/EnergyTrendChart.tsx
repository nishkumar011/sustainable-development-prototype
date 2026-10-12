import React, { useState } from 'react';
import { EnergyTrendPoint } from '../../types';
import { formatKwh } from '../../utils/formatters';

interface EnergyTrendChartProps {
  data: EnergyTrendPoint[];
}

export const EnergyTrendChart: React.FC<EnergyTrendChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No interval time series data recorded yet.
      </div>
    );
  }

  // Find max value for scaling
  const maxVal = Math.max(...data.map((d) => Math.max(d.actualKwh, d.expectedKwh)), 5);
  const roundedMax = Math.ceil(maxVal * 1.15);

  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const pointsCount = data.length;
  const stepX = pointsCount > 1 ? innerWidth / (pointsCount - 1) : innerWidth;

  const getY = (val: number) => {
    return paddingY + innerHeight - (val / roundedMax) * innerHeight;
  };

  // Build SVG path strings
  const actualPathPoints = data.map((d, i) => `${paddingX + i * stepX},${getY(d.actualKwh)}`).join(' L ');
  const expectedPathPoints = data.map((d, i) => `${paddingX + i * stepX},${getY(d.expectedKwh)}`).join(' L ');

  // Excess area path between actual and expected when actual > expected
  const actualPath = `M ${actualPathPoints}`;
  const expectedPath = `M ${expectedPathPoints}`;

  // Area under actual
  const actualAreaPath = `M ${paddingX},${getY(data[0].actualKwh)} L ${actualPathPoints} L ${
    paddingX + (pointsCount - 1) * stepX
  },${paddingY + innerHeight} L ${paddingX},${paddingY + innerHeight} Z`;

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Campus Energy Consumption Profile
          </h3>
          <p className="text-xs text-slate-500">
            Observed actual load vs expected baseline across intervals
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-700">Actual (kWh)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400 stroke-dashed" />
            <span className="text-slate-500">Expected Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500/20 border border-rose-400" />
            <span className="text-rose-700 font-bold">Excess Waste</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="excessGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + innerHeight * (1 - ratio);
            const val = (ratio * roundedMax).toFixed(1);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={actualAreaPath} fill="url(#actualGradient)" />

          {/* Baseline stroke (dashed) */}
          <path
            d={expectedPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Actual line stroke */}
          <path
            d={actualPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Interactive hover zones */}
          {data.map((d, i) => {
            const cx = paddingX + i * stepX;
            const cyActual = getY(d.actualKwh);
            const cyExpected = getY(d.expectedKwh);
            const hasExcess = d.excessKwh > 0;
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={paddingY + innerHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Excess connector if wastage occurred */}
                {hasExcess && (
                  <line
                    x1={cx}
                    y1={cyActual}
                    x2={cx}
                    y2={cyExpected}
                    stroke="#f43f5e"
                    strokeWidth={isHovered ? '3' : '2'}
                    strokeLinecap="round"
                  />
                )}

                {/* Point dots */}
                <circle
                  cx={cx}
                  cy={cyActual}
                  r={isHovered ? 5.5 : 3.5}
                  fill={hasExcess ? '#f43f5e' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* X axis labels */}
                {(pointsCount <= 8 || i % 2 === 0 || i === pointsCount - 1) && (
                  <text
                    x={cx}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-medium"
                  >
                    {d.timeLabel}
                  </text>
                )}

                {/* Transparent hit area for mouse interaction */}
                <rect
                  x={cx - (stepX / 2 || 15)}
                  y={paddingY}
                  width={stepX || 30}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="absolute top-2 right-4 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs pointer-events-none transition-all z-20 min-w-[200px]"
          >
            <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between">
              <span>{hoveredPoint.timeLabel}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {hoveredPoint.intervalCount} intervals
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Actual:</span>
                <span className="font-bold text-emerald-400">{formatKwh(hoveredPoint.actualKwh)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Expected Baseline:</span>
                <span className="font-medium text-slate-300">{formatKwh(hoveredPoint.expectedKwh)}</span>
              </div>
              {hoveredPoint.excessKwh > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-rose-400 font-semibold">Potential Excess:</span>
                  <span className="font-bold text-rose-400">+{formatKwh(hoveredPoint.excessKwh)}</span>
                </div>
              )}
              {hoveredPoint.alertsTriggered > 0 && (
                <div className="text-[10px] text-amber-300 font-semibold pt-0.5">
                  ⚠️ {hoveredPoint.alertsTriggered} alert{hoveredPoint.alertsTriggered > 1 ? 's' : ''} during this interval
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
        <span>Unit: kWh consumed per monitored interval</span>
        <span>Awaiting live campus sub-metering verification</span>
      </div>
    </div>
  );
};
