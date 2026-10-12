import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useRoomPulse } from '../../context/RoomPulseContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const { resetAllDemoData, toastMessage, setToastMessage } = useRoomPulse();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onResetClick={() => setResetModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
            <div
              className={`p-3.5 rounded-xl border shadow-lg flex items-center justify-between gap-3 text-xs font-semibold ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-950 text-rose-100 border-rose-800'
                  : 'bg-slate-900 text-slate-100 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : toastMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/60 px-6 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">RoomPulse</span>
            <span className="text-slate-300">•</span>
            <span>Deterministic Campus Energy Wastage Detection</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Configurable Rules • Timetable Cross-Referencing • Transparent Calculations
          </div>
        </footer>
      </div>

      {/* Confirmation Modal for Demo Data Reset */}
      <ConfirmationModal
        isOpen={resetModalOpen}
        title="Reset All Demo Data?"
        message="This action will restore the original 12 campus rooms, deterministic timetable intervals, default detection thresholds (0.50 kWh empty, ₹8.00/kWh tariff), and clear all custom alert statuses from local storage."
        confirmLabel="Reset to Defaults"
        isDestructive={true}
        onConfirm={resetAllDemoData}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
};
