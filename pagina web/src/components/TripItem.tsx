import { Calendar, Users } from "lucide-react";

interface TripItemProps {
  destination: string;
  date: string;
  travelers: number;
  status: "próximo" | "planificando" | "completado";
}

const TripItem = ({ destination, date, travelers, status }: TripItemProps) => {
  const statusColors = {
    próximo: "bg-turquoise/20 text-turquoise",
    planificando: "bg-gold/20 text-gold-foreground",
    completado: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-card-foreground truncate">{destination}</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {travelers}
          </span>
        </div>
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[status]}`}
      >
        {status}
      </span>
    </div>
  );
};

export default TripItem;
