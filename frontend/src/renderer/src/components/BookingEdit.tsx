import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingEdit = ({ token, apiBase, role, setView, booking }) => {
  const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith('blob:') || img.startsWith('data:') || img.startsWith('http')) return img;
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    const path = img.startsWith('/') ? img : `/${img}`;
    return `${base}${path}`;
  };

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstPreview, setFirstPreview] = useState(resolveImage(booking?.first_image));
  const [secondPreview, setSecondPreview] = useState(resolveImage(booking?.second_image));
  
  const [form, setForm] = useState({
    first_name: booking?.first_name || '',
    email: booking?.email || '',
    address: booking?.address || '',
    check_in_date: booking?.check_in_date || '',
    check_out_date: booking?.check_out_date || '',
    hotel_name: booking?.hotel_name || '',
    room_type: booking?.room_type || 'single',
    location: booking?.location || '',
    phone: booking?.phone || '',
    room_value: booking?.room_value || '',
    rooms_count: booking?.rooms_count || 1,
    guests_count: booking?.guests_count || 1,
    first_image: null, // New file upload
    second_image: null, // New file upload
    currency_code: booking?.currency_code || 'EUR',
  });

  const authHeaders = (tkn) => ({ Authorization: `Bearer ${tkn}` });
  const canEdit = role === 'admin' || role === 'super_admin' || role === 'employee';

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
      if (firstPreview && !booking.first_image) URL.revokeObjectURL(firstPreview);
      setFirstPreview(file ? URL.createObjectURL(file) : booking.first_image);
    }
    if (name === 'second_image') {
      if (secondPreview && !booking.second_image) URL.revokeObjectURL(secondPreview);
      setSecondPreview(file ? URL.createObjectURL(file) : booking.second_image);
    }
  };

  const handleFileDrop = (name, file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) { setMsg({ type: 'error', text: 'Archivo no válido: debe ser una imagen.' }); return; }
    setForm((f) => ({ ...f, [name]: file }));
    const url = URL.createObjectURL(file);
    if (name === 'first_image') { 
        if (firstPreview && !booking.first_image) URL.revokeObjectURL(firstPreview); 
        setFirstPreview(url); 
    }
    if (name === 'second_image') { 
        if (secondPreview && !booking.second_image) URL.revokeObjectURL(secondPreview); 
        setSecondPreview(url); 
    }
  };

  const removeImage = (name) => {
    setForm((f) => ({ ...f, [name]: null })); // If we want to delete existing image, we might need a separate flag or API support. For now, assuming this clears new upload.
    // If user wants to remove EXISTING image, backend needs to handle that. 
    // Assuming for now we just clear the preview if it was a new upload, or set to null if it was existing (implying deletion if backend supports sending null/empty).
    // Let's just reset to initial if it was existing, or clear if new.
    // Actually, usually you send a flag or empty string to clear.
    // Let's keep it simple: if it's a new file, remove it. If it's existing, maybe we can't remove it easily without specific backend logic.
    // For this implementation, I'll assume clearing means "don't upload new file" and restore preview if existing, OR we can hide preview.
    
    // Better behavior:
    if (name === 'first_image') {
        if (form.first_image) {
             // Removing new upload
             if (firstPreview && !booking.first_image) URL.revokeObjectURL(firstPreview);
             setFirstPreview(booking.first_image);
             setForm(f => ({...f, first_image: null}));
        } else {
            // Removing existing?? Let's not support removing existing images for now unless requested, to be safe.
        }
    }
    if (name === 'second_image') {
        if (form.second_image) {
             if (secondPreview && !booking.second_image) URL.revokeObjectURL(secondPreview);
             setSecondPreview(booking.second_image);
             setForm(f => ({...f, second_image: null}));
        }
    }
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

  const updateBooking = async (e) => {
    e.preventDefault();
    if (!canEdit) { setMsg({ type: 'error', text: 'No tienes permisos para editar reservas.' }); return; }
    const err = validateForm(); if (err) { setMsg({ type: 'error', text: err }); return; }
    setLoading(true); setMsg(null);
    try {
      const fd = new FormData(); 
      Object.entries(form).forEach(([k, v]) => { 
          if (v !== null && v !== undefined) {
             // Only append if it's not the file fields (unless they have new files)
             if (k === 'first_image' || k === 'second_image') {
                 if (v instanceof File) fd.append(k, v);
             } else {
                 fd.append(k, v); 
             }
          }
      });
      fd.set('room_type', normalizeRoomType(form.room_type));
      
      const res = await fetch(`${apiBase}/users/api/bookings/${booking.id}/`, { method: 'PATCH', headers: authHeaders(token), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(extractServerError(data) || 'No se pudo actualizar la reserva');
      
      setMsg({ type: 'success', text: `Reserva actualizada: ${data.first_name} - ${data.hotel_name}` });
      setTimeout(() => setView('bookings'), 800);
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => () => { 
      if (firstPreview && firstPreview !== booking.first_image) URL.revokeObjectURL(firstPreview); 
      if (secondPreview && secondPreview !== booking.second_image) URL.revokeObjectURL(secondPreview); 
  }, [firstPreview, secondPreview, booking]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[calc(100vh-120px)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-theme-text font-semibold text-lg">Editar reserva</div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button" 
            onClick={() => setView('bookings')} 
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-theme-text transition-colors"
          >
            Volver
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {msg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-4 p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={updateBooking} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm"
          >
            <div className="text-theme-textSecondary font-medium text-sm mb-4 border-b border-theme-border pb-2">Datos del huésped</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Primer nombre</label>
                <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="Primer nombre" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Correo electrónico</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="correo@ejemplo.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Dirección</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="Calle y número" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Teléfono</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="+123456789" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Check-in</label>
                <input type="date" name="check_in_date" value={form.check_in_date} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Check-out</label>
                <input type="date" name="check_out_date" value={form.check_out_date} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm"
          >
            <div className="text-theme-textSecondary font-medium text-sm mb-4 border-b border-theme-border pb-2">Datos del hotel</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Nombre del hotel</label>
                <input type="text" name="hotel_name" value={form.hotel_name} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="Nombre del hotel" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Tipo de habitación</label>
                <input type="text" name="room_type" value={form.room_type} onChange={handleChange} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="Ej: individual, doble, suite" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Ubicación</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} required className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="Ciudad, país" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm"
          >
            <div className="text-theme-textSecondary font-medium text-sm mb-4 border-b border-theme-border pb-2">Detalles de la reserva</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Valor de la habitación</label>
                <input type="number" name="room_value" value={form.room_value} onChange={handleChange} required min={0} step="0.01" className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="0.00" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Cantidad de habitaciones</label>
                <input type="number" name="rooms_count" value={form.rooms_count} onChange={handleChange} required min={1} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Cantidad de huéspedes</label>
                <input type="number" name="guests_count" value={form.guests_count} onChange={handleChange} required min={1} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition" placeholder="1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Moneda</label>
                <select name="currency_code" value={form.currency_code} onChange={handleChange} className="px-3 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 transition">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="COP">COP ($)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm"
          >
            <div className="text-theme-textSecondary font-medium text-sm mb-4 border-b border-theme-border pb-2">Imágenes</div>
            <input id="first_image_input" type="file" name="first_image" onChange={handleFileChange} accept="image/*" className="hidden" />
            <input id="second_image_input" type="file" name="second_image" onChange={handleFileChange} accept="image/*" className="hidden" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Imagen del huésped</label>
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: 'rgba(var(--color-accent-rgb), 0.5)' }}
                  onClick={() => { const el = document.getElementById('first_image_input'); if (el) el.click(); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) handleFileDrop('first_image', f); }}
                  className="group relative flex items-center justify-center rounded-lg border-2 border-dashed border-theme-border bg-theme-background/30 h-32 cursor-pointer transition-colors"
                >
                  {!firstPreview && (
                    <div className="text-theme-textSecondary text-sm flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7l2-3h10l2 3M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7"/></svg>
                      <span>Subir imagen huésped</span>
                    </div>
                  )}
                  {firstPreview && (
                    <>
                      <img src={firstPreview} alt="Vista previa huésped" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); const el = document.getElementById('first_image_input'); if (el) el.click(); }} className="px-2 py-1 text-xs rounded bg-gray-900/70 hover:bg-gray-900 text-white backdrop-blur-sm">Cambiar</button>
                        {form.first_image && (
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); removeImage('first_image'); }} className="px-2 py-1 text-xs rounded bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-sm">Deshacer</button>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-theme-textSecondary text-xs uppercase tracking-wide font-medium">Imagen del hotel</label>
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: 'rgba(var(--color-accent-rgb), 0.5)' }}
                  onClick={() => { const el = document.getElementById('second_image_input'); if (el) el.click(); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) handleFileDrop('second_image', f); }}
                  className="group relative flex items-center justify-center rounded-lg border-2 border-dashed border-theme-border bg-theme-background/30 h-32 cursor-pointer transition-colors"
                >
                  {!secondPreview && (
                    <div className="text-theme-textSecondary text-sm flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7l2-3h10l2 3M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7"/></svg>
                      <span>Subir imagen hotel</span>
                    </div>
                  )}
                  {secondPreview && (
                    <>
                      <img src={secondPreview} alt="Vista previa hotel" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); const el = document.getElementById('second_image_input'); if (el) el.click(); }} className="px-2 py-1 text-xs rounded bg-gray-900/70 hover:bg-gray-900 text-white backdrop-blur-sm">Cambiar</button>
                        {form.second_image && (
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); removeImage('second_image'); }} className="px-2 py-1 text-xs rounded bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-sm">Deshacer</button>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button" 
              onClick={() => setView('bookings')} 
              className="px-4 py-2 rounded-lg bg-theme-background/50 hover:bg-theme-background/70 text-theme-text transition-colors"
            >
              Cancelar
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={loading || !canEdit} 
              className="px-6 py-2 rounded-lg btn-brand disabled:opacity-50 shadow-lg shadow-theme-primary/20"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </motion.button>
          </div>
      </form>
    </motion.div>
  );
};

export default BookingEdit;
