import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { LanguageProvider } from "@/react-app/contexts/LanguageContext";
import HomePage from "@/react-app/pages/Home";
import LoginPage from "@/react-app/pages/Login";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import ControlCenterPage from "@/react-app/pages/ControlCenter";
import AlertsPage from "@/react-app/pages/Alerts";
import SettingsPage from "@/react-app/pages/Settings";
import ProfilePage from "@/react-app/pages/Profile";
import FamilyCenterPage from "@/react-app/pages/FamilyCenter";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/control" element={<ControlCenterPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/family" element={<FamilyCenterPage />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
