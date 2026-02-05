import { LogOut, Settings, Languages } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import type { MochaUser } from "@getmocha/users-service/shared";
import StatusBadge from "@/react-app/components/StatusBadge";
import Navigation from "@/react-app/components/Navigation";
import { useLanguage } from "@/react-app/contexts/LanguageContext";

interface HeaderProps {
  user: MochaUser;
  systemStatus?: "safe" | "warning" | "danger";
}

export default function Header({ user, systemStatus = "safe" }: HeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  return (
    <>
      <header className="border-b border-slate-700/30 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
                {t.header.appName}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <StatusBadge status={systemStatus} />
              <button
                onClick={() => navigate("/profile")}
                className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.google_user_data.picture && (
                  <img
                    src={user.google_user_data.picture}
                    alt={user.google_user_data.name || "User"}
                    className="w-8 h-8 rounded-full border-2 border-slate-600/50 shadow-lg"
                  />
                )}
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 text-slate-300 hover:text-white transition-all backdrop-blur-sm border border-slate-600/30 shadow-lg flex items-center gap-1.5"
                  title="Change language"
                >
                  <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs font-semibold">{language.toUpperCase()}</span>
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="p-2 rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 text-slate-300 hover:text-white transition-all backdrop-blur-sm border border-slate-600/30 shadow-lg"
                  title={t.header.settings}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 text-slate-300 hover:text-white transition-all backdrop-blur-sm border border-slate-600/30 shadow-lg"
                  title={t.header.signOut}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Navigation />
    </>
  );
}
