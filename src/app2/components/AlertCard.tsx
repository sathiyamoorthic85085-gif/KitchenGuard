import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface Alert {
  id: number;
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  sensorValue: number;
  threshold: number;
  unit: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt: string | null;
}

interface AlertCardProps {
  alert: Alert;
}

const severityConfig = {
  critical: {
    bg: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  warning: {
    bg: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  info: {
    bg: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
};

export default function AlertCard({ alert }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeDifference = (start: string, end: string | null) => {
    if (!end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div
      className={`bg-gradient-to-br ${config.bg} backdrop-blur-sm rounded-xl p-6 border ${config.border} shadow-lg transition-all duration-300 hover:shadow-xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-xl bg-slate-800/50 ${config.text}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-white">{alert.type}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${config.badge}`}
              >
                {alert.severity.toUpperCase()}
              </span>
              {alert.isResolved && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  RESOLVED
                </span>
              )}
            </div>
            <p className="text-slate-300">{alert.message}</p>
          </div>
        </div>
        {alert.isResolved ? (
          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0 mt-1 shadow-lg shadow-red-500/50" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs font-medium">Detected Value</p>
          </div>
          <p className={`text-lg font-bold ${config.text}`}>
            {alert.sensorValue} {alert.unit}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Threshold: {alert.threshold} {alert.unit}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <p className="text-slate-400 text-xs font-medium">Detected At</p>
          </div>
          <p className="text-white text-sm font-semibold">
            {formatTimestamp(alert.timestamp)}
          </p>
        </div>

        {alert.isResolved && alert.resolvedAt && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-slate-400 text-xs font-medium">Resolution Time</p>
            </div>
            <p className="text-green-400 text-sm font-semibold">
              {getTimeDifference(alert.timestamp, alert.resolvedAt)}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {formatTimestamp(alert.resolvedAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
