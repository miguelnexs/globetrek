import React, { useEffect, useState } from 'react';

const BookingCreate = ({ token, apiBase, role, setView }) => {
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstPreview, setFirstPreview] = useState(null);
  const [secondPreview, setSecondPreview] = useState(null);
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
    currency_code: 'EUR',
  });

  const authHeaders = (tkn) => ({ Authorization: `Bearer ${tkn}` });
  const canCreate = role === 'admin' || role === 'super_admin' || role === 'employee';

  const normalizeRoomType = (val) => {
    const s = (val || '').toString().trim().toLowerCase();
    if (['single','individual','simple','sencilla','indiv'].includes(s)) return 'single';
    if (['double','doble','duo','2','two'].includes(s)) return 'double';
    if (['suite','suíte'].includes(s)) return 'suite';
    return s;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
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
  const handleFileDrop = (name, file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) { setMsg({ type: 'error', text: 'Archivo no válido: debe ser una imagen.' }); return; }
    setForm((f) => ({ ...f, [name]: file }));
    const url = URL.createObjectURL(file);
    if (name === 'first_image') { if (firstPreview) URL.revokeObjectURL(firstPreview); setFirstPreview(url); }
    if (name === 'second_image') { if (secondPreview) URL.revokeObjectURL(secondPreview); setSecondPreview(url); }
  };
  const removeImage = (name) => {
    setForm((f) => ({ ...f, [name]: null }));
    if (name === 'first_image') { if (firstPreview) URL.revokeObjectURL(firstPreview); setFirstPreview(null); }
    if (name === 'second_image') { if (secondPreview) URL.revokeObjectURL(secondPreview); setSecondPreview(null); }
  };

  const validateForm = () => {
    const required = ['first_name','email','address','check_in_date','check_out_date','hotel_name','room_type','location','phone','room_value','rooms_count','guests_count','currency_code'];
    for (const k of required) { if (!form[k]) return `${k.replace('_',' ')} es requerido`; }
    if (!/^\+?\d{7,15}$/.test(form.phone)) return 'Teléfono inválido';
    const inDate = new Date(form.check_in_date); const outDate = new Date(form.check_out_date);
    if (inDate.toString() === 'Invalid Date' || outDate.toString() === 'Invalid Date') return 'Fechas inválidas';
    if (outDate < inDate) return 'Check-out debe ser posterior al check-in';
    const rt = normalizeRoomType(form.room_type);
    if (!['single','double','suite'].includes(rt)) return 'Tipo de habitación inválido: use individual, doble o suite';
    return null;
  };

  const extractServerError = (data) => {
    if (!data) return null;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length) { const k = keys[0]; const v = data[k]; if (Array.isArray(v) && v.length) return `${k}: ${v[0]}`; if (typeof v === 'string') return `${k}: ${v}`; }
    }
    return null;
  };

  const createBooking = async (e) => {
    e.preventDefault();
    if (!canCreate) { setMsg({ type: 'error', text: 'No tienes permisos para crear reservas.' }); return; }
    const err = validateForm(); if (err) { setMsg({ type: 'error', text: err }); return; }
    setLoading(true); setMsg(null);
    try {
      const fd = new FormData(); Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      fd.set('room_type', normalizeRoomType(form.room_type));
      const res = await fetch(`${apiBase}/users/api/bookings/`, { method: 'POST', headers: authHeaders(token), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(extractServerError(data) || 'No se pudo crear la reserva');
      const emailMsg = data.email_sent ? ' Se envio el correo correctamente.' : '';
      setMsg({ type: 'success', text: `Reserva creada: ${data.first_name} - ${data.hotel_name}.${emailMsg}` });
      setTimeout(() => setView('bookings'), 800);
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => () => { if (firstPreview) URL.revokeObjectURL(firstPreview); if (secondPreview) URL.revokeObjectURL(secondPreview); }, [firstPreview, secondPreview]);

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="text-theme-text font-semibold text-lg">Nueva reserva</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setView('bookings')} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-theme-text">Volver</button>
        </div>
      </div>
      {msg && (
        <div className={`mb-4 p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>{msg.text}</div>
      )}
      <form onSubmit={createBooking} className="space-y-6">
          <div>
            <div className="text-theme-textSecondary text-sm mb-2">Datos del huésped</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Primer nombre</label>
                <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="Primer nombre" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Correo electrónico</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="correo@ejemplo.com" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Dirección</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="Calle y número" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Teléfono</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="+123456789" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Check-in</label>
                <input type="date" name="check_in_date" value={form.check_in_date} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Check-out</label>
                <input type="date" name="check_out_date" value={form.check_out_date} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-theme-textSecondary text-sm mb-2">Datos del hotel</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Nombre del hotel</label>
                <input type="text" name="hotel_name" value={form.hotel_name} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="Nombre del hotel" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Tipo de habitación</label>
                <input type="text" name="room_type" value={form.room_type} onChange={handleChange} className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="Ej: individual, doble, suite" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Ubicación</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} required className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="Ciudad, país" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-theme-textSecondary text-sm mb-2">Detalles de la reserva</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Valor de la habitación</label>
                <input type="number" name="room_value" value={form.room_value} onChange={handleChange} required min={0} step="0.01" className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="0.00" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Cantidad de habitaciones</label>
                <input type="number" name="rooms_count" value={form.rooms_count} onChange={handleChange} required min={1} className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="1" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Cantidad de huéspedes</label>
                <input type="number" name="guests_count" value={form.guests_count} onChange={handleChange} required min={1} className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border" placeholder="1" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Moneda</label>
                <select name="currency_code" value={form.currency_code} onChange={handleChange} className="px-3 py-2 rounded bg-theme-surface text-theme-text border border-theme-border">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="COP">COP ($)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="text-theme-textSecondary text-sm mb-2">Imágenes</div>
            <input id="first_image_input" type="file" name="first_image" onChange={handleFileChange} accept="image/*" className="hidden" />
            <input id="second_image_input" type="file" name="second_image" onChange={handleFileChange} accept="image/*" className="hidden" />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Imagen del huésped</label>
                <div
                  onClick={() => { const el = document.getElementById('first_image_input'); if (el) el.click(); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) handleFileDrop('first_image', f); }}
                  className="group relative flex items-center justify-center rounded border-2 border-dashed border-theme-border bg-theme-surface h-24 cursor-pointer"
                >
                  {!firstPreview && (
                    <div className="text-theme-textSecondary text-sm flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7l2-3h10l2 3M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7"/></svg>
                      <span>Subir imagen huésped</span>
                    </div>
                  )}
                  {firstPreview && (
                    <>
                      <img src={firstPreview} alt="Vista previa huésped" className="absolute inset-0 w-full h-full object-cover rounded" />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); const el = document.getElementById('first_image_input'); if (el) el.click(); }} className="px-2 py-1 text-xs rounded bg-gray-900/70 hover:bg-gray-900 text-white">Cambiar</button>
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); removeImage('first_image'); }} className="px-2 py-1 text-xs rounded bg-red-600/80 hover:bg-red-700 text-white">Quitar</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-theme-textSecondary text-sm">Imagen del hotel</label>
                <div
                  onClick={() => { const el = document.getElementById('second_image_input'); if (el) el.click(); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) handleFileDrop('second_image', f); }}
                  className="group relative flex items-center justify-center rounded border-2 border-dashed border-theme-border bg-theme-surface h-24 cursor-pointer"
                >
                  {!secondPreview && (
                    <div className="text-theme-textSecondary text-sm flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7l2-3h10l2 3M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7"/></svg>
                      <span>Subir imagen hotel</span>
                    </div>
                  )}
                  {secondPreview && (
                    <>
                      <img src={secondPreview} alt="Vista previa hotel" className="absolute inset-0 w-full h-full object-cover rounded" />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); const el = document.getElementById('second_image_input'); if (el) el.click(); }} className="px-2 py-1 text-xs rounded bg-gray-900/70 hover:bg-gray-900 text-white">Cambiar</button>
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); removeImage('second_image'); }} className="px-2 py-1 text-xs rounded bg-red-600/80 hover:bg-red-700 text-white">Quitar</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setView('bookings')} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-theme-text">Cancelar</button>
            <button type="submit" disabled={loading || !canCreate} className="px-3 py-2 rounded btn-brand disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
      </form>
    </div>
  );
};

export default BookingCreate;
