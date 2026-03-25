import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import api from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

const MIN_PASSWORD = 8;

export default function RegisterCoachPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, setSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === 'coach') navigate('/trainees', { replace: true });
    if (user?.role === 'trainee') navigate('/my-tasks', { replace: true });
  }, [user, authLoading, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    setLoading(true);
    setError('');
    try {
      const authRes = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
        role: 'coach',
      });
      const data = authRes.data;
      setSession(data.token, data.user);
      navigate(data.user?.role === 'coach' ? '/trainees' : '/my-tasks');
    } catch (err) {
      setError(err.response?.data?.error?.message || t('registerCoach.googleFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError(t('registerCoach.fillAll'));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(t('registerCoach.passwordTooShort', { min: MIN_PASSWORD }));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('registerCoach.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const res = await authService.register(email.trim(), password, name.trim(), 'coach');
      setSession(res.token, res.user);
      navigate('/trainees');
    } catch (err) {
      setError(err.response?.data?.error?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <p className="text-charcoal-light">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6">
      <div className="fixed top-6 end-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-cream rounded-2xl p-10 shadow-card">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">
              {t('registerCoach.title')}
            </h1>
            <p className="text-charcoal-light text-sm">{t('registerCoach.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-light/50 border border-rose/30 rounded-2xl p-4 text-charcoal text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="coach-name" className="block text-charcoal font-medium mb-2">
                {t('login.yourName')}
              </label>
              <input
                id="coach-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
            </div>

            <div>
              <label htmlFor="coach-email" className="block text-charcoal font-medium mb-2">
                {t('login.email')}
              </label>
              <input
                id="coach-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
            </div>

            <div>
              <label htmlFor="coach-password" className="block text-charcoal font-medium mb-2">
                {t('login.password')}
              </label>
              <input
                id="coach-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
              <p className="text-charcoal-light text-xs mt-1">{t('registerCoach.passwordHint', { min: MIN_PASSWORD })}</p>
            </div>

            <div>
              <label htmlFor="coach-confirm" className="block text-charcoal font-medium mb-2">
                {t('registerCoach.confirmPassword')}
              </label>
              <input
                id="coach-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.signingIn') : t('registerCoach.submit')}
            </button>
          </form>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="mt-6">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sand-dark" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-cream text-charcoal-light">{t('login.or')}</span>
                </div>
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError(t('registerCoach.googleFailed'))}
                  useOneTap={false}
                  theme="filled_black"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
              <p className="text-center text-charcoal-light text-xs mt-2">{t('registerCoach.googleNote')}</p>
            </div>
          )}

          <p className="text-center text-charcoal-light text-sm mt-8">
            {t('registerCoach.haveAccount')}{' '}
            <Link to="/login" className="text-sage font-medium hover:underline">
              {t('registerCoach.signIn')}
            </Link>
          </p>
          <p className="text-center text-charcoal-light text-xs mt-4">{t('registerCoach.traineeHint')}</p>
        </div>
      </div>
    </div>
  );
}
