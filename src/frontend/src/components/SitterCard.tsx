import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import type { View } from "../App";
import type { Public } from "../backend.d";

interface SitterCardProps {
  sitter: Public;
  navigate: (view: View, sitterId?: bigint) => void;
  index?: number;
}

const cardGradients = [
  "from-indigo-600 to-violet-700",
  "from-teal-500 to-cyan-700",
  "from-orange-500 to-pink-600",
  "from-emerald-500 to-teal-700",
];

export default function SitterCard({
  sitter,
  navigate,
  index = 0,
}: SitterCardProps) {
  const grad = cardGradients[index % cardGradients.length];
  const extraServices = sitter.services.length - 3;

  return (
    <button
      type="button"
      data-ocid={`sitters.item.${index + 1}`}
      className="bg-card rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer border border-border hover:-translate-y-0.5 text-left w-full"
      onClick={() => navigate("sitter-detail", sitter.id)}
    >
      {/* Photo */}
      <div className="relative h-44 overflow-hidden">
        {sitter.photoUrl ? (
          <img
            src={sitter.photoUrl}
            alt={sitter.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}
          >
            <span className="text-5xl font-bold text-white/80 font-display">
              {sitter.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Rate badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
          ${Number(sitter.hourlyRate)}/hr
        </div>
        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display font-bold text-white text-lg leading-tight">
            {sitter.name}
          </h3>
          {sitter.location && (
            <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
              <MapPin size={10} />
              <span>{sitter.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={13}
                className={
                  i <= Math.round(sitter.rating)
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                }
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {sitter.rating > 0 ? sitter.rating.toFixed(1) : "New"}
            {Number(sitter.reviewCount) > 0 &&
              ` (${Number(sitter.reviewCount)})`}
          </span>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1 mb-4">
          {sitter.services.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium"
            >
              {s}
            </span>
          ))}
          {extraServices > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              +{extraServices} more
            </span>
          )}
        </div>

        <Button
          data-ocid={`sitters.item.${index + 1}.button`}
          onClick={(e) => {
            e.stopPropagation();
            navigate("sitter-detail", sitter.id);
          }}
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          size="sm"
        >
          Book Now
        </Button>
      </div>
    </button>
  );
}
