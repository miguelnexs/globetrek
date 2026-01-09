import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/negro.png" alt="Logo" className="h-12 w-auto cursor-pointer object-contain" onClick={() => navigate('/')} />
          </div>

          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Agencia de Viajes · Diseño conceptual
          </p>

          {/* Decorative text */}
          <p className="font-display text-sm italic text-muted-foreground">
            "El mundo es un libro..."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
