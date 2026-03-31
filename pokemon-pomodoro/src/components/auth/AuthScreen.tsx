import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CosmicBackground } from '../ui/CosmicBackground';
import { Masterball } from '../ui/PokeBalls';

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-white/55 text-xs font-medium mb-1.5 ml-0.5">{label}</label>
      <input
        type={type} required value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 glass-input rounded-xl text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <motion.button type="submit" disabled={loading}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      className="w-full py-3 mt-1 rounded-xl font-semibold text-sm text-white cursor-pointer disabled:opacity-50"
      style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
        boxShadow: '0 4px 20px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.18)' }}
    >
      {loading ? loadingLabel : label}
    </motion.button>
  );
}

export function AuthScreen() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', username: '', password: '', confirm: '' });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setIsLoading(true);
    try { await login(loginForm.email, loginForm.password); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al iniciar sesión'); }
    finally { setIsLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (registerForm.password !== registerForm.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (registerForm.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setIsLoading(true);
    try { await register(registerForm.email, registerForm.username, registerForm.password); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al registrarse'); }
    finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <CosmicBackground />

      <motion.div className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <motion.div className="inline-block mb-3"
            animate={{ y: [0, -6, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Masterball size={68} />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">PokéTimer</h1>
          <p className="text-white/35 text-xs mt-1 tracking-wide">TU COMPAÑERO DE PRODUCTIVIDAD</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
          {/* Specular top line */}
          <div className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)' }} />

          {/* Tabs */}
          <div className="flex bg-black/30 rounded-2xl p-1 mb-5">
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  tab === t ? 'bg-white/12 text-white' : 'text-white/40 hover:text-white/60'
                }`}>
                {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <div className="p-3 rounded-xl text-red-300 text-xs border border-red-500/25"
                  style={{ background: 'rgba(239,68,68,0.10)' }}>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form key="login" onSubmit={handleLogin} className="space-y-3"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}>
                <Field label="Email" type="email" value={loginForm.email}
                  onChange={v => setLoginForm(f => ({ ...f, email: v }))} placeholder="trainer@pokemon.com" />
                <Field label="Contraseña" type="password" value={loginForm.password}
                  onChange={v => setLoginForm(f => ({ ...f, password: v }))} placeholder="••••••••" />
                <SubmitBtn loading={isLoading} label="Entrar" loadingLabel="Entrando..." />
              </motion.form>
            ) : (
              <motion.form key="register" onSubmit={handleRegister} className="space-y-3"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                <Field label="Nombre de entrenador" type="text" value={registerForm.username}
                  onChange={v => setRegisterForm(f => ({ ...f, username: v }))} placeholder="AshKetchum" />
                <Field label="Email" type="email" value={registerForm.email}
                  onChange={v => setRegisterForm(f => ({ ...f, email: v }))} placeholder="trainer@pokemon.com" />
                <Field label="Contraseña" type="password" value={registerForm.password}
                  onChange={v => setRegisterForm(f => ({ ...f, password: v }))} placeholder="••••••••" />
                <Field label="Confirmar contraseña" type="password" value={registerForm.confirm}
                  onChange={v => setRegisterForm(f => ({ ...f, confirm: v }))} placeholder="••••••••" />
                <SubmitBtn loading={isLoading} label="Comenzar aventura" loadingLabel="Registrando..." />
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">Datos sincronizados en la nube ✦</p>
      </motion.div>
    </div>
  );
}
