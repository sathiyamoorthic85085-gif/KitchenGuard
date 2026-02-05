import { useLanguage } from "@/react-app/contexts/LanguageContext";

interface StatusBadgeProps {
  status: "safe" | "warning" | "danger";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();

  const statusConfig = {
    safe: {
      bg: "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
      text: "text-emerald-400",
      dot: "bg-emerald-500 shadow-lg shadow-emerald-500/50",
      label: t.status.safe,
      border: "border-emerald-500/30",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
      text: "text-amber-400",
      dot: "bg-amber-500 shadow-lg shadow-amber-500/50",
      label: t.status.warning,
      border: "border-amber-500/30",
    },
    danger: {
      bg: "bg-gradient-to-r from-red-500/20 to-pink-500/20",
      text: "text-red-400",
      dot: "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse",
      label: t.status.alert,
      border: "border-red-500/30",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${config.bg} backdrop-blur-sm border ${config.border} shadow-lg`}>
      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${config.dot}`} />
      <span className={`text-xs sm:text-sm font-semibold ${config.text} drop-shadow-md`}>{config.label}</span>
    </div>
  );
}
