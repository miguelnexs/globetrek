import { MapPin, Star } from "lucide-react";

interface DestinationItemProps {
  name: string;
  country: string;
  rating: number;
  image: string;
}

const DestinationItem = ({ name, country, rating, image }: DestinationItemProps) => {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted">
      {/* Image */}
      <div 
        className="h-12 w-12 flex-shrink-0 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-card-foreground truncate">{name}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{country}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-gold text-gold" />
        <span className="text-sm font-medium text-card-foreground">{rating}</span>
      </div>
    </div>
  );
};

export default DestinationItem;
