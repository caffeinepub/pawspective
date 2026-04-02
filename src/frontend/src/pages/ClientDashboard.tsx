import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CalendarDays,
  PawPrint,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { View } from "../App";
import type { Public, Public__4 } from "../backend.d";
import ServiceLogTimeline from "../components/ServiceLogTimeline";
import StatusBadge from "../components/StatusBadge";
import {
  useActiveSitters,
  useBookingsByEmail,
  useSubmitReview,
} from "../hooks/useQueries";

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

function getStatusKey(status: unknown): string {
  if (typeof status === "string") return status;
  if (status !== null && typeof status === "object")
    return Object.keys(status as object)[0] ?? "";
  return String(status ?? "");
}

// Item 2: Star picker component
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={
              i <= (hovered || value)
                ? "fill-accent text-accent"
                : "text-muted-foreground"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ClientDashboard({
  navigate,
  initialEmail = "",
}: Props) {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [submittedEmail, setSubmittedEmail] = useState(initialEmail);
  const { data: bookings = [], isLoading } = useBookingsByEmail(submittedEmail);
  // Item 4: load sitters to show names/avatars
  const { data: allSittersRaw = [] } = useActiveSitters();
  const allSitters = allSittersRaw as Public[];

  // Item 2: track reviewed booking IDs and active review state
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const submitReview = useSubmitReview();

  const handleSearch = () => {
    if (emailInput.trim()) setSubmittedEmail(emailInput.trim());
  };

  const getSitterName = (sid: bigint) => {
    const s = allSitters.find((st) => st.id === sid);
    return s?.name ?? `Sitter #${sid.toString()}`;
  };

  const getSitterPhoto = (sid: bigint) => {
    const s = allSitters.find((st) => st.id === sid);
    return s?.photoUrl ?? null;
  };

  const handleReviewSubmit = async (booking: Public__4) => {
    const sitterId = booking.sitterIds?.[0];
    if (!sitterId) return;
    try {
      await submitReview.mutateAsync({ sitterId, rating: reviewRating });
      setReviewedIds((prev) => new Set([...prev, booking.id.toString()]));
      setReviewingId(null);
      setReviewRating(5);
      toast.success("Review submitted! Thank you.");
    } catch {
      toast.error("Failed to submit review.");
    }
  };

  // Status border accent colors
  const statusBorderColor: Record<string, string> = {
    pending: "border-l-amber-400",
    confirmed: "border-l-blue-400",
    completed: "border-l-emerald-400",
    cancelled: "border-l-red-300",
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
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
              <PawPrint size={36} className="text-primary" />
            </div>
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
            {(bookings as Public__4[]).map((b) => {
              const statusKey = getStatusKey(b.status);
              const borderClass =
                statusBorderColor[statusKey] ?? "border-l-border";
              const isCompleted = statusKey === "completed";
              const isConfirmed = statusKey === "confirmed";
              const bookingIdStr = b.id.toString();
              const alreadyReviewed = reviewedIds.has(bookingIdStr);
              const isReviewing = reviewingId === bookingIdStr;

              return (
                <div
                  key={bookingIdStr}
                  data-ocid={`client.bookings.item.${bookingIdStr}`}
                  className={`bg-card rounded-xl border border-border border-l-4 ${borderClass} shadow-xs overflow-hidden`}
                >
                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm">
                          #{bookingIdStr}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="flex gap-1.5">
                        {/* Item 4: Book Again button */}
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid="client.book_again.button"
                          onClick={() => navigate("home")}
                          className="rounded-full h-7 px-3 text-xs gap-1"
                        >
                          <RefreshCw size={11} />
                          Book Again
                        </Button>
                      </div>
                    </div>

                    {/* Sitter info row - Item 4 */}
                    {b.sitterIds && b.sitterIds.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        {b.sitterIds.slice(0, 2).map((sid) => {
                          const photo = getSitterPhoto(sid);
                          const name = getSitterName(sid);
                          return (
                            <div
                              key={sid.toString()}
                              className="flex items-center gap-1.5"
                            >
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/20 shrink-0">
                                {photo ? (
                                  <img
                                    src={photo}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                                    {name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Dates and pets */}
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        <span>
                          {formatDate(b.startDate)} – {formatDate(b.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PawPrint size={12} />
                        <span>
                          {b.pets?.map((p) => p.petName).join(", ") ?? "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Item 2: Leave a Review for completed bookings */}
                    {isCompleted && !alreadyReviewed && (
                      <div className="mt-3">
                        {!isReviewing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid="client.review.button"
                            onClick={() => {
                              setReviewingId(bookingIdStr);
                              setReviewRating(5);
                            }}
                            className="rounded-full h-7 px-3 text-xs gap-1 border-accent text-accent hover:bg-accent/10"
                          >
                            <Star size={11} />
                            Leave a Review
                          </Button>
                        ) : (
                          <div
                            data-ocid="client.review.panel"
                            className="mt-2 p-3 bg-muted/40 rounded-xl space-y-2"
                          >
                            <p className="text-xs font-semibold">
                              Rate your experience
                            </p>
                            <StarPicker
                              value={reviewRating}
                              onChange={setReviewRating}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                data-ocid="client.review.submit_button"
                                onClick={() => handleReviewSubmit(b)}
                                disabled={submitReview.isPending}
                                className="rounded-full h-7 px-3 text-xs bg-primary text-primary-foreground"
                              >
                                {submitReview.isPending
                                  ? "Submitting..."
                                  : "Submit Review"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-ocid="client.review.cancel_button"
                                onClick={() => setReviewingId(null)}
                                className="rounded-full h-7 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isCompleted && alreadyReviewed && (
                      <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <Star size={11} className="fill-emerald-600" />
                        Review submitted — thank you!
                      </p>
                    )}
                  </div>

                  {/* Service log - only for confirmed/completed */}
                  {(isConfirmed || isCompleted) && (
                    <div className="px-4 pb-4 border-t border-border pt-3">
                      {b.sitterIds?.map((sid) => (
                        <ServiceLogTimeline
                          key={sid.toString()}
                          bookingId={b.id}
                          sitterId={sid}
                          sitterName={getSitterName(sid)}
                          isActive={false}
                          autoRefresh={isConfirmed}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
