import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, Star, Trophy } from "lucide-react";
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

export function parseBadges(bio: string): {
  badges: string[];
  cleanBio: string;
} {
  const match = bio.match(/^\[badges:([^\]]*)\]/);
  if (!match) return { badges: [], cleanBio: bio };
  return {
    badges: match[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    cleanBio: bio.slice(match[0].length).trim(),
  };
}

const BADGE_CONFIG: Record<
  string,
  { label: string; icon: typeof ShieldCheck; color: string }
> = {
  "Background Checked": {
    label: "Background Checked",
    icon: ShieldCheck,
    color:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  "5+ Years Experience": {
    label: "5+ Years Exp",
    icon: Trophy,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
  },
  "Top Sitter": {
    label: "Top Sitter",
    icon: Star,
    color:
      "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
  },
};

export default function SitterCard({
  sitter,
  navigate,
  index = 0,
}: SitterCardProps) {
  const grad = cardGradients[index % cardGradients.length];
  const extraServices = sitter.services.length - 3;
  const { badges } = parseBadges(sitter.bio ?? "");
  const displayBadges = badges.slice(0, 2);
  const ratingDisplay = sitter.rating > 0 ? sitter.rating.toFixed(1) : null;
  const reviewCount = Number(sitter.reviewCount);

  return (
    <button
      type="button"
      data-ocid={`sitters.item.${index + 1}`}
      className="group relative bg-card rounded-2xl overflow-hidden card-lift border border-border/50 shadow-sm text-left w-full cursor-pointer"
      onClick={() => navigate("sitter-detail", sitter.id)}
    >
      {/* PHOTO AREA — full-width crop, Rover-style */}
      <div className="relative h-56 w-full overflow-hidden">
        {sitter.photoUrl ? (
          <img
            src={sitter.photoUrl}
            alt={sitter.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}
          >
            <span className="text-6xl font-bold text-white/70 font-display">
              {sitter.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Bottom gradient overlay — name/location float over photo */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Rate badge — top right */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full border border-white/20">
          From ${Number(sitter.hourlyRate)}/hr
        </div>

        {/* Verification badge — top left */}
        {displayBadges.length > 0 &&
          displayBadges[0] === "Background Checked" && (
            <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={11} />
              Verified
            </div>
          )}

        {/* Name + location — on the photo overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display font-bold text-white text-lg leading-tight">
            {sitter.name}
          </h3>
          {sitter.location && (
            <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
              <MapPin size={11} />
              <span>{sitter.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 space-y-3">
        {/* Rating row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={13}
                className={
                  i <= Math.round(sitter.rating)
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-foreground">
            {ratingDisplay ?? "New"}
          </span>
          {reviewCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({reviewCount} reviews)
            </span>
          )}
          {!ratingDisplay && (
            <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full ml-1">
              New
            </span>
          )}
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1.5">
          {sitter.services.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full font-medium"
            >
              {s}
            </span>
          ))}
          {extraServices > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
              +{extraServices} more
            </span>
          )}
        </div>

        {/* Badge chips */}
        {displayBadges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayBadges.map((badge) => {
              const cfg = BADGE_CONFIG[badge];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <span
                  key={badge}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
                >
                  <Icon size={9} />
                  {cfg.label}
                </span>
              );
            })}
          </div>
        )}

        {/* CTA Button */}
        <Button
          data-ocid={`sitters.item.${index + 1}.button`}
          onClick={(e) => {
            e.stopPropagation();
            navigate("sitter-detail", sitter.id);
          }}
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm shadow-primary/20"
          size="sm"
        >
          View Profile &amp; Book
        </Button>
      </div>
    </button>
  );
}
