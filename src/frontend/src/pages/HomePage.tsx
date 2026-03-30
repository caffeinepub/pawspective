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
  PawPrint,
  Search,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import type { View } from "../App";
import type { Public } from "../backend.d";
import SitterCard from "../components/SitterCard";
import { useActiveSitters } from "../hooks/useQueries";

interface Props {
  navigate: (view: View, sitterId?: bigint) => void;
}

export default function HomePage({ navigate }: Props) {
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
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <PawPrint size={16} className="text-primary-foreground" />
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
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Find a Sitter
            </button>
            <button
              type="button"
              onClick={() => navigate("booking-lookup")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              My Bookings
            </button>
            <button
              type="button"
              onClick={() => navigate("login")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Sitter Portal
            </button>
          </nav>
          <Button
            onClick={() =>
              document
                .getElementById("sitters-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-5"
            size="sm"
          >
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.18 265) 0%, oklch(0.35 0.22 280) 50%, oklch(0.40 0.16 255) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, oklch(0.7 0.15 55) 0%, transparent 60%), radial-gradient(circle at 80% 20%, oklch(0.8 0.1 200) 0%, transparent 60%)",
            }}
          />
          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <Sparkles size={14} className="text-accent" />
              Trusted by pet families everywhere
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6">
              Pet Care
              <br />
              <span style={{ color: "oklch(0.82 0.18 55)" }}>made easy</span>
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with verified, passionate pet sitters in your
              neighborhood. Book in minutes, track every visit.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() =>
                  document
                    .getElementById("sitters-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full px-8 text-base font-bold text-accent-foreground hover:opacity-90"
                style={{ backgroundColor: "oklch(0.72 0.18 55)" }}
              >
                Find a Sitter
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("booking-lookup")}
                className="rounded-full px-8 text-base font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              >
                Track My Booking
              </Button>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { icon: Shield, label: "Verified Sitters" },
                { icon: Star, label: "5-Star Rated" },
                { icon: CheckCircle, label: "Flexible Scheduling" },
                { icon: PawPrint, label: "All Pet Types" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <Icon size={16} className="text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SITTERS GRID */}
        <section id="sitters-section" className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Meet Our Sitters
              </h2>
              <p className="text-muted-foreground mt-1">
                Hand-picked caregivers ready to look after your furry family
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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
                  className="rounded-2xl border border-border overflow-hidden"
                >
                  <Skeleton className="h-44 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
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
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {(sitters as Public[]).length === 0
                  ? "Sitters are being onboarded"
                  : "No sitters match your filters"}
              </h3>
              <p className="text-muted-foreground">
                {(sitters as Public[]).length === 0
                  ? "Check back soon — or sign up as a sitter!"
                  : "Try adjusting your search filters"}
              </p>
              {(sitters as Public[]).length === 0 && (
                <Button
                  onClick={() => navigate("login")}
                  className="mt-5 rounded-full bg-primary text-primary-foreground"
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
        <section className="bg-secondary/30 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
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
                  desc: "Your sitter handles the rest. Track your booking status and message your sitter anytime.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                    <span className="font-display font-bold text-primary-foreground text-lg">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">
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
      </main>

      {/* FOOTER */}
      <footer
        style={{ backgroundColor: "oklch(0.18 0.06 265)" }}
        className="text-white/70 py-10 px-4"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <PawPrint size={14} className="text-white/80" />
            </div>
            <span className="font-display font-bold text-white">
              Pawspective
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <button
              type="button"
              onClick={() => navigate("booking-lookup")}
              className="hover:text-white transition-colors"
            >
              Track Booking
            </button>
            <button
              type="button"
              onClick={() => navigate("login")}
              className="hover:text-white transition-colors"
            >
              Sitter Portal
            </button>
            <button
              type="button"
              onClick={() => navigate("login")}
              className="hover:text-white transition-colors"
            >
              Admin
            </button>
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Pawspective &middot; Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/70"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
