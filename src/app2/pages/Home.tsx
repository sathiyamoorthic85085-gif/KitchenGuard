import { Flame, Wind, Thermometer, Activity, Shield, TrendingUp } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import SensorCard from "@/react-app/components/SensorCard";
import ChildDetectionCard from "@/react-app/components/ChildDetectionCard";
import Header from "@/react-app/components/Header";
import { useSensorData } from "@/react-app/hooks/useSensorData";
import { useLanguage } from "@/react-app/contexts/LanguageContext";

export default function HomePage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { sensorData, isLoading: isSensorLoading, thresholds } = useSensorData();
  const { t } = useLanguage();

  const systemStatus =
    sensorData?.lpg.status === "danger" ||
    sensorData?.co.status === "danger" ||
    sensorData?.temperature.status === "danger" ||
    sensorData?.childDetected.status === "danger"
      ? ("danger" as const)
      : sensorData?.lpg.status === "warning" ||
        sensorData?.co.status === "warning" ||
        sensorData?.temperature.status === "warning"
      ? ("warning" as const)
      : ("safe" as const);

  if (isPending || isSensorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!sensorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-white">No data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        <Header user={user} systemStatus={systemStatus} />

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Dashboard Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* System Status Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-slate-400">System</span>
                </div>
                <div className={`text-xl font-bold ${
                  systemStatus === 'safe' ? 'text-emerald-400' :
                  systemStatus === 'warning' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {systemStatus === 'danger' ? t.status.alert : t.status[systemStatus]}
                </div>
              </div>
            </div>

            {/* Active Sensors Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-slate-400">Sensors</span>
                </div>
                <div className="text-xl font-bold text-white">
                  3/3
                </div>
              </div>
            </div>

            {/* Avg Temp Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  <span className="text-xs text-slate-400">Avg Temp</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {sensorData.temperature.value}°C
                </div>
              </div>
            </div>

            {/* Trend Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-slate-400">24h Trend</span>
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  Stable
                </div>
              </div>
            </div>
          </div>

          {/* Child Detection - Full Width */}
          <ChildDetectionCard isDetected={sensorData.childDetected.isDetected} />

          {/* Main Sensor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <SensorCard
              icon={Flame}
              title={t.home.lpg}
              value={sensorData.lpg.value}
              unit={sensorData.lpg.unit}
              threshold={thresholds.lpg}
              status={sensorData.lpg.status}
              color="red"
            />
            <SensorCard
              icon={Wind}
              title={t.home.co}
              value={sensorData.co.value}
              unit={sensorData.co.unit}
              threshold={thresholds.co}
              status={sensorData.co.status}
              color="purple"
            />
            <SensorCard
              icon={Thermometer}
              title={t.home.temperature}
              value={sensorData.temperature.value}
              unit={sensorData.temperature.unit}
              threshold={thresholds.temp}
              status={sensorData.temperature.status}
              color="orange"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
