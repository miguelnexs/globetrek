import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import DashboardSection from "@/components/DashboardSection";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <DashboardSection />
        <GallerySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
