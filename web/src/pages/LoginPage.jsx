import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
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
  const { login, setSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || undefined;
  const [invitePreview, setInvitePreview] = useState(null);

  useEffect(() => {
    if (!inviteToken) return;
    api.get(`/auth/invite/${inviteToken}`)
      .then((r) => setInvitePreview(r.data))
      .catch(() => setInvitePreview(null));
  }, [inviteToken]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    setLoading(true);
    setError('');
    try {
      const authRes = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
        role: 'trainee',
        inviteToken,
      });
      const data = authRes.data;
      setSession(data.token, data.user);
      navigate(data.user?.role === 'trainee' ? '/my-tasks' : '/trainees');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed');
  };

  useEffect(() => {
    api.get('/health', { timeout: 60000 }).then(() => setBackendReachable(true)).catch(() => setBackendReachable(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, inviteToken);
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

          {invitePreview && (
            <div className="mb-6 p-4 bg-sage/10 border border-sage/30 rounded-2xl text-charcoal text-sm">
              <strong>{invitePreview.coachName}</strong> {t('login.invitedYou')}
              {invitePreview.domain && (
                <span className="block mt-1 text-charcoal-light">
                  {t('login.focusArea')}: {invitePreview.domain}
                </span>
              )}
            </div>
          )}

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

            <div className="mt-6">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sand-dark" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-cream text-charcoal-light">{t('login.or')}</span>
                </div>
              </div>
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="filled_black"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                  />
                </div>
              ) : (
                <p className="text-center text-charcoal-light text-sm">
                  {t('login.googleNotConfigured')}
                </p>
              )}
            </div>
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
