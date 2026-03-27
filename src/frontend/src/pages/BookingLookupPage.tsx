import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, PawPrint, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import type { View } from "../App";
import type { Public__3 } from "../backend.d";
import ServiceLogTimeline from "../components/ServiceLogTimeline";
import StatusBadge from "../components/StatusBadge";
import { useBookingsByEmail } from "../hooks/useQueries";

interface Props {
  navigate: (view: View) => void;
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PET_EMOJIS: Record<string, string> = {
  Dog: "🐶",
  Cat: "🐱",
  Bird: "🦜",
  Rabbit: "🐰",
  Fish: "🐟",
  "Small Animal": "🐹",
  Other: "🐾",
};

function BookingActivityCard({ booking }: { booking: Public__3 }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = ["confirmed"].includes(booking.status as string);

  const petsLabel =
    booking.pets?.length > 0
      ? booking.pets
          .map((p) => `${PET_EMOJIS[p.petType] ?? "🐾"} ${p.petName}`)
          .join(", ")
      : "No pets";

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-display font-bold text-lg">
                #{booking.id.toString()}
              </span>
              <StatusBadge status={booking.status as string} />
              {booking.isRecurring && (
                <Badge
                  variant="outline"
                  className="text-xs gap-1 border-primary/30 text-primary"
                >
                  <RefreshCw size={10} />{" "}
                  {booking.recurrencePattern ?? "Recurring"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <PawPrint size={13} />
                {petsLabel}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {booking.services?.length > 0
                ? booking.services.join(" · ")
                : "General Care"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs h-8"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide" : "Activity Feed"}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5">
          {booking.sitterIds?.length > 0 ? (
            booking.sitterIds.map((sid) => (
              <ServiceLogTimeline
                key={sid.toString()}
                bookingId={booking.id}
                sitterId={sid}
                sitterName="Your sitter"
                isActive={false}
                autoRefresh={isActive}
              />
            ))
          ) : (
            <ServiceLogTimeline
              bookingId={booking.id}
              sitterId={0n}
              sitterName="Your sitter"
              isActive={false}
              autoRefresh={isActive}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingLookupPage({ navigate }: Props) {
  const [emailInput, setEmailInput] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { data: bookings = [], isLoading } = useBookingsByEmail(submittedEmail);

  const handleSearch = () => {
    if (emailInput.trim()) setSubmittedEmail(emailInput.trim());
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-display font-semibold">Track Booking</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <PawPrint size={28} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">
            Find Your Bookings
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter the email you used to book and see all your reservations.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xs p-6 mb-8">
          <div className="space-y-3">
            <Label htmlFor="lookup-email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                data-ocid="lookup.email.input"
                id="lookup-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="jane@example.com"
                className="rounded-full"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                data-ocid="lookup.search.button"
                onClick={handleSearch}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 font-semibold"
              >
                <Search size={16} className="mr-1.5" /> Search
              </Button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && submittedEmail && bookings.length === 0 && (
          <div data-ocid="lookup.empty_state" className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-display font-semibold text-lg">
              No bookings found
            </h3>
            <p className="text-muted-foreground mt-1">
              No bookings found for <strong>{submittedEmail}</strong>
            </p>
          </div>
        )}

        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            <p className="font-semibold text-foreground">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </p>
            {(bookings as Public__3[]).map((b) => (
              <BookingActivityCard key={b.id.toString()} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
