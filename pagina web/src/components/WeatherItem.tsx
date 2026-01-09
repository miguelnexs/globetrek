import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";

interface WeatherItemProps {
  city: string;
  temp: string;
  condition: "soleado" | "nublado" | "lluvioso" | "nevado";
}

const WeatherItem = ({ city, temp, condition }: WeatherItemProps) => {
  const icons = {
    soleado: <Sun className="h-5 w-5 text-gold" />,
    nublado: <Cloud className="h-5 w-5 text-muted-foreground" />,
    lluvioso: <CloudRain className="h-5 w-5 text-primary" />,
    nevado: <Snowflake className="h-5 w-5 text-turquoise" />,
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted">
      <div className="flex items-center gap-3">
        {icons[condition]}
        <span className="font-medium text-card-foreground">{city}</span>
      </div>
      <span className="text-lg font-semibold text-card-foreground">{temp}</span>
    </div>
  );
};

export default WeatherItem;
