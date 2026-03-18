import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import api, { API_BASE_URL } from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendReachable, setBackendReachable] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/health', { timeout: 60000 }).then(() => setBackendReachable(true)).catch(() => setBackendReachable(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      navigate(res.user?.role === 'trainee' ? '/my-tasks' : '/trainees');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Set VITE_API_BASE_URL in Netlify to your Render backend URL.');
      } else {
        setError(err.response?.data?.error?.message || t('login.checkCredentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6">
      <div className="fixed top-6 end-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-cream rounded-2xl p-10 shadow-card">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-semibold text-charcoal mb-2">
              {t('login.title')}
            </h1>
            <p className="text-charcoal-light">
              {t('login.subtitle')}
            </p>
          </div>

          {backendReachable === false && (
            <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-2xl text-charcoal text-sm">
              <strong>Backend unreachable.</strong> App is trying: <code className="bg-white/50 px-1 rounded break-all">{API_BASE_URL}</code>
              {API_BASE_URL.includes('localhost') && (
                <><br /><br />Set <code className="bg-white/50 px-1 rounded">VITE_API_BASE_URL</code> in Netlify env vars to <code className="bg-white/50 px-1 rounded">https://flukee-backend.onrender.com</code>, then trigger a new deploy.</>
              )}
              {!API_BASE_URL.includes('localhost') && (
                <><br /><br />Backend may be starting (Render free tier sleeps; first request can take ~60s). Try again, or check <a href={API_BASE_URL + '/health'} target="_blank" rel="noopener noreferrer" className="text-sage underline">health endpoint</a> directly.</>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-light/50 border border-rose/30 rounded-2xl p-4 text-charcoal text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-charcoal font-medium mb-2">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-charcoal font-medium mb-2">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-sand-dark/50">
            <p className="text-charcoal-light text-sm font-medium mb-2">Get the app feel on your phone</p>
            <p className="text-charcoal-light text-xs mb-2">
              <strong>Option 1:</strong> On your phone, tap the browser menu (⋮ or Share) → <strong>Add to Home Screen</strong>. The site will open fullscreen like an app.
            </p>
            <p className="text-charcoal-light text-xs">
              <strong>Option 2:</strong> Ask the developer for an APK link (Android) — a real installable app.
            </p>
            <p className="text-charcoal-light text-xs mt-2">
              Login: <code className="bg-sand-dark/30 px-1 rounded">trainee@test.com</code> / <code className="bg-sand-dark/30 px-1 rounded">password</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
