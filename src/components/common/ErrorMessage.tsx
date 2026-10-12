import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning';
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  severity = 'error',
  onRetry,
}) => {
  const isError = severity === 'error';
  const Icon = isError ? AlertCircle : AlertTriangle;

  return (
    <div
      className={`rounded-xl border p-4 my-2 flex items-start gap-3 ${
        isError ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isError ? 'text-rose-600' : 'text-amber-600'}`} />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <p className="leading-relaxed opacity-90">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};
