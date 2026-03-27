import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import MobileNav from "./components/MobileNav";
import AdminDashboard from "./pages/AdminDashboard";
import BookingLookupPage from "./pages/BookingLookupPage";
import ClientDashboard from "./pages/ClientDashboard";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SitterDashboard from "./pages/SitterDashboard";
import SitterDetailPage from "./pages/SitterDetailPage";

export type View =
  | "home"
  | "sitter-detail"
  | "booking-lookup"
  | "client-dashboard"
  | "sitter-dashboard"
  | "admin-dashboard"
  | "login";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedSitterId, setSelectedSitterId] = useState<bigint | null>(null);
  const [clientEmail, setClientEmail] = useState<string>("");

  const navigate = (view: View, sitterId?: bigint, email?: string) => {
    if (sitterId !== undefined) setSelectedSitterId(sitterId);
    if (email !== undefined) setClientEmail(email);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {currentView === "home" && <HomePage navigate={navigate} />}
      {currentView === "sitter-detail" && selectedSitterId !== null && (
        <SitterDetailPage sitterId={selectedSitterId} navigate={navigate} />
      )}
      {currentView === "booking-lookup" && (
        <BookingLookupPage navigate={navigate} />
      )}
      {currentView === "client-dashboard" && (
        <ClientDashboard navigate={navigate} initialEmail={clientEmail} />
      )}
      {currentView === "sitter-dashboard" && (
        <SitterDashboard navigate={navigate} />
      )}
      {currentView === "admin-dashboard" && (
        <AdminDashboard navigate={navigate} />
      )}
      {currentView === "login" && <LoginPage navigate={navigate} />}
      <MobileNav currentView={currentView} navigate={navigate} />
      <Toaster richColors position="top-right" />
    </>
  );
}
