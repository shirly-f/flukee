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
        <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">
          {t('dashboard.yourClients')}
        </h2>

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
