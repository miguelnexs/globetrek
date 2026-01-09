import { Mountain, Waves, Building2, TreePine, Palmtree, Castle, Sun, Compass, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

// Import gallery images
import beachImg from "@/assets/gallery/beach.jpg";
import mountainsImg from "@/assets/gallery/mountains.jpg";
import cityImg from "@/assets/gallery/city.jpg";
import natureImg from "@/assets/gallery/nature.jpg";
import tropicalImg from "@/assets/gallery/tropical.jpg";
import historyImg from "@/assets/gallery/history.jpg";
import summerImg from "@/assets/gallery/summer.jpg";
import adventureImg from "@/assets/gallery/adventure.jpg";

type GalleryItem = { icon: ReactNode; label: string; image: string };
const galleryItems: GalleryItem[] = [
  { icon: <Waves className="h-8 w-8" />, label: "Playas", image: beachImg },
  { icon: <Mountain className="h-8 w-8" />, label: "Montañas", image: mountainsImg },
  { icon: <Building2 className="h-8 w-8" />, label: "Ciudades", image: cityImg },
  { icon: <TreePine className="h-8 w-8" />, label: "Naturaleza", image: natureImg },
  { icon: <Palmtree className="h-8 w-8" />, label: "Tropical", image: tropicalImg },
  { icon: <Castle className="h-8 w-8" />, label: "Historia", image: historyImg },
  { icon: <Sun className="h-8 w-8" />, label: "Verano", image: summerImg },
  { icon: <Compass className="h-8 w-8" />, label: "Aventura", image: adventureImg },
];

const GallerySection = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState<string>("Todos");
  const [autoplay, setAutoplay] = useState(true);
  const [zoom, setZoom] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const filtered: GalleryItem[] = useMemo(() => {
    if (selected === "Todos") return galleryItems;
    return galleryItems.filter((g) => g.label === selected);
  }, [selected]);

  useEffect(() => {
    if (embla && open) embla.scrollTo(index);
  }, [embla, open, index]);

  useEffect(() => {
    if (!open || !autoplay || !embla) return;
    const id = setInterval(() => embla.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [open, autoplay, embla]);

  useEffect(() => {
    if (!open) return;
    galleryItems.forEach((i) => { const img = new Image(); img.src = i.image; });
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowLeft") embla?.scrollPrev();
      if (e.key === "ArrowRight") embla?.scrollNext();
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, embla]);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="mb-8 text-center md:mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Galería de experiencias
          </h2>
          <p className="mt-2 text-muted-foreground">
            Encuentra la inspiración para tu próximo destino
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {["Todos","Playas","Montañas","Ciudades","Naturaleza","Tropical","Historia","Verano","Aventura"].map((c) => (
            <Button key={c} variant={selected === c ? "default" : "secondary"} size="sm" className="rounded-full" onClick={() => setSelected(c)}>
              {c}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {filtered.map((item, i) => (
            <div
              key={item.label}
              className="group relative aspect-[4/3] md:aspect-square overflow-hidden rounded-2xl shadow-travel transition-all duration-500 hover:shadow-travel-lg hover:scale-[1.02] opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 75}ms` }}
              onClick={() => { setIndex(i); setOpen(true); }}
            >
              {/* Background image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              {/* Content */}
              <div className="relative flex h-full flex-col items-center justify-end p-4 pb-6">
                <div className="mb-2 text-primary-foreground drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <span className="font-display text-lg font-semibold text-primary-foreground drop-shadow-lg">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden">
            <div className="relative bg-black">
              <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                <span className="text-white text-sm">{galleryItems[index]?.label}</span>
              </div>
              <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setAutoplay((a) => !a)}>
                  {autoplay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => { setZoom((z) => !z); setPanX(0); setPanY(0); }}>
                  {zoom ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
                </button>
                <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {galleryItems.map((item) => (
                      <div key={item.label} className="min-w-0 flex-[0_0_100%]">
                        <div
                          className={`relative flex items-center justify-center bg-black ${zoom ? 'cursor-grab' : ''}`}
                          onMouseDown={(e) => { if (!zoom) return; setDragging(true); setStart({ x: e.clientX - panX, y: e.clientY - panY }); }}
                          onMouseMove={(e) => { if (!zoom || !dragging) return; setPanX(e.clientX - start.x); setPanY(e.clientY - start.y); }}
                          onMouseUp={() => setDragging(false)}
                          onMouseLeave={() => setDragging(false)}
                        >
                          <img src={item.image} alt={item.label} className="h-[70vh] w-full object-contain select-none"
                            style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom ? 1.4 : 1})`, transition: dragging ? 'none' : 'transform 200ms ease' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                  <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => embla?.scrollPrev()}>
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => embla?.scrollNext()}>
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 overflow-x-auto bg-black/80 p-2">
                  {galleryItems.map((item, i) => (
                    <button key={item.label} className={`h-14 w-24 overflow-hidden rounded border ${i === index ? 'border-white' : 'border-white/20'}`} onClick={() => { setIndex(i); embla?.scrollTo(i); }}>
                      <img src={item.image} alt={item.label} className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default GallerySection;
