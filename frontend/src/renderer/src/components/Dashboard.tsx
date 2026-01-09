import React, { useEffect, useMemo, useState } from 'react';
import Bookings from './Bookings';
import BookingCreate from './BookingCreate';
import logoBlanco from '../logo.png';

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

const Topbar = ({ view, setView, role, onSignOut, mobileOpen, setMobileOpen }) => (
  <>
    {mobileOpen && (
      <div
        className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
        onClick={() => setMobileOpen(false)}
      />
    )}
    <header className="w-full sticky top-0 z-50 bg-theme-surface/80 backdrop-blur border-b border-theme-border mobile-touch safe-area-top">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded text-theme-text hover:bg-theme-background/30"
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <img src={logoBlanco} alt="GlobeTrek" className="h-8 w-auto" />
        </div>
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
        <div className="md:hidden text-xs text-theme-textSecondary">Rol: <span className="font-medium">{role}</span></div>
      </div>
      <div className={`md:hidden ${mobileOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300`}>
        <div className="bg-theme-surface border-t border-theme-border">
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

const KPI = ({ label, value, delta, positive }) => (
  <div className="bg-theme-surface border border-theme-border rounded-lg p-4">
    <div className="text-xs text-theme-textSecondary">{label}</div>
    <div className="text-2xl font-semibold text-theme-text mt-1">{value}</div>
    {typeof delta !== 'undefined' && (
      <div className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>{positive ? '▲' : '▼'} {delta}%</div>
    )}
  </div>
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
    <svg viewBox="0 0 300 100" className="w-full h-24">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" className="text-theme-accent" />
    </svg>
  );
};

const SimpleBarChart = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="w-6 bg-theme-primary" style={{ height: `${(d / (max || 1)) * 100}%` }} />
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
    <svg viewBox="0 0 120 36" className={`w-full h-9 ${colorClass}`}>
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

const RichKPI = ({ icon, label, value, delta, positive, series }) => (
  <div className="bg-theme-surface border border-theme-border rounded-lg p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-theme-background/40 text-theme-text flex items-center justify-center">
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div className="text-xs text-theme-textSecondary">{label}</div>
      </div>
      {typeof delta !== 'undefined' && (
        <div className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>{positive ? '▲' : '▼'} {delta}%</div>
      )}
    </div>
    <div className="text-2xl font-semibold text-theme-text">{value}</div>
    {Array.isArray(series) && series.length > 1 && (
      <Sparkline data={series} />
    )}
  </div>
);

const ChartsPanel = ({ seriesA, seriesB }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="bg-theme-surface border border-theme-border rounded-lg p-4">
      <div className="text-sm text-theme-text mb-2">Tendencia de reservas</div>
      <SimpleLineChart data={seriesA} />
    </div>
    <div className="bg-theme-surface border border-theme-border rounded-lg p-4">
      <div className="text-sm text-theme-text mb-2">Reservas por región</div>
      <SimpleBarChart data={seriesB} />
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {['Europa','América','Asia','África','Oceanía','Local'].slice(0, Math.max(seriesB.length, 0)).map((r, i) => (
          <span key={i} className="px-2 py-1 rounded bg-theme-background/30 text-theme-text">{r}</span>
        ))}
      </div>
    </div>
  </div>
);

