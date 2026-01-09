import { Heart, Bookmark } from "lucide-react";

interface InspirationCardProps {
  title: string;
  description: string;
  category: string;
  likes: number;
  image: string;
}

const InspirationCard = ({ title, description, category, likes, image }: InspirationCardProps) => {
  return (
    <div className="space-y-3">
      {/* Image */}
      <div 
        className="relative aspect-video overflow-hidden rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
        <div className="absolute right-2 top-2 flex gap-1">
          <button className="rounded-full bg-card/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-card">
            <Bookmark className="h-4 w-4 text-card-foreground" />
          </button>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-accent">
            {category}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            {likes}
          </span>
        </div>
        <h4 className="font-display font-semibold text-card-foreground">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default InspirationCard;
