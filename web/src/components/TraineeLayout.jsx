import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

export default function TraineeLayout({ children }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-sand-dark/60 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link
              to="/my-tasks"
              className="font-serif text-xl font-semibold text-charcoal hover:text-sage transition-colors duration-300"
            >
              {t('login.title')}
            </Link>
            <div className="flex items-center gap-6 md:gap-8">
              <Link
                to="/my-messages"
                className="text-charcoal-light text-sm hover:text-sage transition-colors duration-300"
              >
                {t('messages.messages')}
              </Link>
              <span className="text-charcoal-light text-sm">{user?.name}</span>
              <button
                onClick={logout}
                className="text-charcoal-light text-sm hover:text-sage transition-colors duration-300"
              >
                {t('common.signOut')}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  );
}
