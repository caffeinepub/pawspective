import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import MobileNav from "./components/MobileNav";
import AdminDashboard from "./pages/AdminDashboard";
import BookingLookupPage from "./pages/BookingLookupPage";
import ClientDashboard from "./pages/ClientDashboard";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PrivacyPage from "./pages/PrivacyPage";
import SitterApplicationPage from "./pages/SitterApplicationPage";
import SitterDashboard from "./pages/SitterDashboard";
import SitterDetailPage from "./pages/SitterDetailPage";
import TermsPage from "./pages/TermsPage";

export type View =
  | "home"
  | "sitter-detail"
  | "booking-lookup"
  | "client-dashboard"
  | "sitter-dashboard"
  | "admin-dashboard"
  | "sitter-apply"
  | "login"
  | "terms"
  | "privacy";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedSitterId, setSelectedSitterId] = useState<bigint | null>(null);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const navigate = (view: View, sitterId?: bigint, email?: string) => {
    if (sitterId !== undefined) setSelectedSitterId(sitterId);
    if (email !== undefined) setClientEmail(email);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {currentView === "home" && (
        <div key="home" className="page-enter">
          <HomePage
            navigate={navigate}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </div>
      )}
      {currentView === "sitter-detail" && selectedSitterId !== null && (
        <div key="sitter-detail" className="page-enter">
          <SitterDetailPage sitterId={selectedSitterId} navigate={navigate} />
        </div>
      )}
      {currentView === "booking-lookup" && (
        <div key="booking-lookup" className="page-enter">
          <BookingLookupPage navigate={navigate} />
        </div>
      )}
      {currentView === "client-dashboard" && (
        <div key="client-dashboard" className="page-enter">
          <ClientDashboard navigate={navigate} initialEmail={clientEmail} />
        </div>
      )}
      {currentView === "sitter-dashboard" && (
        <div key="sitter-dashboard" className="page-enter">
          <SitterDashboard
            navigate={navigate}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </div>
      )}
      {currentView === "admin-dashboard" && (
        <div key="admin-dashboard" className="page-enter">
          <AdminDashboard
            navigate={navigate}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </div>
      )}
      {currentView === "sitter-apply" && (
        <div key="sitter-apply" className="page-enter">
          <SitterApplicationPage navigate={navigate} />
        </div>
      )}
      {currentView === "login" && (
        <div key="login" className="page-enter">
          <LoginPage navigate={navigate} />
        </div>
      )}
      {currentView === "terms" && (
        <div key="terms" className="page-enter">
          <TermsPage navigate={navigate} />
        </div>
      )}
      {currentView === "privacy" && (
        <div key="privacy" className="page-enter">
          <PrivacyPage navigate={navigate} />
        </div>
      )}
      <MobileNav currentView={currentView} navigate={navigate} />
      <Toaster richColors position="top-right" />
    </>
  );
}
