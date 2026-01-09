import { MapPin, Compass } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroBanner = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-ocean/80 via-ocean/60 to-ocean/90" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-turquoise blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-gold blur-3xl" />
      </div>

      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative mx-auto px-4 py-20 md:px-6 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm animate-fade-in-up">
            <Compass className="h-4 w-4 text-gold animate-shimmer" />
            <span className="text-sm font-medium text-primary-foreground">
              Descubre nuevos horizontes
            </span>
          </div>

          {/* Main heading */}
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl lg:text-7xl animate-fade-in-up animation-delay-100">
            Explora el mundo
            <span className="block text-gold">con estilo</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl animate-fade-in-up animation-delay-200">
            Tu próxima aventura comienza aquí. Destinos únicos, 
            experiencias inolvidables y momentos que perduran.
          </p>

          {/* Decorative location tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animation-delay-300">
            {["Santorini", "Bali", "Maldivas", "Patagonia"].map((place) => (
              <span
                key={place}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-sm text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/20"
              >
                <MapPin className="h-3.5 w-3.5" />
                {place}
              </span>
            ))}
          </div>

          <div className="mt-8 animate-fade-in-up animation-delay-400">
            <Button variant="secondary" className="h-11 px-6" onClick={() => navigate("/code")}>Ingresar código</Button>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroBanner;
