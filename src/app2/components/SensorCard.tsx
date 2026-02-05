import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/react-app/contexts/LanguageContext";

interface SensorCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  unit: string;
  threshold: number;
  status: "safe" | "warning" | "danger";
  color: "red" | "purple" | "orange";
}

export default function SensorCard({
  icon: Icon,
  title,
  value,
  unit,
  threshold,
  status,
  color,
}: SensorCardProps) {
  const { t } = useLanguage();

  const colorMap = {
    red: {
      safe: "from-slate-800/80 via-slate-800/60 to-slate-700/60 border-slate-600/50",
      warning: "from-amber-900/50 via-amber-800/30 to-orange-900/40 border-amber-500/50",
      danger: "from-red-900/60 via-red-800/40 to-pink-900/50 border-red-500/60",
      icon: "text-red-400",
      glow: "shadow-red-500/20",
    },
    purple: {
      safe: "from-slate-800/80 via-slate-800/60 to-slate-700/60 border-slate-600/50",
      warning: "from-amber-900/50 via-amber-800/30 to-orange-900/40 border-amber-500/50",
      danger: "from-purple-900/60 via-purple-800/40 to-indigo-900/50 border-purple-500/60",
      icon: "text-purple-400",
      glow: "shadow-purple-500/20",
    },
    orange: {
      safe: "from-slate-800/80 via-slate-800/60 to-slate-700/60 border-slate-600/50",
      warning: "from-amber-900/50 via-amber-800/30 to-orange-900/40 border-amber-500/50",
      danger: "from-orange-900/60 via-orange-800/40 to-red-900/50 border-orange-500/60",
      icon: "text-orange-400",
      glow: "shadow-orange-500/20",
    },
  };

  const statusLabels = {
    safe: t.home.normal,
    warning: t.home.warning,
    danger: t.home.critical,
  };

  const statusColor = {
    safe: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${colorMap[color][status]} border rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl ${status === 'danger' ? colorMap[color].glow : ''} transition-all backdrop-blur-sm`}
    >
      {/* Gloss effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-2.5 bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700/50`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorMap[color].icon} drop-shadow-lg`} />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white drop-shadow-md">{title}</h3>
          </div>
          <div
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
              status === "danger" ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" : 
              status === "warning" ? "bg-amber-500 shadow-lg shadow-amber-500/50" : 
              "bg-emerald-500 shadow-lg shadow-emerald-500/50"
            }`}
          />
        </div>

        <div className="mb-3">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent drop-shadow-lg">{value}</span>
            <span className="text-base sm:text-lg text-slate-300 drop-shadow-md">{unit}</span>
          </div>
          <div className="mt-1 text-xs sm:text-sm text-slate-400">
            {t.home.threshold}: {threshold} {unit}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className={`font-medium ${statusColor[status]} drop-shadow-md`}>
            {statusLabels[status]}
          </span>
          <span className="text-slate-400 font-medium">
            {Math.round((value / threshold) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
