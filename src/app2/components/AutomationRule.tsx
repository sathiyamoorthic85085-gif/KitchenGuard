import { ArrowRight } from "lucide-react";

interface AutomationRuleProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  trigger: string;
  action: string;
}

export default function AutomationRule({
  title,
  description,
  isEnabled,
  onToggle,
  trigger,
  action,
}: AutomationRuleProps) {
  return (
    <div
      className={`bg-gradient-to-br ${
        isEnabled
          ? "from-amber-500/10 to-amber-600/5 border-amber-500/30"
          : "from-slate-800/50 to-slate-700/30 border-slate-700/50"
      } backdrop-blur-sm rounded-xl p-5 border shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg mb-1">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ml-3 ${
            isEnabled ? "bg-amber-500" : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg ${
              isEnabled ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4 text-sm">
        <div
          className={`px-3 py-1.5 rounded-lg ${
            isEnabled
              ? "bg-slate-800/50 border border-slate-700"
              : "bg-slate-700/50 border border-slate-600"
          }`}
        >
          <p className="text-slate-300 font-mono">{trigger}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500" />
        <div
          className={`px-3 py-1.5 rounded-lg ${
            isEnabled
              ? "bg-amber-500/20 border border-amber-500/30"
              : "bg-slate-700/50 border border-slate-600"
          }`}
        >
          <p className={`${isEnabled ? "text-amber-300" : "text-slate-400"} font-medium`}>
            {action}
          </p>
        </div>
      </div>
    </div>
  );
}
