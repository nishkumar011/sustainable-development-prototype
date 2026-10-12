import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
import { useRoomPulse } from '../../context/RoomPulseContext';
import { RoomPulseService } from '../../services/roomPulseService';
import { ValidationResult } from '../../types';
import { exportSampleTemplateCSV } from '../../utils/csvExporter';
import { INVALID_TEST_CSV } from '../../data/sampleData';

interface DataUploadProps {
  onValidationComplete: (result: ValidationResult) => void;
  currentValidCount: number;
}

export const DataUpload: React.FC<DataUploadProps> = ({
  onValidationComplete,
  currentValidCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { loadSampleData } = useRoomPulse();

  const handleProcessCsvText = (text: string, name: string) => {
    setIsProcessing(true);
    setFileName(name);

    setTimeout(() => {
      const result = RoomPulseService.importCSV(text);
      setValidationResult(result);
      setIsProcessing(false);
      onValidationComplete(result);
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessCsvText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessCsvText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setFileName('sample-campus-day.csv');
    setValidationResult(null);
    loadSampleData();
  };

  const handleLoadInvalidSample = () => {
    handleProcessCsvText(INVALID_TEST_CSV, 'flawed-validation-test.csv');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Dataset Ingestion</h3>
          <p className="text-xs text-slate-500">
            Import meter readings & occupancy intervals via CSV or load standard campus dataset
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportSampleTemplateCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Download CSV format template"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Template</span>
          </button>
          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>

      {/* Drag & drop upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-3 flex items-center justify-center">
          {isProcessing ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <p className="text-sm font-bold text-slate-800 mb-1">
          {fileName ? `Loaded: ${fileName}` : 'Click to select CSV or drag and drop file here'}
        </p>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Expected columns: <code className="text-slate-600 font-mono">room_id, timestamp, expected_occupancy, actual_kwh, expected_kwh</code>
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-[11px] text-slate-400">Want to test error handling?</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadInvalidSample();
            }}
            className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
          >
            Load Malformed Test File
          </button>
        </div>
      </div>

      {/* Validation feedback card */}
      {validationResult && (
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {validationResult.errors.length === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-xs font-bold text-slate-900">
                {validationResult.errors.length === 0
                  ? `Validation Succeeded: ${validationResult.validIntervals.length} records ready for detection`
                  : `Validation Failed: ${validationResult.errors.length} fatal error(s) found in file`}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total rows: {validationResult.totalRowsProcessed}
            </span>
          </div>

          {/* Fatal errors */}
          {validationResult.errors.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-rose-700 block">
                Row-level errors (records excluded):
              </span>
              <ul className="text-xs text-rose-600 space-y-1 max-h-36 overflow-y-auto pr-1">
                {validationResult.errors.map((err) => (
                  <li key={err.id} className="flex items-start gap-1.5 font-mono text-[11px]">
                    <span className="text-rose-400">•</span>
                    <span>{err.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings / skipped duplicates */}
          {validationResult.warnings.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Data Quality Warnings ({validationResult.warnings.length}):
              </span>
              <ul className="text-xs text-amber-700 space-y-1 max-h-28 overflow-y-auto pr-1">
                {validationResult.warnings.map((w) => (
                  <li key={w.id} className="flex items-start gap-1.5 font-mono text-[11px]">
                    <span className="text-amber-400">•</span>
                    <span>{w.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
