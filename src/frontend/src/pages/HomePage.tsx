import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Heart,
  Moon,
  PawPrint,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import type { View } from "../App";
import type { Public } from "../backend.d";
import SitterCard from "../components/SitterCard";
import { useActiveSitters } from "../hooks/useQueries";

const POPULAR_SERVICES = [
  { label: "Dog Walking", filter: "dog walking" },
  { label: "Cat Sitting", filter: "cat sitting" },
  { label: "Overnight Stay", filter: "overnight" },
  { label: "Drop-In Visit", filter: "drop-in" },
  { label: "Dog Boarding", filter: "boarding" },
  { label: "Playtime", filter: "playtime" },
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    label: "Background Checked",
    sub: "Every sitter verified",
  },
  { icon: Trophy, label: "5-Star Rated", sub: "Top-rated caregivers" },
  { icon: Heart, label: "Insured & Bonded", sub: "Peace of mind included" },
  { icon: CheckCircle, label: "Flexible Booking", sub: "Cancel anytime" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse Sitters",
    desc: "Explore verified sitters in your area. Read reviews, check availability, and compare rates.",
  },
  {
    step: "02",
    title: "Book in Minutes",
    desc: "Select your services, dates, and pets. No account needed — just your contact info.",
  },
  {
    step: "03",
    title: "Relax & Track",
    desc: "Your sitter handles the rest. Track visits in real-time and message your sitter anytime.",
  },
];

interface Props {
  navigate: (view: View, sitterId?: bigint) => void;
  darkMode?: boolean;
  setDarkMode?: (v: boolean) => void;
}

