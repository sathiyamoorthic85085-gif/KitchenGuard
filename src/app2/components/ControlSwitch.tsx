import { LucideIcon } from "lucide-react";

interface ControlSwitchProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isOn: boolean;
  onToggle: (newState: boolean) => void;
  color: "red" | "blue" | "green";
  onLabel: string;
  offLabel: string;
}

const colorClasses = {
  red: {
    bg: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
    icon: "text-red-400",
    switch: "bg-red-500",
  },
  blue: {
    bg: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    icon: "text-blue-400",
    switch: "bg-blue-500",
  },
  green: {
    bg: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
    icon: "text-green-400",
    switch: "bg-green-500",
  },
};

export default function ControlSwitch({
  title,
  description,
  icon: Icon,
  isOn,
  onToggle,
  color,
  onLabel,
  offLabel,
}: ControlSwitchProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm rounded-xl p-5 border ${colors.border} shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-3 rounded-xl bg-slate-800/50 ${colors.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg">{title}</h3>
            <p className="text-slate-400 text-sm mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className={`text-sm font-medium ${isOn ? "text-green-400" : "text-slate-400"}`}>
              {isOn ? onLabel : offLabel}
            </p>
          </div>
          <button
            onClick={() => onToggle(!isOn)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
              isOn ? colors.switch : "bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg ${
                isOn ? "translate-x-7" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
