import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Mail,
  PawPrint,
  Phone,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import type { View } from "../App";
import type { Public__4 } from "../backend.d";
import ServiceLogTimeline from "../components/ServiceLogTimeline";
import StatusBadge from "../components/StatusBadge";
import { useBookingsByEmail, useBookingsByPhone } from "../hooks/useQueries";

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
/** Strip all non-digit characters, keep only digits */
function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function getStatusKey(status: unknown): string {
  if (typeof status === "string") return status;
  if (status !== null && typeof status === "object")
    return Object.keys(status as object)[0] ?? "";
  return String(status ?? "");
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

function BookingActivityCard({ booking }: { booking: Public__4 }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = getStatusKey(booking.status) === "confirmed";

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
              <StatusBadge status={booking.status} />
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
  const [lookupMode, setLookupMode] = useState<"email" | "phone">("email");
  const [emailInput, setEmailInput] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");

  const { data: emailBookings = [], isLoading: emailLoading } =
    useBookingsByEmail(submittedEmail);
  const { data: phoneBookings = [], isLoading: phoneLoading } =
    useBookingsByPhone(submittedPhone);

  const bookings = lookupMode === "email" ? emailBookings : phoneBookings;
  const isLoading = lookupMode === "email" ? emailLoading : phoneLoading;
  const submittedIdentifier =
    lookupMode === "email" ? submittedEmail : submittedPhone;

  const handleSearch = () => {
    if (lookupMode === "email") {
      if (emailInput.trim()) setSubmittedEmail(emailInput.trim());
    } else {
      const normalized = normalizePhone(phoneInput.trim());
      if (normalized.length >= 10) setSubmittedPhone(normalized);
    }
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
            Enter the email or phone number you used when booking.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xs p-6 mb-8">
          {/* Email / Phone toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              data-ocid="lookup.toggle_email"
              onClick={() => setLookupMode("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors border ${
                lookupMode === "email"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border text-foreground hover:bg-muted"
              }`}
            >
              <Mail size={15} />
              Email Address
            </button>
            <button
              type="button"
              data-ocid="lookup.toggle_phone"
              onClick={() => setLookupMode("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors border ${
                lookupMode === "phone"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border text-foreground hover:bg-muted"
              }`}
            >
              <Phone size={15} />
              Phone Number
            </button>
          </div>

          <Label
            htmlFor={lookupMode === "email" ? "lookup-email" : "lookup-phone"}
            className="block mb-2"
          >
            {lookupMode === "email"
              ? "Your Email Address"
              : "Your Phone Number"}
          </Label>
          <div className="flex gap-2">
            {lookupMode === "email" ? (
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
            ) : (
              <Input
                data-ocid="lookup.phone.input"
                id="lookup-phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="(555) 123-4567"
                className="rounded-full"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            )}
            <Button
              data-ocid="lookup.search.button"
              onClick={handleSearch}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 font-semibold"
            >
              <Search size={16} className="mr-1.5" /> Search
            </Button>
          </div>
          {lookupMode === "phone" &&
            phoneInput &&
            normalizePhone(phoneInput).length < 10 && (
              <p className="text-xs text-destructive mt-2">
                Enter a valid 10-digit phone number
              </p>
            )}
          <p className="text-xs text-muted-foreground mt-3">
            We use your contact info to keep you updated on your pet&apos;s care
            and to reach you if needed.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && submittedIdentifier && bookings.length === 0 && (
          <div data-ocid="lookup.empty_state" className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
              <PawPrint size={36} className="text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg">
              No bookings found
            </h3>
            <p className="text-muted-foreground mt-1">
              No bookings found for <strong>{submittedIdentifier}</strong>
            </p>
          </div>
        )}

        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            <p className="font-semibold text-foreground">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </p>
            {(bookings as Public__4[]).map((b) => (
              <BookingActivityCard key={b.id.toString()} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
