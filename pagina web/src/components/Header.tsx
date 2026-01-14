import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submitCode = async () => {
    const v = code.trim().toUpperCase();
    if (!v) return;
    setError("");
    try {
      const res = await fetch(`https://globetrek.cloud/api/bookings/by-code/?code=${encodeURIComponent(v)}`);
      const data: {
        detail?: string;
        first_name?: string;
        email?: string;
        hotel_name?: string;
        address?: string;
        check_in_date?: string;
        check_out_date?: string;
        room_value?: number | string;
      } = await res.json().catch(() => ({} as Record<string, never>));
      if (!res.ok) throw new Error(data?.detail || "Código no encontrado");
      localStorage.setItem(`booking:${v}`, JSON.stringify({
        first_name: data.first_name,
        email: data.email,
        hotel_name: data.hotel_name,
        address: data.address,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        total: String(data.room_value ?? ""),
        card_last_digits: "",
      }));
      setOpen(false);
      navigate(`/download/${v}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo obtener datos";
      setError(msg);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/negro.png" alt="Logo" className="h-12 w-auto cursor-pointer object-contain" onClick={() => navigate('/')} />
        </div>

        

        {/* Botón para abrir formulario de código */}
        <div className="hidden items-center gap-2 md:flex">
          <Button className="h-10 px-4" onClick={() => setOpen(true)}>
            Ingresar código
          </Button>
        </div>

        {/* Mobile menu button */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingresa tu código de reserva</DialogTitle>
            <DialogDescription>Validaremos el código y te llevaremos a las descargas.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Código (p.ej. ABCDE1)" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center justify-end gap-2">
              <Button onClick={submitCode}>Continuar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
