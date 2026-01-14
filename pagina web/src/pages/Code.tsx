import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Code = () => {
  const [open, setOpen] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { setOpen(true); }, []);

  const submitCode = async () => {
    const v = code.trim().toUpperCase();
    if (!v) return;
    setError("");
    try {
      const res = await fetch(`https://globetrek.cloud/api/bookings/by-code/?code=${encodeURIComponent(v)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Código no encontrado");
      localStorage.setItem(`booking:${v}`, JSON.stringify({
        first_name: data.first_name,
        email: data.email,
        hotel_name: data.hotel_name,
        address: data.address,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        total: String(data.room_value),
        card_last_digits: "",
        first_image: data.first_image,
        second_image: data.second_image,
        currency_code: data.currency_code,
      }));
      sessionStorage.setItem('allowed_code', v);
      setOpen(false);
      navigate(`/download/${v}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "No se pudo obtener datos");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-16">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ingresa tu código de reserva</DialogTitle>
              <DialogDescription>Usaremos tu código para mostrarte la página de descargas.</DialogDescription>
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
      </main>
      <Footer />
    </div>
  );
};

export default Code;
