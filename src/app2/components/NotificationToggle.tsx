import { Mail, Bell, MessageSquare } from "lucide-react";

interface NotificationToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: "email" | "push" | "sms";
}

const iconMap = {
  email: Mail,
  push: Bell,
  sms: MessageSquare,
};

export default function NotificationToggle({
  label,
  description,
  enabled,
  onToggle,
  icon,
}: NotificationToggleProps) {
  const Icon = iconMap[icon];

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 transition-all duration-300 hover:border-slate-600/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-3 rounded-xl ${enabled ? "bg-blue-500/20" : "bg-slate-700/50"}`}>
            <Icon className={`w-5 h-5 ${enabled ? "text-blue-400" : "text-slate-500"}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{label}</h3>
            <p className="text-slate-400 text-sm mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
            enabled ? "bg-blue-500" : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg ${
              enabled ? "translate-x-7" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
