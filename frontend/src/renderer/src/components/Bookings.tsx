import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import logoNegro from '../negro.png';

const currency = (v, code = 'EUR') => {
  const n = Number(v || 0);
  try {
    const formatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: code });
    const parts = formatter.formatToParts(n);
    const symbol = parts.find(p => p.type === 'currency')?.value || code;
    const number = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    return `${symbol} ${number}`;
  } catch {
    return String(n);
  }
};

const roomTypeLabel = (rt) => {
  if (rt === 'single') return 'Individual';
  if (rt === 'double') return 'Doble';
  if (rt === 'triple') return 'Triple';
  if (rt === 'suite') return 'Suite';
  return rt || '-';
};

const Bookings = ({ token, apiBase, role, setView, onEdit }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [q, setQ] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSendEmail, setConfirmSendEmail] = useState(null);
  const [showSuccessEmail, setShowSuccessEmail] = useState(null);
  const [showErrorEmail, setShowErrorEmail] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const authHeaders = (tkn) => ({ Authorization: `Bearer ${tkn}` });

  const normalizeRoomType = (val) => {
    const s = (val || '').toString().trim().toLowerCase();
    if (['single','individual','simple','sencilla','indiv'].includes(s)) return 'single';
    if (['double','doble','duo','2','two'].includes(s)) return 'double';
    if (['triple','triple','tres','three','3'].includes(s)) return 'triple';
    if (['suite','suíte'].includes(s)) return 'suite';
    return s;
  };

  const extractServerError = (data) => {
    if (!data) return null;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length) {
        const k = keys[0];
        const v = data[k];
        if (Array.isArray(v) && v.length) return `${k}: ${v[0]}`;
        if (typeof v === 'string') return `${k}: ${v}`;
      }
    }
    return null;
  };

  const canManage = role === 'admin' || role === 'super_admin' || role === 'employee';
  const canDelete = role === 'admin' || role === 'super_admin';
  const canCreate = canManage;

  const loadBookings = async () => {
    if (!canManage) {
      setMsg({ type: 'error', text: 'Solo personal autorizado puede gestionar reservas.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const url = new URL(`${apiBase}/users/api/bookings/`);
      if (q) url.searchParams.set('q', q);
      if (ordering) url.searchParams.set('ordering', ordering);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('page_size', pageSize.toString());
      const res = await fetch(url, { headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar reservas');
      setList(data.results || []);
      setTotal(Number(data.total || 0));
      setPage(Number(data.page || 1));
      setPageSize(Number(data.page_size || 10));
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token && canManage) loadBookings(); }, [token]);


  const createReceiptPdfBlob = async (b) => {
    const inDate = new Date(b.check_in_date);
    const outDate = new Date(b.check_out_date);
    const nightsRaw = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    const nights = isNaN(nightsRaw) ? 7 : Math.max(1, nightsRaw);
    const roomRatePerNight = Number(b.room_value || 90);
    const subtotal = roomRatePerNight * nights;
    
    // Generate QR
    const qrUrlText = `http://localhost:5173/download/${b.code || b.id || ''}`;
    let qrSrc = null;
    try {
      qrSrc = await QRCode.toDataURL(qrUrlText, { width: 140, margin: 1 });
    } catch (e) {
      console.error('Error generating QR', e);
    }

    const receiptContent = document.createElement('div');
    receiptContent.style.cssText = `
      background-color: white;
      color: black;
      padding: 24px;
      font-family: Arial, sans-serif;
      width: 210mm;
      max-height: 296mm;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      line-height: 1.4;
      border-top: 8px solid #111111;
    `;
    const totalStay = subtotal;
    receiptContent.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;max-width:80%;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${logoNegro}" alt="Globetrek" style="height:48px;display:block;" />
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="text-align:right;font-size:18px;color:#111827;font-weight:700;">
              <div>Numero de reserva</div>
              <div style="font-weight:700;">${b.code || b.id || '-'}</div>
            </div>
            ${qrSrc ? `<img src="${qrSrc}" alt="QR" style="height:70px;width:70px;border:1px solid #e5e7eb;border-radius:6px;display:block;" />` : ``}
          </div>
        </div>
        <div style="margin-top:6px;color:#6b7280;font-size:12px;">Este es tu recibo</div>
        
        <div style="margin-top:18px;font-size:18px;font-weight:700;">Tus datos</div>
        <div style="margin-top:8px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Nombre</div><div style="font-weight:600;">${b.first_name || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Correo</div><div style="font-weight:600;">${b.email || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Fecha</div><div style="font-weight:600;">${new Date().toLocaleDateString('es-ES')}</div>
          </div>
        </div>
        
        <div style="margin-top:18px;font-size:18px;font-weight:700;">Datos de la Reserva</div>
        <div style="margin-top:8px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Nombre del alojamiento</div><div style="text-align:right;font-weight:600;">${b.hotel_name || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Direccion del alojamiento</div><div style="text-align:right;font-weight:600;">${b.address || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Numero de reserva</div><div style="font-weight:600;">${b.code || b.id || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Entrada</div><div style="font-weight:600;">${b.check_in_date || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Salida</div><div style="font-weight:600;">${b.check_out_date || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Total</div><div style="font-weight:700;">${currency(totalStay, b.currency_code || 'EUR')}</div>
          </div>
        </div>
        
        <div style="margin-top:18px;">Pago realizado con tarjeta de credito ****${String(b.card_last_digits || '244')}</div>
        <div style="margin-top:12px;">Gracias por tu compra</div>
        <div>Puedes confirmar tu reserva en nuestras pagina oficial http://localhost:5173/</div>
      </div>
    `;
    document.body.appendChild(receiptContent);
    const mod = await import('html2pdf.js');
    const html2pdf = mod.default || mod;
    const baseName = b.code ? `Comprobante_${b.code}` : `Comprobante_${b.id}`;
    let blob;
    await html2pdf()
      .set({
        margin: 0,
        filename: `${baseName}.pdf`,
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', letterRendering: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(receiptContent)
      .toPdf()
      .get('pdf')
      .then((pdf) => { blob = pdf.output('blob'); });
    document.body.removeChild(receiptContent);
    return { blob, filename: `${baseName}.pdf` };
  };

  const createBookingPdfBlob = async (b) => {
    const inDate = new Date(b.check_in_date);
    const outDate = new Date(b.check_out_date);
    const nightsRaw = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    const nights = isNaN(nightsRaw) ? '-' : Math.max(1, nightsRaw);
    const subtotal = Number(b.room_value || 0) * Number(b.rooms_count || 1);
    const resolveImageSrc = async (u) => {
      if (!u) return null;
      const abs = /^https?:/.test(u) ? u : `${apiBase}${u}`;
      try {
        const res = await fetch(abs, { headers: authHeaders(token) });
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.warn('Image fetch returned HTML (likely 404 or proxy issue), ignoring:', abs);
          return null;
        }
        const blob = await res.blob();
        return await new Promise((done) => {
          const reader = new FileReader();
          reader.onloadend = () => done(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };
    const img1 = await resolveImageSrc(b.first_image);
    const img2 = await resolveImageSrc(b.second_image);
    const total = typeof nights === 'number' ? subtotal * nights : subtotal;

    // Generate QR
    const qrUrlText = `http://localhost:5173/download/${b.code || b.id || ''}`;
    let qrSrc = null;
    try {
      qrSrc = await QRCode.toDataURL(qrUrlText, { width: 120, margin: 1 });
    } catch (e) {
      console.error('Error generating QR', e);
    }

    const el = document.createElement('div');
    el.style.cssText = 'background-color:white;color:black;padding:16px;font-family:Arial,sans-serif;width:210mm;max-height:296mm;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #111111;">
        <div style="display:flex;align-items:center;">
          <img src="${logoNegro}" alt="GlobeTrek" style="height:80px;display:block;" />
        </div>
        <div style="display:flex;align-items:center;gap:12px;background:#ffffff;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;">
          <div style="text-align:right;">
            <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">Comprobante reserva</p>
            <p style="margin:4px 0 0 0;color:#64748b;font-size:12px;">Código de confirmación</p>
            <p style="margin:2px 0 0 0;font-family:monospace;font-size:20px;font-weight:700;color:#111111;">${b.code || b.id}</p>
          </div>
          ${qrSrc ? `<img src="${qrSrc}" alt="QR" style="height:70px;width:70px;border:1px solid #e5e7eb;border-radius:6px;display:block;" />` : ``}
        </div>
      </div>
      <div>
        <p style="margin:0;color:#0f172a;font-size:14px;">Estimado/a <span style="font-weight:600;">${b.first_name || '-'}</span>, su reserva está confirmada.</p>
      </div>
      <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start;">
        <div style="background:#f8fafc;padding:12px;border-radius:6px;">
          <div style="position:relative;width:100%;height:150px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;">
            ${img1 ? `<img src="${img1}" alt="Imagen 1" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="color:#94a3b8;font-size:12px;">Sin imagen</span>`}
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
      <div style="display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
          <div style="background:#111111;color:#ffffff;padding:10px;font-size:13px;font-weight:600;">Resumen de la Reserva</div>
          <div>
          <table style="width:100%;border-collapse:separate;border-spacing:0;">
            <tbody>
              <tr style="background:#f8fafc;">
                <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Nombre del hotel</td>
                <td style="padding:10px;color:black;font-size:12px;">${b.hotel_name || '-'}</td>
              </tr>
              <tr>
                <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Tipo de habitación</td>
                <td style="padding:10px;color:black;font-size:12px;">${roomTypeLabel(b.room_type)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Ubicación</td>
                <td style="padding:10px;color:black;font-size:12px;">${b.location || '-'}</td>
              </tr>
              <tr>
                <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Teléfono</td>
                <td style="padding:10px;color:black;font-size:12px;">${b.phone || '-'}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div style="background:#f8fafc;padding:12px;border-radius:6px;">
          <div style="position:relative;width:100%;height:200px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;">
            ${img2 ? `<img src="${img2}" alt="Imagen 2" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="color:#94a3b8;font-size:12px;">Sin imagen</span>`}
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

      <div style="margin-top:4px;background:#dbeafe;border:1px solid #e2e8f0;border-radius:8px;padding:10px;font-size:12px;color:#0f172a;line-height:1.6;">
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
            <p style="margin:2px 0 0 0;color:#334155;">Los suplementos adicionales (como cama supletoria) no están incluidos en el precio total. Si no te presentas o cancelas la reserva, es posible que el alojamiento te cargue los impuestos correspondientes. Recuerda leer la información importante que aparece a continuación, ya que puede contener datos relevantes que no se mencionan aquí.</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    const mod = await import('html2pdf.js');
    const html2pdf = mod.default || mod;
    const baseName = b.code ? `Reserva_${b.code}` : `Reserva_${b.id}`;
    let blob;
    await html2pdf()
      .set({ margin: 0, filename: `${baseName}.pdf`, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
      .from(el)
      .toPdf()
      .get('pdf')
      .then((pdf) => { blob = pdf.output('blob'); });
    document.body.removeChild(el);
    return { blob, filename: `${baseName}.pdf` };
  };
  const downloadReceipt = async (b) => {
    try {
      // Calcular noches de estadía
      const inDate = new Date(b.check_in_date);
      const outDate = new Date(b.check_out_date);
      const nightsRaw = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
      const nights = isNaN(nightsRaw) ? 7 : Math.max(1, nightsRaw);
      
      // Calcular subtotal basado en las noches
      const roomRatePerNight = Number(b.room_value || 90);
      const subtotal = roomRatePerNight * nights;

      // Generate QR
      const qrUrlText = `http://localhost:5173/download/${b.code || b.id || ''}`;
      let qrSrc = null;
      try {
        qrSrc = await QRCode.toDataURL(qrUrlText, { width: 140, margin: 1 });
      } catch (e) {
        console.error('Error generating QR', e);
      }

      // Crear el contenido del recibo basado en el PDF de muestra
      const receiptContent = document.createElement('div');
      receiptContent.style.cssText = `
        background-color: white;
        color: black;
        padding: 24px;
        font-family: Arial, sans-serif;
        width: 210mm;
        max-height: 296mm;
        overflow: hidden;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        line-height: 1.4;
        border-top: 8px solid #111111;
      `;

      receiptContent.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;max-width:80%;margin:0 auto;"><div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${logoNegro}" alt="Globetrek" style="height:50px;display:block;" />
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="text-align:right;font-size:12px;color:#111827;">
              <div>Numero de reserva</div>
              <div style="font-weight:700;">${b.code || b.id || '-'}</div>
            </div>
            ${qrSrc ? `<img src="${qrSrc}" alt="QR" style="height:70px;width:70px;border:1px solid #e5e7eb;border-radius:6px;display:block;" />` : ``}
          </div>
        </div>
        <div style="margin-top:6px;color:#6b7280;font-size:12px;">Este es tu recibo</div>
        <div style="margin-top:18px;font-size:18px;font-weight:700;">Tus datos</div>
        <div style="margin-top:8px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Nombre</div><div style="font-weight:600;">${b.first_name || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Correo</div><div style="font-weight:600;">${b.email || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Fecha</div><div style="font-weight:600;">${new Date().toLocaleDateString('es-ES')}</div>
          </div>
        </div>
        <div style="margin-top:18px;font-size:18px;font-weight:700;">Datos de la Reserva</div>
        <div style="margin-top:8px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Nombre del alojamiento</div><div style="text-align:right;font-weight:600;">${b.hotel_name || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Direccion del alojamiento</div><div style="text-align:right;font-weight:600;">${b.address || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Numero de reserva</div><div style="font-weight:600;">${b.code || b.id || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Entrada</div><div style="font-weight:600;">${b.check_in_date || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Salida</div><div style="font-weight:600;">${b.check_out_date || '-'}</div>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div>Total</div><div style="font-weight:700;">${currency(subtotal * (typeof nights === 'number' ? nights : 1), b.currency_code || 'EUR')}</div>
          </div>
        </div>
        <div style="margin-top:18px;">Pago realizado con tarjeta de credito ****${String(b.card_last_digits || '244')}</div>
        <div style="margin-top:12px;">Gracias por tu compra</div>
        <div>Puedes confirmar tu reserva en nuestras pagina oficial https://globetrek.es/</div>
        </div>
      `;

      // Agregar al DOM temporalmente
      document.body.appendChild(receiptContent);

      const mod = await import('html2pdf.js');
      const html2pdf = mod.default || mod;
      const baseName = b.code ? `Comprobante_${b.code}` : `Comprobante_${b.id}`;

      // Generar PDF
      await html2pdf()
      .set({
        margin: 0,
        filename: `${baseName}.pdf`,
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            letterRendering: true,
            logging: false
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(receiptContent)
        .save();

      // Limpiar
      document.body.removeChild(receiptContent);
    } catch (e) {
      console.error('Error generando PDF:', e);
      setMsg({ type: 'error', text: 'Error generando el recibo. Por favor intenta de nuevo.' });
    }
  };

  const downloadBookingPdf = async (b) => {
    try {
      const inDate = new Date(b.check_in_date);
      const outDate = new Date(b.check_out_date);
      const nightsRaw = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
      const nights = isNaN(nightsRaw) ? '-' : Math.max(1, nightsRaw);
      const subtotal = Number(b.room_value || 0) * Number(b.rooms_count || 1);

      const resolveImageSrc = async (u) => {
        if (!u) return null;
        let abs = /^https?:/.test(u) ? u : `${apiBase}${u}`;
        
        const isElectron = (window as any).electron;
        
        // Si estamos en modo local, redirigir URLs de media de la nube al backend local
        if ((apiBase.includes('127.0.0.1') || apiBase.includes('localhost')) && abs.includes('globetrek.cloud/media')) {
           abs = abs.replace(/https?:\/\/globetrek\.cloud\/media/, `${apiBase}/media`);
        }
        
        // Proxy hack for localhost CORS (only for browser dev)
        if (!isElectron && window.location.hostname === 'localhost' && abs.startsWith('/media')) {
           // Si ya es relativa, dejamos que el proxy de Vite lo maneje, 
           // pero si apiBase es local, la lógica anterior ya lo convirtió a http://127.0.0.1:8000/media
           // Si por alguna razón quedó relativa (e.g. venía relativa del backend), está bien.
        }
        try {
          const res = await fetch(abs, { headers: authHeaders(token) });
          if (!res.ok) return null;
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            console.warn('Image fetch returned HTML (likely 404 or proxy issue), ignoring:', abs);
            return null;
          }
          const blob = await res.blob();
          return await new Promise((done) => {
            const reader = new FileReader();
            reader.onloadend = () => done(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      };

      const img1 = await resolveImageSrc(b.first_image);
      const img2 = await resolveImageSrc(b.second_image);

      const total = typeof nights === 'number' ? subtotal * nights : subtotal;
      const paymentMethod = b.payment_method || 'Tarjeta de crédito';

      // Generate QR
      const qrUrlText = `http://localhost:5173/download/${b.code || b.id || ''}`;
      let qrSrc = null;
      try {
        qrSrc = await QRCode.toDataURL(qrUrlText, { width: 120, margin: 1 });
      } catch (e) {
        console.error('Error generating QR', e);
      }

      const el = document.createElement('div');
      el.style.cssText = 'background-color:white;color:black;padding:16px;font-family:Arial,sans-serif;width:210mm;max-height:296mm;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;';
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #111111;">
          <div style="display:flex;align-items:center;">
            <img src="${logoNegro}" alt="GlobeTrek" style="height:80px;display:block;" />
          </div>
          <div style="display:flex;align-items:center;gap:12px;background:#ffffff;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="text-align:right;">
              <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">Comprobante reserva</p>
              <p style="margin:4px 0 0 0;color:#64748b;font-size:12px;">Código de confirmación</p>
              <p style="margin:2px 0 0 0;font-family:monospace;font-size:20px;font-weight:700;color:#111111;">${b.code || b.id}</p>
            </div>
            ${qrSrc ? `<img src="${qrSrc}" alt="QR" style="height:70px;width:70px;border:1px solid #e5e7eb;border-radius:6px;display:block;" />` : ``}
          </div>
        </div>

        <div>
          <p style="margin:0;color:#0f172a;font-size:14px;">Estimado/a <span style="font-weight:600;">${b.first_name || '-'}</span>, su reserva está confirmada.</p>
        </div>

        <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start;">
          <div style="background:#f8fafc;padding:12px;border-radius:6px;">
            <div style="position:relative;width:100%;height:150px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;">
              ${img1 ? `<img src="${img1}" alt="Imagen 1" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="color:#94a3b8;font-size:12px;">Sin imagen</span>`}
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

        

        <div style="display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start;">
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
            <div style="background:#111111;color:#ffffff;padding:10px;font-size:13px;font-weight:600;">Resumen de la Reserva</div>
            <div>
            <table style="width:100%;border-collapse:separate;border-spacing:0;">
              <tbody>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Nombre del hotel</td>
                  <td style="padding:10px;color:black;font-size:12px;">${b.hotel_name || '-'}</td>
                </tr>
                <tr>
                  <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Tipo de habitación</td>
                  <td style="padding:10px;color:black;font-size:12px;">${roomTypeLabel(b.room_type)}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Ubicación</td>
                  <td style="padding:10px;color:black;font-size:12px;">${b.location || '-'}</td>
                </tr>
                <tr>
                  <td style="padding:10px;color:black;font-weight:bold;font-size:12px;width:35%;">Teléfono</td>
                  <td style="padding:10px;color:black;font-size:12px;">${b.phone || '-'}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
          <div style="background:#f8fafc;padding:12px;border-radius:6px;">
            <div style="position:relative;width:100%;height:200px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;">
              ${img2 ? `<img src="${img2}" alt="Imagen 2" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="color:#94a3b8;font-size:12px;">Sin imagen</span>`}
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
                <td style="padding:12px;color:#0f172a;font-size:12px;text-align:right;border-left:1px solid #e2e8f0;width:25%;">${currency(b.room_value || 0, b.currency_code || 'EUR')}</td>
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

        <div style="margin-top:4px;background:#dbeafe;border:1px solid #e2e8f0;border-radius:8px;padding:10px;font-size:12px;color:#0f172a;line-height:1.6;">
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

      document.body.appendChild(el);

      const mod = await import('html2pdf.js');
      const html2pdf = mod.default || mod;
      const baseName = b.code ? `Reserva_${b.code}` : `Reserva_${b.id}`;
      await html2pdf()
        .set({ margin: 0, filename: `${baseName}.pdf`, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
        .from(el)
        .save();

      document.body.removeChild(el);
    } catch (e) {
      setMsg({ type: 'error', text: 'Error generando la reserva en PDF. Intenta de nuevo.' });
    }
  };

  const performDelete = async (id) => {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/users/api/bookings/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) throw new Error((data && (data.detail || data.message)) || 'No se pudo eliminar');
      const msgText = (data && (data.message || data.detail)) || 'Reserva eliminada';
      setMsg({ type: 'success', text: msgText });
      loadBookings();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / (pageSize || 1))), [total, pageSize]);

  const handleSendEmail = async (b) => {
    try {
      setIsSendingEmail(true);
      const { blob: receiptBlob, filename: receiptName } = await createReceiptPdfBlob(b);
      const { blob: bookingBlob, filename: bookingName } = await createBookingPdfBlob(b);
      const fd = new FormData();
      fd.append('receipt_pdf', receiptBlob, receiptName);
      fd.append('reservation_pdf', bookingBlob, bookingName);
      const res = await fetch(`${apiBase}/users/api/bookings/${b.id}/send-receipt/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al enviar el correo');
      setShowSuccessEmail(b);
      setMsg(null);
    } catch (e) {
      setShowErrorEmail(e.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <AnimatePresence>
        {msg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('booking_create')} 
          className="px-4 py-2 rounded btn-brand shadow-lg shadow-theme-primary/20 font-medium"
        >
          Nueva reserva
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="text-theme-text font-bold text-lg">Reservas</div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 pr-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/40 w-full md:w-auto" placeholder="Buscar..." />
            </div>
            <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/40">
              <option value="-created_at">Más recientes</option>
              <option value="first_name">Nombre (A-Z)</option>
              <option value="hotel_name">Hotel (A-Z)</option>
              <option value="check_in_date">Check-in</option>
              <option value="check_out_date">Check-out</option>
              <option value="room_value">Valor</option>
            </select>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setPage(1); loadBookings(); }} 
              className="px-3 py-2 text-sm rounded-lg bg-theme-background/50 text-theme-text border border-theme-border hover:bg-theme-background/70"
            >
              Aplicar
            </motion.button>
          </div>
        </div>
        <div className="overflow-auto rounded-lg border border-theme-border">
          <table className="min-w-full text-sm text-theme-text">
            <thead>
              <tr className="text-left bg-theme-background/50 text-theme-textSecondary font-medium">
                {['Nombre','Código','Correo','Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 border-b border-theme-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              <AnimatePresence>
                {list.map((b, i) => (
                  <motion.tr 
                    key={b.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-theme-background/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{b.first_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.code || '-'}</td>
                    <td className="px-4 py-3 text-theme-textSecondary">{b.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => onEdit && onEdit(b)} className="px-2 py-1 text-xs rounded btn-brand">Editar</motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => downloadReceipt(b)} className="px-2 py-1 text-xs rounded bg-theme-accent text-white">Recibo</motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => downloadBookingPdf(b)} className="px-2 py-1 text-xs rounded bg-theme-primary text-white">Reserva</motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => setConfirmSendEmail(b)} className="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white">Email</motion.button>
                        {canDelete && (
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setConfirmDelete(b)} className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20">Eliminar</motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {list.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-theme-textSecondary" colSpan={4}>No hay reservas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-theme-textSecondary">Total: {total}</div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => { setPage(Math.max(1, page - 1)); loadBookings(); }} className="px-3 py-1.5 rounded-lg border border-theme-border hover:bg-theme-background/30 disabled:opacity-50 transition-colors">Anterior</button>
            <span className="text-theme-text font-medium px-2">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => { setPage(Math.min(totalPages, page + 1)); loadBookings(); }} className="px-3 py-1.5 rounded-lg border border-theme-border hover:bg-theme-background/30 disabled:opacity-50 transition-colors">Siguiente</button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-theme-surface border border-theme-border rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M9.402 2.01a2 2 0 00-1.732 1l-5.196 9a2 2 0 000 2l5.196 9a2 2 0 001.732 1h9.196a2 2 0 001.732-1l-5.196-9a2 2 0 000-2l-5.196-9a2 2 0 00-1.732-1H9.402z"/></svg>
                  </div>
                  <div className="font-bold text-lg">Confirmar eliminación</div>
                </div>
              </div>
              <div className="p-6 text-theme-text space-y-4">
                <p>¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.</p>
                <div className="text-sm bg-theme-background/30 border border-theme-border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between"><span className="text-theme-textSecondary">Nombre:</span> <span className="font-medium">{confirmDelete.first_name}</span></div>
                  <div className="flex justify-between"><span className="text-theme-textSecondary">Hotel:</span> <span className="font-medium">{confirmDelete.hotel_name}</span></div>
                  <div className="flex justify-between"><span className="text-theme-textSecondary">Código:</span> <span className="font-mono">{confirmDelete.code || '-'}</span></div>
                </div>
              </div>
              <div className="p-6 flex items-center justify-end gap-3 border-t border-theme-border bg-theme-background/20">
                <button className="px-4 py-2 rounded-lg bg-theme-background/50 hover:bg-theme-background/70 text-theme-text transition-colors" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-colors" onClick={async () => { const id = confirmDelete.id; setConfirmDelete(null); await performDelete(id); }}>Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmSendEmail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-theme-surface border border-theme-border rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                  </div>
                  <div className="font-bold text-lg">¿Enviar reserva?</div>
                </div>
              </div>
              <div className="p-6 text-theme-text space-y-4">
                <p>Se enviará el comprobante y el recibo de la reserva al correo electrónico del cliente.</p>
                <div className="text-sm bg-theme-background/30 border border-theme-border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between"><span className="text-theme-textSecondary">Cliente:</span> <span className="font-medium">{confirmSendEmail.first_name}</span></div>
                  <div className="flex justify-between"><span className="text-theme-textSecondary">Email:</span> <span className="font-medium">{confirmSendEmail.email}</span></div>
                  <div className="flex justify-between"><span className="text-theme-textSecondary">Código:</span> <span className="font-mono">{confirmSendEmail.code || '-'}</span></div>
                </div>
              </div>
              <div className="p-6 flex items-center justify-end gap-3 border-t border-theme-border bg-theme-background/20">
                <button className="px-4 py-2 rounded-lg bg-theme-background/50 hover:bg-theme-background/70 text-theme-text transition-colors" onClick={() => setConfirmSendEmail(null)}>Cancelar</button>
                <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-colors flex items-center gap-2" disabled={isSendingEmail} onClick={async () => { const b = confirmSendEmail; await handleSendEmail(b); setConfirmSendEmail(null); }}>
                  {isSendingEmail ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Confirmar envío</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showErrorEmail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-theme-surface border border-theme-border rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                  </div>
                  <div className="font-bold text-lg">Error al enviar</div>
                </div>
              </div>
              <div className="p-6 text-theme-text space-y-4 text-center">
                <p>Ocurrió un problema al intentar enviar el correo.</p>
                <div className="text-sm bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg p-3">
                  {showErrorEmail}
                </div>
              </div>
              <div className="p-6 flex items-center justify-center border-t border-theme-border bg-theme-background/20">
                <button className="px-8 py-2 rounded-lg bg-theme-background/50 hover:bg-theme-background/70 text-theme-text transition-colors" onClick={() => setShowErrorEmail(null)}>Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessEmail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-theme-surface border border-theme-border rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="font-bold text-lg">¡Correo enviado!</div>
                </div>
              </div>
              <div className="p-6 text-theme-text space-y-4 text-center">
                <p>El correo ha sido enviado correctamente a <span className="font-bold text-theme-text">{showSuccessEmail.email}</span>.</p>
                <p className="text-sm text-theme-textSecondary">El cliente recibirá su reserva y recibo en breve.</p>
              </div>
              <div className="p-6 flex items-center justify-center border-t border-theme-border bg-theme-background/20">
                <button className="px-8 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-colors" onClick={() => setShowSuccessEmail(null)}>Entendido</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Bookings;
