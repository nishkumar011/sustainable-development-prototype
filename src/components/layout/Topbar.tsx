import React from 'react';
import { Menu, Zap, Download, RefreshCw } from 'lucide-react';
import { useRoomPulse } from '../../context/RoomPulseContext';
import { StatusBadge } from '../common/StatusBadge';
import { exportAlertsToCSV, exportRoomSummariesToCSV } from '../../utils/csvExporter';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { activeTab, setActiveTab, settings, summary, alerts, isAnalyzing, triggerAnalysis } = useRoomPulse();

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Energy Waste Overview',
          subtitle: 'Detecting empty classrooms where lights, ACs, or computers were left running.',
        };
      case 'analysis':
        return {
          title: 'Upload & Test Data',
          subtitle: 'Upload a meter CSV or test sample records with 1 click.',
        };
      case 'alerts':
        return {
          title: 'Active Waste Alerts',
          subtitle: 'Inspect rooms and mark equipment as turned off.',
        };
      case 'rooms':
        return {
          title: 'Campus Spaces',
          subtitle: '12 monitored classrooms, labs, and halls across campus.',
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Configure electricity rate and detection thresholds.',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  // Determine main data source
  const hasUploaded = summary.dataSourceDistribution.uploaded > 0;
  const primaryDataSource = hasUploaded ? 'uploaded' : 'simulated';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Headings */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
              <div className="hidden sm:inline-block">
                <StatusBadge type="source" value={primaryDataSource} size="sm" />
              </div>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">{subtitle}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600">
            <span className="text-slate-400">Rate:</span>
            <span className="font-bold text-slate-900">₹{settings.tariffPerKwh}/unit</span>
          </div>

          {activeTab === 'alerts' && alerts.length > 0 && (
            <button
              onClick={() => exportAlertsToCSV(alerts)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Export filtered alerts to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export Alerts</span>
            </button>
          )}

          {activeTab === 'rooms' && summary.topRoomsByExcess.length > 0 && (
            <button
              onClick={() => exportRoomSummariesToCSV(summary.topRoomsByExcess)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Export room summaries to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export Rooms</span>
            </button>
          )}

          {activeTab !== 'analysis' && (
            <button
              onClick={() => {
                if (activeTab === 'dashboard') {
                  triggerAnalysis();
                } else {
                  setActiveTab('analysis');
                }
              }}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>{activeTab === 'dashboard' ? 'Re-analyze' : 'Run Detection'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
