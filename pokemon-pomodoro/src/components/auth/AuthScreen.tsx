import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type Tab = 'login' | 'register';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', username: '', password: '', confirm: '' });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await register(registerForm.email, registerForm.username, registerForm.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎮</div>
          <h1 className="text-3xl font-bold text-white">Pomodoro Pokémon</h1>
          <p className="text-purple-300 mt-1 text-sm">Tu compañero de productividad</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-black/20 p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === 'login' ? 'bg-white text-purple-900 shadow' : 'text-white/70 hover:text-white'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === 'register' ? 'bg-white text-purple-900 shadow' : 'text-white/70 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="trainer@pokemon.com"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-1.5">Contraseña</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-2"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-1.5">Nombre de entrenador</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={registerForm.username}
                  onChange={e => setRegisterForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="AshKetchum"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="trainer@pokemon.com"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-1.5">Contraseña</label>
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-1.5">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  value={registerForm.confirm}
                  onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-2"
              >
                {isLoading ? 'Registrando...' : 'Comenzar aventura'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/40 text-xs mt-4">
          Tus datos se sincronizan en la nube
        </p>
      </div>
    </div>
  );
}
