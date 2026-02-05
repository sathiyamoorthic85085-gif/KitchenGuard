import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Power, Fan, Zap, Settings } from "lucide-react";
import ControlSwitch from "@/react-app/components/ControlSwitch";
import AutomationRule from "@/react-app/components/AutomationRule";
import Header from "@/react-app/components/Header";
import { useDeviceStates } from "@/react-app/hooks/useDeviceStates";
import { useState, useEffect } from "react";

export default function ControlCenterPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { deviceStates, isLoading: isDevicesLoading, toggleDevice } = useDeviceStates();
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [isRulesLoading, setIsRulesLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch("/api/automation/rules");
        const data = await response.json();
        setAutomationRules(data.rules || []);
        setIsRulesLoading(false);
      } catch (error) {
        setIsRulesLoading(false);
      }
    };

    if (user) {
      fetchRules();
    }
  }, [user]);

  if (isPending || isDevicesLoading || isRulesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const gasValveState = deviceStates.gas_valve;
  const exhaustFanState = deviceStates.exhaust_fan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Control Center</h1>
          </div>
          <p className="text-slate-400">
            Manually control devices and configure automation rules
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Power className="w-5 h-5 text-blue-400" />
              Manual Controls
            </h2>
            <div className="space-y-4">
              <ControlSwitch
                title="Gas Valve"
                description="Main gas supply control"
                icon={Power}
                isOn={Boolean(gasValveState?.is_on)}
                onToggle={(newState) => toggleDevice("gas_valve", newState)}
                color="red"
                onLabel="Open"
                offLabel="Closed"
              />
              <ControlSwitch
                title="Exhaust Fan"
                description="Kitchen ventilation system"
                icon={Fan}
                isOn={Boolean(exhaustFanState?.is_on)}
                onToggle={(newState) => toggleDevice("exhaust_fan", newState)}
                color="blue"
                onLabel="Running"
                offLabel="Off"
              />
            </div>

            <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                <div>
                  <p className="text-amber-400 text-sm font-medium">Safety Notice</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Manual overrides will be active until you turn them off. Automation
                    rules will resume after manual control is disabled.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Automation Rules
            </h2>
            <div className="space-y-4">
              {automationRules.map((rule) => (
                <AutomationRule
                  key={rule.id}
                  title={rule.rule_type
                    .split("_")
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                  description={`${rule.action_device
                    .split("_")
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")} when ${rule.trigger_sensor.toUpperCase()} ${
                    rule.trigger_condition === "greater_than" ? ">" : "<"
                  } ${rule.trigger_threshold}`}
                  isEnabled={rule.is_enabled === 1}
                  onToggle={() => {}}
                  trigger={`${rule.trigger_sensor.toUpperCase()} ${
                    rule.trigger_condition === "greater_than" ? ">" : "<"
                  } ${rule.trigger_threshold}`}
                  action={`${
                    rule.action_state === "on" ? "Turn on" : "Turn off"
                  } ${rule.action_device.split("_").join(" ")}`}
                />
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-400 text-sm font-medium">Smart Protection</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Automation rules monitor sensors 24/7 and respond instantly to keep
                    your kitchen safe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  gasValveState?.is_on ? "bg-green-500" : "bg-red-500"
                } shadow-lg ${
                  gasValveState?.is_on ? "shadow-green-500/50" : "shadow-red-500/50"
                }`}
              />
              <div>
                <p className="text-slate-400 text-xs">Gas Valve</p>
                <p className="text-white text-sm font-medium">
                  {gasValveState?.is_on ? "Open" : "Closed"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  exhaustFanState?.is_on ? "bg-blue-500" : "bg-slate-500"
                } shadow-lg ${exhaustFanState?.is_on ? "shadow-blue-500/50" : ""}`}
              />
              <div>
                <p className="text-slate-400 text-xs">Exhaust Fan</p>
                <p className="text-white text-sm font-medium">
                  {exhaustFanState?.is_on ? "Running" : "Off"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
              <div>
                <p className="text-slate-400 text-xs">Automation</p>
                <p className="text-white text-sm font-medium">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
              <div>
                <p className="text-slate-400 text-xs">Connection</p>
                <p className="text-white text-sm font-medium">Online</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