export default function HomePage({ navigate, darkMode, setDarkMode }: Props) {
  const { data: sitters = [], isLoading } = useActiveSitters();
  const [locationFilter, setLocationFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  const filtered = (sitters as Public[]).filter((s) => {
    const matchLoc =
      !locationFilter ||
      s.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchSvc =
      serviceFilter === "all" ||
      s.services.some((sv) =>
        sv.toLowerCase().includes(serviceFilter.toLowerCase()),
      );
    return matchLoc && matchSvc;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-2.5 font-display font-bold text-xl text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
              <PawPrint size={17} className="text-primary-foreground" />
            </div>
            <span>Pawspective</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("sitters-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl transition-colors"
            >
              Find a Sitter
            </button>
            <button
              type="button"
              onClick={() => navigate("booking-lookup")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl transition-colors"
            >
              My Bookings
            </button>
            <button
              type="button"
              onClick={() => navigate("login")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl transition-colors"
            >
              Sitter Portal
            </button>
            <button
              type="button"
              data-ocid="home.sitter_apply.link"
              onClick={() => navigate("sitter-apply")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl transition-colors"
            >
              Become a Sitter
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {setDarkMode && (
              <button
                type="button"
                data-ocid="nav.dark_mode.toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                aria-label={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <Button
              onClick={() =>
                document
                  .getElementById("sitters-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-5 shadow-sm shadow-primary/25"
              size="sm"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO — full bleed with photo */}
        <section className="relative overflow-hidden min-h-[600px] md:min-h-[680px] flex items-center">
          {/* Background photo */}
          <div className="absolute inset-0">
            <img
              src="/assets/generated/pawspective-hero.dim_1200x800.jpg"
              alt="Happy pets with their sitter"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(105deg, oklch(0.18 0.18 265 / 0.92) 0%, oklch(0.22 0.16 275 / 0.85) 45%, oklch(0.28 0.12 255 / 0.6) 100%)",
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 w-full">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/15">
                <Sparkles size={13} className="text-amber-300" />
                Trusted by thousands of pet families
              </div>

              {/* Headline */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.03] mb-5">
                Pet Care,
                <br />
                <span style={{ color: "oklch(0.84 0.18 55)" }}>Perfected.</span>
              </h1>

              <p className="text-white/75 text-lg md:text-xl max-w-xl leading-relaxed mb-9">
                Find trusted, background-checked sitters in your neighborhood.
                Book in minutes, track every visit in real-time.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  data-ocid="home.find_sitter.button"
                  onClick={() =>
                    document
                      .getElementById("sitters-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="rounded-full px-8 text-base font-bold shadow-lg hover:opacity-95 transition-opacity h-13"
                  style={{
                    backgroundColor: "oklch(0.72 0.18 55)",
                    color: "oklch(0.12 0.02 55)",
                  }}
                >
                  Find a Sitter
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  data-ocid="home.sitter_apply.button"
                  onClick={() => navigate("sitter-apply")}
                  className="rounded-full px-8 text-base font-semibold border-white/25 text-white bg-white/10 hover:bg-white/18 backdrop-blur-sm h-13"
                >
                  Become a Sitter
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => navigate("booking-lookup")}
                  className="rounded-full px-6 text-base font-medium text-white/75 hover:text-white hover:bg-white/10 h-13"
                >
                  Track My Booking →
                </Button>
              </div>

              {/* Social proof micro-stats */}
              <div className="flex items-center gap-5 mt-8 flex-wrap">
                <div className="flex -space-x-2">
                  {["BG", "SL", "KM", "JR"].map((initials) => (
                    <div
                      key={initials}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-white/70 text-sm">
                  <span className="text-white font-semibold">
                    500+ pet families
                  </span>{" "}
                  trust Pawspective
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="text-white/70 text-sm ml-1">5.0 avg</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR SERVICES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Popular Services
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-ocid="services.filter.tab"
              onClick={() => setServiceFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                serviceFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-secondary/70"
              }`}
            >
              All Services
            </button>
            {POPULAR_SERVICES.map((svc) => (
              <button
                key={svc.filter}
                type="button"
                data-ocid={`services.${svc.filter.replace(/[^a-z0-9]/g, "_")}.tab`}
                onClick={() =>
                  setServiceFilter(
                    serviceFilter === svc.filter ? "all" : svc.filter,
                  )
                }
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                  serviceFilter === svc.filter
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-secondary/70"
                }`}
              >
                {svc.label}
              </button>
            ))}
          </div>
        </section>

        {/* SITTERS GRID */}
        <section
          id="sitters-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Meet Our Sitters
              </h2>
              <p className="text-muted-foreground mt-1.5 text-base">
                Hand-picked, verified caregivers ready to look after your furry
                family
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  data-ocid="search.input"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-9 rounded-full w-48 text-sm"
                />
              </div>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger
                  data-ocid="search.select"
                  className="rounded-full w-44 text-sm"
                >
                  <SelectValue placeholder="Service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="dog walking">Dog Walking</SelectItem>
                  <SelectItem value="overnight">Overnight Stay</SelectItem>
                  <SelectItem value="drop-in">Drop-In Visit</SelectItem>
                  <SelectItem value="boarding">Boarding</SelectItem>
                  <SelectItem value="cat sitting">Cat Sitting</SelectItem>
                  <SelectItem value="feeding">Pet Feeding</SelectItem>
                  <SelectItem value="playtime">Playtime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {["s1", "s2", "s3"].map((k) => (
                <div
                  key={k}
                  className="rounded-2xl border border-border overflow-hidden bg-card"
                >
                  <Skeleton className="h-52 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                <PawPrint size={36} className="text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                {(sitters as Public[]).length === 0
                  ? "Sitters are being onboarded"
                  : "No sitters match your filters"}
              </h3>
              <p className="text-muted-foreground text-base">
                {(sitters as Public[]).length === 0
                  ? "Check back soon — or sign up as a sitter!"
                  : "Try adjusting your search filters"}
              </p>
              {(sitters as Public[]).length === 0 && (
                <Button
                  onClick={() => navigate("sitter-apply")}
                  className="mt-5 rounded-full bg-primary text-primary-foreground px-8"
                  size="lg"
                >
                  Become a Sitter
                </Button>
              )}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((sitter, i) => (
                <SitterCard
                  key={sitter.id.toString()}
                  sitter={sitter}
                  navigate={navigate}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section
          className="py-20"
          style={{ backgroundColor: "oklch(0.96 0.012 265)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
                Simple as 1-2-3
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                How Pawspective Works
              </h2>
              <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">
                Book trusted pet care in minutes, with full visibility and
                control throughout the process.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />
              {HOW_IT_WORKS.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="relative text-center bg-card rounded-2xl p-8 border border-border shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-md shadow-primary/25">
                    <span className="font-display font-bold text-primary-foreground text-lg">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section
          className="py-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.18 265) 0%, oklch(0.38 0.22 280) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 50%, oklch(0.72 0.18 55) 0%, transparent 60%)",
            }}
          />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to find your perfect pet sitter?
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">
              Join thousands of happy pet owners who trust Pawspective for
              premium, reliable pet care.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                size="lg"
                onClick={() =>
                  document
                    .getElementById("sitters-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full px-8 font-bold text-base h-13"
                style={{
                  backgroundColor: "oklch(0.72 0.18 55)",
                  color: "oklch(0.12 0.02 55)",
                }}
              >
                Browse Sitters
              </Button>
              <Button
                size="lg"
                variant="outline"
                data-ocid="home.sitter_apply.button"
                onClick={() => navigate("sitter-apply")}
                className="rounded-full px-8 font-semibold text-base border-white/25 text-white bg-white/10 hover:bg-white/18 h-13"
              >
                Become a Sitter
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        style={{ backgroundColor: "oklch(0.15 0.05 265)" }}
        className="text-white/60 py-12 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <PawPrint size={15} className="text-white/80" />
                </div>
                <span className="font-display font-bold text-white text-lg">
                  Pawspective
                </span>
              </div>
              <p className="text-sm text-white/50 max-w-xs leading-relaxed">
                Premium pet care marketplace connecting pet families with
                trusted, verified sitters.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
                  For Pet Owners
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("sitters-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="text-sm text-left hover:text-white transition-colors"
                  >
                    Find a Sitter
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("booking-lookup")}
                    className="text-sm text-left hover:text-white transition-colors"
                  >
                    Track Booking
                  </button>
                </div>
              </div>
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
                  For Sitters
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    data-ocid="home.sitter_apply.link"
                    onClick={() => navigate("sitter-apply")}
                    className="text-sm text-left hover:text-white transition-colors"
                  >
                    Become a Sitter
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("login")}
                    className="text-sm text-left hover:text-white transition-colors"
                  >
                    Sitter Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("login")}
                    className="text-sm text-left hover:text-white transition-colors"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/35">
              © {new Date().getFullYear()} Pawspective. All rights reserved.
            </p>
            <p className="text-xs text-white/35">
              Built with{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/60 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
