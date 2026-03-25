import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { traineeService } from '../services/traineeService';
import Layout from '../components/Layout';

export default function TraineeListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addDomain, setAddDomain] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [addSuccessWarning, setAddSuccessWarning] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState('');

  useEffect(() => {
    loadTrainees();
  }, []);

  const loadTrainees = async () => {
    try {
      const data = await traineeService.listTrainees();
      setTrainees(data);
    } catch (error) {
      console.error('Failed to load trainees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainee = async (e) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAddError('');
    setAddSuccess('');
    setAddSuccessWarning(false);
    setLastInviteLink('');
    setAddLoading(true);
    try {
      const result = await traineeService.addTrainee(addEmail.trim(), addDomain.trim() || undefined);
      if (result.invited) {
        if (result.inviteLink) setLastInviteLink(result.inviteLink);
        if (result.emailDelivered === false && result.message) {
          setAddSuccess(result.message);
          setAddSuccessWarning(true);
        } else {
          const baseMsg = t('coach.inviteSent', { email: result.email });
          setAddSuccess(
            result.inviteLink ? `${baseMsg} ${t('coach.shareLinkBelow')}` : baseMsg
          );
        }
        setAddEmail('');
        setAddDomain('');
      } else {
        setAddSuccess(t('coach.traineeAdded', { name: result.trainee?.name }));
        loadTrainees();
      }
      setShowAddForm(false);
    } catch (err) {
      setAddError(err.response?.data?.error?.message || t('common.error'));
    } finally {
      setAddLoading(false);
    }
  };

  // Overview stats
  const totalTrainees = trainees.length;
  const totalActive = trainees.reduce((sum, t) => sum + (t.activeTasks || 0), 0);
  const totalCompleted = trainees.reduce((sum, t) => sum + (t.completedTasks || 0), 0);
  const completionRate = totalActive + totalCompleted > 0 
    ? Math.round((totalCompleted / (totalActive + totalCompleted)) * 100) 
    : 0;

  return (
    <Layout>
      {/* Welcome Header */}
      <div className="mb-12">
        <p className="text-charcoal-light text-base mb-1">{t('dashboard.welcome')}</p>
        <h1 className="font-serif text-4xl font-semibold text-charcoal">
          {user?.name || t('dashboard.coach')}
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-cream rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300">
          <p className="text-charcoal-light text-sm mb-1">{t('dashboard.peopleInCare')}</p>
          <p className="font-serif text-3xl font-semibold text-sage">{totalTrainees}</p>
        </div>
        <div className="bg-cream rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300">
          <p className="text-charcoal-light text-sm mb-1">{t('dashboard.activePractices')}</p>
          <p className="font-serif text-3xl font-semibold text-sage">{totalActive}</p>
        </div>
        <div className="bg-cream rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300">
          <p className="text-charcoal-light text-sm mb-1">{t('dashboard.completionRate')}</p>
          <p className="font-serif text-3xl font-semibold text-sage">{completionRate}%</p>
        </div>
      </div>

      {/* Trainee List */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">
            {t('dashboard.yourClients')}
          </h2>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setAddError('');
              setAddSuccess('');
              setLastInviteLink('');
              setAddSuccessWarning(false);
            }}
            className="px-5 py-2.5 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300"
          >
            {showAddForm ? t('coach.cancelAdd') : t('coach.addTrainee')}
          </button>
        </div>

        {addSuccess && (
          <div
            className={`mb-6 p-4 rounded-2xl text-charcoal text-sm ${
              addSuccessWarning
                ? 'bg-amber-50 border border-amber-300'
                : 'bg-green-50 border border-green-200'
            }`}
          >
            <p className="mb-2">{addSuccess}</p>
            {lastInviteLink && (
              <div className="mt-3 pt-3 border-t border-sand-dark/40">
                <p className="text-xs text-charcoal-light mb-1">{t('coach.inviteLinkLabel')}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <code className="flex-1 block text-xs break-all bg-white/70 p-2 rounded-lg border border-sand-dark">
                    {lastInviteLink}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(lastInviteLink)}
                    className="shrink-0 px-4 py-2 bg-sage text-cream text-sm font-medium rounded-xl hover:bg-sage-light"
                  >
                    {t('coach.copyInviteLink')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAddTrainee} className="mb-6 p-6 bg-cream rounded-2xl shadow-soft space-y-4">
            <h3 className="font-serif text-lg font-semibold text-charcoal">{t('coach.addTraineeByEmail')}</h3>
            {addError && (
              <div className="p-3 bg-rose-light/50 border border-rose/30 rounded-xl text-sm text-rose-800">
                {addError}
              </div>
            )}
            <div>
              <label htmlFor="add-email" className="block text-charcoal font-medium mb-2">{t('login.email')}</label>
              <input
                id="add-email"
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="trainee@example.com"
                required
                className="w-full px-5 py-3 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
            </div>
            <div>
              <label htmlFor="add-domain" className="block text-charcoal font-medium mb-2">{t('coach.domainLabel')}</label>
              <input
                id="add-domain"
                type="text"
                value={addDomain}
                onChange={(e) => setAddDomain(e.target.value)}
                placeholder={t('coach.domainPlaceholder')}
                className="w-full px-5 py-3 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal focus:border-sage"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={addLoading}
                className="px-6 py-3 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300 disabled:opacity-50"
              >
                {addLoading ? t('common.loading') : t('coach.addTrainee')}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-sand-dark text-charcoal rounded-2xl hover:bg-sand/30 transition-colors"
              >
                {t('coach.cancelAdd')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-20 text-charcoal-light">
            {t('common.loading')}
          </div>
        ) : trainees.length === 0 ? (
          <div className="bg-cream rounded-2xl p-16 text-center shadow-soft">
            <p className="font-serif text-xl text-charcoal mb-2">{t('dashboard.yourSpaceAwaits')}</p>
            <p className="text-charcoal-light">
              {t('dashboard.whenClientsAssigned')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {trainees.map((trainee) => {
              const pendingCount = trainee.activeTasks || 0;
              const statusText = pendingCount === 0 
                ? t('tasks.allCaughtUp') 
                : t('tasks.practicesPending', { count: pendingCount });
              
              return (
                <Link
                  key={trainee.id}
                  to={`/trainees/${trainee.id}`}
                  className="block bg-cream rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:border-l-4 hover:border-l-sage border-l-4 border-l-transparent"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">
                        {trainee.name}
                      </h3>
                      <p className="text-charcoal-light text-sm">{statusText}</p>
                    </div>
                    <span className="text-sage text-lg">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
