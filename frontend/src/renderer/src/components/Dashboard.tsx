import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Bookings from './Bookings';
import BookingCreate from './BookingCreate';
import BookingEdit from './BookingEdit';
import logoBlanco from '../logo.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const Icon = ({ name, className = 'w-5 h-5' }) => {
  if (name === 'dashboard') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 11c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm-8 0c2.209 0 4-1.791 4-4S10.209 3 8 3 4 4.791 4 7s1.791 4 4 4zm0 2c-3.866 0-7 3.134-7 7h6c0-1.657 1.343-3 3-3h2c1.657 0 3 1.343 3 3h6c0-3.866-3.134-7-7-7H8zm8 0c4.418 0 8 3.582 8 8h-4c0-2.209-1.791-4-4-4h-2.5" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'bookings') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 4h10a2 2 0 012 2v2h1a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1h1V6a2 2 0 012-2zm0 4h10V6H7v2zm0 3a1 1 0 100 2h3a1 1 0 100-2H7zm0 4a1 1 0 100 2h7a1 1 0 100-2H7z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'plane') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 16l6-2 3 3 1-1-2-4 8-3a2 2 0 10-1.5-3.7L9 8 5 6 4 7l3 4-5 2v3l3-1 2 3h3l-2-3 3-1-2-2-4 1-3 1v-2z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'logout') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-13H9a2 2 0 00-2 2v4h2V4h10v16H9v-2H7v4a2 2 0 002 2h10a2 2 0 002-2V2a2 2 0 00-2-2z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'menu') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" />
      </svg>
    );
  }
  if (name === 'money') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'ticket') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8h18v8H3V8z" stroke="currentColor" strokeWidth="2" />
        <path d="M6 8v8M18 8v8" stroke="currentColor" strokeWidth="2" />
        <path d="M10 10h4M10 14h4" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'map') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'cancel') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'trend') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" />
        <path d="M21 7v6h-6" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return null;
};

