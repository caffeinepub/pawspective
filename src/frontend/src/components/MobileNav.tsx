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
      {/* Quick Book FAB */}
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
          className="w-12 h-12 rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:scale-105 flex items-center justify-center active:scale-95 transition-all duration-200"
          aria-label="Quick Book"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden frosted-nav border-t border-border/40 safe-area-pb relative overflow-visible">
        {/* Subtle top fade gradient */}
        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />

        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
            const isActive = currentView === view;
            return (
              <button
                key={view}
                type="button"
                data-ocid={`nav.${view}.link`}
                onClick={() => navigate(view)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[60px] ${
                  isActive
                    ? "bg-primary/12 dark:bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110 text-primary" : "scale-100"
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                </span>
                <span
                  className={`text-xs leading-none transition-all duration-200 ${
                    isActive
                      ? "font-semibold text-primary"
                      : "font-normal text-muted-foreground"
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
