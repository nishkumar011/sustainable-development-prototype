import React, { useState } from 'react';
import { useRoomPulse } from '../context/RoomPulseContext';
import { DEFAULT_SETTINGS } from '../data/roomConfig';
import { validateSettings } from '../engine/validation';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import {
  Save,
  RotateCcw,
  Trash2,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Info,
  Building,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllDemoData } = useRoomPulse();

  const [tariff, setTariff] = useState(settings.tariffPerKwh);
  const [emptyThreshold, setEmptyThreshold] = useState(settings.emptyRoomThresholdKwh);
  const [occupiedThreshold, setOccupiedThreshold] = useState(settings.occupiedRoomThresholdKwh);
  const [persistence, setPersistence] = useState(settings.persistenceIntervals);
  const [intervalMinutes, setIntervalMinutes] = useState(settings.defaultIntervalMinutes);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = {
      tariffPerKwh: Number(tariff),
      emptyRoomThresholdKwh: Number(emptyThreshold),
      occupiedRoomThresholdKwh: Number(occupiedThreshold),
      persistenceIntervals: Number(persistence),
      defaultIntervalMinutes: Number(intervalMinutes),
    };

    const val = validateSettings(candidate);
    if (!val.isValid) {
      setValidationErrors(val.errors);
      setSaveSuccess(false);
      return;
    }

    setValidationErrors([]);
    updateSettings(candidate);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setTariff(DEFAULT_SETTINGS.tariffPerKwh);
    setEmptyThreshold(DEFAULT_SETTINGS.emptyRoomThresholdKwh);
    setOccupiedThreshold(DEFAULT_SETTINGS.occupiedRoomThresholdKwh);
    setPersistence(DEFAULT_SETTINGS.persistenceIntervals);
    setIntervalMinutes(DEFAULT_SETTINGS.defaultIntervalMinutes);
    updateSettings(DEFAULT_SETTINGS);
    setValidationErrors([]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Platform Configurations &amp; Baselines
            </h2>
            <p className="text-xs text-slate-500">
              Configure detection thresholds, electricity rates, and multi-interval persistence rules
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <strong className="block mb-1 font-bold">Please correct the following errors:</strong>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">
              Settings successfully saved to local storage and re-applied to detection engine!
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tariff */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Electricity Rate (₹ / unit)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={tariff}
                onChange={(e) => setTariff(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Campus electricity billing rate per kWh. Used to calculate financial loss.
            </p>
          </div>

          {/* Empty room threshold */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Empty Room Waste Threshold (kWh)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={emptyThreshold}
                onChange={(e) => setEmptyThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400">
              If an empty classroom consumes more than this above idle baseline, an alert triggers.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Settings to Defaults</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Full Reset */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Reset Demo Data &amp; Local Storage</h3>
            <p className="text-xs text-slate-500">
              Restore the pristine deterministic 12-room dataset and clear all modified statuses
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          If you have uploaded custom CSV feeds or altered workflow alert statuses and want to return to the
          standard presentation demo state, click below. This will refresh all state to the factory defaults.
        </p>

        <button
          type="button"
          onClick={() => setResetModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      <ConfirmationModal
        isOpen={resetModalOpen}
        title="Confirm Factory Reset"
        message="Are you sure you want to restore original sample intervals, settings, and clear all acknowledged/investigating alert statuses?"
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={resetAllDemoData}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
};
