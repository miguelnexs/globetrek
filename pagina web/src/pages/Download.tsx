import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import QRCode from "qrcode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/DashboardCard";
import { Plane, FileText, Calendar, MapPin, Phone, Mail, Printer, CheckCircle, HelpCircle, Download as DownloadIcon, Send, User, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const currency = (v: number | string | undefined, code: string = 'EUR') => {
  const n = Number(v || 0);
  try {
    const formatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: code });
    const parts = formatter.formatToParts(n);
    const symbol = parts.find(p => p.type === 'currency')?.value || code;
    const number = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    return `${symbol} ${number}`;
  } catch { return String(n); }
};
const roomTypeLabel = (t?: string) => {
  const s = (t || '').toLowerCase();
  if (!s) return '-';
  if (s.includes('suite')) return 'Suite';
  if (s.includes('triple')) return 'Triple';
  if (s.includes('doble')) return 'Doble';
  if (s.includes('individual')) return 'Individual';
  return s;
};
const buildReceiptElement = (b: Booking, qrSrc?: string | null) => {
  const inDate = b.check_in_date ? new Date(b.check_in_date) : new Date();
  const outDate = b.check_out_date ? new Date(b.check_out_date) : new Date();
  const nightsRaw = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  const nights = isNaN(nightsRaw) ? 7 : Math.max(1, nightsRaw);
  const rate = Number(b.total || 0);
  const total = rate * nights;
  const el = document.createElement('div');
  el.style.cssText = 'background-color:white;color:black;padding:24px;font-family:Arial,sans-serif;width:210mm;height:296mm;max-height:296mm;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;line-height:1.4;border-top:8px solid #111111;';
  el.innerHTML = `
    <div style="height:100%;display:flex;flex-direction:column;max-width:75%;margin:0 auto;padding-top:18px;padding-bottom:18px;line-height:1.6;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="/negro.png" alt="Globetrek" style="height:56px;display:block;" />
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="text-align:right;font-size:20px;color:#111827;font-weight:800;">
            <div>Numero de reserva</div>
            <div style="font-weight:800;">${b.code || '-'}</div>
          </div>
          ${qrSrc ? `<img src="${qrSrc}" alt="QR" style="height:70px;width:70px;border:1px solid #e5e7eb;border-radius:6px;display:block;" />` : ``}
        </div>
      </div>
      <div style="margin-top:10px;color:#6b7280;font-size:13px;">Este es tu recibo</div>
      <div style="margin-top:22px;font-size:22px;font-weight:800;">Tus datos</div>
      <div style="margin-top:8px;">
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Nombre</div><div style="font-weight:600;">${b.first_name || '-'}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Correo</div><div style="font-weight:600;">${b.email || '-'}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Fecha</div><div style="font-weight:600;">${todayStr()}</div>
        </div>
      </div>
      <div style="margin-top:22px;font-size:22px;font-weight:800;">Datos de la Reserva</div>
      <div style="margin-top:8px;">
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Nombre del alojamiento</div><div style="text-align:right;font-weight:600;">${b.hotel_name || '-'}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Direccion del alojamiento</div><div style="text-align:right;font-weight:600;">${b.address || '-'}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Numero de reserva</div><div style="font-weight:600;">${b.code || '-'}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Entrada</div><div style="font-weight:600;">${b.check_in_date || '-'}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Salida</div><div style="font-weight:600;">${b.check_out_date || '-'}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <div>Total</div><div style="font-weight:700;">${currency(total, b.currency_code || 'EUR')}</div>
        </div>
      </div>
      <div style="margin-top:22px;">Pago realizado con tarjeta de credito ****${String(b.card_last_digits || '244')}</div>
      <div style="margin-top:16px;">Gracias por tu compra</div>
      <div style="margin-top:8px;">Puedes confirmar tu reserva en nuestras pagina oficial http://localhost:5173/</div>
      <div style="margin-top:22px;font-size:13px;">
        <div style="padding:10px 0;border-top:1px solid #e5e7eb;">El precio final incluye tasas aplicables por el alojamiento.</div>
        <div style="padding:10px 0;border-top:1px solid #e5e7eb;">La entidad emisora puede aplicar un cargo por transacción internacional.</div>
        <div style="padding:10px 0;border-top:1px solid #e5e7eb;">En caso de no presentación o cancelación, pueden aplicarse políticas de cargos del alojamiento.</div>
        <div style="padding:10px 0;border-top:1px solid #e5e7eb;">Revisa las condiciones de tu reserva, podrían contener información adicional importante.</div>
      </div>
    </div>
  `;
  return el;
};
const buildBookingElement = (b: Booking, firstSrc?: string | null, secondSrc?: string | null, qrSrc?: string | null) => {
  const inDate = b.check_in_date ? new Date(b.check_in_date) : new Date();
  const outDate = b.check_out_date ? new Date(b.check_out_date) : new Date();
  const nightsRaw = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  const nights = isNaN(nightsRaw) ? '-' : Math.max(1, nightsRaw);
  const subtotal = Number(b.total || 0);
  const total = typeof nights === 'number' ? subtotal * nights : subtotal;
  const el = document.createElement('div');
  el.style.cssText = 'background-color:white;color:black;padding:24px;font-family:Arial,sans-serif;width:210mm;height:296mm;max-height:296mm;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:2px solid #111111;">
      <div style="display:flex;align-items:center;">
        <img src="/negro.png" alt="GlobeTrek" style="height:70px;display:block;" />
      </div>
      <div style="background:#ffffff;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;display:flex;align-items:center;gap:12px;">
        <div style="text-align:right;">
          <p style="margin:0;color:#0f172a;font-size:18px;font-weight:700;">Comprobante reserva</p>
          <p style="margin:6px 0 0 0;color:#64748b;font-size:13px;">Código de confirmación</p>
          <p style="margin:4px 0 0 0;font-family:monospace;font-size:24px;font-weight:700;color:#111111;">${b.code || '-'}</p>
        </div>
        ${qrSrc ? `<img src="${qrSrc}" alt="QR" style="height:80px;width:80px;display:block;border-radius:4px;" />` : ``}
      </div>
    </div>
    <div>
      <p style="margin:0;color:#0f172a;font-size:14px;">Estimado/a <span style="font-weight:600;">${b.first_name || '-'}</span>, su reserva está confirmada.</p>
    </div>
    <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start;">
      <div style="background:#f8fafc;padding:12px;border-radius:6px;">
        <div style="position:relative;width:100%;height:150px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;">
          ${firstSrc ? `<img src="${firstSrc}" style="max-width:100%;max-height:100%;object-fit:contain;display:block;" />` : `<span style="color:#94a3b8;font-size:12px;">Sin imagen</span>`}
        </div>
      </div>
      <div style="background:#f8fafc;padding:12px;border-radius:6px;">
        <div style="margin-bottom:10px;color:#0f172a;font-size:26px;font-weight:900;letter-spacing:0.3px;">${b.hotel_name || '-'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:'Calibri',sans-serif;">
          <div style="grid-column:1 / span 2;">
            <div style="color:black;font-size:12px;font-weight:700;">Dirección</div>
            <div style="color:#0f172a;font-size:12px;">${b.address || '-'}</div>
          </div>
          <div>
            <div style="color:black;font-size:12px;font-weight:700;">Check-in</div>
            <div style="color:#0f172a;font-size:12px;">${b.check_in_date || '-'}</div>
          </div>
          <div>
            <div style="color:black;font-size:12px;font-weight:700;">Check-out</div>
            <div style="color:#0f172a;font-size:12px;">${b.check_out_date || '-'}</div>
          </div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 300px;gap:12px;align-items:start;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        <div style="background:#111111;color:#ffffff;padding:8px;font-size:12px;font-weight:600;">Resumen de la Reserva</div>
        <div>
          <table style="width:100%;border-collapse:separate;border-spacing:0;">
            <tbody>
              <tr style="background:#f8fafc;">
                <td style="padding:8px;color:black;font-size:11px;width:35%;font-weight:bold;">Nombre del hotel</td>
                <td style="padding:8px;color:black;font-size:11px;">${b.hotel_name || '-'}</td>
              </tr>
              <tr>
                <td style="padding:8px;color:black;font-size:11px;width:35%;font-weight:bold;">Tipo de habitación</td>
                <td style="padding:8px;color:black;font-size:11px;">${roomTypeLabel(b.room_type)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td style="padding:8px;color:black;font-size:11px;width:35%;font-weight:bold;">Ubicación</td>
                <td style="padding:8px;color:black;font-size:11px;">${b.location || '-'}</td>
              </tr>
              <tr>
                <td style="padding:8px;color:black;font-size:11px;width:35%;font-weight:bold;">Teléfono</td>
                <td style="padding:8px;color:black;font-size:11px;">${b.phone || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style="background:#f8fafc;padding:10px;border-radius:6px;">
        <div style="position:relative;width:100%;height:120px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:6px;">
          ${secondSrc ? `<img src="${secondSrc}" style="max-width:100%;max-height:100%;object-fit:contain;display:block;" />` : `<span style="color:#94a3b8;font-size:12px;">Sin imagen</span>`}
        </div>
      </div>
    </div>
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
      <div style="background:#111111;color:#ffffff;padding:8px;font-size:12px;font-weight:600;">Información del Pago</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;">
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:12px;color:#0f172a;font-size:12px;font-weight:700;width:30%;">Habitación:</td>
            <td style="padding:12px;color:#0f172a;font-size:12px;text-align:center;">${b.rooms_count || 1}</td>
            <td style="padding:12px;color:#0f172a;font-size:12px;text-align:right;border-left:1px solid #e2e8f0;width:25%;">${currency(subtotal, b.currency_code || 'EUR')}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:12px;color:#0f172a;font-size:12px;font-weight:700;">Dias:</td>
            <td style="padding:12px;color:#0f172a;font-size:12px;text-align:center;">${typeof nights === 'number' ? nights : '-'}</td>
            <td style="padding:12px;color:#0f172a;font-size:12px;text-align:right;border-left:1px solid #e2e8f0;">${typeof nights === 'number' ? nights : '-'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:12px;color:#0f172a;font-size:12px;font-weight:700;">Huéspedes:</td>
            <td style="padding:12px;color:#0f172a;font-size:12px;text-align:center;">${b.guests_count || 1}</td>
            <td style="padding:12px;color:#0f172a;font-size:12px;text-align:right;border-left:1px solid #e2e8f0;">-</td>
          </tr>
          <tr>
            <td style="padding:12px;color:#0f172a;font-size:12px;font-weight:700;">Total:</td>
            <td style="padding:12px;color:#0f172a;font-size:12px;text-align:center;"></td>
            <td style="padding:12px;color:#0f172a;font-size:14px;font-weight:700;text-align:right;border-left:1px solid #e2e8f0;">${currency(total, b.currency_code || 'EUR')}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="margin-top:-8px;background:#dbeafe;border:1px solid #e2e8f0;border-radius:8px;padding:10px;font-size:12px;color:#0f172a;line-height:1.6;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;">
        <div>
          <p style="margin:0;font-weight:700;">El precio final que se muestra ya ha sido pagado.</p>
          <p style="margin:0;">No se realizarán cargos adicionales.</p>
          <p style="margin:4px 0 0 0;"><span style="font-weight:700;">Total pagado:</span> <span style="font-weight:700;">${currency(total, b.currency_code || 'EUR')}</span></p>
        </div>
        <div>
          <p style="margin:0;">Este alojamiento acepta las siguientes formas de pago: American Express, Visa, Diners Club, Maestro</p>
        </div>
        <div style="grid-column:1 / span 2;">
          <p style="margin:8px 0 0 0;font-weight:600;">Información adicional</p>
          <p style="margin:2px 0 0 0;color:#334155;">Los suplementos adicionales (como cama supletoria) no están incluidos en el precio total. Si no te presentas o cancelas la reserva, es posible que el alojamiento te cargue los impuestos correspondientes. Recuerda leer la información importante que aparece a continuación, ya que puede contener datos relevantes que no se mencionan aqui.</p>
        </div>
      </div>
    </div>
  `;
  return el;
};
const downloadReceiptAdmin = async (b: Booking) => {
    const inDate = b.check_in_date ? new Date(b.check_in_date) : new Date();
    const outDate = b.check_out_date ? new Date(b.check_out_date) : new Date();
    const nightsRaw = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const nights = isNaN(nightsRaw) ? 7 : Math.max(1, nightsRaw);
    const roomRatePerNight = Number(b.total || 0);
    const subtotal = roomRatePerNight * nights;
    const qrUrlText = `http://localhost:5173/download/${b.code || ''}`;
    let qrSrc: string | null = null;
    try {
      qrSrc = await QRCode.toDataURL(qrUrlText, { width: 140, margin: 1 });
    } catch (e) {
      console.error("Error generating QR", e);
    }
    const el = buildReceiptElement(b, qrSrc);
  document.body.appendChild(el);
  await html2pdf()
    .set({ margin: 0, filename: `Comprobante_${b.code || 'RESERVA'}.pdf`, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
    .from(el)
    .save();
  document.body.removeChild(el);
};
const downloadBookingAdmin = async (b: Booking) => {
    const inDate = b.check_in_date ? new Date(b.check_in_date) : new Date();
    const outDate = b.check_out_date ? new Date(b.check_out_date) : new Date();
    const nightsRaw = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const nights = isNaN(nightsRaw) ? '-' : Math.max(1, nightsRaw);
    const subtotal = Number(b.total || 0);
    const total = typeof nights === 'number' ? subtotal * nights : subtotal;
    const resolveImageSrc = async (u?: string) => {
      if (!u) return null;
      if (/^data:/.test(u)) return u; // ya es Data URL
      const abs = (() => {
        if (/^https?:/.test(u)) return u;
        if (u.startsWith('/')) return `http://127.0.0.1:8000${u}`;
        const withMedia = u.startsWith('media/') ? u : `media/${u}`;
        return `http://127.0.0.1:8000/${withMedia}`;
      })();
      try {
        const res = await fetch(abs);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string>((done) => {
          const reader = new FileReader();
          reader.onloadend = () => done(String(reader.result || ''));
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };
    const firstSrc = await resolveImageSrc(b.first_image);
    const secondSrc = await resolveImageSrc(b.second_image);
    const qrUrlText = `http://localhost:5173/download/${b.code || ''}`;
    let qrSrc: string | null = null;
    try {
      qrSrc = await QRCode.toDataURL(qrUrlText, { width: 120, margin: 1 });
    } catch (e) {
      console.error("Error generating QR", e);
    }
    const el = buildBookingElement(b, firstSrc, secondSrc, qrSrc);
  document.body.appendChild(el);
  await html2pdf()
    .set({ margin: 0, filename: `Reserva_${b.code || 'RESERVA'}.pdf`, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
    .from(el)
    .save();
  document.body.removeChild(el);
};

type Booking = {
  code: string;
  id?: number;
  first_name?: string;
  email?: string;
  hotel_name?: string;
  address?: string;
  check_in_date?: string;
  check_out_date?: string;
  total?: string;
  card_last_digits?: string;
  first_image?: string;
  second_image?: string;
  currency_code?: string;
  room_type?: string;
  location?: string;
  phone?: string;
  guests_count?: number;
};

const todayStr = () => new Date().toLocaleDateString("es-ES");

const Download = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const c = (code || "-").toUpperCase();
  const [booking, setBooking] = useState<Booking>({ code: c });
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [generatingBooking, setGeneratingBooking] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [showSuccessEmail, setShowSuccessEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`booking:${c}`);
      if (raw) {
        const b = JSON.parse(raw);
        setBooking({ code: c, ...b });
      }
    } catch (e) { void e; }
    fetch(`http://127.0.0.1:8000/users/api/bookings/by-code/?code=${encodeURIComponent(c)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || 'Código no encontrado');
        const mapped = {
          id: data.id,
          first_name: data.first_name,
          email: data.email,
          hotel_name: data.hotel_name,
          address: data.address,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          total: String(data.room_value),
          card_last_digits: '',
          first_image: data.first_image,
          second_image: data.second_image,
          currency_code: data.currency_code,
          room_type: data.room_type,
          location: data.location,
          phone: data.phone,
          guests_count: data.guests_count,
        };
        localStorage.setItem(`booking:${c}`, JSON.stringify(mapped));
        setBooking({ code: c, ...mapped });
      })
      .catch((e) => {
        console.error("Error fetching booking:", e);
        const raw = localStorage.getItem(`booking:${c}`);
        if (!raw) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la reserva. Verifique que el backend esté funcionando.' });
        } else {
          toast({ variant: 'destructive', title: 'Aviso', description: 'No se pudo actualizar la reserva. Mostrando datos guardados.' });
        }
      });
  }, [c, navigate]);

  const makeReceiptBlob = async (b: Booking) => {
    const qrUrlText = `http://localhost:5173/download/${b.code || ''}`;
    let qrSrc: string | null = null;
    try {
      qrSrc = await QRCode.toDataURL(qrUrlText, { width: 140, margin: 1 });
    } catch (e) {
      console.error("Error generating QR", e);
    }
    const el = buildReceiptElement(b, qrSrc);
    document.body.appendChild(el);
    let blob: Blob | undefined;
    await html2pdf().set({ html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).toPdf().get('pdf').then((pdf) => { blob = pdf.output('blob'); });
    document.body.removeChild(el);
    return { blob: blob!, filename: `Comprobante_${b.code || 'RESERVA'}.pdf` };
  };

  const makeBookingBlob = async (b: Booking) => {
    const inDate = b.check_in_date ? new Date(b.check_in_date) : new Date();
    const outDate = b.check_out_date ? new Date(b.check_out_date) : new Date();
    const nightsRaw = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const nights = isNaN(nightsRaw) ? '-' : Math.max(1, nightsRaw);
    const subtotal = Number(b.total || 0);
    const total = typeof nights === 'number' ? subtotal * nights : subtotal;
    const resolveImageSrc = async (u?: string) => {
      if (!u) return null;
      if (/^data:/.test(u)) return u;
      const abs = (() => {
        if (/^https?:/.test(u)) return u;
        if (u.startsWith('/')) return `http://127.0.0.1:8000${u}`;
        const withMedia = u.startsWith('media/') ? u : `media/${u}`;
        return `http://127.0.0.1:8000/${withMedia}`;
      })();
      try {
        const res = await fetch(abs);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string>((done) => {
          const reader = new FileReader();
          reader.onloadend = () => done(String(reader.result || ''));
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };
    const firstSrc = await resolveImageSrc(b.first_image);
    const secondSrc = await resolveImageSrc(b.second_image);
    const qrUrlText = `http://localhost:5173/download/${b.code || ''}`;
    let qrSrc: string | null = null;
    try {
      qrSrc = await QRCode.toDataURL(qrUrlText, { width: 120, margin: 1 });
    } catch (e) {
      console.error("Error generating QR", e);
    }
    const el = buildBookingElement(b, firstSrc, secondSrc, qrSrc);
    document.body.appendChild(el);
    let blob: Blob | undefined;
    await html2pdf().set({ html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).toPdf().get('pdf').then((pdf) => { blob = pdf.output('blob'); });
    document.body.removeChild(el);
    return { blob: blob!, filename: `Reserva_${b.code || 'RESERVA'}.pdf` };
  };

  const sendEmail = async () => {
    try {
      setSending(true);
      if (!booking.id) throw new Error('ID de reserva no disponible');
      const { blob: receiptBlob, filename: receiptName } = await makeReceiptBlob(booking);
      const { blob: bookingBlob, filename: bookingName } = await makeBookingBlob(booking);
      const fd = new FormData();
      fd.append('receipt_pdf', receiptBlob, receiptName);
      fd.append('reservation_pdf', bookingBlob, bookingName);
      const res = await fetch(`http://127.0.0.1:8000/users/api/bookings/${booking.id}/send-receipt/`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Error al enviar el correo');
      setShowSuccessEmail(true);
      toast({ title: 'Correo enviado', description: 'Hemos enviado tu reserva y recibo por email.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Error al enviar el correo' });
    } finally {
      setSending(false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `http://127.0.0.1:8000${path}`;
    const withMedia = path.startsWith('media/') ? path : `media/${path}`;
    return `http://127.0.0.1:8000/${withMedia}`;
  };

  const hotelImage = getImageUrl(booking.first_image);

  const handleDownloadReceipt = async () => {
    try {
      setGeneratingReceipt(true);
      await downloadReceiptAdmin(booking);
      toast({ title: 'Recibo generado', description: 'La descarga ha comenzado.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo generar el recibo.' });
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const handleDownloadBooking = async () => {
    try {
      setGeneratingBooking(true);
      await downloadBookingAdmin(booking);
      toast({ title: 'Comprobante generado', description: 'La descarga ha comenzado.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo generar el comprobante.' });
    } finally {
      setGeneratingBooking(false);
    }
  };



  const inDate = booking.check_in_date ? new Date(booking.check_in_date) : undefined;
  const outDate = booking.check_out_date ? new Date(booking.check_out_date) : undefined;
  const nightsRaw = inDate && outDate ? Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
  const nights = typeof nightsRaw === 'number' && !isNaN(nightsRaw) ? Math.max(1, nightsRaw) : undefined;
  const perNight = Number(booking.total || 0);
  const totalAmount = nights ? perNight * nights : perNight;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
               <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                 <CheckCircle className="h-10 w-10 text-green-600" />
               </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              ¡Todo listo{booking.first_name ? `, ${booking.first_name}` : ''}!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tu reserva en <span className="font-semibold text-foreground">{booking.hotel_name || 'tu alojamiento'}</span> está confirmada. 
              Aquí tienes toda la documentación necesaria para tu viaje.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-border shadow-md">
                {hotelImage && (
                  <div className="h-64 w-full relative">
                    <img 
                      src={hotelImage} 
                      alt={booking.hotel_name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-600 hover:bg-green-700 text-base px-3 py-1">Confirmada</Badge>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{booking.hotel_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    {booking.address || booking.location || 'Dirección no disponible'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Dates Section */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Entrada
                      </p>
                      <p className="text-lg font-semibold">{booking.check_in_date || '-'}</p>
                      <p className="text-xs text-muted-foreground">A partir de las 15:00</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 justify-end">
                        Salida <Calendar className="h-4 w-4" />
                      </p>
                      <p className="text-lg font-semibold">{booking.check_out_date || '-'}</p>
                      <p className="text-xs text-muted-foreground">Hasta las 12:00</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Código de Reserva</p>
                      <p className="text-lg font-mono font-bold tracking-wider">{booking.code}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Huéspedes</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">{booking.guests_count || 1} Adulto(s)</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Tipo de Habitación</p>
                      <p className="text-base">{roomTypeLabel(booking.room_type)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Contacto Alojamiento</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">{booking.phone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Resumen de pago</CardTitle>
                  <CardDescription>Detalles de importe y noches</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Precio por noche</p>
                    <p className="text-lg font-semibold">{currency(perNight, booking.currency_code || 'EUR')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Noches</p>
                    <p className="text-lg font-semibold">{typeof nights === 'number' ? nights : '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{currency(totalAmount, booking.currency_code || 'EUR')}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Tus datos</CardTitle>
                  <CardDescription>Información de contacto</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="text-base font-medium">{booking.first_name || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Correo</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-base">{booking.email || '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>¿Cómo descargo mis documentos?</AccordionTrigger>
                  <AccordionContent>Usa los botones en el panel derecho para generar y descargar el recibo o el comprobante.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>¿Puedo cambiar la reserva?</AccordionTrigger>
                  <AccordionContent>Contacta al soporte con tu código de reserva. Te ayudaremos a gestionar cambios.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>No me llega el correo</AccordionTrigger>
                  <AccordionContent>Revisa la carpeta de correo no deseado. Si no llega, usa la opción de enviar nuevamente.</AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Tips / Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4 items-start">
                 <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                   <CheckCircle className="h-5 w-5" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-blue-900">Información Importante</h3>
                   <p className="text-blue-700 text-sm mt-1">
                     Recuerda presentar tu documento de identidad y la tarjeta de crédito utilizada para la reserva al momento del check-in.
                   </p>
                 </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              
              {/* Downloads Card */}
              <Card className="border-border shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">Documentación</CardTitle>
                  <CardDescription>Descarga o envía tus comprobantes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start h-12 text-base" onClick={handleDownloadReceipt} disabled={generatingReceipt}>
                    <DownloadIcon className="mr-2 h-5 w-5" />
                    {generatingReceipt ? 'Generando recibo...' : 'Descargar Recibo'}
                  </Button>
                  <Button variant="secondary" className="w-full justify-start h-12 text-base" onClick={handleDownloadBooking} disabled={generatingBooking}>
                    <FileText className="mr-2 h-5 w-5" />
                    {generatingBooking ? 'Generando comprobante...' : 'Descargar Comprobante'}
                  </Button>
                  <Separator className="my-2" />
                  <Button variant="outline" className="w-full justify-start h-12 text-base" onClick={() => setShowConfirmEmail(true)} disabled={sending}>
                    <Mail className="mr-2 h-5 w-5" />
                    {sending ? 'Enviando correo...' : 'Enviar por Correo'}
                  </Button>

                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="border-border shadow-sm bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    ¿Necesitas ayuda?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4">
                  <p>Si tienes problemas con tu reserva o necesitas modificarla, contáctanos.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium text-foreground">+34 900 123 456</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium text-foreground">soporte@globetrek.es</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button variant="link" className="text-muted-foreground" onClick={() => navigate('/')}>
                  Volver al inicio
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AlertDialog open={showConfirmEmail} onOpenChange={setShowConfirmEmail}>
        <AlertDialogContent className="max-w-[400px] rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2 text-blue-600">
              <Mail className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">¿Enviar reserva?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base">
              Se enviará el comprobante y el recibo de la reserva al correo electrónico del cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 px-6">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={sendEmail}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-200"
            >
              Confirmar envío
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessEmail} onOpenChange={setShowSuccessEmail}>
        <AlertDialogContent className="max-w-[400px] rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">¡Correo enviado!</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base">
              La reserva y el recibo han sido enviados correctamente a la dirección de correo electrónico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4">
            <AlertDialogAction 
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-10 shadow-lg shadow-green-200"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Download;