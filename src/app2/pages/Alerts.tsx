import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react";
import Header from "@/react-app/components/Header";
import AlertCard from "@/react-app/components/AlertCard";
import { useState } from "react";

// Stub data for alerts
const stubAlerts = [
  {
    id: 1,
    type: "LPG Leak",
    severity: "critical" as const,
    message: "LPG levels exceeded safe threshold",
    sensorValue: 87,
    threshold: 50,
    unit: "ppm",
    timestamp: "2024-01-15T14:23:00Z",
    isResolved: true,
    resolvedAt: "2024-01-15T14:25:00Z",
  },
  {
    id: 2,
    type: "High Temperature",
    severity: "warning" as const,
    message: "Kitchen temperature exceeded safe limit",
    sensorValue: 68,
    threshold: 60,
    unit: "°C",
    timestamp: "2024-01-15T12:15:00Z",
    isResolved: true,
    resolvedAt: "2024-01-15T12:20:00Z",
  },
  {
    id: 3,
    type: "CO Detection",
    severity: "critical" as const,
    message: "Carbon monoxide detected above threshold",
    sensorValue: 42,
    threshold: 35,
    unit: "ppm",
    timestamp: "2024-01-14T18:45:00Z",
    isResolved: false,
    resolvedAt: null,
  },
  {
    id: 4,
    type: "LPG Leak",
    severity: "warning" as const,
    message: "LPG levels approaching threshold",
    sensorValue: 55,
    threshold: 50,
    unit: "ppm",
    timestamp: "2024-01-14T09:30:00Z",
    isResolved: true,
    resolvedAt: "2024-01-14T09:32:00Z",
  },
  {
    id: 5,
    type: "High Temperature",
    severity: "info" as const,
    message: "Temperature spike detected",
    sensorValue: 63,
    threshold: 60,
    unit: "°C",
    timestamp: "2024-01-13T16:20:00Z",
    isResolved: true,
    resolvedAt: "2024-01-13T16:25:00Z",
  },
];

export default function AlertsPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "resolved">("all");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "warning" | "info">("all");

  if (isPending) {
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

  // Filter alerts
  const filteredAlerts = stubAlerts.filter((alert) => {
    if (filterStatus === "active" && alert.isResolved) return false;
    if (filterStatus === "resolved" && !alert.isResolved) return false;
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false;
    return true;
  });

  const activeAlertsCount = stubAlerts.filter((a) => !a.isResolved).length;
  const resolvedAlertsCount = stubAlerts.filter((a) => a.isResolved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Alerts & History</h1>
          </div>
          <p className="text-slate-400">
            Monitor and review safety alerts from your kitchen sensors
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/30 shadow-lg">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-red-400 text-sm font-medium">Active Alerts</p>
                <p className="text-white text-3xl font-bold">{activeAlertsCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-green-400 text-sm font-medium">Resolved</p>
                <p className="text-white text-3xl font-bold">{resolvedAlertsCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Alerts</p>
                <p className="text-white text-3xl font-bold">{stubAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">
                Status
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "active"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus("resolved")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "resolved"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">
                Severity
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterSeverity("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSeverity === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterSeverity("critical")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSeverity === "critical"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Critical
                </button>
                <button
                  onClick={() => setFilterSeverity("warning")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSeverity === "warning"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Warning
                </button>
                <button
                  onClick={() => setFilterSeverity("info")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSeverity === "info"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Info
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 shadow-lg text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg font-medium">No alerts match your filters</p>
              <p className="text-slate-400 text-sm mt-2">Try adjusting your filter settings</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
