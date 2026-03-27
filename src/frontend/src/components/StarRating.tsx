import { Star } from "lucide-react";

interface Props {
  rating: number;
  size?: number;
}

export default function StarRating({ rating, size = 14 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-accent text-accent"
              : "text-muted-foreground"
          }
        />
      ))}
    </div>
  );
}
