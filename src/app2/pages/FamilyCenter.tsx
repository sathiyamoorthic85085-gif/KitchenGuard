import { useState, useEffect } from "react";
import { Users, UserPlus, Wifi, WifiOff, Trash2, Plus, Loader2, Check } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import Header from "@/react-app/components/Header";
import { useLanguage } from "@/react-app/contexts/LanguageContext";

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  has_app_access: number;
}

interface PairedDevice {
  id: number;
  device_id: string;
  device_name: string;
  device_type: string;
  is_online: number;
  is_paired: number;
  paired_at: string;
  firmware_version: string;
  last_seen_at: string;
}

export default function FamilyCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [devices, setDevices] = useState<PairedDevice[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showPairDevice, setShowPairDevice] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [pairingStep, setPairingStep] = useState<"generate" | "waiting" | "complete">("generate");
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      setIsLoading(false);
      fetchMembers();
      fetchDevices();
    }
  }, [user, navigate]);

  // Real-time polling for device pairing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPolling && pairingStep === "waiting") {
      interval = setInterval(async () => {
        // Check if a new device has been paired
        const response = await fetch("/api/family/devices");
        const data = await response.json();
        const newDevices = data.devices || [];
        
        // Check if there's a new device compared to previous state
        if (newDevices.length > devices.length) {
          setPairingStep("complete");
          setIsPolling(false);
          fetchDevices();
          setTimeout(() => {
            setShowPairDevice(false);
            setPairingStep("generate");
            setPairingCode("");
          }, 3000);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, pairingStep, devices.length]);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/family/members");
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/family/devices");
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const startPairing = async () => {
    try {
      const response = await fetch("/api/family/devices/pair/start", {
        method: "POST",
      });
      const data = await response.json();
      setPairingCode(data.pairingCode);
      setPairingStep("waiting");
      setIsPolling(true);
    } catch (error) {
      console.error("Error starting pairing:", error);
    }
  };

  const simulatePairing = async () => {
    // Simulate ESP32 device connection
    const deviceId = `ESP32-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const deviceName = "Kitchen ESP32";
    
    try {
      await fetch("/api/family/devices/pair/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          device_name: deviceName,
          pairing_code: pairingCode,
          device_type: "esp32",
          firmware_version: "v1.2.3",
        }),
      });
      
      setPairingStep("complete");
      setIsPolling(false);
      fetchDevices();
      setTimeout(() => {
        setShowPairDevice(false);
        setPairingStep("generate");
        setPairingCode("");
      }, 3000);
    } catch (error) {
      console.error("Error completing pairing:", error);
    }
  };

  const deleteMember = async (id: number) => {
    try {
      await fetch(`/api/family/members/${id}`, { method: "DELETE" });
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const deleteDevice = async (id: number) => {
    try {
      await fetch(`/api/family/devices/${id}`, { method: "DELETE" });
      fetchDevices();
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        <Header user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Family Members Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 shadow-2xl">
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg border border-blue-400/30 shadow-lg">
                    <Users className="w-6 h-6 text-blue-400 drop-shadow-lg" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{t.family.familyMembers}</h2>
                </div>
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 border border-blue-500/30"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="font-medium">{t.family.add}</span>
                </button>
              </div>

              {showAddMember && (
                <div className="mb-6 p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl">
                  <h3 className="text-white font-semibold mb-4">{t.family.addNewMember}</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      await fetch("/api/family/members", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: formData.get("name"),
                          relationship: formData.get("relationship"),
                          email: formData.get("email"),
                          phone: formData.get("phone"),
                          has_app_access: formData.get("has_app_access") === "on",
                        }),
                      });
                      setShowAddMember(false);
                      fetchMembers();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder={t.family.name}
                        required
                        className="px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        name="relationship"
                        placeholder={t.family.relationship}
                        required
                        className="px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder={t.family.email}
                        className="px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder={t.family.phone}
                        className="px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input type="checkbox" name="has_app_access" className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">{t.family.grantAccess}</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg"
                      >
                        {t.family.addMember}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-lg transition-all"
                      >
                        {t.family.cancel}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-900/80 transition-all shadow-lg"
                  >
                    <div>
                      <h3 className="text-white font-semibold">{member.name}</h3>
                      <p className="text-slate-400 text-sm">{member.relationship}</p>
                      {member.email && (
                        <p className="text-slate-500 text-xs mt-1">{member.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {member.has_app_access === 1 && (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                          {t.family.hasAccess}
                        </span>
                      )}
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Paired Devices Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 shadow-2xl">
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg border border-purple-400/30 shadow-lg">
                    <Wifi className="w-6 h-6 text-purple-400 drop-shadow-lg" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{t.family.devices}</h2>
                </div>
                <button
                  onClick={() => setShowPairDevice(!showPairDevice)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg transition-all shadow-lg hover:shadow-purple-500/50 border border-purple-500/30"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">{t.family.pair}</span>
                </button>
              </div>

              {showPairDevice && (
                <div className="mb-6 p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl">
                  {pairingStep === "generate" && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-full flex items-center justify-center mx-auto border border-purple-400/30 shadow-lg">
                        <Wifi className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-white font-bold text-lg">{t.family.pairDevice}</h3>
                      <p className="text-slate-400 text-sm max-w-md mx-auto">
                        {t.family.enterCode}
                      </p>
                      <button
                        onClick={startPairing}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg transition-all shadow-lg hover:shadow-purple-500/50 font-medium"
                      >
                        {t.family.generateCode}
                      </button>
                    </div>
                  )}

                  {pairingStep === "waiting" && (
                    <div className="text-center space-y-5">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        <h3 className="text-white font-bold text-lg">{t.family.waitingForDevice}</h3>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
                        <div className="relative text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent tracking-widest py-4 drop-shadow-2xl">
                          {pairingCode}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-300 text-sm font-medium">
                          {t.family.enterCode}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {t.family.listeningForDevice}
                        </p>
                      </div>
                      <div className="pt-2 space-y-2">
                        <button
                          onClick={simulatePairing}
                          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg transition-all shadow-lg hover:shadow-emerald-500/50 font-medium text-sm"
                        >
                          {t.family.simulateConnection}
                        </button>
                        <p className="text-slate-600 text-xs">{t.family.forDemo}</p>
                      </div>
                    </div>
                  )}

                  {pairingStep === "complete" && (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto border border-emerald-400/40 shadow-2xl shadow-emerald-500/30 animate-pulse">
                        <Check className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-white font-bold text-lg">{t.family.deviceConnected}</h3>
                      <p className="text-slate-300 text-sm">{t.family.deviceReady}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-900/80 transition-all shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg backdrop-blur-sm shadow-lg border ${
                          device.is_online 
                            ? "bg-emerald-500/20 border-emerald-400/30" 
                            : "bg-slate-700/50 border-slate-600/50"
                        }`}
                      >
                        {device.is_online ? (
                          <Wifi className="w-5 h-5 text-emerald-400 drop-shadow-lg" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{device.device_name}</h3>
                        <p className="text-slate-400 text-sm font-mono">{device.device_id}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-slate-500 text-xs">
                            v{device.firmware_version}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              device.is_online ? "text-emerald-400" : "text-slate-500"
                            }`}
                          >
                            {device.is_online ? `● ${t.family.online}` : `○ ${t.family.offline}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDevice(device.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
