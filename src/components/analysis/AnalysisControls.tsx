import React, { useState } from 'react';
import { AnalysisSettings } from '../../types';
import { Zap, RotateCcw, Sliders } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../../data/roomConfig';

interface AnalysisControlsProps {
  currentSettings: AnalysisSettings;
  isAnalyzing: boolean;
  onRunAnalysis: (updatedSettings: AnalysisSettings) => void;
  onResetDefaults: () => void;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  currentSettings,
  isAnalyzing,
  onRunAnalysis,
  onResetDefaults,
}) => {
  const [tariff, setTariff] = useState<number>(currentSettings.tariffPerKwh);
  const [emptyThreshold, setEmptyThreshold] = useState<number>(currentSettings.emptyRoomThresholdKwh);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunAnalysis({
      ...currentSettings,
      tariffPerKwh: Number(tariff),
      emptyRoomThresholdKwh: Number(emptyThreshold),
    });
  };

  const handleReset = () => {
    setTariff(DEFAULT_SETTINGS.tariffPerKwh);
    setEmptyThreshold(DEFAULT_SETTINGS.emptyRoomThresholdKwh);
    onResetDefaults();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Detection Settings</h3>
            <p className="text-xs text-slate-400">Configure cost rate and sensitivity threshold</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tariff */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Electricity Rate (₹ / kWh)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={tariff}
              onChange={(e) => setTariff(parseFloat(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Used to calculate monetary loss in ₹
          </span>
        </div>

        {/* Empty Threshold */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Empty Room Waste Cutoff (kWh)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={emptyThreshold}
            onChange={(e) => setEmptyThreshold(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Alerts trigger when empty room draws more than this above baseline (default: 0.5 kWh)
          </span>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? 'Checking...' : 'Run Waste Check'}</span>
        </button>
      </div>
    </form>
  );
};
