import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, PawPrint, Search } from "lucide-react";
import { useState } from "react";
import type { View } from "../App";
import type { Public__3 } from "../backend.d";
import ServiceLogTimeline from "../components/ServiceLogTimeline";
import StatusBadge from "../components/StatusBadge";
import { useBookingsByEmail } from "../hooks/useQueries";

interface Props {
  navigate: (view: View) => void;
  initialEmail?: string;
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ClientDashboard({
  navigate,
  initialEmail = "",
}: Props) {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [submittedEmail, setSubmittedEmail] = useState(initialEmail);
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
            <ArrowLeft size={16} /> Home
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-display font-semibold">My Bookings</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border border-border shadow-xs p-6 mb-6">
          <Label
            htmlFor="cd-email"
            className="text-sm font-semibold mb-2 block"
          >
            Your Email
          </Label>
          <div className="flex gap-2">
            <Input
              data-ocid="client.email.input"
              id="cd-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="jane@example.com"
              className="rounded-full"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              data-ocid="client.search.button"
              onClick={handleSearch}
              className="rounded-full bg-primary text-primary-foreground shrink-0"
            >
              <Search size={16} />
            </Button>
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
          <div data-ocid="client.empty_state" className="text-center py-16">
            <div className="text-4xl mb-3">🐾</div>
            <h3 className="font-display font-semibold text-lg">
              No bookings found
            </h3>
            <p className="text-muted-foreground mt-1">
              No bookings for <strong>{submittedEmail}</strong>
            </p>
            <Button
              onClick={() => navigate("home")}
              className="mt-4 rounded-full bg-primary text-primary-foreground"
            >
              Find a Sitter
            </Button>
          </div>
        )}

        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            <p className="font-semibold">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </p>
            {(bookings as Public__3[]).map((b) => (
              <div
                key={b.id.toString()}
                className="bg-card rounded-xl border border-border shadow-xs overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-display font-bold">
                      #{b.id.toString()}
                    </span>
                    <StatusBadge status={b.status as string} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PawPrint size={13} />
                      {b.pets?.map((p) => p.petName).join(", ") ?? "N/A"}
                    </span>
                    <span>
                      {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </span>
                  </div>
                </div>
                {["confirmed", "completed"].includes(b.status as string) && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    {b.sitterIds?.map((sid) => (
                      <ServiceLogTimeline
                        key={sid.toString()}
                        bookingId={b.id}
                        sitterId={sid}
                        sitterName="Sitter"
                        isActive={false}
                        autoRefresh={(b.status as string) === "confirmed"}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
