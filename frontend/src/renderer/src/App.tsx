import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const apiBase = 'https://globetrek.cloud';
  const authHeaders = (tkn) => ({
    'Content-Type': 'application/json',
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
  });

  const roleLabel = (r) => {
    if (r === 'super_admin') return 'Super Administrador';
    if (r === 'admin') return 'Administrador';
    if (r === 'employee') return 'Empleado';
    return 'Desconocido';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiBase}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Credenciales inválidas');
      }
      setToken(data.access);
      setMessage({ type: 'success', text: 'Inicio de sesión exitoso' });
      // Obtener rol del usuario
      try {
        const meRes = await fetch(`${apiBase}/api/auth/me/`, {
          method: 'GET',
          headers: authHeaders(data.access),
        });
        const meData = await meRes.json();
        if (!meRes.ok) throw new Error(meData.detail || 'No se pudo obtener el perfil');
        setRole(meData.role);
      } catch (e) {
        setMessage({ type: 'error', text: e.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setToken(null);
    setRole(null);
    setUsername('');
    setPassword('');
    setMessage({ type: 'success', text: 'Sesión cerrada' });
  };

  const AdminPanel = ({ token }) => {
    const [empUsername, setEmpUsername] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [empLoading, setEmpLoading] = useState(false);
    const [empMessage, setEmpMessage] = useState(null);
    const [employees, setEmployees] = useState([]);

    const loadEmployees = async () => {
      setEmpMessage(null);
      try {
        const res = await fetch(`${apiBase}/api/users/`, {
          method: 'GET',
          headers: authHeaders(token),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar empleados');
        setEmployees(data);
      } catch (err) {
        setEmpMessage({ type: 'error', text: err.message });
      }
    };

    useEffect(() => {
      if (token) loadEmployees();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleCreateEmployee = async (e) => {
      e.preventDefault();
      setEmpLoading(true);
      setEmpMessage(null);
      try {
        const res = await fetch(`${apiBase}/api/users/`, {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({
            username: empUsername,
            password: empPassword,
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            department,
            position,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudo crear el empleado');
        setEmpMessage({ type: 'success', text: `Empleado ${data.username} creado` });
        setEmpUsername('');
        setEmpPassword('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setDepartment('');
        setPosition('');
        loadEmployees();
      } catch (err) {
        setEmpMessage({ type: 'error', text: err.message });
      } finally {
        setEmpLoading(false);
      }
    };

    const handleDelete = async (id) => {
      setEmpMessage(null);
      try {
        const res = await fetch(`${apiBase}/api/users/${id}/`, {
          method: 'DELETE',
          headers: authHeaders(token),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || data.message || 'No se pudo eliminar');
        setEmpMessage({ type: 'success', text: 'Empleado eliminado' });
        loadEmployees();
      } catch (err) {
        setEmpMessage({ type: 'error', text: err.message });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Panel de Administrador</h2>
          <SignOut />
        </div>

        {empMessage && (
          <div className={`p-3 rounded text-sm ${empMessage.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>
            {empMessage.text}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded p-4">
          <h3 className="text-white font-medium mb-3">Crear nuevo empleado</h3>
          <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Usuario</label>
              <input
                type="text"
                value={empUsername}
                onChange={(e) => setEmpUsername(e.target.value)}
                required
                minLength={4}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Usuario"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Contraseña</label>
              <input
                type="password"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                required
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Contraseña"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Nombre"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Apellidos</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Apellidos"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="+123456789"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Departamento</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Departamento"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Cargo</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Cargo"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={empLoading}
                className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
              >
                {empLoading ? 'Creando...' : 'Crear empleado'}
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-2">Solo se permite crear cuentas de tipo empleado.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Empleados</h3>
            <button
              onClick={loadEmployees}
              className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white"
            >
              Recargar
            </button>
          </div>
          <ul className="space-y-2">
            {employees.map((emp) => (
              <li key={emp.id} className="flex items-center justify-between bg-gray-700/50 border border-gray-600 rounded p-2 text-sm text-white">
                <span>{emp.username}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
            {employees.length === 0 && (
              <li className="text-gray-300 text-sm">No hay empleados registrados.</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const EmployeePanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Panel de Empleado</h2>
        <SignOut />
      </div>
      <div className="bg-white/5 border border-white/10 rounded p-4 text-gray-200">
        Acceso a funciones básicas del sistema. Para gestión de usuarios, contacte a un administrador.
      </div>
    </div>
  );

  const SuperAdminPanel = ({ token }) => {
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('admin'); // 'admin' | 'employer'
    const [creating, setCreating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleCreateUser = async (e) => {
      e.preventDefault();
      setCreating(true);
      setFeedback(null);
      try {
        const res = await fetch(`${apiBase}/api/users/`, {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({
            username: newUsername,
            password: newPassword,
            role: newRole,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'No se pudo crear el usuario');
        setFeedback({ type: 'success', text: `Usuario ${data.username} creado como ${newRole}.` });
        setNewUsername('');
        setNewPassword('');
        setNewRole('admin');
      } catch (err) {
        setFeedback({ type: 'error', text: err.message });
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Panel de Super Administrador</h2>
          <SignOut />
        </div>
        {feedback && (
          <div className={`p-3 rounded text-sm ${feedback.type === 'success' ? 'bg-green-600/20 text-green-200 border border-green-500/40' : 'bg-red-600/20 text-red-200 border border-red-500/40'}`}>
            {feedback.text}
          </div>
        )}
        <div className="bg-white/5 border border-white/10 rounded p-4">
          <h3 className="text-white font-medium mb-3">Crear Administrador o Empleador</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Usuario</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                minLength={4}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Usuario"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                placeholder="Contraseña"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm">Rol</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
              >
                <option value="admin">Administrador</option>
                <option value="employer">Empleador</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={creating}
                className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
              >
                {creating ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-2">Los Super Administradores pueden crear cuentas de tipo Administrador o Empleador.</p>
        </div>
      </div>
    );
  };

  if (token) {
    return <Dashboard token={token} role={role} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-theme-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-theme-surface/90 backdrop-blur-sm border border-theme-border rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
        {/* Lado Izquierdo: Login */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-theme-surface/50 text-theme-text relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-text mb-2">¡Hola de nuevo! 👋</h1>
            <p className="text-theme-textSecondary">Ingresa tus credenciales para acceder a GlobeTrek.</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message.type === 'error' && (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-theme-textSecondary mb-1.5">Usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-theme-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={4}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-theme-text placeholder-theme-textMuted bg-theme-surface/50"
                  placeholder="Ej. admin_viajes"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-theme-textSecondary">Contraseña</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-theme-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-theme-text placeholder-theme-textMuted bg-theme-surface/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-theme-textSecondary">Recordarme</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">¿Olvidaste tu contraseña?</a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} GlobeTrek Systems. Todos los derechos reservados.</p>
          </div>
        </div>

        {/* Lado Derecho: Bienvenida / Agencia de Viajes */}
        <div className="hidden lg:flex relative bg-blue-600 flex-col justify-center items-center text-white p-12 overflow-hidden">
          {/* Fondo decorativo con gradiente y patrones */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 z-0"></div>
          <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
          
          {/* Círculos decorativos */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>

          <div className="relative z-10 text-center max-w-md">
            <div className="mb-6 flex justify-center">
               {/* Icono de avión o mundo estilizado */}
               <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
                 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Explora el mundo con <span className="text-blue-200">GlobeTrek</span></h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              La plataforma integral para gestionar experiencias inolvidables. Conecta destinos, administra reservas y lleva tu agencia al siguiente nivel.
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="font-bold text-xl">150+</div>
                <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">Países</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="font-bold text-xl">24/7</div>
                <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">Soporte</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="font-bold text-xl">10k+</div>
                <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">Viajeros</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
