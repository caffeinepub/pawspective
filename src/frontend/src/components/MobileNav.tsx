import { Home, PawPrint, Search, Shield } from "lucide-react";
import type { View } from "../App";

interface Props {
  currentView: View;
  navigate: (view: View) => void;
}

const NAV_ITEMS = [
  { view: "home" as View, label: "Home", icon: Home },
  { view: "booking-lookup" as View, label: "My Bookings", icon: Search },
  { view: "login" as View, label: "Sitter Portal", icon: PawPrint },
  { view: "admin-dashboard" as View, label: "Admin", icon: Shield },
];

export default function MobileNav({ currentView, navigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              type="button"
              data-ocid={`nav.${view}.link`}
              onClick={() => navigate(view)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[60px]"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={17} />
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
