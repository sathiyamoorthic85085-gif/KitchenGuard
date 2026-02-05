import { Home, Sliders, Bell, Users, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useLanguage } from "@/react-app/contexts/LanguageContext";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { name: t.nav.home, path: "/", icon: Home },
    { name: t.nav.control, path: "/control", icon: Sliders },
    { name: t.nav.alerts, path: "/alerts", icon: Bell },
    { name: t.nav.family, path: "/family", icon: Users },
    { name: t.nav.settings, path: "/settings", icon: Settings },
  ];

  return (
    <nav className="bg-slate-900/70 backdrop-blur-md border-b border-slate-700/30 sticky top-[60px] sm:top-[68px] z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 transition-all whitespace-nowrap group ${
                  isActive
                    ? "text-blue-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 shadow-lg shadow-blue-500/50"></div>
                )}
                <div className={`p-1.5 rounded-lg transition-all ${
                  isActive 
                    ? "bg-blue-500/20 shadow-lg shadow-blue-500/30" 
                    : "group-hover:bg-slate-800/50"
                }`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
