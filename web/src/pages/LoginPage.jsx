import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/trainees');
    } catch (err) {
      setError(err.response?.data?.error?.message || t('login.checkCredentials'));
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
              {t('login.subtitleCoach')}
            </p>
          </div>

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
        </div>
      </div>
    </div>
  );
}
