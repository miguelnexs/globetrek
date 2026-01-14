import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const Bookings = ({ token, apiBase, role, setView }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [q, setQ] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [firstPreview, setFirstPreview] = useState(null);
  const [secondPreview, setSecondPreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    email: '',
    address: '',
    check_in_date: '',
    check_out_date: '',
    hotel_name: '',
    room_type: 'single',
    location: '',
    phone: '',
    room_value: '',
    rooms_count: 1,
    guests_count: 1,
    first_image: null,
    second_image: null,
  });

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
      const url = new URL(`${apiBase}/api/bookings/`);
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files && files[0] ? files[0] : null;
    setForm((f) => ({ ...f, [name]: file }));
    if (name === 'first_image') {
      if (firstPreview) URL.revokeObjectURL(firstPreview);
      setFirstPreview(file ? URL.createObjectURL(file) : null);
    }
    if (name === 'second_image') {
      if (secondPreview) URL.revokeObjectURL(secondPreview);
      setSecondPreview(file ? URL.createObjectURL(file) : null);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  
  const handleFileDrop = (name, file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Archivo no válido: debe ser una imagen.' });
      return;
    }
    setForm((f) => ({ ...f, [name]: file }));
    if (name === 'first_image') {
      if (firstPreview) URL.revokeObjectURL(firstPreview);
      setFirstPreview(URL.createObjectURL(file));
    }
    if (name === 'second_image') {
      if (secondPreview) URL.revokeObjectURL(secondPreview);
      setSecondPreview(URL.createObjectURL(file));
    }
  };
  
  const removeImage = (name) => {
    setForm((f) => ({ ...f, [name]: null }));
    if (name === 'first_image') {
      if (firstPreview) URL.revokeObjectURL(firstPreview);
      setFirstPreview(null);
    }
    if (name === 'second_image') {
      if (secondPreview) URL.revokeObjectURL(secondPreview);
      setSecondPreview(null);
    }
  };

  const validateForm = () => {
    const required = ['first_name','email','address','check_in_date','check_out_date','hotel_name','room_type','location','phone','room_value','rooms_count','guests_count'];
    for (const k of required) {
      if (!form[k]) return `${k.replace('_',' ')} es requerido`;
    }
    if (!/^\+?\d{7,15}$/.test(form.phone)) return 'Teléfono inválido';
    const inDate = new Date(form.check_in_date);
    const outDate = new Date(form.check_out_date);
    if (inDate.toString() === 'Invalid Date' || outDate.toString() === 'Invalid Date') return 'Fechas inválidas';
    if (outDate < inDate) return 'Check-out debe ser posterior al check-in';
    const rt = normalizeRoomType(form.room_type);
    if (!['single','double','triple','suite'].includes(rt)) return 'Tipo de habitación inválido: use individual, doble, triple o suite';
    return null;
  };

  const createBooking = async (e) => {
    e.preventDefault();
    if (!canCreate) { setMsg({ type: 'error', text: 'No tienes permisos para crear reservas.' }); return; }
    const err = validateForm();
    if (err) { setMsg({ type: 'error', text: err }); return; }
    setLoading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      fd.set('room_type', normalizeRoomType(form.room_type));
      const res = await fetch(`${apiBase}/api/bookings/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractServerError(data) || 'No se pudo crear la reserva');
      setMsg({ type: 'success', text: `Reserva creada: ${data.first_name} - ${data.hotel_name}` });
      setForm({
        first_name: '', email: '', address: '', check_in_date: '', check_out_date: '', hotel_name: '', room_type: 'single', location: '', phone: '', room_value: '', rooms_count: 1, guests_count: 1, first_image: null, second_image: null,
      });
      if (firstPreview) URL.revokeObjectURL(firstPreview);
      if (secondPreview) URL.revokeObjectURL(secondPreview);
      setFirstPreview(null);
      setSecondPreview(null);
      setShowCreate(false);
      loadBookings();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (firstPreview) URL.revokeObjectURL(firstPreview);
      if (secondPreview) URL.revokeObjectURL(secondPreview);
    };
  }, [firstPreview, secondPreview]);

  const createReceiptPdfBlob = async (b) => {
    const inDate = new Date(b.check_in_date);
    const outDate = new Date(b.check_out_date);
    const nightsRaw = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    const nights = isNaN(nightsRaw) ? 7 : Math.max(1, nightsRaw);
    const roomRatePerNight = Number(b.room_value || 90);
    const subtotal = roomRatePerNight * nights;
    const receiptContent = document.createElement('div');
    receiptContent.style.cssText = `
      background-color: white;
      color: black;
      padding: 24px;
      font-family: Arial, sans-serif;
      width: 210mm;
      height: 297mm;
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
          <div style="text-align:right;font-size:18px;color:#111827;font-weight:700;">
            <div>Numero de reserva</div>
            <div style="font-weight:700;">${b.code || b.id || '-'}</div>
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
        <div>Puedes confirmar tu reserva en nuestras pagina oficial https://globetrek.es/</div>
      </div>
    `;
    document.body.appendChild(receiptContent);
    const mod = await import('html2pdf.js');
    const html2pdf = mod.default || mod;
    const baseName = b.code ? `Comprobante_${b.code}` : `Comprobante_${b.id}`;
    let blob;
    await html2pdf()
      .set({
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
    const el = document.createElement('div');
    el.style.cssText = 'background-color:white;color:black;padding:16px;font-family:Arial,sans-serif;width:210mm;height:285mm;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #111111;">
        <div style="display:flex;align-items:center;">
          <img src="${logoNegro}" alt="GlobeTrek" style="height:60px;display:block;" />
        </div>
        <div style="text-align:right;background:#ffffff;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;">
          <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">Comprobante reserva</p>
          <p style="margin:4px 0 0 0;color:#64748b;font-size:12px;">Código de confirmación</p>
          <p style="margin:2px 0 0 0;font-family:monospace;font-size:20px;font-weight:700;color:#111111;">${b.code || b.id}</p>
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
        <table style="width:100%;border-collapse:separate;border-spacing:0;">
          <thead>
            <tr style="background:#f1f5f9;color:#0f172a;">
              <th style="text-align:left;padding:8px;font-size:11px;font-weight:600;">Concepto</th>
              <th style="text-align:right;padding:8px;font-size:11px;font-weight:600;">Cantidad</th>
              <th style="text-align:right;padding:8px;font-size:11px;font-weight:600;">Precio/Noche</th>
              <th style="text-align:right;padding:8px;font-size:11px;font-weight:600;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#f8fafc;">
              <td style="padding:8px;color:#0f172a;font-size:11px;">Habitación</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${b.rooms_count || 1}</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${currency(b.room_value, b.currency_code || 'EUR')}</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${currency(subtotal, b.currency_code || 'EUR')}</td>
            </tr>
            <tr>
              <td style="padding:8px;color:#0f172a;font-size:11px;">Huéspedes</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${b.guests_count || 1}</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">-</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">-</td>
            </tr>
            <tr>
              <td style="padding:8px;color:#0f172a;font-size:11px;">Días</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${typeof nights === 'number' ? nights : '-'}</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${typeof nights === 'number' ? currency(b.room_value, b.currency_code || 'EUR') : '-'}</td>
              <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${typeof nights === 'number' ? currency(subtotal * nights, b.currency_code || 'EUR') : '-'}</td>
            </tr>
            <tr style="background:#e2e8f0;">
              <td style="padding:8px;font-size:11px;font-weight:700;color:#0f172a;">Total</td>
              <td style="padding:8px;font-size:11px;color:#0f172a;text-align:right;">-</td>
              <td style="padding:8px;font-size:11px;color:#0f172a;text-align:right;">-</td>
              <td style="padding:8px;font-size:11px;font-weight:700;color:#111111;text-align:right;">${currency(total, b.currency_code || 'EUR')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top:4px;background:#dbeafe;border:1px solid #e2e8f0;border-radius:8px;padding:10px;font-size:12px;color:#0f172a;line-height:1.6;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;">
          <div>
            <p style="margin:0;font-weight:700;">El precio final que se muestra es el importe que pagarás al alojamiento.</p>
            <p style="margin:0;">La entidad emisora puede aplicar un cargo por transacción internacional.</p>
            <p style="margin:4px 0 0 0;"><span style="font-weight:700;">El alojamiento te cobrará:</span> <span style="font-weight:700;">${currency(total, b.currency_code || 'EUR')}</span></p>
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
      .set({ filename: `${baseName}.pdf`, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
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

      // Crear el contenido del recibo basado en el PDF de muestra
      const receiptContent = document.createElement('div');
      receiptContent.style.cssText = `
        background-color: white;
        color: black;
        padding: 24px;
        font-family: Arial, sans-serif;
        width: 210mm;
        height: 297mm;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        line-height: 1.4;
        border-top: 8px solid #111111;
      `;

      receiptContent.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;max-width:80%;margin:0 auto;"><div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${logoNegro}" alt="Globetrek" style="height:26px;display:block;" />
          </div>
          <div style="text-align:right;font-size:12px;color:#111827;">
            <div>Numero de reserva</div>
            <div style="font-weight:700;">${b.code || b.id || '-'}</div>
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
        const abs = /^https?:/.test(u) ? u : `${apiBase}${u}`;
        try {
          const res = await fetch(abs, { headers: authHeaders(token) });
          if (!res.ok) return null;
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

      const el = document.createElement('div');
      el.style.cssText = 'background-color:white;color:black;padding:16px;font-family:Arial,sans-serif;width:210mm;height:297mm;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;';
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #111111;">
          <div style="display:flex;align-items:center;">
            <img src="${logoNegro}" alt="GlobeTrek" style="height:60px;display:block;" />
          </div>
          <div style="text-align:right;background:#ffffff;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;">
            <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">Comprobante reserva</p>
            <p style="margin:4px 0 0 0;color:#64748b;font-size:12px;">Código de confirmación</p>
            <p style="margin:2px 0 0 0;font-family:monospace;font-size:20px;font-weight:700;color:#111111;">${b.code || b.id}</p>
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
          <table style="width:100%;border-collapse:separate;border-spacing:0;">
            <thead>
              <tr style="background:#f1f5f9;color:#0f172a;">
                <th style="text-align:left;padding:8px;font-size:11px;font-weight:600;">Concepto</th>
                <th style="text-align:right;padding:8px;font-size:11px;font-weight:600;">Cantidad</th>
                <th style="text-align:right;padding:8px;font-size:11px;font-weight:600;">Precio/Noche</th>
                <th style="text-align:right;padding:8px;font-size:11px;font-weight:600;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#f8fafc;">
                <td style="padding:8px;color:#0f172a;font-size:11px;">Habitación</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${b.rooms_count || 1}</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${currency(b.room_value, b.currency_code || 'EUR')}</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${currency(subtotal, b.currency_code || 'EUR')}</td>
              </tr>
              <tr>
                <td style="padding:8px;color:#0f172a;font-size:11px;">Días</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${typeof nights === 'number' ? nights : '-'}</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${typeof nights === 'number' ? currency(b.room_value, b.currency_code || 'EUR') : '-'}</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${typeof nights === 'number' ? currency(subtotal * nights, b.currency_code || 'EUR') : '-'}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td style="padding:8px;color:#0f172a;font-size:11px;">Huéspedes</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">${b.guests_count || 1}</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">-</td>
                <td style="padding:8px;color:#0f172a;font-size:11px;text-align:right;">-</td>
              </tr>
              <tr style="background:#e2e8f0;">
                <td style="padding:8px;font-size:11px;font-weight:700;color:#0f172a;">Total</td>
                <td style="padding:8px;font-size:11px;color:#0f172a;text-align:right;">-</td>
                <td style="padding:8px;font-size:11px;color:#0f172a;text-align:right;">-</td>
                <td style="padding:8px;font-size:11px;font-weight:700;color:#111111;text-align:right;">${currency(total, b.currency_code || 'EUR')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top:4px;background:#dbeafe;border:1px solid #e2e8f0;border-radius:8px;padding:10px;font-size:12px;color:#0f172a;line-height:1.6;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;">
            <div>
              <p style="margin:0;font-weight:700;">El precio final que se muestra es el importe que pagarás al alojamiento.</p>
              <p style="margin:0;">La entidad emisora puede aplicar un cargo por transacción internacional.</p>
              <p style="margin:4px 0 0 0;"><span style="font-weight:700;">El alojamiento te cobrará:</span> <span style="font-weight:700;">${currency(total, b.currency_code || 'EUR')}</span></p>
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
        .set({ filename: `${baseName}.pdf`, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
        .from(el)
        .save();

      document.body.removeChild(el);
    } catch (e) {
      setMsg({ type: 'error', text: 'Error generando la reserva en PDF. Intenta de nuevo.' });
    }
  };

  const startEdit = (b) => {
    setEditing({ ...b });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      ['first_name','email','address','check_in_date','check_out_date','hotel_name','room_type','location','phone','room_value','rooms_count','guests_count','currency_code'].forEach((k) => {
        if (editing[k] !== undefined && editing[k] !== null) fd.append(k, editing[k]);
      });
      if (editing.room_type !== undefined && editing.room_type !== null) {
        fd.set('room_type', normalizeRoomType(editing.room_type));
      }
      if (editing.first_image instanceof File) fd.append('first_image', editing.first_image);
      if (editing.second_image instanceof File) fd.append('second_image', editing.second_image);
      const res = await fetch(`${apiBase}/api/bookings/${editing.id}/`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractServerError(data) || 'No se pudo actualizar');
      setMsg({ type: 'success', text: 'Reserva actualizada' });
      setEditing(null);
      loadBookings();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async (id) => {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/bookings/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
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

  const removeBooking = async (id) => {
    return performDelete(id);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / (pageSize || 1))), [total, pageSize]);

  const generateReceiptPdf = async () => {
    if (!receiptBooking) return;
    try {
      await downloadReceipt(receiptBooking);
    } catch (e) {
      setMsg({ type: 'error', text: `Error generando PDF: ${e.message}` });
    }
  };

  const handleSendEmail = async (b) => {
    try {
      setMsg({ type: 'info', text: `Generando PDFs y enviando a ${b.email}...` });
      const { blob: receiptBlob, filename: receiptName } = await createReceiptPdfBlob(b);
      const { blob: bookingBlob, filename: bookingName } = await createBookingPdfBlob(b);
      const fd = new FormData();
      fd.append('receipt_pdf', receiptBlob, receiptName);
      fd.append('reservation_pdf', bookingBlob, bookingName);
      const res = await fetch(`${apiBase}/api/bookings/${b.id}/send-receipt/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al enviar el correo');
      setMsg({ type: 'success', text: 'Se envió el correo correctamente con la reserva y el recibo.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
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
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => startEdit(b)} className="px-2 py-1 text-xs rounded btn-brand">Editar</motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => downloadReceipt(b)} className="px-2 py-1 text-xs rounded bg-theme-accent text-white">Recibo</motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => downloadBookingPdf(b)} className="px-2 py-1 text-xs rounded bg-theme-primary text-white">Reserva</motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleSendEmail(b)} className="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white">Email</motion.button>
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
        {editing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-surface border border-theme-border rounded-xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="text-theme-text font-bold text-xl mb-1">Editar reserva</div>
              <div className="text-theme-textSecondary text-sm mb-6 pb-4 border-b border-theme-border">
                {editing.first_name} - <span className="font-medium text-theme-primary">{editing.hotel_name}</span>
              </div>
              <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Primer nombre</label>
                  <input type="text" value={editing.first_name || ''} onChange={(e) => setEditing((x) => ({ ...x, first_name: e.target.value }))} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Correo</label>
                  <input type="email" value={editing.email || ''} onChange={(e) => setEditing((x) => ({ ...x, email: e.target.value }))} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Dirección</label>
                  <input type="text" value={editing.address || ''} onChange={(e) => setEditing((x) => ({ ...x, address: e.target.value }))} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Check-in</label>
                  <div className="relative">
                    <input type="date" value={editing.check_in_date || ''} onChange={(e) => setEditing((x) => ({ ...x, check_in_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Check-out</label>
                  <div className="relative">
                    <input type="date" value={editing.check_out_date || ''} onChange={(e) => setEditing((x) => ({ ...x, check_out_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Hotel</label>
                  <input type="text" value={editing.hotel_name || ''} onChange={(e) => setEditing((x) => ({ ...x, hotel_name: e.target.value }))} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Tipo de habitación</label>
                  <input
                    type="text"
                    value={editing.room_type || ''}
                    onChange={(e) => setEditing((x) => ({ ...x, room_type: e.target.value }))}
                    placeholder="Ej: individual, doble, triple, suite"
                    className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Ubicación</label>
                  <input type="text" value={editing.location || ''} onChange={(e) => setEditing((x) => ({ ...x, location: e.target.value }))} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Teléfono</label>
                  <input type="text" value={editing.phone || ''} onChange={(e) => setEditing((x) => ({ ...x, phone: e.target.value }))} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Valor habitación</label>
                  <input type="number" value={editing.room_value || ''} onChange={(e) => setEditing((x) => ({ ...x, room_value: e.target.value }))} min={0} step="0.01" className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Habitaciones</label>
                  <input type="number" value={editing.rooms_count || 1} onChange={(e) => setEditing((x) => ({ ...x, rooms_count: e.target.value }))} min={1} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Huéspedes</label>
                  <input type="number" value={editing.guests_count || 1} onChange={(e) => setEditing((x) => ({ ...x, guests_count: e.target.value }))} min={1} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Moneda</label>
                  <select value={editing.currency_code || 'EUR'} onChange={(e) => setEditing((x) => ({ ...x, currency_code: e.target.value }))} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="COP">COP ($)</option>
                    <option value="MXN">MXN ($)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Imagen huésped</label>
                  <input type="file" onChange={(e) => setEditing((x) => ({ ...x, first_image: e.target.files?.[0] || null }))} accept="image/*" className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide">Imagen hotel</label>
                  <input type="file" onChange={(e) => setEditing((x) => ({ ...x, second_image: e.target.files?.[0] || null }))} accept="image/*" className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border" />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-end gap-3 mt-4 pt-4 border-t border-theme-border">
                  <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-theme-background/30 text-theme-text hover:bg-theme-background/50 transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2 rounded-lg btn-brand shadow-lg shadow-theme-primary/20">Guardar cambios</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
};

export default Bookings;
