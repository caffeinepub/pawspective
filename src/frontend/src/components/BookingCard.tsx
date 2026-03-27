import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  PawPrint,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Public__3 } from "../backend.d";
import MessageThread from "./MessageThread";
import StatusBadge from "./StatusBadge";

interface BookingCardProps {
  booking: Public__3;
  senderName: string;
  onConfirm?: (id: bigint) => void;
  onComplete?: (id: bigint) => void;
  onCancel?: (id: bigint) => void;
  index?: number;
  extraContent?: React.ReactNode;
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

export default function BookingCard({
  booking,
  senderName,
  onConfirm,
  onComplete,
  onCancel,
  index = 0,
  extraContent,
}: BookingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const servicesLabel =
    booking.services?.length > 0
      ? booking.services.join(" · ")
      : "General Care";

  const petsLabel =
    booking.pets?.length > 0
      ? booking.pets
          .map((p) => `${PET_EMOJIS[p.petType] ?? "🐾"} ${p.petName}`)
          .join(", ")
      : "No pets listed";

  return (
    <div
      data-ocid={`bookings.item.${index + 1}`}
      className="bg-card rounded-xl border border-border shadow-xs overflow-hidden"
    >
      <button
        type="button"
        className="w-full p-4 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground font-display">
              #{booking.id.toString()}
            </span>
            <StatusBadge status={booking.status as string} />
            {booking.isRecurring && (
              <Badge
                variant="outline"
                className="text-xs gap-1 border-primary/30 text-primary"
              >
                <RefreshCw size={10} /> Recurring
              </Badge>
            )}
            {booking.sitterIds?.length > 1 && (
              <Badge variant="outline" className="text-xs gap-1">
                <Users size={10} /> {booking.sitterIds.length} sitters
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <PawPrint size={13} />
              {petsLabel}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {servicesLabel} · {booking.clientName}
          </p>
        </div>
        {expanded ? (
          <ChevronUp
            size={16}
            className="text-muted-foreground shrink-0 mt-1"
          />
        ) : (
          <ChevronDown
            size={16}
            className="text-muted-foreground shrink-0 mt-1"
          />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                Services
              </p>
              <p className="text-foreground">{servicesLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                Contact
              </p>
              <p className="text-foreground">{booking.clientEmail}</p>
              <p className="text-foreground">{booking.clientPhone}</p>
            </div>
            {booking.pets?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground font-medium mb-1.5">
                  Pets
                </p>
                <div className="flex flex-wrap gap-2">
                  {booking.pets.map((pet, pi) => (
                    <div
                      key={`${pet.petName}-${pi}`}
                      className="flex items-center gap-1.5 bg-secondary/60 rounded-full px-3 py-1 text-xs"
                    >
                      <span>{PET_EMOJIS[pet.petType] ?? "🐾"}</span>
                      <span className="font-medium">{pet.petName}</span>
                      <span className="text-muted-foreground">
                        ({pet.petType})
                      </span>
                      {pet.breed && (
                        <span className="text-muted-foreground">
                          · {pet.breed}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {booking.isRecurring && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">
                  Recurrence
                </p>
                <p className="capitalize text-foreground">
                  {booking.recurrencePattern ?? "—"}
                </p>
              </div>
            )}
          </div>
          {booking.notes && (
            <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">
              <span className="font-medium">Notes:</span> {booking.notes}
            </p>
          )}
          {(onConfirm || onComplete || onCancel) && (
            <div className="flex gap-2 flex-wrap">
              {onConfirm && (booking.status as string) === "pending" && (
                <Button
                  data-ocid={`bookings.item.${index + 1}.confirm_button`}
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full"
                  onClick={() => onConfirm(booking.id)}
                >
                  Confirm Booking
                </Button>
              )}
              {onComplete && (booking.status as string) === "confirmed" && (
                <Button
                  data-ocid={`bookings.item.${index + 1}.secondary_button`}
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-full"
                  onClick={() => onComplete(booking.id)}
                >
                  Mark Complete
                </Button>
              )}
              {onCancel &&
                !(["cancelled", "completed"] as string[]).includes(
                  booking.status as string,
                ) && (
                  <Button
                    data-ocid={`bookings.item.${index + 1}.delete_button`}
                    size="sm"
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => onCancel(booking.id)}
                  >
                    Cancel
                  </Button>
                )}
            </div>
          )}
          {extraContent}
          <div>
            <h4 className="text-sm font-semibold mb-2">Messages</h4>
            <MessageThread bookingId={booking.id} senderName={senderName} />
          </div>
        </div>
      )}
    </div>
  );
}
