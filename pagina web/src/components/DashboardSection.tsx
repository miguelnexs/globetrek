import { MapPin, Plane, Sparkles, CloudSun } from "lucide-react";
import DashboardCard from "./DashboardCard";
import DestinationItem from "./DestinationItem";
import TripItem from "./TripItem";
import WeatherItem from "./WeatherItem";
import InspirationCard from "./InspirationCard";

// Import destination images
import santoriniImg from "@/assets/destinations/santorini.jpg";
import kyotoImg from "@/assets/destinations/kyoto.jpg";
import machupicchuImg from "@/assets/destinations/machupicchu.jpg";
import dubrovnikImg from "@/assets/destinations/dubrovnik.jpg";

// Import inspiration images
import santoriniSunsetImg from "@/assets/inspiration/santorini-sunset.jpg";
import angkorImg from "@/assets/inspiration/angkor.jpg";
import auroraImg from "@/assets/inspiration/aurora.jpg";
import safariImg from "@/assets/inspiration/safari.jpg";

const destinations = [
  { name: "Santorini", country: "Grecia", rating: 4.9, image: santoriniImg },
  { name: "Kioto", country: "Japón", rating: 4.8, image: kyotoImg },
  { name: "Machu Picchu", country: "Perú", rating: 4.9, image: machupicchuImg },
  { name: "Dubrovnik", country: "Croacia", rating: 4.7, image: dubrovnikImg },
];

const trips = [
  { destination: "París, Francia", date: "15-22 Mar", travelers: 2, status: "próximo" as const },
  { destination: "Tokio, Japón", date: "10-20 Abr", travelers: 4, status: "planificando" as const },
  { destination: "Barcelona, España", date: "5-12 May", travelers: 3, status: "planificando" as const },
];

const weather = [
  { city: "Cancún", temp: "28°C", condition: "soleado" as const },
  { city: "Londres", temp: "12°C", condition: "lluvioso" as const },
  { city: "Reikiavik", temp: "2°C", condition: "nevado" as const },
  { city: "Sydney", temp: "24°C", condition: "nublado" as const },
];

const inspirations = [
  {
    title: "Atardeceres en Santorini",
    description: "Los cielos más espectaculares del Mediterráneo te esperan en las islas griegas.",
    category: "Playas",
    likes: 2847,
    image: santoriniSunsetImg,
  },
  {
    title: "Templos de Angkor",
    description: "Explora la majestuosidad de los antiguos templos camboyanos al amanecer.",
    category: "Cultura",
    likes: 1923,
    image: angkorImg,
  },
  {
    title: "Auroras Boreales",
    description: "Contempla el espectáculo de luces más impresionante del planeta en Islandia.",
    category: "Aventura",
    likes: 3156,
    image: auroraImg,
  },
  {
    title: "Safari Africano",
    description: "Vive la experiencia única de observar la vida salvaje en su hábitat natural.",
    category: "Naturaleza",
    likes: 2534,
    image: safariImg,
  },
];

const DashboardSection = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Tu panel de viajes
          </h2>
          <p className="mt-2 text-muted-foreground">
            Todo lo que necesitas para planificar tu próxima aventura
          </p>
        </div>

        {/* Dashboard grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Destinos recomendados */}
          <DashboardCard
            title="Destinos recomendados"
            subtitle="Lugares populares este mes"
            icon={<MapPin className="h-5 w-5" />}
            variant="featured"
            className="opacity-0 animate-fade-in-up lg:col-span-2"
          >
            <div className="space-y-2">
              {destinations.map((dest) => (
                <DestinationItem key={dest.name} {...dest} />
              ))}
            </div>
          </DashboardCard>

          {/* Próximos viajes */}
          <DashboardCard
            title="Próximos viajes"
            subtitle="Tu agenda de aventuras"
            icon={<Plane className="h-5 w-5" />}
            className="opacity-0 animate-fade-in-up animation-delay-100"
          >
            <div className="space-y-2">
              {trips.map((trip) => (
                <TripItem key={trip.destination} {...trip} />
              ))}
            </div>
          </DashboardCard>

          

          {/* Inspiración del mes - spans full width */}
          <DashboardCard
            title="Inspiración del mes"
            subtitle="Destinos que enamoran"
            icon={<Sparkles className="h-5 w-5" />}
            variant="featured"
            className="md:col-span-2 lg:col-span-3 opacity-0 animate-fade-in-up animation-delay-300"
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {inspirations.map((insp) => (
                <InspirationCard key={insp.title} {...insp} />
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
