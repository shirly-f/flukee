import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { taskService } from '../services/taskService';
import { traineeService } from '../services/traineeService';
import TraineeLayout from '../components/TraineeLayout';

export default function TraineeHomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tasksData, coachData] = await Promise.all([
        taskService.listTasksForTrainee().catch(() => []),
        traineeService.getMyCoach().catch(() => null),
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setCoach(coachData || null);
    } catch (error) {
      console.error('Failed to load data:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const currentFocus = tasks.find((t) => t.status === 'in_progress') || tasks.find((t) => t.status === 'pending');

  if (loading) {
    return (
      <TraineeLayout>
        <div className="text-center py-20 text-charcoal-light">{t('common.loading')}</div>
      </TraineeLayout>
    );
  }

  return (
    <TraineeLayout>
      <div className="mb-12">
        <p className="text-charcoal-light text-base mb-1">{t('dashboard.welcome')}</p>
        <h1 className="font-serif text-4xl font-semibold text-charcoal">
          {user?.name || t('dashboard.friend')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-cream rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300">
          <p className="text-charcoal-light text-sm mb-1">{t('tasks.yourProgress')}</p>
          <p className="font-serif text-3xl font-semibold text-sage">
            {t('progress.completedOfTotal', { completed: completedCount, total: tasks.length })}
          </p>
          {tasks.length > 0 && (
            <div className="mt-2 h-2 bg-sand-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-sage rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
        <div className="bg-cream rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300">
          <p className="text-charcoal-light text-sm mb-1">{t('tasks.currentFocus')}</p>
          <p className="font-serif text-xl font-semibold text-charcoal">
            {currentFocus ? currentFocus.title : t('tasks.allCaughtUp')}
          </p>
        </div>
      </div>

      <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">
        {t('tasks.allPractices')}
      </h2>

      {tasks.length === 0 ? (
        <div className="bg-cream rounded-2xl p-16 text-center shadow-soft">
          <p className="font-serif text-xl text-charcoal mb-2">{t('dashboard.emptyStateTitle')}</p>
          <p className="text-charcoal-light">{t('dashboard.emptyStateMessage')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={`/my-tasks/${task.id}`}
              className="block bg-cream rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 border border-transparent hover:border-sage/20"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm mb-2 ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'in_progress'
                        ? 'bg-sage/20 text-sage'
                        : 'bg-sand-dark text-charcoal-light'
                    }`}
                  >
                    {task.status === 'completed'
                      ? t('tasks.completed')
                      : task.status === 'in_progress'
                      ? t('tasks.inProgress')
                      : t('tasks.pending')}
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-charcoal">{task.title}</h3>
                  {task.description && (
                    <p className="text-charcoal-light mt-1 line-clamp-2">{task.description}</p>
                  )}
                </div>
                <span className="text-sage text-sm">{t('tasks.tapToOpen')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </TraineeLayout>
  );
}