const StatsPanel = ({ stats, seriesA }) => {
  const bookings = Number(stats.bookings || 0);
  const receipts = Number(stats.receipts || 0);
  const avgTicket = bookings > 0 ? Math.round((receipts / bookings) * 100) / 100 : 0;
  const deltaBookings = seriesA.length > 1 ? Math.round(((seriesA[seriesA.length - 1] - seriesA[seriesA.length - 2]) / (seriesA[seriesA.length - 2] || 1)) * 100) : 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RichKPI icon="ticket" label="Reservas totales" value={bookings} delta={Math.abs(deltaBookings)} positive={deltaBookings >= 0} series={seriesA} />
      <RichKPI icon="money" label="Ingresos estimados" value={`$ ${receipts}`} series={seriesA} />
      <RichKPI icon="trend" label="Ticket promedio" value={avgTicket ? `$ ${avgTicket}` : 'N/D'} />
      <RichKPI icon="map" label="Regiones activas" value={Math.max(seriesA.length, 1)} />
      <RichKPI icon="cancel" label="Cancelaciones" value="N/D" />
      <RichKPI icon="dashboard" label="Empleados" value={Number(stats.employees || 0)} />
    </div>
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
    <div className="space-y-4">
      {msg && !msg.text.includes('Solo administradores pueden gestionar usuarios') && (
        <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}
      <div className="bg-theme-surface border border-theme-border rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-theme-text font-semibold">Crear nuevo empleado</div>
            <div className="text-theme-textSecondary text-sm">Añade un usuario con datos básicos</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCreateOpen(true)} className="px-4 py-2 rounded btn-brand">Nuevo empleado</button>
            <button onClick={loadEmployees} className="px-3 py-2 rounded text-xs bg-theme-background/30 text-theme-text hover:bg-theme-background/40">Recargar</button>
          </div>
        </div>
      </div>
      <div className="bg-theme-surface border border-theme-border rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-theme-text font-semibold">Empleados</div>
            <div className="text-theme-textSecondary text-sm">Gestiona y edita usuarios existentes</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, usuario, email, departamento..."
              className="px-3 py-2 rounded bg-theme-background/20 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40 w-56"
            />
          </div>
        </div>
        <ul className="space-y-2">
          {filteredEmployees.map((emp) => (
            <li key={emp.id} className="flex items-center justify-between bg-theme-background/20 border border-theme-border rounded p-3 text-sm text-theme-text">
              <span className="flex-1 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-theme-background/40 text-theme-text font-medium">
                  {String(emp.username || '?').slice(0,1).toUpperCase()}
                </span>
                <span className="flex-1">
                  <span className="font-medium">{emp.username}</span>
                  <span className="text-theme-textSecondary ml-2">{emp.first_name} {emp.last_name}</span>
                  <span className="text-theme-textMuted ml-2 text-xs">{emp.email}</span>
                  {(emp.department || emp.position) && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-theme-background/30 text-theme-textSecondary">
                      {emp.department || 'Sin depto.'} · {emp.position || 'Sin cargo'}
                    </span>
                  )}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(emp)} className="px-3 py-1 text-xs rounded btn-brand">Editar</button>
                <button onClick={() => removeEmployee(emp.id)} className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Eliminar</button>
              </div>
            </li>
          ))}
          {Array.isArray(employees) && employees.length === 0 && (
            <li className="text-theme-textSecondary text-sm flex items-center gap-2">
              <Icon name="users" className="w-4 h-4" />
              No hay empleados registrados.
            </li>
          )}
          {Array.isArray(employees) && employees.length > 0 && filteredEmployees.length === 0 && (
            <li className="text-theme-textSecondary text-sm">No hay resultados para “{query}”.</li>
          )}
        </ul>
      </div>
      {createOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-theme-surface border border-theme-border rounded p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-theme-text font-semibold">Nuevo empleado</div>
                <div className="text-theme-textSecondary text-sm">Completa los datos para crear el usuario</div>
              </div>
              <button onClick={() => setCreateOpen(false)} className="px-3 py-2 rounded bg-theme-background/30 text-theme-text hover:bg-theme-background/40">Cerrar</button>
            </div>
            <form onSubmit={createEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['username','password','first_name','last_name','email','department','position'].map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <label htmlFor={`create_${field}`} className="text-xs text-theme-textSecondary">{fieldLabels[field] || field}</label>
                  <input
                    id={`create_${field}`}
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required={field === 'username' || field === 'password'}
                    className="px-3 py-2 rounded bg-theme-background/20 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40"
                    placeholder={`Ingresa ${fieldLabels[field] || field}`}
                  />
                </div>
              ))}
              <div className="md:col-span-3 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-3 py-2 rounded bg-theme-background/30 text-theme-text hover:bg-theme-background/40">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded btn-brand disabled:opacity-50">
                  {loading ? 'Creando...' : 'Crear empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-theme-surface border border-theme-border rounded p-4 w-full max-w-lg">
            <div className="text-theme-text font-semibold mb-2">Editar empleado</div>
            <div className="text-theme-textSecondary text-sm mb-4">{editing.username}</div>
            <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['first_name','last_name','email','department','position','password'].map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <label htmlFor={`edit_${field}`} className="text-xs text-theme-textSecondary">{fieldLabels[field] || field}</label>
                  <input
                    id={`edit_${field}`}
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={editForm[field]}
                    onChange={handleEditChange}
                    className="px-3 py-2 rounded bg-theme-background/20 text-theme-text border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/40"
                    placeholder={field === 'password' ? 'Nueva contraseña (opcional)' : fieldLabels[field] || field}
                  />
                </div>
              ))}
              <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 rounded bg-theme-background/30 text-theme-text hover:bg-theme-background/40">Cancelar</button>
                <button type="submit" className="px-3 py-2 rounded btn-brand">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
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
        <section className="rounded-2xl p-6 bg-theme-surface/60 border border-theme-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-theme-text">
            <div className="text-2xl md:text-3xl font-bold">Bienvenido a GlobeTrek</div>
            <div className="text-sm md:text-base text-theme-textSecondary mt-1">Organiza reservas, usuarios y más desde una interfaz limpia y agradable.</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('bookings')} className="px-4 py-2 rounded btn-brand">Ver reservas</button>
            {(role === 'admin' || role === 'super_admin') && (
              <button onClick={() => setView('users')} className="px-4 py-2 rounded bg-theme-background/30 text-theme-text hover:bg-theme-background/40">Gestionar usuarios</button>
            )}
          </div>
        </section>
        {view === 'dashboard' && (
          <div data-charts-section>
            <StatsPanel stats={stats} seriesA={seriesA} />
            {chartsVisible && <ChartsPanel seriesA={seriesA} seriesB={seriesB} />}
          </div>
        )}
        {view === 'users' && (
          <UsersManager token={token} apiBase={apiBase} role={role} />
        )}
        {view === 'bookings' && (
          <Bookings token={token} apiBase={apiBase} role={role} setView={setView} />
        )}
        {view === 'booking_create' && (
          <BookingCreate token={token} apiBase={apiBase} role={role} setView={setView} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
