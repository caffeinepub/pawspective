import { Home, Moon, PawPrint, Plus, Search, Shield, Sun } from "lucide-react";
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
    <>
      {/* Item 10: Floating Action Button for quick booking */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        <button
          type="button"
          data-ocid="nav.quick_book.button"
          onClick={() => {
            navigate("home");
            setTimeout(
              () =>
                document
                  .getElementById("sitters-section")
                  ?.scrollIntoView({ behavior: "smooth" }),
              100,
            );
          }}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
          aria-label="Quick Book"
        >
          <Plus size={22} />
        </button>
      </div>

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
                {/* Item 10: filled pill behind active icon */}
                <div
                  className={`w-10 h-8 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// Exported so pages can use a shared dark mode toggle
export function DarkModeToggle({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      data-ocid="nav.dark_mode.toggle"
      onClick={() => setDarkMode(!darkMode)}
      className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