const Topbar = ({ view, setView, role, onSignOut, mobileOpen, setMobileOpen }) => {
  const handleMinimize = () => window.electron.ipcRenderer.send('window-minimize');
  const handleMaximize = () => window.electron.ipcRenderer.send('window-maximize');
  const handleClose = () => window.electron.ipcRenderer.send('window-close');

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <header className="w-full sticky top-0 z-50 bg-theme-surface/80 backdrop-blur-md border-b border-theme-border mobile-touch safe-area-top title-bar-drag">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 h-full no-drag">
            <button
              className="md:hidden p-2 rounded text-theme-text hover:bg-theme-background/30"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" className="w-6 h-6" />
            </button>
            <img src={logoBlanco} alt="GlobeTrek" className="h-12 w-auto object-contain" />
          </div>
          
          <div className="flex items-center gap-4 h-full no-drag">
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 py-2 rounded text-sm transition ${view === 'dashboard' ? 'bg-theme-background/40 text-theme-text' : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/20'}`}
              >
                Inicio
              </button>
              <button
                onClick={() => setView('bookings')}
                disabled={!(role === 'admin' || role === 'super_admin' || role === 'employee')}
                className={`px-3 py-2 rounded text-sm transition ${view === 'bookings' ? 'bg-theme-background/40 text-theme-text' : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/20'}`}
              >
                Reservas
              </button>
              <button
                onClick={() => setView('users')}
                disabled={role !== 'admin' && role !== 'super_admin'}
                className={`px-3 py-2 rounded text-sm transition ${view === 'users' ? 'bg-theme-background/40 text-theme-text' : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/20'}`}
              >
                Usuarios
              </button>
              <button
                onClick={onSignOut}
                className="ml-3 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Cerrar sesión
              </button>
            </nav>
            
            <div className="md:hidden text-xs text-theme-textSecondary mr-2">Rol: <span className="font-medium">{role}</span></div>

            {/* Window Controls */}
            <div className="flex items-center h-8 ml-2 border-l border-theme-border pl-2">
              <button onClick={handleMinimize} className="p-2 text-theme-textSecondary hover:text-theme-text transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </button>
              <button onClick={handleMaximize} className="p-2 text-theme-textSecondary hover:text-theme-text transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3C1.22386 3 1 3.22386 1 3.5V11.5C1 11.7761 1.22386 12 1.5 12H13.5C13.7761 12 14 11.7761 14 11.5V3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM0 3.5C0 2.67157 0.671573 2 1.5 2H13.5C14.3284 2 15 2.67157 15 3.5V11.5C15 12.3284 14.3284 13 13.5 13H1.5C0.671573 13 0 12.3284 0 11.5V3.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </button>
              <button onClick={handleClose} className="p-2 text-theme-textSecondary hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </button>
            </div>
          </div>
        </div>
        <div className={`md:hidden ${mobileOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300`}>
          <div className="bg-theme-surface border-t border-theme-border no-drag">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => { setView('dashboard'); setMobileOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded ${view === 'dashboard' ? 'bg-theme-background/30 text-theme-text' : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/20'}`}
              >
                Inicio
              </button>
              <button
                onClick={() => { setView('bookings'); setMobileOpen(false); }}
                disabled={!(role === 'admin' || role === 'super_admin' || role === 'employee')}
                className={`w-full text-left px-3 py-2 rounded ${view === 'bookings' ? 'bg-theme-background/30 text-theme-text' : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/20'}`}
              >
                Reservas
              </button>
              <button
                onClick={() => { setView('users'); setMobileOpen(false); }}
                disabled={role !== 'admin' && role !== 'super_admin'}
                className={`w-full text-left px-3 py-2 rounded ${view === 'users' ? 'bg-theme-background/30 text-theme-text' : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-background/20'}`}
              >
                Usuarios
              </button>
              <button
                onClick={() => { onSignOut(); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

const KPI = ({ label, value, delta, positive }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    className="bg-theme-surface border border-theme-border rounded-lg p-4 transition-colors duration-300"
  >
    <div className="text-xs text-theme-textSecondary">{label}</div>
    <div className="text-2xl font-semibold text-theme-text mt-1">{value}</div>
    {typeof delta !== 'undefined' && (
      <div className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>{positive ? '▲' : '▼'} {delta}%</div>
    )}
  </motion.div>
);

const SimpleLineChart = ({ data }) => {
  const points = useMemo(() => {
    const w = 300, h = 100, max = Math.max(...data), min = Math.min(...data);
    const xStep = w / (data.length - 1);
    return data
      .map((d, i) => {
        const x = i * xStep;
        const y = h - ((d - min) / (max - min || 1)) * h;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data]);
  
  return (
    <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
      <motion.polyline 
        points={points} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        className="text-theme-accent"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
};

const SimpleBarChart = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <motion.div 
          key={i} 
          className="w-6 bg-theme-primary rounded-t-sm" 
          initial={{ height: 0 }}
          animate={{ height: `${(d / (max || 1)) * 100}%` }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: "backOut" }}
        />
      ))}
    </div>
  );
};

const Sparkline = ({ data, colorClass = 'text-theme-accent' }) => {
  const path = useMemo(() => {
    const w = 120, h = 36, max = Math.max(...data), min = Math.min(...data);
    const xStep = w / (data.length - 1);
    const pts = data.map((d, i) => {
      const x = i * xStep;
      const y = h - ((d - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    }).join(' ');
    return pts;
  }, [data]);
  return (
    <svg viewBox="0 0 120 36" className={`w-full h-9 ${colorClass} overflow-visible`}>
      <motion.polyline 
        points={path} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
    </svg>
  );
};

const RichKPI = ({ icon, label, value, delta, positive, series }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    className="bg-theme-surface border border-theme-border rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150 origin-top-right">
      <Icon name={icon} className="w-16 h-16 text-theme-accent" />
    </div>
    
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-theme-background/40 text-theme-text flex items-center justify-center shadow-sm">
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div className="text-xs text-theme-textSecondary font-medium">{label}</div>
      </div>
      {typeof delta !== 'undefined' && (
        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {positive ? '▲' : '▼'} {delta}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-theme-text relative z-10 tracking-tight">{value}</div>
    {Array.isArray(series) && series.length > 1 && (
      <div className="relative z-10 mt-2">
        <Sparkline data={series} />
      </div>
    )}
  </motion.div>
);

const ChartsPanel = ({ seriesA, seriesB }) => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
  >
    <motion.div 
      variants={itemVariants}
      className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-theme-text">Tendencia de reservas</div>
        <select className="bg-theme-background/50 border border-theme-border text-xs rounded px-2 py-1 text-theme-textSecondary outline-none focus:border-theme-accent">
          <option>Últimos 7 días</option>
          <option>Este mes</option>
        </select>
      </div>
      <SimpleLineChart data={seriesA} />
    </motion.div>
    <motion.div 
      variants={itemVariants}
      className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-theme-text">Reservas por región</div>
        <button className="text-xs text-theme-accent hover:underline">Ver detalle</button>
      </div>
      <SimpleBarChart data={seriesB} />
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {['Europa','América','Asia','África','Oceanía','Local'].slice(0, Math.max(seriesB.length, 0)).map((r, i) => (
          <motion.span 
            key={i} 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + (i * 0.05) }}
            className="px-2 py-1 rounded-md bg-theme-background/50 text-theme-textSecondary border border-theme-border/50"
          >
            {r}
          </motion.span>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

const StatsPanel = ({ stats, seriesA }) => {
  const bookings = Number(stats.bookings || 0);
  const receipts = Number(stats.receipts || 0);
  const avgTicket = bookings > 0 ? Math.round((receipts / bookings) * 100) / 100 : 0;
  const deltaBookings = seriesA.length > 1 ? Math.round(((seriesA[seriesA.length - 1] - seriesA[seriesA.length - 2]) / (seriesA[seriesA.length - 2] || 1)) * 100) : 0;
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <RichKPI icon="ticket" label="Reservas totales" value={bookings} delta={Math.abs(deltaBookings)} positive={deltaBookings >= 0} series={seriesA} />
      <RichKPI icon="money" label="Ingresos estimados" value={`$ ${receipts.toLocaleString()}`} series={seriesA} />
      <RichKPI icon="trend" label="Ticket promedio" value={avgTicket ? `$ ${avgTicket.toLocaleString()}` : 'N/D'} />
      <RichKPI icon="map" label="Regiones activas" value={Math.max(seriesA.length, 1)} />
      <RichKPI icon="cancel" label="Cancelaciones" value="N/D" />
      <RichKPI icon="users" label="Empleados activos" value={Number(stats.employees || 0)} />
    </motion.div>
  );
};

const UsersManager = ({ token, apiBase, role }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', department: '', position: '', password: '' });
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const authHeaders = (tkn) => ({ 'Content-Type': 'application/json', ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}) });

  const loadEmployees = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/users/api/users/`, { headers: authHeaders(token) });
      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) throw new Error((data && (data.detail || data.message)) || 'No se pudieron cargar usuarios');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setEmployees(list);
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token && (role === 'admin' || role === 'super_admin')) loadEmployees(); }, [token, role]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createEmployee = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/users/api/users/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo crear el usuario');
      setMsg({ type: 'success', text: `Empleado ${data.username} creado` });
      setForm({ username: '', password: '', first_name: '', last_name: '', email: '', department: '', position: '' });
      loadEmployees();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const removeEmployee = async (id) => {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/users/api/users/${id}/`, { method: 'DELETE', headers: authHeaders(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'No se pudo eliminar');
      setMsg({ type: 'success', text: 'Empleado eliminado' });
      loadEmployees();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const startEdit = (emp) => {
    setMsg(null);
    setEditing(emp);
    setEditForm({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      email: emp.email || '',
      department: emp.department || '',
      position: emp.position || '',
      password: ''
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/users/api/users/${editing.id}/`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'No se pudo actualizar');
      setMsg({ type: 'success', text: 'Empleado actualizado' });
      setEditing(null);
      loadEmployees();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  if (role !== 'admin' && role !== 'super_admin') {
    return null;
  }

  const fieldLabels = {
    username: 'Usuario',
    password: 'Contraseña',
    first_name: 'Nombre',
    last_name: 'Apellidos',
    email: 'Correo electrónico',
    department: 'Departamento',
    position: 'Cargo'
  };

  const filteredEmployees = Array.isArray(employees)
    ? employees
        .filter((e) => {
          const t = query.trim().toLowerCase();
          if (!t) return true;
          return (
            String(e.username || '').toLowerCase().includes(t) ||
            String(e.email || '').toLowerCase().includes(t) ||
            String(e.first_name || '').toLowerCase().includes(t) ||
            String(e.last_name || '').toLowerCase().includes(t) ||
            String(e.department || '').toLowerCase().includes(t) ||
            String(e.position || '').toLowerCase().includes(t)
          );
        })
        .sort((a, b) => String(a.username || '').localeCompare(String(b.username || '')))
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <AnimatePresence>
        {msg && !msg.text.includes('Solo administradores pueden gestionar usuarios') && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={itemVariants}
        className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-theme-text font-semibold text-lg">Crear nuevo empleado</div>
            <div className="text-theme-textSecondary text-sm mt-1">Añade un usuario con datos básicos para que pueda acceder al sistema</div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreateOpen(true)} 
              className="px-4 py-2 rounded btn-brand font-medium shadow-lg shadow-theme-primary/20"
            >
              Nuevo empleado
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadEmployees} 
              className="px-3 py-2 rounded text-xs bg-theme-background/30 text-theme-text hover:bg-theme-background/40 border border-theme-border"
            >
              Recargar
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-theme-text font-semibold text-lg">Empleados</div>
            <div className="text-theme-textSecondary text-sm mt-1">Gestiona y edita usuarios existentes</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon name="users" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary w-4 h-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, usuario..."
                className="pl-9 pr-4 py-2 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 w-64 transition-all"
              />
            </div>
          </div>
        </div>
        <motion.ul layout className="space-y-3">
          <AnimatePresence>
            {filteredEmployees.map((emp) => (
              <motion.li 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.01, backgroundColor: "rgba(var(--color-surface-rgb), 0.8)" }}
                key={emp.id} 
                className="flex items-center justify-between bg-theme-background/20 border border-theme-border rounded-lg p-4 text-sm text-theme-text hover:shadow-md transition-all duration-200"
              >
                <span className="flex-1 flex items-center gap-4">
                  <div className="relative">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-theme-primary to-theme-accent text-white font-bold shadow-lg shadow-theme-primary/20">
                      {String(emp.username || '?').slice(0,1).toUpperCase()}
                    </span>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-theme-surface rounded-full"></div>
                  </div>
                  <span className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{emp.username}</span>
                      {(emp.department || emp.position) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-theme-background/40 text-theme-textSecondary border border-theme-border/50">
                          {emp.department || 'General'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-theme-textSecondary">{emp.first_name} {emp.last_name}</span>
                      <span className="text-theme-textMuted text-xs">•</span>
                      <span className="text-theme-textMuted text-xs">{emp.email}</span>
                    </div>
                  </span>
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => startEdit(emp)} className="px-3 py-1.5 text-xs rounded-md btn-brand">Editar</motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeEmployee(emp.id)} className="px-3 py-1.5 text-xs rounded-md bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20">Eliminar</motion.button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {Array.isArray(employees) && employees.length === 0 && (
            <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-theme-textSecondary text-sm flex items-center gap-2 p-8 justify-center flex-col border-2 border-dashed border-theme-border rounded-lg">
              <Icon name="users" className="w-8 h-8 opacity-50 mb-2" />
              <span>No hay empleados registrados.</span>
            </motion.li>
          )}
          {Array.isArray(employees) && employees.length > 0 && filteredEmployees.length === 0 && (
            <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-theme-textSecondary text-sm p-8 text-center">
              No hay resultados para “{query}”.
            </motion.li>
          )}
        </motion.ul>
      </motion.div>
      <AnimatePresence>
        {createOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-theme-surface border border-theme-border rounded-xl p-6 w-full max-w-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-theme-border pb-4">
                <div>
                  <div className="text-theme-text font-bold text-xl">Nuevo empleado</div>
                  <div className="text-theme-textSecondary text-sm mt-1">Completa los datos para crear el usuario</div>
                </div>
                <button onClick={() => setCreateOpen(false)} className="p-2 rounded-full hover:bg-theme-background/50 transition-colors">
                  <Icon name="cancel" className="w-6 h-6 text-theme-textSecondary" />
                </button>
              </div>
              <form onSubmit={createEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['username','password','first_name','last_name','email','department','position'].map((field) => (
                  <div key={field} className={`flex flex-col gap-1.5 ${field === 'email' ? 'md:col-span-2' : ''}`}>
                    <label htmlFor={`create_${field}`} className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide ml-1">{fieldLabels[field] || field}</label>
                    <input
                      id={`create_${field}`}
                      type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      required={field === 'username' || field === 'password'}
                      className="px-4 py-2.5 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent/50 transition-all placeholder-theme-textMuted/50"
                      placeholder={`Ingresa ${fieldLabels[field] || field}`}
                    />
                  </div>
                ))}
                <div className="md:col-span-2 flex items-center justify-end gap-3 mt-4 pt-4 border-t border-theme-border">
                  <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg bg-theme-background/30 text-theme-text hover:bg-theme-background/50 transition-colors">Cancelar</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg btn-brand disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-theme-primary/20">
                    {loading ? 'Creando...' : 'Crear empleado'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
              className="bg-theme-surface border border-theme-border rounded-xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="text-theme-text font-bold text-xl mb-1">Editar empleado</div>
              <div className="text-theme-textSecondary text-sm mb-6 pb-4 border-b border-theme-border">Editando a <span className="font-semibold text-theme-primary">{editing.username}</span></div>
              <form onSubmit={submitEdit} className="grid grid-cols-1 gap-4">
                {['first_name','last_name','email','department','position','password'].map((field) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label htmlFor={`edit_${field}`} className="text-xs font-medium text-theme-textSecondary uppercase tracking-wide ml-1">{fieldLabels[field] || field}</label>
                    <input
                      id={`edit_${field}`}
                      type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={editForm[field]}
                      onChange={handleEditChange}
                      className="px-4 py-2.5 rounded-lg bg-theme-background/30 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent/50 transition-all"
                      placeholder={field === 'password' ? 'Nueva contraseña (opcional)' : fieldLabels[field] || field}
                    />
                  </div>
                ))}
                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-theme-border">
                  <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-theme-background/30 text-theme-text hover:bg-theme-background/50 transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2 rounded-lg btn-brand shadow-lg shadow-theme-primary/20">Guardar cambios</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DashboardView = ({ stats, seriesA, seriesB }) => (
  <div className="space-y-4">
    <StatsPanel stats={stats} seriesA={seriesA} />
    <ChartsPanel seriesA={seriesA} seriesB={seriesB} />
    <div className="bg-theme-surface border border-theme-border rounded-lg p-4">
      <div className="text-sm text-theme-text">Resumen</div>
      <p className="text-theme-textSecondary text-sm mt-2">Este panel presenta una vista general del sistema con métricas clave y gráficos rápidos para decisiones informadas.</p>
    </div>
  </div>
);

const Dashboard = ({ token, role, onSignOut }) => {
  const apiBase = 'http://127.0.0.1:8000';
  const [view, setView] = useState('dashboard');
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [stats, setStats] = useState({ bookings: 0, receipts: 0, employees: 0, admins: 0 });
  const [seriesA, setSeriesA] = useState([3, 5, 4, 6, 8, 7, 9]);
  const [seriesB, setSeriesB] = useState([5, 3, 6, 2, 4, 7]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chartsVisible, setChartsVisible] = useState(false);

  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    fetch(`${apiBase}/users/api/stats/`, { headers })
      .then(async (res) => {
        let data;
        try { data = await res.json(); } catch { data = null; }
        return { ok: res.ok, data };
      })
      .then(({ ok, data }) => {
        if (ok && data) {
          setStats({
            bookings: Number(data.total_bookings || 0),
            receipts: Number(data.total_receipts || data.total_bookings || 0),
            employees: Number(data.total_employees || 0),
            admins: Number(data.total_admins || 0),
          });
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    let startX = 0;
    let currentX = 0;
    let startY = 0;
    const onStart = (e) => {
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX;
      startY = t.clientY;
      currentX = startX;
    };
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      currentX = t.clientX;
    };
    const onEnd = () => {
      const dx = currentX - startX;
      const dy = Math.abs((currentX - startX) - (startY - startY));
      if (!mobileOpen && startX < 24 && dx > 50 && Math.abs(dy) < 30) setMobileOpen(true);
      if (mobileOpen && dx < -50) setMobileOpen(false);
      startX = 0; currentX = 0; startY = 0;
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const section = document.querySelector('[data-charts-section]');
    if (!section) { setChartsVisible(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setChartsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [view]);

  return (
    <div className="min-h-screen bg-theme-background">
      <Topbar view={view} setView={setView} role={role} onSignOut={onSignOut} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6 mobile-touch mobile-smooth-scroll mobile-text-adjust safe-area-bottom">
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-6 bg-gradient-to-r from-theme-surface/80 to-theme-surface/40 backdrop-blur-md border border-theme-border flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm"
        >
          <div className="text-theme-text">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-theme-text to-theme-textSecondary"
            >
              Bienvenido a GlobeTrek
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-theme-textSecondary mt-1"
            >
              Organiza reservas, usuarios y más desde una interfaz limpia y agradable.
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('bookings')} 
              className="px-4 py-2 rounded btn-brand shadow-lg shadow-theme-primary/20"
            >
              Ver reservas
            </motion.button>
            {(role === 'admin' || role === 'super_admin') && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('users')} 
                className="px-4 py-2 rounded bg-theme-background/30 text-theme-text hover:bg-theme-background/40 border border-theme-border"
              >
                Gestionar usuarios
              </motion.button>
            )}
          </div>
        </motion.section>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              data-charts-section
            >
              <StatsPanel stats={stats} seriesA={seriesA} />
              {chartsVisible && <div className="mt-6"><ChartsPanel seriesA={seriesA} seriesB={seriesB} /></div>}
            </motion.div>
          )}
          {view === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UsersManager token={token} apiBase={apiBase} role={role} />
            </motion.div>
          )}
          {view === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Bookings 
                token={token} 
                apiBase={apiBase} 
                role={role} 
                setView={setView} 
                onEdit={(b) => {
                  setBookingToEdit(b);
                  setView('booking_edit');
                }}
              />
            </motion.div>
          )}
          {view === 'booking_create' && (
            <motion.div
              key="booking_create"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <BookingCreate token={token} apiBase={apiBase} role={role} setView={setView} />
            </motion.div>
          )}
          {view === 'booking_edit' && (
            <motion.div
              key="booking_edit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <BookingEdit token={token} apiBase={apiBase} role={role} setView={setView} booking={bookingToEdit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
