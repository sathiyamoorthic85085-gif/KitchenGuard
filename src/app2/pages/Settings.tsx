import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Settings as SettingsIcon, Bell, User, Shield, Save } from "lucide-react";
import Header from "@/react-app/components/Header";
import ThresholdSlider from "@/react-app/components/ThresholdSlider";
import NotificationToggle from "@/react-app/components/NotificationToggle";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  const [lpgThreshold, setLpgThreshold] = useState(50);
  const [coThreshold, setCoThreshold] = useState(35);
  const [tempThreshold, setTempThreshold] = useState(60);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        
        if (data.settings) {
          setLpgThreshold(data.settings.lpg_threshold);
          setCoThreshold(data.settings.co_threshold);
          setTempThreshold(data.settings.temp_threshold);
          setEmailNotifications(data.settings.is_email_notifications_enabled === 1);
          setPushNotifications(data.settings.is_push_notifications_enabled === 1);
          setSmsNotifications(data.settings.is_sms_notifications_enabled === 1);
          setEmergencyName(data.settings.emergency_contact_name || "");
          setEmergencyPhone(data.settings.emergency_contact_phone || "");
          setEmergencyEmail(data.settings.emergency_contact_email || "");
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  if (isPending || isLoading) {
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lpg_threshold: lpgThreshold,
          co_threshold: coThreshold,
          temp_threshold: tempThreshold,
          is_email_notifications_enabled: emailNotifications,
          is_push_notifications_enabled: pushNotifications,
          is_sms_notifications_enabled: smsNotifications,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          emergency_contact_email: emergencyEmail,
        }),
      });
    } catch (error) {
      // Error handled silently - user can retry if needed
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
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
            <SettingsIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-slate-400">
            Configure alert thresholds and notification preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Alert Thresholds */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Safety Thresholds</h2>
            </div>
            <div className="space-y-6">
              <ThresholdSlider
                label="LPG Threshold"
                value={lpgThreshold}
                onChange={setLpgThreshold}
                min={10}
                max={100}
                step={5}
                unit="ppm"
                color="red"
                description="Alert when LPG levels exceed this value"
              />
              <ThresholdSlider
                label="Carbon Monoxide Threshold"
                value={coThreshold}
                onChange={setCoThreshold}
                min={10}
                max={70}
                step={5}
                unit="ppm"
                color="amber"
                description="Alert when CO levels exceed this value"
              />
              <ThresholdSlider
                label="Temperature Threshold"
                value={tempThreshold}
                onChange={setTempThreshold}
                min={40}
                max={100}
                step={5}
                unit="°C"
                color="orange"
                description="Alert when temperature exceeds this value"
              />
            </div>
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-400 text-sm font-medium">Safety Recommendation</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Lower thresholds provide earlier warnings but may trigger more alerts.
                    The default values are recommended for most kitchens.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <NotificationToggle
                label="Email Notifications"
                description="Receive alerts via email"
                enabled={emailNotifications}
                onToggle={() => setEmailNotifications(!emailNotifications)}
                icon="email"
              />
              <NotificationToggle
                label="Push Notifications"
                description="Receive real-time browser notifications"
                enabled={pushNotifications}
                onToggle={() => setPushNotifications(!pushNotifications)}
                icon="push"
              />
              <NotificationToggle
                label="SMS Notifications"
                description="Receive text messages for critical alerts"
                enabled={smsNotifications}
                onToggle={() => setSmsNotifications(!smsNotifications)}
                icon="sms"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Emergency Contact</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="mt-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-amber-400 text-sm font-medium">Emergency Protocol</p>
                    <p className="text-slate-400 text-xs mt-1">
                      This contact will be notified when critical alerts are detected and
                      remain unresolved for more than 5 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 p-4">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/50 border border-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
