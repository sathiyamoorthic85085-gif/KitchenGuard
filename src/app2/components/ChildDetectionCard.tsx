import { Baby, Shield } from "lucide-react";
import { useLanguage } from "@/react-app/contexts/LanguageContext";

interface ChildDetectionCardProps {
  isDetected: boolean;
}

export default function ChildDetectionCard({ isDetected }: ChildDetectionCardProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl border p-4 sm:p-5 shadow-2xl transition-all backdrop-blur-sm ${
        isDetected
          ? "bg-gradient-to-br from-red-900/60 via-red-800/40 to-pink-900/50 border-red-500/60 shadow-red-500/20"
          : "bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 border-slate-600/50"
      }`}
    >
      {/* Gloss effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 sm:p-2.5 rounded-lg backdrop-blur-sm shadow-lg border ${
              isDetected ? "bg-red-500/30 border-red-400/30" : "bg-slate-900/80 border-slate-700/50"
            }`}
          >
            <Baby className={`w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg ${isDetected ? "text-red-300" : "text-slate-400"}`} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white drop-shadow-md">{t.home.childDetection}</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {isDetected ? t.home.childDetected : t.home.noChildDetected}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDetected && (
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/30 backdrop-blur-sm rounded-full border border-red-400/30 shadow-lg">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-red-300 drop-shadow-md" />
              <span className="text-xs sm:text-sm text-red-200 font-semibold drop-shadow-md">{t.home.gasClosed}</span>
            </div>
          )}
          <div
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
              isDetected ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" : "bg-emerald-500 shadow-lg shadow-emerald-500/50"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
